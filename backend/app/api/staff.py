"""
API endpoints cho quản lý nhân viên
Đồng bộ với schema SQL PostgreSQL
Bảng: users (role='staff')
Author: CleanHome Team  
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_
from app.extensions import db
from app.models.user import User
from app.utils.helpers import admin_required

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required
def get_staff():
    """
    Lấy danh sách tất cả nhân viên (chỉ dành cho admin)
    - Lọc users có role='staff' từ bảng users
    - Bao gồm thông tin lịch làm việc
    """
    try:
        # Lấy tham số query
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int) 
        status = request.args.get('status')  # active/inactive
        
        # Query nhân viên từ bảng users với role='staff'
        query = User.query.filter_by(role='staff')
        
        if status:
            query = query.filter_by(status=status)
              # Phân trang
        staff_pagination = query.paginate(
            page=page, per_page=limit, error_out=False
        )
        
        result = []
        for staff in staff_pagination.items:
            result.append({
                'id': str(staff.id),
                'name': staff.name,
                'email': staff.email,
                'phone': staff.phone,
                'status': staff.status,  # enum user_status
                'avatar': staff.avatar,
                'bio': staff.bio,
                'loginCount': staff.login_count,
                'lastLoginAt': staff.last_login_at.isoformat() if staff.last_login_at else None,
                'createdAt': staff.created_at.isoformat() if staff.created_at else None,
                'updatedAt': staff.updated_at.isoformat() if staff.updated_at else None
            })
        
        return jsonify({
            'status': 'success',
            'staff': result,
            'pagination': {
                'page': page,
                'pages': staff_pagination.pages,
                'total': staff_pagination.total,
                'per_page': limit
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi lấy danh sách nhân viên: {str(e)}'
        }), 500

@staff_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_staff():
    """
    Tạo nhân viên mới (chỉ dành cho admin)
    - Tạo user mới với role='staff'
    - Không cần mật khẩu, sẽ được tạo tự động hoặc gửi email đặt lại
    """
    try:
        data = request.get_json()
        
        # Validate dữ liệu đầu vào
        if not data.get('name'):
            return jsonify({
                'status': 'error',
                'message': 'Tên nhân viên là bắt buộc'
            }), 400
            
        if not data.get('email'):
            return jsonify({
                'status': 'error',
                'message': 'Email là bắt buộc'
            }), 400
        
        # Kiểm tra email đã tồn tại chưa
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({
                'status': 'error',
                'message': 'Email đã tồn tại trong hệ thống'
            }), 400
          # Tạo mật khẩu tạm thời (có thể thay đổi sau)
        password = data.get('password')
        if not password:
            # Nếu không có password được cung cấp, tạo tự động
            import secrets
            import string
            password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
            is_generated_password = True
        else:
            is_generated_password = False
        
        # Tạo user mới với role staff
        new_staff = User(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone', ''),
            role='staff',
            status=data.get('status', 'active'),  # active, inactive, locked, pending
            bio=data.get('bio', ''),
            avatar=data.get('avatar', '')
        )
          # Set mật khẩu
        new_staff.set_password(password)
        
        # Lưu vào database
        db.session.add(new_staff)
        db.session.commit()
        
        # Trả về thông tin nhân viên mới (không bao gồm mật khẩu)
        return jsonify({
            'status': 'success',
            'message': 'Tạo nhân viên thành công',
            'staff': {
                'id': str(new_staff.id),
                'name': new_staff.name,
                'email': new_staff.email,
                'phone': new_staff.phone,
                'role': new_staff.role,
                'status': new_staff.status,
                'avatar': new_staff.avatar,
                'bio': new_staff.bio,
                'createdAt': new_staff.created_at.isoformat() if new_staff.created_at else None            },
            'password': password if is_generated_password else None,  # Chỉ trả về password nếu được tạo tự động
            'isGeneratedPassword': is_generated_password
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi tạo nhân viên: {str(e)}'
        }), 500

@staff_bp.route('/<staff_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_staff(staff_id):
    """
    Cập nhật thông tin nhân viên (chỉ dành cho admin)
    - Cập nhật thông tin user với role='staff'
    """
    try:
        staff = User.query.filter_by(id=staff_id, role='staff').first()
        if not staff:
            return jsonify({
                'status': 'error',
                'message': 'Nhân viên không tồn tại'
            }), 404
        
        data = request.get_json()
        
        # Validate dữ liệu đầu vào
        if data.get('email') and data['email'] != staff.email:
            # Kiểm tra email đã tồn tại chưa
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user:
                return jsonify({
                    'status': 'error',
                    'message': 'Email đã tồn tại trong hệ thống'
                }), 400
        
        # Cập nhật thông tin
        if data.get('name'):
            staff.name = data['name']
        if data.get('email'):
            staff.email = data['email']
        if data.get('phone'):
            staff.phone = data['phone']
        if data.get('status'):
            staff.status = data['status']
        if data.get('bio'):
            staff.bio = data['bio']
        if data.get('avatar'):
            staff.avatar = data['avatar']
        
        # Cập nhật mật khẩu nếu có
        if data.get('password'):
            staff.set_password(data['password'])
        
        # Lưu vào database
        db.session.commit()
        
        # Trả về thông tin nhân viên đã cập nhật
        return jsonify({
            'status': 'success',
            'message': 'Cập nhật nhân viên thành công',
            'staff': {
                'id': str(staff.id),
                'name': staff.name,
                'email': staff.email,
                'phone': staff.phone,
                'role': staff.role,
                'status': staff.status,
                'avatar': staff.avatar,
                'bio': staff.bio,
                'updatedAt': staff.updated_at.isoformat() if staff.updated_at else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi cập nhật nhân viên: {str(e)}'
        }), 500

@staff_bp.route('/<staff_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_staff_status(staff_id):
    """
    Cập nhật trạng thái nhân viên (chỉ dành cho admin)
    """
    try:
        # Log request info
        from flask import current_app
        current_app.logger.info(f"Updating staff status - ID: {staff_id}")
        
        staff = User.query.filter_by(id=staff_id, role='staff').first()
        if not staff:
            current_app.logger.warning(f"Staff not found - ID: {staff_id}")
            return jsonify({
                'status': 'error',
                'message': 'Nhân viên không tồn tại'
            }), 404
        
        data = request.get_json()
        new_status = data.get('status')
        
        current_app.logger.info(f"Staff {staff_id} status change: {staff.status} -> {new_status}")
        
        if not new_status or new_status not in ['active', 'inactive', 'locked', 'pending']:
            current_app.logger.error(f"Invalid status: {new_status}")
            return jsonify({
                'status': 'error',
                'message': 'Trạng thái không hợp lệ'
            }), 400
        
        # Cập nhật trạng thái
        old_status = staff.status
        staff.status = new_status
        db.session.commit()
        
        current_app.logger.info(f"Successfully updated staff {staff_id} status: {old_status} -> {new_status}")
        
        response_data = {
            'status': 'success',
            'message': 'Cập nhật trạng thái thành công',
            'staff': {
                'id': str(staff.id),
                'name': staff.name,
                'email': staff.email,
                'status': staff.status
            }
        }
        
        current_app.logger.info(f"Sending response: {response_data}")
        return jsonify(response_data), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating staff status: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi cập nhật trạng thái: {str(e)}'
        }), 500

@staff_bp.route('/<staff_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_staff(staff_id):
    """
    Xóa nhân viên (chỉ dành cho admin)
    - Xóa user với role='staff'
    - Kiểm tra các ràng buộc trước khi xóa
    """
    try:
        staff = User.query.filter_by(id=staff_id, role='staff').first()
        if not staff:
            return jsonify({
                'status': 'error',
                'message': 'Nhân viên không tồn tại'
            }), 404
          # Kiểm tra các ràng buộc (booking đang hoạt động, etc.)
        from app.models.booking import Booking
        active_bookings = Booking.query.filter_by(
            staff_id=staff_id,
            status='in_progress'
        ).count()
        
        if active_bookings > 0:
            return jsonify({
                'status': 'error',
                'message': f'Không thể xóa nhân viên vì có {active_bookings} booking đang thực hiện'
            }), 400
          # Cập nhật các booking đã hoàn thành để không mất dữ liệu lịch sử
        completed_bookings = Booking.query.filter_by(staff_id=staff_id).all()
        for booking in completed_bookings:
            booking.staff_id = None  # Hoặc gán cho admin
        
        # Xóa nhân viên
        db.session.delete(staff)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Xóa nhân viên thành công'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Lỗi khi xóa nhân viên: {str(e)}'
        }), 500
