"""
API endpoints cho quản lý người dùng
Đồng bộ với schema SQL PostgreSQL
Bảng: users, user_addresses
Author: CleanHome Team
"""

import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

from app.extensions import db
from app.models.user import User
from app.schemas.user import (
    user_schema, users_schema, user_create_schema, user_update_schema,
    user_password_change_schema
)
from app.utils.errors import handle_error
from app.utils.validators import validate_uuid

users_bp = Blueprint('users', __name__)

# Các loại file ảnh được phép
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    """Kiểm tra file có phải là ảnh được phép không"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """
    Lấy danh sách tất cả người dùng với phân trang và bộ lọc
    - Yêu cầu JWT token
    - Hỗ trợ lọc theo: role (admin/customer/staff), status, search
    - Đồng bộ với bảng users trong PostgreSQL
    """
    try:
        # Lấy tham số query
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        role = request.args.get('role')
        status = request.args.get('status')
        search = request.args.get('search')
        
        # Kiểm tra quyền admin hoặc staff
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_staff():
            return jsonify({'error': 'Access denied. Staff role required.'}), 403
        
        # Tạo query cơ bản
        query = User.query
        
        # Áp dụng bộ lọc
        if role:
            query = query.filter(User.role == role)
        
        if status:
            query = query.filter(User.status == status)
        
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                db.or_(
                    User.name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    User.phone.ilike(search_pattern)
                )
            )
        
        # Phân trang
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        users = pagination.items
        
        return jsonify({
            'status': 'success',
            'data': {
                'users': users_schema.dump(users),
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': pagination.total,
                    'pages': pagination.pages,
                    'has_next': pagination.has_next,
                    'has_prev': pagination.has_prev
                }
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching users: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Lấy thông tin chi tiết một người dùng"""
    try:
        # Validate UUID
        if not validate_uuid(user_id):
            return jsonify({'error': 'Invalid user ID format'}), 400
        
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Chỉ cho phép xem thông tin của chính mình hoặc admin/staff
        if str(current_user_id) != user_id and not current_user.is_staff():
            return jsonify({'error': 'Access denied'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'status': 'success',
            'data': user_schema.dump(user)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching user {user_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Cập nhật thông tin người dùng"""
    try:
        # Validate UUID
        if not validate_uuid(user_id):
            return jsonify({'error': 'Invalid user ID format'}), 400
        
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Chỉ cho phép cập nhật thông tin của chính mình hoặc admin
        if str(current_user_id) != user_id and not current_user.is_admin():
            return jsonify({'error': 'Access denied'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate request data
        try:
            data = user_update_schema.load(request.json)
        except ValidationError as err:
            return jsonify({'error': 'Validation error', 'details': err.messages}), 400
        
        # Cập nhật các trường được phép
        for field in ['name', 'phone', 'address', 'bio']:
            if field in data:
                setattr(user, field, data[field])
        
        # Chỉ admin mới được cập nhật status và role
        if current_user.is_admin():
            if 'status' in data:
                user.status = data['status']
            if 'role' in data:
                user.role = data['role']
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'User updated successfully',
            'data': user_schema.dump(user)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating user {user_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/<user_id>/avatar', methods=['POST'])
@jwt_required()
def upload_avatar(user_id):
    """
    Upload ảnh đại diện cho người dùng
    - Chỉ cho phép user tự upload avatar của mình hoặc admin
    - Kiểm tra loại file và kích thước (max 5MB)
    - Lưu file vào thư mục static/uploads/avatars/
    - Cập nhật URL avatar vào database
    """
    try:
        # Kiểm tra định dạng UUID của user_id
        if not validate_uuid(user_id):
            return jsonify({'error': 'Invalid user ID format'}), 400
        
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Chỉ cho phép cập nhật avatar của chính mình hoặc admin
        if str(current_user_id) != user_id and not current_user.is_admin():
            return jsonify({'error': 'Access denied'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Kiểm tra có file upload trong request không
        if 'avatar' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['avatar']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Kiểm tra loại file có phải ảnh không
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only images are allowed.'}), 400
        
        # Kiểm tra kích thước file (tối đa 5MB)
        file.seek(0, 2)  # Di chuyển pointer đến cuối file để đo size
        file_size = file.tell()
        file.seek(0)  # Reset pointer về đầu file
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            return jsonify({'error': 'File too large. Maximum size is 5MB.'}), 400
        
        # Tạo tên file an toàn và unique
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        new_filename = f"avatar_{user_id}_{hash(current_app.config.get('SECRET_KEY', '')) % 1000000}.{file_extension}"
        
        # Tạo thư mục uploads/avatars nếu chưa có
        upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'avatars')
        os.makedirs(upload_folder, exist_ok=True)
        current_app.logger.info(f"📁 Thư mục upload: {upload_folder}")
        
        # Xóa avatar cũ nếu có để tiết kiệm dung lượng
        if user.avatar:
            old_avatar_path = os.path.join(current_app.config['UPLOAD_FOLDER'], user.avatar.lstrip('/static/uploads/'))
            if os.path.exists(old_avatar_path):
                try:
                    os.remove(old_avatar_path)
                    current_app.logger.info(f"Đã xóa avatar cũ: {old_avatar_path}")
                except Exception as e:
                    current_app.logger.warning(f"Không thể xóa avatar cũ: {str(e)}")
        
        # Lưu file mới vào thư mục
        file_path = os.path.join(upload_folder, new_filename)
        file.save(file_path)
        current_app.logger.info(f"Đã lưu avatar mới: {file_path}")
        
        # Cập nhật đường dẫn avatar trong database
        avatar_url = f"/static/uploads/avatars/{new_filename}"
        user.avatar = avatar_url
        
        db.session.commit()
        current_app.logger.info(f"Đã cập nhật avatar cho user {user_id}: {avatar_url}")
        
        return jsonify({
            'status': 'success',
            'message': 'Avatar uploaded successfully',
            'data': {
                'avatar_url': avatar_url,
                'user': user_schema.dump(user)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi khi upload avatar cho user {user_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/<user_id>/change-password', methods=['POST'])
@jwt_required()
def change_password(user_id):
    """Đổi mật khẩu người dùng"""
    try:
        # Validate UUID
        if not validate_uuid(user_id):
            return jsonify({'error': 'Invalid user ID format'}), 400
        
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Chỉ cho phép đổi mật khẩu của chính mình hoặc admin
        if str(current_user_id) != user_id and not current_user.is_admin():
            return jsonify({'error': 'Access denied'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate request data
        try:
            data = user_password_change_schema.load(request.json)
        except ValidationError as err:
            return jsonify({'error': 'Validation error', 'details': err.messages}), 400
        
        # Nếu không phải admin thì phải cung cấp mật khẩu hiện tại
        if not current_user.is_admin() or str(current_user_id) == user_id:
            if not user.check_password(data['current_password']):
                return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Cập nhật mật khẩu mới
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error changing password for user {user_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@users_bp.route('/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Xóa người dùng (Chỉ Admin)"""
    try:
        # Validate UUID
        if not validate_uuid(user_id):
            return jsonify({'error': 'Invalid user ID format'}), 400
        
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin():
            return jsonify({'error': 'Access denied. Admin role required.'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Không cho phép xóa chính mình
        if str(current_user_id) == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Xóa avatar nếu có
        if user.avatar:
            avatar_path = os.path.join(current_app.config['UPLOAD_FOLDER'], user.avatar.lstrip('/static/uploads/'))
            if os.path.exists(avatar_path):
                try:
                    os.remove(avatar_path)
                    current_app.logger.info(f"Đã xóa avatar khi xóa user: {avatar_path}")
                except Exception as e:
                    current_app.logger.warning(f"Could not delete avatar: {str(e)}")
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting user {user_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

