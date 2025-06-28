"""Admin API endpoints"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import func, desc, and_, or_
from datetime import datetime, timedelta
from app.extensions import db
from app.models.user import User
from app.models.booking import Booking, BookingStaff, BookingItem
from app.models.service import Service
from app.utils.errors import ValidationAPIError, AuthenticationError, handle_error
from app.utils.helpers import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_stats():
    """Lấy thống kê tổng quan cho admin dashboard"""
    try:
        # Tính toán các thống kê
        total_bookings = Booking.query.count()
        total_users = User.query.filter_by(role='customer').count()
        total_staff = User.query.filter_by(role='staff').count()
        
        # Doanh thu tháng này
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_revenue = db.session.query(func.sum(Booking.total_price)).filter(
            and_(
                Booking.created_at >= current_month,
                Booking.status == 'completed',
                Booking.payment_status == 'paid'
            )
        ).scalar() or 0
        
        # Người dùng mới tháng này
        new_users_this_month = User.query.filter(
            and_(
                User.created_at >= current_month,
                User.role == 'customer'
            )
        ).count()
        
        # Booking hoàn thành tháng này
        completed_bookings_this_month = Booking.query.filter(
            and_(
                Booking.created_at >= current_month,
                Booking.status == 'completed'
            )
        ).count()
        
        # Đánh giá trung bình (giả sử có bảng reviews)
        avg_rating = 4.5  # Placeholder
        
        # Tăng trưởng (giả sử tính so với tháng trước)
        booking_growth = 15.2  # Placeholder
        revenue_growth = 12.8  # Placeholder
        user_growth = 18.5     # Placeholder
        
        return jsonify({
            'totalBookings': total_bookings,
            'totalUsers': total_users,
            'totalStaff': total_staff,
            'monthlyRevenue': monthly_revenue,
            'newUsersThisMonth': new_users_this_month,
            'completedBookingsThisMonth': completed_bookings_this_month,
            'avgRating': avg_rating,
            'bookingGrowth': booking_growth,
            'revenueGrowth': revenue_growth,
            'userGrowth': user_growth
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Admin stats error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get admin stats: {str(e)}'
        }), 500

@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_bookings():
    """Lấy danh sách booking cho admin"""
    try:
        # Lấy tham số query
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        status = request.args.get('status')
        payment_status = request.args.get('payment_status')
        
        # Build query
        query = Booking.query
        
        if status:
            query = query.filter(Booking.status == status)
        if payment_status:
            query = query.filter(Booking.payment_status == payment_status)
        
        # Phân trang
        bookings = query.order_by(desc(Booking.created_at)).paginate(
            page=page, per_page=limit, error_out=False
        )
          # Format data
        result = []
        for booking in bookings.items:
            # Lấy thông tin user
            user = User.query.get(booking.user_id)
            staff = User.query.get(booking.staff_id) if booking.staff_id else None
            
            # Lấy service từ booking_items (vì booking không có trực tiếp service_id)
            service = None
            service_name = 'Unknown'
            service_id = None
            if booking.booking_items:
                # Lấy service từ booking_item đầu tiên
                first_item = booking.booking_items[0]
                if hasattr(first_item, 'service_id') and first_item.service_id:
                    service = Service.query.get(first_item.service_id)
                    if service:
                        service_name = service.name
                        service_id = str(first_item.service_id)
            
            result.append({
                'id': str(booking.id),
                'bookingCode': booking.booking_code,
                'userId': str(booking.user_id),
                'userName': user.name if user else 'Unknown',
                'userEmail': user.email if user else 'Unknown',
                'userPhone': user.phone if user else 'Unknown',
                'serviceId': service_id,
                'serviceName': service_name,
                'staffId': str(booking.staff_id) if booking.staff_id else None,
                'staffName': staff.name if staff else None,
                'bookingDate': booking.booking_date.isoformat() if booking.booking_date else None,
                'bookingTime': booking.booking_time.strftime('%H:%M') if booking.booking_time else None,
                'endTime': booking.end_time.strftime('%H:%M') if booking.end_time else None,
                'customerAddress': booking.customer_address,
                'subtotal': float(booking.subtotal or 0),
                'discount': float(booking.discount or 0),
                'tax': float(booking.tax or 0),
                'totalPrice': float(booking.total_price or 0),
                'status': booking.status,
                'paymentStatus': booking.payment_status,
                'paymentMethod': booking.payment_method,
                'notes': booking.notes,
                'cancelReason': booking.cancel_reason,
                'createdAt': booking.created_at.isoformat() if booking.created_at else None,
                'updatedAt': booking.updated_at.isoformat() if booking.updated_at else None
            })
        
        return jsonify({
            'data': result,
            'total': bookings.total,
            'page': page,
            'limit': limit,
            'totalPages': bookings.pages
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Admin bookings error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get bookings: {str(e)}'
        }), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_users():
    """Lấy danh sách user cho admin"""
    try:
        # Lấy tham số query
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        role = request.args.get('role')
        status = request.args.get('status')
        
        # Build query
        query = User.query
        
        if role:
            query = query.filter(User.role == role)
        if status:
            query = query.filter(User.status == status)
        
        # Phân trang
        users = query.order_by(desc(User.created_at)).paginate(
            page=page, per_page=limit, error_out=False
        )
        
        # Format data
        result = []
        for user in users.items:
            # Tính toán thống kê
            total_bookings = Booking.query.filter_by(user_id=user.id).count()
            total_spent = db.session.query(func.sum(Booking.total_price)).filter(
                and_(
                    Booking.user_id == user.id,
                    Booking.payment_status == 'paid'
                )
            ).scalar() or 0
            
            result.append({
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'address': user.address,
                'avatar': user.avatar,
                'bio': user.bio,
                'role': user.role,
                'status': user.status,
                'emailVerifiedAt': user.email_verified_at.isoformat() if user.email_verified_at else None,
                'phoneVerifiedAt': user.phone_verified_at.isoformat() if user.phone_verified_at else None,
                'lastLoginAt': user.last_login_at.isoformat() if user.last_login_at else None,
                'loginCount': user.login_count or 0,
                'failedLoginAttempts': user.failed_login_attempts or 0,
                'lockedUntil': user.locked_until.isoformat() if user.locked_until else None,
                'joinedAt': user.created_at.date().isoformat() if user.created_at else None,
                'totalBookings': total_bookings,
                'totalSpent': float(total_spent),
                'createdAt': user.created_at.isoformat() if user.created_at else None,
                'updatedAt': user.updated_at.isoformat() if user.updated_at else None
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f"Admin users error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get users: {str(e)}'
        }), 500

@admin_bp.route('/staff', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_staff():
    """
    Lấy danh sách staff cho admin - Phiên bản cập nhật đồng bộ thống kê
    
    CHỨC NĂNG CHÍNH:
    - Lấy tất cả nhân viên (role='staff') từ bảng users
    - Tính toán thống kê đơn hàng chính xác từ cả 2 nguồn dữ liệu:
      + Phân công trực tiếp: Booking.staff_id 
      + Phân công nhiều người: BookingStaff table (many-to-many)
    - Lấy danh sách dịch vụ đã được phân công cho từng nhân viên
    - ĐÃ XÓA: Phần đánh giá nhân viên (rating) không còn được sử dụng
    
    THỐNG KÊ BẢO ĐẢM ĐỒNG BỘ:
    - totalBookings: Tổng số đơn hàng được phân công (tránh trùng lặp)
    - completedBookings: Số đơn hàng đã hoàn thành  
    - assignedServices: Danh sách dịch vụ đã được phân công
    """
    try:
        # Lấy danh sách staff từ bảng users với role='staff'
        staff_users = User.query.filter_by(role='staff').order_by(desc(User.created_at)).all()
        
        result = []
        for user in staff_users:
            # ===== TÍNH TOÁN THỐNG KÊ ĐỒNG BỘ TỪ CẢ 2 NGUỒN =====
            # Tính toán thống kê đồng bộ từ cả 2 nguồn: Booking.staff_id và BookingStaff
            # Phương pháp 1: Đơn hàng được phân công trực tiếp (staff_id trong bảng bookings)
            direct_total_bookings = Booking.query.filter_by(staff_id=user.id).count()
            direct_completed_bookings = Booking.query.filter(
                and_(
                    Booking.staff_id == user.id,
                    Booking.status == 'completed'
                )
            ).count()
            
            # Phương pháp 2: Đơn hàng được phân công qua bảng booking_staff (many-to-many)
            staff_assignments = BookingStaff.query.filter_by(staff_id=user.id).all()
            booking_ids_from_assignments = [assignment.booking_id for assignment in staff_assignments]
            
            # Đếm booking từ bảng booking_staff
            assignment_total_bookings = len(booking_ids_from_assignments)
            assignment_completed_bookings = 0
            if booking_ids_from_assignments:
                assignment_completed_bookings = Booking.query.filter(
                    and_(
                        Booking.id.in_(booking_ids_from_assignments),
                        Booking.status == 'completed'
                    )
                ).count()
            
            # ===== TỔNG HỢP THỐNG KÊ TRÁNH TRÙNG LẶP =====
            # Tổng hợp thống kê từ cả 2 nguồn (tránh trùng lặp)
            all_booking_ids = set()
            
            # Thêm booking IDs từ phân công trực tiếp
            direct_bookings = Booking.query.filter_by(staff_id=user.id).all()
            for booking in direct_bookings:
                all_booking_ids.add(booking.id)
            
            # Thêm booking IDs từ bảng booking_staff
            for booking_id in booking_ids_from_assignments:
                all_booking_ids.add(booking_id)
            
            # Tính tổng số đơn hàng (không trùng lặp)
            total_bookings = len(all_booking_ids)
            
            # Tính số đơn hoàn thành (không trùng lặp)
            completed_bookings = 0
            if all_booking_ids:
                completed_bookings = Booking.query.filter(
                    and_(
                        Booking.id.in_(list(all_booking_ids)),
                        Booking.status == 'completed'
                    )
                ).count()
            
            # ===== LẤY DANH SÁCH DỊCH VỤ ĐƯỢC PHÂN CÔNG =====
            # Lấy danh sách dịch vụ đã được phân công (từ cả 2 nguồn thông qua BookingItem)
            assigned_services_query = db.session.query(Service.name).join(
                BookingItem, BookingItem.service_id == Service.id
            ).join(
                Booking, Booking.id == BookingItem.booking_id
            ).filter(
                Booking.id.in_(list(all_booking_ids))
            ).distinct().all()
            
            assigned_services = [service[0] for service in assigned_services_query] if assigned_services_query else []

            # ===== TẠO KẾT QUẢ TRẢ VỀ =====
            result.append({
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
                'phone': user.phone or '',
                'status': user.status,
                'avatar': user.avatar,
                'hireDate': user.created_at.date().isoformat() if user.created_at else None,
                # ĐÃ XÓA: 'rating' - Không còn đánh giá nhân viên
                'totalBookings': total_bookings,           # Tổng số đơn được phân công (đồng bộ)
                'completedBookings': completed_bookings,   # Số đơn đã hoàn thành (đồng bộ)
                'assignedServices': assigned_services,     # Danh sách dịch vụ được phân công (đồng bộ)
                'createdAt': user.created_at.isoformat() if user.created_at else None,
                'updatedAt': user.updated_at.isoformat() if user.updated_at else None
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f"Admin staff error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get staff: {str(e)}'
        }), 500

# Additional endpoints for CRUD operations...
@admin_bp.route('/users/<user_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_user_status(user_id):
    """Cập nhật trạng thái user"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['active', 'inactive', 'locked', 'pending']:
            return jsonify({
                'status': 'error',
                'message': 'Invalid status'
            }), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        user.status = status
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'User status updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update user status error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to update user status: {str(e)}'
        }), 500

