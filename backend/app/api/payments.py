"""
API endpoints cho thanh toán
Tích hợp VNPay và các phương thức thanh toán khác
Author: CleanHome Team
"""

import json
import uuid
from datetime import datetime
from decimal import Decimal
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.payment import Payment
from app.models.booking import Booking
from app.models.user import User
from app.schemas.payment import payment_schema, payments_schema
from app.utils.vnpay import VNPayConfig, VNPAY_RESPONSE_CODES, get_client_ip
from app.utils.validators import validate_uuid

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/', methods=['GET'])
@jwt_required()
def get_payments():
    """
    Lấy danh sách thanh toán của user hiện tại
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Admin/Staff có thể xem tất cả, user chỉ xem của mình
        if current_user.is_staff():
            payments = Payment.query.all()
        else:
            # Lấy payments thông qua bookings của user
            payments = Payment.query.join(Booking).filter(Booking.user_id == current_user_id).all()
        
        return jsonify({
            'status': 'success',
            'data': payments_schema.dump(payments)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching payments: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@payments_bp.route('/<payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    """
    Lấy chi tiết một thanh toán
    """
    try:
        if not validate_uuid(payment_id):
            return jsonify({'error': 'Invalid payment ID format'}), 400
        
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404
        
        # Kiểm tra quyền truy cập
        if not current_user.is_staff():
            booking = Booking.query.get(payment.booking_id)
            if not booking or str(booking.user_id) != str(current_user_id):
                return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({
            'status': 'success',
            'data': payment_schema.dump(payment)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching payment {payment_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@payments_bp.route('/vnpay/create', methods=['POST'])
@jwt_required()
def create_vnpay_payment():
    """
    Tạo thanh toán VNPay
    Body: {
        "booking_id": "uuid",
        "bank_code": "NCB" (optional)
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'booking_id' not in data:
            return jsonify({'error': 'booking_id is required'}), 400
        
        booking_id = data['booking_id']
        bank_code = data.get('bank_code')
        
        if not validate_uuid(booking_id):
            return jsonify({'error': 'Invalid booking ID format'}), 400
        
        # Kiểm tra booking tồn tại và thuộc về user
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        if str(booking.user_id) != str(current_user_id):
            return jsonify({'error': 'Access denied'}), 403
          # Kiểm tra booking chưa được thanh toán
        existing_payment = Payment.query.filter(
            Payment.booking_id == booking_id,
            Payment.status.in_(['completed', 'processing'])
        ).first()
        
        if existing_payment:
            return jsonify({'error': 'Booking already has payment in progress or completed'}), 400
        
        # Tạo payment record
        payment = Payment(
            booking_id=booking_id,
            amount=booking.total_price,
            payment_method='vnpay',
            status='pending'
        )
        
        db.session.add(payment)
        db.session.commit()
        
        # Tạo VNPay payment URL
        vnpay_config = VNPayConfig()
        
        order_id = str(payment.id)
        amount = int(booking.total_price)  # Convert to int for VNPay
        order_desc = f"Thanh toan don hang CleanHome {booking_id}"
        user_ip = get_client_ip(request)
        
        payment_url = vnpay_config.get_payment_url(
            order_id=order_id,
            amount=amount,
            order_desc=order_desc,
            bank_code=bank_code,
            user_ip=user_ip
        )
        
        # Cập nhật payment với transaction_id
        payment.transaction_id = order_id
        payment.status = 'processing'
        db.session.commit()
        
        current_app.logger.info(f"Tạo thanh toán VNPay cho booking {booking_id}, payment {payment.id}")
        
        return jsonify({
            'status': 'success',
            'message': 'VNPay payment URL created successfully',
            'data': {
                'payment_id': str(payment.id),
                'payment_url': payment_url,
                'amount': amount,
                'order_id': order_id
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating VNPay payment: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@payments_bp.route('/vnpay/return', methods=['GET'])
def vnpay_return():
    """
    Xử lý kết quả trả về từ VNPay (GET request từ frontend)
    """
    try:
        vnp_params = dict(request.args)
        current_app.logger.info(f"VNPay return params: {vnp_params}")
        
        # Validate VNPay response
        vnpay_config = VNPayConfig()
        is_valid = vnpay_config.validate_response(vnp_params.copy())
        
        if not is_valid:
            current_app.logger.error("VNPay response validation failed")
            return jsonify({
                'status': 'error',
                'message': 'Invalid VNPay response signature'
            }), 400
        
        # Lấy thông tin từ response
        order_id = vnp_params.get('vnp_TxnRef')
        response_code = vnp_params.get('vnp_ResponseCode')
        transaction_no = vnp_params.get('vnp_TransactionNo')
        bank_code = vnp_params.get('vnp_BankCode')
        amount = vnp_params.get('vnp_Amount')
        
        if not order_id:
            return jsonify({'error': 'Missing order ID'}), 400
        
        # Tìm payment
        payment = Payment.query.filter_by(transaction_id=order_id).first()
        if not payment:
            current_app.logger.error(f"Payment not found for order_id: {order_id}")
            return jsonify({'error': 'Payment not found'}), 404
        
        # Cập nhật payment
        payment.vnpay_response_code = response_code
        payment.vnpay_transaction_no = transaction_no
        payment.vnpay_bank_code = bank_code
        payment.gateway_response = json.dumps(vnp_params)
        
        # Xử lý kết quả thanh toán
        if response_code == '00':
            payment.status = 'completed'
            payment.payment_date = datetime.utcnow()
            
            # Cập nhật booking status
            booking = Booking.query.get(payment.booking_id)
            if booking:
                booking.payment_status = 'paid'
                booking.status = 'confirmed'
            
            message = 'Thanh toán thành công'
            current_app.logger.info(f"VNPay payment completed: {order_id}")
            
        else:
            payment.status = 'failed'
            message = VNPAY_RESPONSE_CODES.get(response_code, 'Thanh toán thất bại')
            current_app.logger.warning(f"VNPay payment failed: {order_id}, code: {response_code}")
        
        db.session.commit()
        
        return jsonify({
            'status': 'success' if response_code == '00' else 'error',
            'message': message,
            'data': {
                'payment_id': str(payment.id),
                'order_id': order_id,
                'response_code': response_code,
                'transaction_no': transaction_no,
                'amount': int(amount) // 100 if amount else 0  # Convert back from VNPay format
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error processing VNPay return: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@payments_bp.route('/vnpay/notify', methods=['POST'])
def vnpay_notify():
    """
    Xử lý thông báo IPN từ VNPay (POST request từ VNPay server)
    """
    try:
        vnp_params = dict(request.form)
        current_app.logger.info(f"VNPay IPN params: {vnp_params}")
        
        # Validate VNPay response
        vnpay_config = VNPayConfig()
        is_valid = vnpay_config.validate_response(vnp_params.copy())
        
        if not is_valid:
            current_app.logger.error("VNPay IPN validation failed")
            return jsonify({'RspCode': '97', 'Message': 'Invalid signature'}), 400
        
        order_id = vnp_params.get('vnp_TxnRef')
        response_code = vnp_params.get('vnp_ResponseCode')
        
        # Tìm và cập nhật payment
        payment = Payment.query.filter_by(transaction_id=order_id).first()
        if not payment:
            current_app.logger.error(f"Payment not found in IPN: {order_id}")
            return jsonify({'RspCode': '01', 'Message': 'Order not found'}), 404
        
        # Chỉ xử lý nếu payment chưa được xử lý
        if payment.status not in ['completed', 'failed']:
            payment.vnpay_response_code = response_code
            payment.vnpay_transaction_no = vnp_params.get('vnp_TransactionNo')
            payment.vnpay_bank_code = vnp_params.get('vnp_BankCode')
            payment.gateway_response = json.dumps(vnp_params)
            
            if response_code == '00':
                payment.status = 'completed'
                payment.payment_date = datetime.utcnow()
                
                # Cập nhật booking
                booking = Booking.query.get(payment.booking_id)
                if booking:
                    booking.payment_status = 'paid'
                    booking.status = 'confirmed'
            else:
                payment.status = 'failed'
            
            db.session.commit()
            current_app.logger.info(f"VNPay IPN processed: {order_id}, status: {payment.status}")
        
        # Trả về response cho VNPay
        return jsonify({'RspCode': '00', 'Message': 'Success'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error processing VNPay IPN: {str(e)}")
        return jsonify({'RspCode': '99', 'Message': 'Internal server error'}), 500