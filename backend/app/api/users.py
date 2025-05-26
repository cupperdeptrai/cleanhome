from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User
from ..extensions import db
from ..utils.helpers import is_valid_uuid
from ..utils.validators import (
    validate_email_format, 
    validate_phone_format, 
    validate_required_fields,
    validate_user_role,
    validate_user_status
)

users_bp = Blueprint('users', __name__)

# Decorator kiểm tra quyền admin
def admin_required(f):
    """
    Decorator kiểm tra quyền admin
    ---
    Đảm bảo người dùng hiện tại có quyền admin trước khi thực hiện hành động.
    """
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        
        if not is_valid_uuid(user_id):
            return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
        
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Bạn không có quyền thực hiện hành động này'}), 403
        
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return jwt_required()(decorated_function)

@users_bp.route('/', methods=['GET'])
@admin_required
def get_users():
    """
    Lấy danh sách người dùng
    ---
    Chỉ admin mới có quyền xem danh sách tất cả người dùng.
    Hỗ trợ phân trang và lọc theo vai trò.
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    role = request.args.get('role')
    
    query = User.query
    
    # Lọc theo vai trò nếu được cung cấp
    if role:
        is_valid, _ = validate_user_role(role)
        if is_valid:
            query = query.filter_by(role=role)
    
    # Phân trang và sắp xếp theo thời gian tạo (mới nhất lên đầu)
    users = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'page': users.page
    }), 200

@users_bp.route('/<uuid:id>', methods=['GET'])
@admin_required
def get_user(id):
    """
    Lấy thông tin người dùng theo ID
    ---
    Chỉ admin mới có quyền xem thông tin chi tiết của bất kỳ người dùng nào.
    """
    user = User.query.get(id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    return jsonify({
        'user': user.to_dict()
    }), 200

@users_bp.route('/', methods=['POST'])
@admin_required
def create_user():
    """
    Tạo người dùng mới
    ---
    Chỉ admin mới có quyền tạo người dùng mới thông qua API này.
    """
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['email', 'password', 'name', 'role']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra định dạng email
    is_valid_email, email_error = validate_email_format(data['email'])
    if not is_valid_email:
        return jsonify({'message': email_error}), 400
    
    # Kiểm tra định dạng số điện thoại nếu được cung cấp
    if 'phone' in data and data['phone']:
        is_valid_phone, phone_error = validate_phone_format(data['phone'])
        if not is_valid_phone:
            return jsonify({'message': phone_error}), 400
    
    # Kiểm tra vai trò người dùng hợp lệ
    is_valid_role, role_error = validate_user_role(data['role'])
    if not is_valid_role:
        return jsonify({'message': role_error}), 400
    
    # Kiểm tra trạng thái người dùng nếu được cung cấp
    if 'status' in data:
        is_valid_status, status_error = validate_user_status(data['status'])
        if not is_valid_status:
            return jsonify({'message': status_error}), 400
    
    # Kiểm tra xem email đã tồn tại chưa
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email đã được sử dụng'}), 400
    
    # Tạo người dùng mới
    user = User(
        email=data['email'],
        name=data['name'],
        phone=data.get('phone'),
        address=data.get('address'),
        role=data['role'],
        status=data.get('status', 'active')
    )
    user.password_hash = data['password']
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Tạo người dùng thành công',
        'user': user.to_dict()
    }), 201

@users_bp.route('/<uuid:id>', methods=['PUT'])
@admin_required
def update_user(id):
    """
    Cập nhật thông tin người dùng
    ---
    Chỉ admin mới có quyền cập nhật thông tin của bất kỳ người dùng nào.
    """
    user = User.query.get(id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    data = request.get_json()
    
    # Kiểm tra định dạng email nếu được cung cấp
    if 'email' in data:
        is_valid_email, email_error = validate_email_format(data['email'])
        if not is_valid_email:
            return jsonify({'message': email_error}), 400
        
        # Kiểm tra email đã tồn tại chưa (nếu khác email hiện tại)
        if data['email'] != user.email:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user:
                return jsonify({'message': 'Email đã được sử dụng'}), 400
    
    # Kiểm tra định dạng số điện thoại nếu được cung cấp
    if 'phone' in data and data['phone']:
        is_valid_phone, phone_error = validate_phone_format(data['phone'])
        if not is_valid_phone:
            return jsonify({'message': phone_error}), 400
    
    # Kiểm tra vai trò người dùng nếu được cung cấp
    if 'role' in data:
        is_valid_role, role_error = validate_user_role(data['role'])
        if not is_valid_role:
            return jsonify({'message': role_error}), 400
    
    # Kiểm tra trạng thái người dùng nếu được cung cấp
    if 'status' in data:
        is_valid_status, status_error = validate_user_status(data['status'])
        if not is_valid_status:
            return jsonify({'message': status_error}), 400
    
    # Cập nhật các trường nếu được cung cấp
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        user.email = data['email']
    if 'phone' in data:
        user.phone = data['phone']
    if 'address' in data:
        user.address = data['address']
    if 'avatar' in data:
        user.avatar = data['avatar']
    if 'role' in data:
        user.role = data['role']
    if 'status' in data:
        user.status = data['status']
    if 'password' in data and data['password']:
        user.password_hash = data['password']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Cập nhật người dùng thành công',
        'user': user.to_dict()
    }), 200

@users_bp.route('/<uuid:id>', methods=['DELETE'])
@admin_required
def delete_user(id):
    """
    Xóa người dùng
    ---
    Chỉ admin mới có quyền xóa người dùng.
    Không thể xóa admin cuối cùng trong hệ thống.
    """
    user = User.query.get(id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    # Ngăn chặn xóa admin cuối cùng
    if user.role == 'admin':
        admin_count = User.query.filter_by(role='admin').count()
        if admin_count <= 1:
            return jsonify({'message': 'Không thể xóa admin cuối cùng trong hệ thống'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Xóa người dùng thành công'
    }), 200

@users_bp.route('/staff', methods=['GET'])
@jwt_required()
def get_staff():
    """
    Lấy danh sách nhân viên
    ---
    API này có thể được sử dụng bởi khách hàng để xem danh sách nhân viên có thể 
    thực hiện dịch vụ. Chỉ nhân viên có trạng thái hoạt động mới được hiển thị.
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Chỉ lấy nhân viên có trạng thái hoạt động
    query = User.query.filter_by(role='staff', status='active')
    
    # Phân trang và sắp xếp
    staff = query.order_by(User.name).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'staff': [user.to_dict() for user in staff.items],
        'total': staff.total,
        'pages': staff.pages,
        'page': staff.page
    }), 200