@admin_bp.route('/bookings/<booking_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_booking_status(booking_id):
    """Cập nhật trạng thái booking"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled']:
            return jsonify({
                'status': 'error',
                'message': 'Invalid status'
            }), 400
        
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({
                'status': 'error',
                'message': 'Booking not found'
            }), 404
        
        booking.status = status
        booking.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Booking status updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update booking status error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to update booking status: {str(e)}'
        }), 500

@admin_bp.route('/bookings/<booking_id>/payment-status', methods=['PUT'])
@jwt_required()
@admin_required
def update_booking_payment_status(booking_id):
    """Cập nhật trạng thái thanh toán của booking cho admin"""
    try:
        # Validate request data
        data = request.get_json()
        if not data or 'payment_status' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Payment status is required'
            }), 400
        
        payment_status = data.get('payment_status')
        
        # Validate payment status
        valid_statuses = ['unpaid', 'pending', 'paid', 'refunded', 'failed']
        if payment_status not in valid_statuses:
            return jsonify({
                'status': 'error',
                'message': f'Invalid payment status. Must be one of: {", ".join(valid_statuses)}'
            }), 400
        
        # Find booking
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({
                'status': 'error',
                'message': 'Booking not found'
            }), 404
        
        # Logic kiểm tra: chỉ cho phép đánh dấu "paid" nếu booking đã completed
        if payment_status == 'paid' and booking.status != 'completed':
            return jsonify({
                'status': 'error',
                'message': 'Chỉ có thể đánh dấu đã thanh toán khi công việc đã hoàn thành'
            }), 400
        
        # Cập nhật payment status
        old_payment_status = booking.payment_status
        booking.payment_status = payment_status
        booking.updated_at = datetime.utcnow()
        
        # Nếu đánh dấu đã thanh toán, có thể thêm logic khác (như tính commission cho staff)
        if payment_status == 'paid' and old_payment_status != 'paid':
            current_app.logger.info(f"Booking {booking.booking_code} marked as paid by admin")
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Payment status updated successfully',
            'data': {
                'booking_id': str(booking.id),
                'booking_code': booking.booking_code,
                'old_payment_status': old_payment_status,
                'new_payment_status': payment_status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update booking payment status error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to update payment status: {str(e)}'
        }), 500

@admin_bp.route('/bookings/<booking_id>/assign-staff', methods=['PUT'])
@jwt_required()
@admin_required
def assign_staff_to_booking(booking_id):
    """Phân công nhân viên cho booking"""
    try:
        # Validate request data
        data = request.get_json()
        if not data or 'staffId' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Staff ID is required'
            }), 400
        
        staff_id = data.get('staffId')
        
        # Tìm booking
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({
                'status': 'error',
                'message': 'Booking not found'
            }), 404
        
        # Kiểm tra staff có tồn tại và active không
        staff = User.query.filter_by(id=staff_id, role='staff', status='active').first()
        if not staff:
            return jsonify({
                'status': 'error',
                'message': 'Staff not found or not active'
            }), 404
          # Kiểm tra booking có thể phân công staff không 
        # Cho phép assign staff cho booking chưa có staff, kể cả completed
        if booking.status == 'cancelled':
            return jsonify({
                'status': 'error',
                'message': 'Không thể phân công nhân viên cho đơn đã hủy'
            }), 400
        
        # Cập nhật staff cho booking
        old_staff_id = booking.staff_id
        booking.staff_id = staff_id
        booking.updated_at = datetime.utcnow()
        
        # Nếu booking chưa confirmed, tự động confirmed khi có staff
        if booking.status == 'pending':
            booking.status = 'confirmed'
        
        db.session.commit()
        
        current_app.logger.info(f"Booking {booking.booking_code} assigned to staff {staff.name}")
        
        return jsonify({
            'status': 'success',
            'message': 'Staff assigned to booking successfully',
            'data': {
                'booking_id': str(booking.id),
                'booking_code': booking.booking_code,
                'old_staff_id': str(old_staff_id) if old_staff_id else None,
                'new_staff_id': str(staff_id),
                'staff_name': staff.name,
                'new_status': booking.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Assign staff to booking error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to assign staff to booking: {str(e)}'
        }), 500

@admin_bp.route('/bookings/<booking_id>/assign-multiple-staff', methods=['PUT'])
@jwt_required()
@admin_required
def assign_multiple_staff_to_booking(booking_id):
    """Phân công nhiều nhân viên cho booking"""
    try:
        # Validate request data
        data = request.get_json()
        if not data or 'staffIds' not in data or not isinstance(data['staffIds'], list):
            return jsonify({
                'status': 'error',
                'message': 'Staff IDs array is required'
            }), 400
        
        staff_ids = data.get('staffIds', [])
        if not staff_ids:
            return jsonify({
                'status': 'error',
                'message': 'At least one staff ID is required'
            }), 400
        
        current_user_id = get_jwt_identity()
        
        # Tìm booking
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({
                'status': 'error',
                'message': 'Booking not found'
            }), 404
        
        # Kiểm tra booking có thể phân công staff không 
        if booking.status == 'cancelled':
            return jsonify({
                'status': 'error',
                'message': 'Không thể phân công nhân viên cho đơn đã hủy'
            }), 400
        
        # Validate tất cả staff trước khi assign
        staff_list = []
        for staff_id in staff_ids:
            staff = User.query.filter_by(id=staff_id, role='staff', status='active').first()
            if not staff:
                return jsonify({
                    'status': 'error',
                    'message': f'Staff {staff_id} not found or not active'
                }), 404
            staff_list.append(staff)
        
        # Import model BookingStaff
        from app.models.booking import BookingStaff
        
        # Xóa assignments cũ (nếu có)
        BookingStaff.query.filter_by(booking_id=booking.id).delete()
        
        # Thêm assignments mới
        assigned_staff = []
        for staff in staff_list:
            # Kiểm tra không trùng lặp
            existing = BookingStaff.query.filter_by(
                booking_id=booking.id, 
                staff_id=staff.id
            ).first()
            
            if not existing:
                booking_staff = BookingStaff(
                    booking_id=booking.id,
                    staff_id=staff.id,
                    assigned_by=current_user_id,
                    notes=data.get('notes', '')
                )
                db.session.add(booking_staff)
                assigned_staff.append({
                    'id': str(staff.id),
                    'name': staff.name,
                    'email': staff.email
                })
        
        # Cập nhật booking status
        if booking.status == 'pending':
            booking.status = 'confirmed'
        
        booking.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_app.logger.info(f"Booking {booking.booking_code} assigned to {len(assigned_staff)} staff members")
        
        return jsonify({
            'status': 'success',
            'message': f'Successfully assigned {len(assigned_staff)} staff members to booking',
            'data': {
                'booking_id': str(booking.id),
                'booking_code': booking.booking_code,
                'assigned_staff': assigned_staff,
                'staff_count': len(assigned_staff),
                'new_status': booking.status
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Assign multiple staff to booking error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to assign staff to booking: {str(e)}'
        }), 500

# ==================== REPORTS & ANALYTICS ====================

@admin_bp.route('/reports/daily', methods=['GET'])
@jwt_required()
@admin_required
def get_daily_report():
    """Lấy báo cáo booking theo ngày trong khoảng thời gian"""
    try:
        start_date_str = request.args.get('start')
        end_date_str = request.args.get('end')
        
        if not start_date_str or not end_date_str:
            return jsonify({
                'status': 'error',
                'message': 'Start date and end date are required'
            }), 400
        
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
        except ValueError:
            return jsonify({
                'status': 'error',
                'message': 'Invalid date format. Use ISO format (YYYY-MM-DD)'
            }), 400
        
        # Get bookings in the date range
        bookings = Booking.query.filter(
            and_(
                Booking.created_at >= start_date,
                Booking.created_at <= end_date
            )
        ).all()
          # Calculate daily breakdown
        daily_reports = []
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        while current_date <= end_date_only:
            day_bookings = [b for b in bookings if b.created_at.date() == current_date]
            completed_bookings = [b for b in day_bookings if b.status == 'completed']
            cancelled_bookings = [b for b in day_bookings if b.status == 'cancelled']
            total_revenue = sum([float(b.total_price or 0) for b in day_bookings if b.payment_status == 'paid'])
            
            # Calculate average rating for completed bookings
            avg_rating = 0
            if completed_bookings:
                try:
                    from app.models.service import Review
                    completed_booking_ids = [b.id for b in completed_bookings]
                    ratings = db.session.query(func.avg(Review.rating)).filter(
                        Review.booking_id.in_(completed_booking_ids)
                    ).scalar()
                    avg_rating = float(ratings) if ratings else 0
                except Exception as e:
                    # Fallback if Review query fails
                    current_app.logger.warning(f"Could not calculate avg rating: {str(e)}")
                    avg_rating = 0
            
            daily_reports.append({
                'date': current_date.isoformat(),
                'bookings': len(day_bookings),
                'revenue': total_revenue,
                'completed': len(completed_bookings),
                'cancelled': len(cancelled_bookings),
                'avgRating': avg_rating
            })
            current_date += timedelta(days=1)
        
        return jsonify(daily_reports), 200
        
    except Exception as e:
        current_app.logger.error(f"Daily report error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get daily report: {str(e)}'
        }), 500

@admin_bp.route('/reports/monthly', methods=['GET'])
@jwt_required()
@admin_required
def get_monthly_report():
    """Lấy báo cáo booking theo tháng"""
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', type=int)  # Optional parameter
        
        if month:
            # Get specific month report
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
            
            # Get bookings for the month
            bookings = Booking.query.filter(
                and_(
                    Booking.created_at >= start_date,
                    Booking.created_at < end_date
                )
            ).all()
            
            # Calculate statistics
            total_bookings = len(bookings)
            completed_bookings = len([b for b in bookings if b.status == 'completed'])
            cancelled_bookings = len([b for b in bookings if b.status == 'cancelled'])
            total_revenue = sum([float(b.total_price or 0) for b in bookings if b.payment_status == 'paid'])
            
            return jsonify({
                'year': year,
                'month': month,
                'totalBookings': total_bookings,
                'completedBookings': completed_bookings,
                'cancelledBookings': cancelled_bookings,
                'totalRevenue': total_revenue,
                'completionRate': (completed_bookings / total_bookings * 100) if total_bookings > 0 else 0
            }), 200
        else:
            # Get all 12 months for the year
            monthly_reports = []
            
            for month_num in range(1, 13):
                start_date = datetime(year, month_num, 1)
                if month_num == 12:
                    end_date = datetime(year + 1, 1, 1)
                else:
                    end_date = datetime(year, month_num + 1, 1)
                
                # Get bookings for the month
                month_bookings = Booking.query.filter(
                    and_(
                        Booking.created_at >= start_date,
                        Booking.created_at < end_date
                    )                ).all()
                
                total_bookings = len(month_bookings)
                completed_bookings = len([b for b in month_bookings if b.status == 'completed'])
                cancelled_bookings = len([b for b in month_bookings if b.status == 'cancelled'])
                total_revenue = sum([float(b.total_price or 0) for b in month_bookings if b.payment_status == 'paid'])
                
                # Calculate average rating for completed bookings
                avg_rating = 0
                completed_month_bookings = [b for b in month_bookings if b.status == 'completed']
                if completed_month_bookings:
                    try:
                        from app.models.service import Review
                        completed_booking_ids = [b.id for b in completed_month_bookings]
                        ratings = db.session.query(func.avg(Review.rating)).filter(
                            Review.booking_id.in_(completed_booking_ids)
                        ).scalar()
                        avg_rating = float(ratings) if ratings else 0
                    except Exception as e:
                        current_app.logger.warning(f"Could not calculate avg rating for month {month_num}: {str(e)}")
                        avg_rating = 0
                
                monthly_reports.append({
                    'month': month_num,
                    'bookings': total_bookings,
                    'revenue': total_revenue,
                    'completed': completed_bookings,
                    'cancelled': cancelled_bookings,
                    'avgRating': avg_rating
                })
            
            return jsonify(monthly_reports), 200
        
    except Exception as e:
        current_app.logger.error(f"Monthly report error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get monthly report: {str(e)}'
        }), 500

@admin_bp.route('/reports/yearly', methods=['GET'])
@jwt_required()
@admin_required
def get_yearly_report():
    """Lấy báo cáo booking theo năm - trả về danh sách các năm"""
    try:
        year = request.args.get('year', type=int)  # Optional parameter
        
        if year:
            # Get specific year report
            start_date = datetime(year, 1, 1)
            end_date = datetime(year + 1, 1, 1)
            
            bookings = Booking.query.filter(
                and_(
                    Booking.created_at >= start_date,
                    Booking.created_at < end_date
                )
            ).all()
            
            total_bookings = len(bookings)
            completed_bookings = len([b for b in bookings if b.status == 'completed'])
            cancelled_bookings = len([b for b in bookings if b.status == 'cancelled'])
            total_revenue = sum([float(b.total_price or 0) for b in bookings if b.payment_status == 'paid'])
            
            return jsonify({
                'year': year,
                'totalBookings': total_bookings,
                'totalCompleted': completed_bookings,
                'totalCancelled': cancelled_bookings,
                'totalRevenue': total_revenue,
                'avgRating': 4.5  # Placeholder
            }), 200
        else:
            # Get reports for multiple years (last 3 years)
            current_year = datetime.now().year
            yearly_reports = []
            
            for y in range(current_year - 2, current_year + 1):
                start_date = datetime(y, 1, 1)
                end_date = datetime(y + 1, 1, 1)
                
                year_bookings = Booking.query.filter(
                    and_(
                        Booking.created_at >= start_date,
                        Booking.created_at < end_date
                    )                ).all()
                
                total_bookings = len(year_bookings)
                completed_bookings = len([b for b in year_bookings if b.status == 'completed'])
                cancelled_bookings = len([b for b in year_bookings if b.status == 'cancelled'])
                total_revenue = sum([float(b.total_price or 0) for b in year_bookings if b.payment_status == 'paid'])
                
                # Calculate average rating for completed bookings
                avg_rating = 0
                completed_year_bookings = [b for b in year_bookings if b.status == 'completed']
                if completed_year_bookings:
                    try:
                        from app.models.service import Review
                        completed_booking_ids = [b.id for b in completed_year_bookings]
                        ratings = db.session.query(func.avg(Review.rating)).filter(
                            Review.booking_id.in_(completed_booking_ids)
                        ).scalar()
                        avg_rating = float(ratings) if ratings else 0
                    except Exception as e:
                        current_app.logger.warning(f"Could not calculate avg rating for year {y}: {str(e)}")
                        avg_rating = 0
                
                yearly_reports.append({
                    'year': y,
                    'totalBookings': total_bookings,
                    'totalCompleted': completed_bookings,
                    'totalCancelled': cancelled_bookings,
                    'totalRevenue': total_revenue,
                    'avgRating': avg_rating
                })
            
            return jsonify(yearly_reports), 200
        
    except Exception as e:
        current_app.logger.error(f"Yearly report error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get yearly report: {str(e)}'
        }), 500

@admin_bp.route('/revenue', methods=['GET'])
@jwt_required()
@admin_required
def get_revenue():
    """Lấy doanh thu theo khoảng thời gian"""
    try:
        start_date_str = request.args.get('start')
        end_date_str = request.args.get('end')
        
        if not start_date_str or not end_date_str:
            return jsonify({
                'status': 'error',
                'message': 'Start date and end date are required'
            }), 400
        
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
        except ValueError:
            return jsonify({
                'status': 'error',
                'message': 'Invalid date format. Use ISO format (YYYY-MM-DD)'
            }), 400
        
        # Get paid bookings in the date range
        bookings = Booking.query.filter(
            and_(
                Booking.created_at >= start_date,
                Booking.created_at <= end_date,
                Booking.payment_status == 'paid'
            )
        ).all()
        
        total_revenue = sum([float(b.total_price or 0) for b in bookings])
        total_bookings = len(bookings)
        
        # Calculate daily breakdown
        daily_data = {}
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        while current_date <= end_date_only:
            day_bookings = [b for b in bookings if b.created_at.date() == current_date]
            daily_data[current_date.isoformat()] = {
                'bookings': len(day_bookings),
                'revenue': sum([float(b.total_price or 0) for b in day_bookings])
            }
            current_date += timedelta(days=1)
        
        return jsonify({
            'startDate': start_date_str,
            'endDate': end_date_str,
            'totalRevenue': total_revenue,
            'totalBookings': total_bookings,
            'dailyData': daily_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Revenue report error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get revenue data: {str(e)}'
        }), 500
