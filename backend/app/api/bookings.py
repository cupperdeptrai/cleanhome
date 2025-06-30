"""
API endpoints cho quản lý đặt lịch dịch vụ  
Đồng bộ với schema SQL PostgreSQL
Bảng: bookings, booking_items, reviews
Author: CleanHome Team
"""

from datetime import datetime
import uuid
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.booking import Booking, BookingItem
from app.models.user import User
from app.models.service import Service
from app.extensions import db
from .vnpay import generate_vnpay_payment_url # Import hàm helper

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['GET'])
def get_bookings():
    """Lấy tất cả bookings (dành cho admin)"""
    try:
        bookings = Booking.query.all()
        return jsonify({
            'status': 'success',
            'bookings': [booking.to_dict() for booking in bookings]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi lấy danh sách booking: {str(e)}'
        }), 500

@bookings_bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def get_my_bookings():
    """Lấy danh sách booking của user hiện tại"""
    try:
        # Lấy user ID từ JWT token
        current_user_id = get_jwt_identity()
        
        # Lấy filter status từ query params
        status_filter = request.args.get('status', None)
        
        # Query bookings của user hiện tại
        query = Booking.query.filter_by(user_id=current_user_id)
        
        # Áp dụng filter status nếu có
        if status_filter and status_filter != 'all':
            query = query.filter_by(status=status_filter)
        
        # Order by created date descending
        bookings = query.order_by(Booking.created_at.desc()).all()
        
        # Sử dụng to_dict_with_service để có tên dịch vụ
        return jsonify([booking.to_dict_with_service() for booking in bookings])
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi lấy danh sách booking: {str(e)}'
        }), 500

@bookings_bp.route('/<booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    """Lấy chi tiết một booking"""
    try:
        current_user_id = get_jwt_identity()
        
        # Tìm booking và kiểm tra quyền truy cập
        booking = Booking.query.filter_by(
            id=booking_id
        ).first()

        if not booking:
            return jsonify({
                'status': 'error',
                'message': 'Không tìm thấy booking'
            }), 404

        # Admin hoặc chủ booking mới có quyền xem
        user = User.query.get(current_user_id)
        if booking.user_id != current_user_id and (not user or user.role != 'admin'):
             return jsonify({
                'status': 'error',
                'message': 'Bạn không có quyền truy cập booking này'
            }), 403
            
        return jsonify(booking.to_dict_with_service())
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi lấy chi tiết booking: {str(e)}'
        }), 500

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    """
    Tạo đơn đặt lịch mới
    Nếu phương thức thanh toán là 'vnpay', sẽ tạo và trả về URL thanh toán
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate dữ liệu đầu vào
        required_fields = ['service_id', 'booking_date', 'booking_time', 'customer_address']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'status': 'error', 
                    'message': f'Trường {field} là bắt buộc'
                }), 400
        
        # Validate phương thức thanh toán
        payment_method = data.get('payment_method', 'cash')
        if payment_method not in ['cash', 'vnpay', 'bank_transfer', 'credit_card', 'momo', 'zalopay']:
            return jsonify({
                'status': 'error', 
                'message': 'Phương thức thanh toán không hợp lệ'
            }), 400
        
        # Parse ngày giờ
        try:
            booking_date = datetime.strptime(data['booking_date'], '%Y-%m-%d').date()
            booking_time = datetime.strptime(data['booking_time'], '%H:%M').time()
        except ValueError:
            return jsonify({
                'status': 'error', 
                'message': 'Định dạng ngày hoặc giờ không hợp lệ'
            }), 400

        # Kiểm tra dịch vụ
        service = Service.query.get(data['service_id'])
        if not service:
            return jsonify({
                'status': 'error', 
                'message': 'Dịch vụ không tồn tại'
            }), 404
            
        # Tính tổng tiền
        area = float(data.get('area', 0)) if data.get('area') else 0
        quantity = int(data.get('quantity', 1)) if data.get('quantity') else 1
        unit_price = float(service.price)
        subtotal = unit_price * quantity
        
        # Tính discount và tax (có thể mở rộng sau)
        discount = float(data.get('discount', 0))
        tax = float(data.get('tax', 0))
        total_price = subtotal - discount + tax
          
        # Tạo booking mới
        new_booking = Booking(
            user_id=current_user_id,
            booking_date=booking_date,
            booking_time=booking_time,
            customer_address=data['customer_address'],
            area=area,
            notes=data.get('notes', ''),
            subtotal=subtotal,
            discount=discount,
            tax=tax,
            total_price=total_price,
            payment_method=payment_method,
            payment_status='unpaid',
            status='pending'
        )
        
        db.session.add(new_booking)
        db.session.flush()  # Để có ID cho booking
        
        # Tạo booking item
        booking_item = BookingItem(
            booking_id=new_booking.id,
            service_id=service.id,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal,
            notes=data.get('service_notes', '')
        )
        
        db.session.add(booking_item)
        db.session.flush()

        # Chuẩn bị response data
        response_data = {
            'status': 'success',
            'message': 'Tạo booking thành công',
            'booking': new_booking.to_dict()
        }

        # Nếu thanh toán VNPay, tạo URL thanh toán
        if payment_method == 'vnpay':
            from .vnpay import generate_vnpay_payment_url
            payment_url = generate_vnpay_payment_url(new_booking, request)
            
            if payment_url:
                # Cập nhật trạng thái pending khi có URL thanh toán
                new_booking.payment_status = 'pending'
                response_data['payment_url'] = payment_url
                response_data['message'] = 'Tạo booking và URL thanh toán VNPay thành công'
            else:
                db.session.rollback()
                return jsonify({
                    'status': 'error', 
                    'message': 'Lỗi khi tạo URL thanh toán VNPay'
                }), 500

        db.session.commit()
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi tạo booking: {str(e)}")  # Debug log
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi tạo booking: {str(e)}'
        }), 500

@bookings_bp.route('/<booking_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_booking(booking_id):
    """Hủy booking"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # Tìm booking và kiểm tra quyền
        booking = Booking.query.filter_by(
            id=booking_id,
            user_id=current_user_id
        ).first()
        
        if not booking:
            return jsonify({
                'status': 'error',
                'message': 'Không tìm thấy booking hoặc bạn không có quyền hủy'
            }), 404
        
        # Kiểm tra trạng thái có thể hủy không
        if booking.status in ['completed', 'cancelled']:
            return jsonify({
                'status': 'error',
                'message': 'Không thể hủy booking đã hoàn thành hoặc đã hủy'
            }), 400
            
        # Cập nhật thông tin hủy
        booking.status = 'cancelled'
        booking.cancelled_by = current_user_id
        booking.cancelled_at = datetime.utcnow()
        
        # Thêm lý do hủy nếu có
        if 'cancel_reason' in data and data['cancel_reason']:
            booking.cancel_reason = data['cancel_reason']
            
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Đã hủy booking thành công',
            'booking': booking.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi hủy booking: {str(e)}'
        }), 500

