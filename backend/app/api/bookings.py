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
from app.models.booking import Booking
from app.models.user import User
from app.extensions import db

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
        
        return jsonify([booking.to_dict() for booking in bookings])
        
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
            id=booking_id,
            user_id=current_user_id
        ).first()
        
        if not booking:
            return jsonify({
                'status': 'error',
                'message': 'Không tìm thấy booking hoặc bạn không có quyền truy cập'
            }), 404
            
        return jsonify(booking.to_dict())
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi lấy chi tiết booking: {str(e)}'
        }), 500

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    """
    Tạo đơn đặt lịch mới với đầy đủ thông tin thanh toán
    
    Expected request body:
    {
        "service_id": "uuid",
        "booking_date": "2025-06-20", 
        "booking_time": "09:00",
        "duration": 2,
        "customer_address": "123 ABC Street",
        "phone": "0123456789",
        "notes": "Special requirements",
        "payment_method": "cash"
    }
    """
    try:
        # Lấy thông tin user hiện tại từ JWT token
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate dữ liệu bắt buộc
        required_fields = [
            'service_id', 'booking_date', 'booking_time', 
            'customer_address', 'phone'
        ]
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'status': 'error',
                    'message': f'Trường {field} là bắt buộc'
                }), 400
        
        # Validate payment method - hỗ trợ tiền mặt và VNPay
        payment_method = data.get('payment_method', 'cash')
        if payment_method not in ['cash', 'vnpay']:
            return jsonify({
                'status': 'error',
                'message': 'Phương thức thanh toán không được hỗ trợ. Chỉ chấp nhận: cash, vnpay'
            }), 400
        
        # Parse date và time
        from datetime import datetime
        try:
            booking_date = datetime.strptime(data['booking_date'], '%Y-%m-%d').date()
            booking_time = datetime.strptime(data['booking_time'], '%H:%M').time()
        except ValueError:
            return jsonify({
                'status': 'error',
                'message': 'Định dạng ngày hoặc giờ không hợp lệ'
            }), 400        # Lấy thông tin dịch vụ để tính giá
        from app.models.service import Service
        
        try:
            service_uuid = uuid.UUID(data['service_id'])
        except ValueError:
            return jsonify({
                'status': 'error',
                'message': 'service_id không hợp lệ'
            }), 400
            
        # Tìm service để lấy giá thực tế
        service = Service.query.filter_by(id=service_uuid).first()
        if not service:
            return jsonify({
                'status': 'error',
                'message': 'Dịch vụ không tồn tại'
            }), 404
            
        if service.status != 'active':
            return jsonify({
                'status': 'error', 
                'message': 'Dịch vụ hiện không hoạt động'
            }), 400
        
        # Tính tổng giá tiền dựa trên giá dịch vụ thực tế
        duration = float(data.get('duration', service.duration / 60 if service.duration else 2))  # duration từ service hoặc default 2h
        unit_price = float(service.price)  # Lấy giá từ service
        subtotal = unit_price  # Giá service đã là tổng, không nhân với duration
        total_price = subtotal  # Chưa có discount
          # Tạo booking mới với đầy đủ thông tin
        booking = Booking(
            user_id=current_user_id,  # current_user_id đã là UUID string
            booking_date=booking_date,
            booking_time=booking_time,
            customer_address=data['customer_address'],
            notes=data.get('notes', ''),
            subtotal=subtotal,
            discount=0,
            tax=0,
            total_price=total_price,
            status='pending',  # Trạng thái mặc định
            payment_status='unpaid',  # Đổi từ pending để khớp với ENUM default
            payment_method=payment_method
        )
          # Lưu booking vào database
        db.session.add(booking)
        db.session.flush()  # Flush để có ID của booking
          # Tạo booking item cho dịch vụ
        from app.models.booking import BookingItem
        
        booking_item = BookingItem(
            booking_id=booking.id,
            service_id=service_uuid,  # Đã được validate ở trên
            quantity=1,
            unit_price=unit_price,  # Dùng giá thực tế từ service
            subtotal=subtotal  # Đổi từ total_price thành subtotal
        )
        
        db.session.add(booking_item)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
            'booking': booking.to_dict()
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Dữ liệu không hợp lệ: {str(e)}'
        }), 400
    except Exception as e:
        db.session.rollback()
        # Log chi tiết lỗi để debug
        print(f"Lỗi tạo booking: {str(e)}")
        import traceback
        traceback.print_exc()
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

