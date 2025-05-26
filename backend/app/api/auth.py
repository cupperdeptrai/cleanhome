from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import User
from ..extensions import db
from ..utils.helpers import is_valid_uuid
from ..utils.validators import validate_email_format, validate_phone_format, validate_required_fields
import logging

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Đăng ký người dùng mới
    ---
    Tạo tài khoản người dùng mới với thông tin cung cấp và trả về token xác thực.
    """
    data = request.get_json()
    
    # Ghi log thông tin đăng ký
    current_app.logger.info(f"Nhận yêu cầu đăng ký từ email: {data.get('email', 'không có email')}")
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['email', 'password', 'name']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        current_app.logger.warning(f"Đăng ký thất bại: Thiếu thông tin bắt buộc: {', '.join(missing_fields)}")
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra định dạng email
    is_valid_email, email_error = validate_email_format(data['email'])
    if not is_valid_email:
        current_app.logger.warning(f"Đăng ký thất bại: Email không hợp lệ: {data.get('email')}")
        return jsonify({'message': email_error}), 400
    
    # Kiểm tra định dạng số điện thoại nếu được cung cấp
    if 'phone' in data and data['phone']:
        is_valid_phone, phone_error = validate_phone_format(data['phone'])
        if not is_valid_phone:
            current_app.logger.warning(f"Đăng ký thất bại: Số điện thoại không hợp lệ: {data.get('phone')}")
            return jsonify({'message': phone_error}), 400
    
    # Kiểm tra xem email đã tồn tại chưa
    if User.query.filter_by(email=data['email']).first():
        current_app.logger.warning(f"Đăng ký thất bại: Email đã tồn tại: {data.get('email')}")
        return jsonify({'message': 'Email đã được sử dụng'}), 400
    
    # Map role từ frontend sang database nếu cần
    role = data.get('role', 'customer')
    # Nếu role từ frontend là 'user', chuyển thành 'customer' cho phù hợp với database
    if role == 'user':
        role = 'customer'
        current_app.logger.info(f"Chuyển đổi role từ 'user' sang 'customer' cho email: {data.get('email')}")
    
    # Tạo người dùng mới
    try:
        user = User(
            email=data['email'],
            name=data['name'],
            phone=data.get('phone'),
            address=data.get('address'),
            role=role,  # Sử dụng role đã xử lý
            status='active'   # Mặc định trạng thái là hoạt động
        )
        user.password_hash = data['password']  # Mã hóa mật khẩu
        
        db.session.add(user)
        db.session.commit()
        
        current_app.logger.info(f"Đăng ký thành công cho người dùng: {data.get('email')}, ID: {user.id}")
        
        # Tạo token JWT
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Đăng ký thành công',
            'token': access_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        current_app.logger.error(f"Lỗi khi đăng ký người dùng: {str(e)}")
        db.session.rollback()
        return jsonify({'message': 'Đã xảy ra lỗi khi đăng ký, vui lòng thử lại sau'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Đăng nhập người dùng
    ---
    Xác thực người dùng và trả về token JWT.
    """
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['email', 'password']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Tìm người dùng theo email
    user = User.query.filter_by(email=data['email']).first()
    
    # Kiểm tra người dùng tồn tại và mật khẩu đúng
    if not user or not user.verify_password(data['password']):
        return jsonify({'message': 'Email hoặc mật khẩu không đúng'}), 401
    
    # Kiểm tra trạng thái người dùng
    if user.status != 'active':
        return jsonify({'message': 'Tài khoản đã bị khóa'}), 403
    
    # Tạo token JWT
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Đăng nhập thành công',
        'token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    """
    Lấy thông tin người dùng đang đăng nhập
    ---
    Trả về thông tin chi tiết của người dùng hiện tại dựa trên token JWT.
    """
    user_id = get_jwt_identity()
    
    # Kiểm tra định dạng UUID
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    return jsonify({
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Cập nhật thông tin người dùng
    ---
    Cho phép người dùng cập nhật thông tin cá nhân.
    """
    user_id = get_jwt_identity()
    
    # Kiểm tra định dạng UUID
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    data = request.get_json()
    
    # Kiểm tra định dạng số điện thoại nếu được cung cấp
    if 'phone' in data and data['phone']:
        is_valid_phone, phone_error = validate_phone_format(data['phone'])
        if not is_valid_phone:
            return jsonify({'message': phone_error}), 400
    
    # Cập nhật các trường nếu được cung cấp
    if 'name' in data:
        user.name = data['name']
    if 'phone' in data:
        user.phone = data['phone']
    if 'address' in data:
        user.address = data['address']
    if 'avatar' in data:
        user.avatar = data['avatar']
    if 'password' in data and data['password']:
        user.password_hash = data['password']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Cập nhật thông tin thành công',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    Thay đổi mật khẩu
    ---
    Cho phép người dùng thay đổi mật khẩu với xác nhận mật khẩu cũ.
    """
    user_id = get_jwt_identity()
    
    # Kiểm tra định dạng UUID
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['current_password', 'new_password']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Xác minh mật khẩu hiện tại
    if not user.verify_password(data['current_password']):
        return jsonify({'message': 'Mật khẩu hiện tại không đúng'}), 401
    
    # Cập nhật mật khẩu mới
    user.password_hash = data['new_password']
    db.session.commit()
    
    return jsonify({
        'message': 'Thay đổi mật khẩu thành công'
    }), 200

@auth_bp.route('/refresh-token', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """
    Làm mới token JWT
    ---
    Tạo token JWT mới khi token cũ sắp hết hạn.
    """
    user_id = get_jwt_identity()
    
    # Kiểm tra định dạng UUID
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    # Kiểm tra người dùng có tồn tại không
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    # Kiểm tra tài khoản có bị khóa không
    if user.status != 'active':
        return jsonify({'message': 'Tài khoản đã bị khóa'}), 403
    
    # Tạo token JWT mới
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Làm mới token thành công',
        'token': access_token
    }), 200