@bookings_bp.route('/<booking_id>/payment/vnpay', methods=['POST'])
@jwt_required()
def create_vnpay_payment(booking_id):
    """
    Tạo URL thanh toán VNPay cho booking đã tồn tại
    Cho phép khách hàng thanh toán lại nếu thanh toán trước đó thất bại
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Tìm booking và kiểm tra quyền
        booking = Booking.query.filter_by(
            id=booking_id,
            user_id=current_user_id
        ).first()
        
        if not booking:
            return jsonify({
                'status': 'error',
                'message': 'Không tìm thấy booking hoặc bạn không có quyền truy cập'
            }), 404
        
        # Kiểm tra trạng thái booking
        if booking.status in ['completed', 'cancelled']:
            return jsonify({
                'status': 'error',
                'message': 'Không thể thanh toán cho booking đã hoàn thành hoặc đã hủy'
            }), 400
            
        # Kiểm tra trạng thái thanh toán
        if booking.payment_status == 'paid':
            return jsonify({
                'status': 'error',
                'message': 'Booking này đã được thanh toán thành công'
            }), 400
        
        # Cho phép thanh toán lại nếu trạng thái là 'unpaid' hoặc 'failed'
        if booking.payment_status not in ['unpaid', 'failed']:
            return jsonify({
                'status': 'error',
                'message': f'Không thể thanh toán cho booking có trạng thái: {booking.payment_status}'
            }), 400
        
        # Cập nhật phương thức thanh toán và trạng thái
        booking.payment_method = 'vnpay'
        booking.payment_status = 'pending'
        
        # Tạo URL thanh toán VNPay
        from .vnpay import generate_vnpay_payment_url
        payment_url = generate_vnpay_payment_url(booking, request)
        
        if payment_url:
            db.session.commit()
            return jsonify({
                'status': 'success',
                'payment_url': payment_url,
                'booking_code': booking.booking_code,
                'amount': float(booking.total_price),
                'message': 'Tạo URL thanh toán VNPay thành công'
            })
        else:
            db.session.rollback()
            # Trả lại trạng thái cũ nếu tạo URL thất bại
            booking.payment_status = 'unpaid'
            return jsonify({
                'status': 'error',
                'message': 'Lỗi khi tạo URL thanh toán VNPay, vui lòng thử lại sau'
            }), 500
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Lỗi hệ thống: {str(e)}'
        }), 500

@bookings_bp.route('/<booking_id>/payment/status', methods=['GET'])
@jwt_required()
def get_payment_status(booking_id):
    """
    Lấy trạng thái thanh toán của booking
    Bao gồm thông tin giao dịch VNPay nếu có
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Tìm booking và kiểm tra quyền
        booking = Booking.query.filter_by(
            id=booking_id,
            user_id=current_user_id
        ).first()
        
        if not booking:
            return jsonify({
                'status': 'error',
                'message': 'Không tìm thấy booking hoặc bạn không có quyền truy cập'
            }), 404
        
        response_data = {
            'status': 'success',
            'booking_code': booking.booking_code,
            'payment_status': booking.payment_status,
            'payment_method': booking.payment_method,
            'total_amount': float(booking.total_price),
            'vnpay_transaction': None
        }
        
        # Lấy thông tin giao dịch VNPay nếu có
        if booking.payment_method == 'vnpay':
            from ..models.vnpay import VnpayTransaction
            transaction = VnpayTransaction.query.filter_by(booking_id=booking_id).first()
            if transaction:
                response_data['vnpay_transaction'] = transaction.to_dict()
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi lấy trạng thái thanh toán: {str(e)}'
        }), 500

