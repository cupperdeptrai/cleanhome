"""Authentication API endpoints"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, 
    get_jwt_identity, get_jwt, verify_jwt_in_request
)
from datetime import datetime, timedelta
from app.extensions import db
from app.models.user import User
from app.utils.validators import validate_email, validate_password
from app.utils.errors import ValidationAPIError, AuthenticationError, handle_error
import re

auth_bp = Blueprint('auth', __name__)

# Token blacklist for logout functionality
blacklisted_tokens = set()

@auth_bp.route('/test', methods=['GET'])
def test_connection():
    """Test database connection"""
    try:
        # Test database connection using text() for SQLAlchemy 2.0
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'success',
            'message': 'Database connection successful',
            'database': 'PostgreSQL - cleanhome'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Database connection failed: {str(e)}'
        }), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request body is required'
            }), 400
        
        required_fields = ['name', 'email', 'password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({
                'status': 'error',
                'message': 'Invalid email format'
            }), 400
        
        # Validate password strength
        password_validation = validate_password(data['password'])
        if not password_validation['valid']:
            return jsonify({
                'status': 'error',
                'message': 'Password validation failed',
                'details': password_validation['errors']
            }), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email'].lower()).first()
        if existing_user:
            return jsonify({
                'status': 'error',
                'message': 'Email already registered'
            }), 409
          # Validate phone if provided
        phone = data.get('phone', '').strip()
        if phone:
            # Simple Vietnamese phone validation
            if not re.match(r'^(0|\+84)[3-9]\d{8}$', phone):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid phone number format'
                }), 400
            
            # Check if phone already exists
            existing_phone_user = User.query.filter_by(phone=phone).first()
            if existing_phone_user:
                return jsonify({
                    'status': 'error',
                    'message': 'Phone number already registered'
                }), 409

        # Create new user
        user = User(
            name=data['name'].strip(),
            email=data['email'].lower().strip(),
            phone=phone,
            role=data.get('role', 'customer'),  # Default to customer
            status='active'  # Default to active
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate access token for the new user
        access_token = create_access_token(identity=str(user.id))
        
        current_app.logger.info(f"New user registered: {user.email}")
        
        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'token': access_token  # Thêm token vào response
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Registration failed: {str(e)}'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request body is required'
            }), 400
        
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'status': 'error',
                'message': 'Email and password are required'
            }), 400
        
        # Find user (case insensitive email)
        user = User.query.filter_by(email=data['email'].lower().strip()).first()
        
        if not user:
            # Log failed login attempt
            current_app.logger.warning(f"Login attempt with non-existent email: {data['email']}")
            return jsonify({
                'status': 'error',
                'message': 'Invalid email or password'
            }), 401
        
        # Check password
        if not user.check_password(data['password']):
            # Increment failed login attempts
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            
            # Lock account after 5 failed attempts
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.utcnow() + timedelta(hours=1)
                current_app.logger.warning(f"Account locked due to failed attempts: {user.email}")
            
            db.session.commit()
            
            current_app.logger.warning(f"Failed login attempt for user: {user.email}")
            return jsonify({
                'status': 'error',
                'message': 'Invalid email or password'
            }), 401
        
        # Check if account is locked
        if user.locked_until and user.locked_until > datetime.utcnow():
            return jsonify({
                'status': 'error',
                'message': f'Account is locked. Try again after {user.locked_until.strftime("%H:%M")}'
            }), 401
        
        # Check if user is active
        if not user.is_active():
            return jsonify({
                'status': 'error',
                'message': 'Account is not active. Please contact support.'
            }), 401
        
        # Create tokens with additional claims
        additional_claims = {
            'role': user.role,
            'email': user.email,
            'name': user.name
        }
        
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # Update login stats
        user.login_count = (user.login_count or 0) + 1
        user.last_login_at = datetime.utcnow()
        user.failed_login_attempts = 0
        user.locked_until = None  # Clear any lock
        db.session.commit()
        
        current_app.logger.info(f"Successful login: {user.email}")
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'expires_in': 1800  # 30 minutes
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Login failed: {str(e)}'
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active():
            return jsonify({
                'status': 'error',
                'message': 'Invalid user or account not active'
            }), 401
        
        # Create new access token
        additional_claims = {
            'role': user.role,
            'email': user.email,
            'name': user.name
        }
        
        new_token = create_access_token(
            identity=str(user.id),
            additional_claims=additional_claims
        )
        
        return jsonify({
            'status': 'success',
            'access_token': new_token,
            'expires_in': 1800
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Token refresh failed: {str(e)}'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user and blacklist token"""
    try:
        jti = get_jwt()['jti']  # JWT ID
        blacklisted_tokens.add(jti)
        
        user_id = get_jwt_identity()
        current_app.logger.info(f"User logged out: {user_id}")
        
        return jsonify({
            'status': 'success',
            'message': 'Successfully logged out'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Logout failed: {str(e)}'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        if not user.is_active():
            return jsonify({
                'status': 'error',
                'message': 'Account is not active'
            }), 401
        
        # Include additional user info
        user_data = user.to_dict()
        user_data['permissions'] = {
            'can_manage_users': user.is_admin(),
            'can_manage_bookings': user.is_staff() or user.is_admin(),
            'can_view_reports': user.is_staff() or user.is_admin()
        }
        
        return jsonify({
            'status': 'success',
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get user info: {str(e)}'
        }), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request body is required'
            }), 400
        
        # Validate required fields
        required_fields = ['current_password', 'new_password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Check current password
        if not user.check_password(data['current_password']):
            return jsonify({
                'status': 'error',
                'message': 'Current password is incorrect'
            }), 400
        
        # Validate new password
        password_validation = validate_password(data['new_password'])
        if not password_validation['valid']:
            return jsonify({
                'status': 'error',
                'message': 'New password validation failed',
                'details': password_validation['errors']
            }), 400
        
        # Check if new password is different
        if user.check_password(data['new_password']):
            return jsonify({
                'status': 'error',
                'message': 'New password must be different from current password'
            }), 400
        
        # Update password
        user.set_password(data['new_password'])
        db.session.commit()
        
        current_app.logger.info(f"Password changed for user: {user.email}")
        
        return jsonify({
            'status': 'success',
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password change error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Password change failed: {str(e)}'
        }), 500

# ==================== FORGOT PASSWORD ENDPOINTS ====================

# Temporary storage for reset codes (in production, use Redis or database)
reset_codes = {}

def generate_reset_code():
    """Generate a 6-digit reset code"""
    import random
    return str(random.randint(100000, 999999))

def send_email_code(email, code):
    """Send reset code via email (mock implementation)"""
    # In production, integrate with email service like SendGrid, AWS SES, etc.
    current_app.logger.info(f"Sending email code {code} to {email}")
    print(f"📧 EMAIL RESET CODE: {code} -> {email}")
    return True

def send_sms_code(phone, code):
    """Send reset code via SMS (mock implementation)"""
    # In production, integrate with SMS service like Twilio, AWS SNS, etc.
    current_app.logger.info(f"Sending SMS code {code} to {phone}")
    print(f"📱 SMS RESET CODE: {code} -> {phone}")
    return True

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send reset code to user's email or phone"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request body is required'
            }), 400
        
        identifier = data.get('identifier', '').strip()
        reset_type = data.get('type', 'email')  # 'email' or 'phone'
        
        if not identifier:
            return jsonify({
                'status': 'error',
                'message': 'Email or phone number is required'
            }), 400
        
        if reset_type not in ['email', 'phone']:
            return jsonify({
                'status': 'error',
                'message': 'Type must be email or phone'
            }), 400
        
        # Find user by email or phone
        user = None
        if reset_type == 'email':
            if not validate_email(identifier):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid email format'
                }), 400
            user = User.query.filter_by(email=identifier.lower()).first()
        else:  # phone
            # Validate phone format (Vietnamese phone numbers)
            phone_pattern = r'^0[3-9]\d{8}$'
            if not re.match(phone_pattern, identifier):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid phone number format. Use format: 0xxxxxxxxx'
                }), 400
            user = User.query.filter_by(phone=identifier).first()
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': f'Không tìm thấy tài khoản với {reset_type} này'
            }), 404
        
        if not user.is_active():
            return jsonify({
                'status': 'error',
                'message': 'Tài khoản đã bị khóa hoặc không hoạt động'
            }), 400
        
        # Generate reset code
        reset_code = generate_reset_code()
        
        # Store reset code with expiration (5 minutes)
        reset_key = f"{reset_type}:{identifier}"
        reset_codes[reset_key] = {
            'code': reset_code,
            'user_id': str(user.id),
            'expires_at': datetime.utcnow() + timedelta(minutes=5),
            'attempts': 0
        }
        
        # Send code
        success = False
        if reset_type == 'email':
            success = send_email_code(identifier, reset_code)
        else:
            success = send_sms_code(identifier, reset_code)
        
        if not success:
            return jsonify({
                'status': 'error',
                'message': f'Không thể gửi mã xác thực qua {reset_type}'
            }), 500
        
        return jsonify({
            'status': 'success',
            'message': f'Mã xác thực đã được gửi đến {reset_type} của bạn',
            'expires_in': 300  # 5 minutes in seconds
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Forgot password error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to send reset code: {str(e)}'
        }), 500

@auth_bp.route('/verify-reset-code', methods=['POST'])
def verify_reset_code():
    """Verify the reset code"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request body is required'
            }), 400
        
        identifier = data.get('identifier', '').strip()
        reset_type = data.get('type', 'email')
        code = data.get('code', '').strip()
        
        if not all([identifier, code]):
            return jsonify({
                'status': 'error',
                'message': 'Identifier and code are required'
            }), 400
        
        # Check reset code
        reset_key = f"{reset_type}:{identifier}"
        reset_data = reset_codes.get(reset_key)
        
        if not reset_data:
            return jsonify({
                'status': 'error',
                'message': 'Mã xác thực không tồn tại hoặc đã hết hạn'
            }), 400
        
        # Check expiration
        if datetime.utcnow() > reset_data['expires_at']:
            del reset_codes[reset_key]
            return jsonify({
                'status': 'error',
                'message': 'Mã xác thực đã hết hạn'
            }), 400
        
        # Check attempts (max 3 attempts)
        if reset_data['attempts'] >= 3:
            del reset_codes[reset_key]
            return jsonify({
                'status': 'error',
                'message': 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới'
            }), 400
        
        # Verify code
        if reset_data['code'] != code:
            reset_data['attempts'] += 1
            return jsonify({
                'status': 'error',
                'message': f'Mã xác thực không đúng. Còn {3 - reset_data["attempts"]} lần thử'
            }), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Mã xác thực chính xác'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Verify reset code error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to verify code: {str(e)}'
        }), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password with verified code"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request body is required'
            }), 400
        
        identifier = data.get('identifier', '').strip()
        reset_type = data.get('type', 'email')
        code = data.get('code', '').strip()
        new_password = data.get('newPassword', '')
        
        if not all([identifier, code, new_password]):
            return jsonify({
                'status': 'error',
                'message': 'Identifier, code, and new password are required'
            }), 400
        
        # Validate new password
        if len(new_password) < 6:
            return jsonify({
                'status': 'error',
                'message': 'Mật khẩu phải có ít nhất 6 ký tự'
            }), 400
        
        # Check reset code one more time
        reset_key = f"{reset_type}:{identifier}"
        reset_data = reset_codes.get(reset_key)
        
        if not reset_data or reset_data['code'] != code:
            return jsonify({
                'status': 'error',
                'message': 'Mã xác thực không hợp lệ'
            }), 400
        
        if datetime.utcnow() > reset_data['expires_at']:
            del reset_codes[reset_key]
            return jsonify({
                'status': 'error',
                'message': 'Mã xác thực đã hết hạn'
            }), 400
        
        # Find and update user
        user = User.query.get(reset_data['user_id'])
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Người dùng không tồn tại'
            }), 404
        
        # Update password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Clean up reset code
        del reset_codes[reset_key]
        
        current_app.logger.info(f"Password reset successful for user {user.email}")
        
        return jsonify({
            'status': 'success',
            'message': 'Đặt lại mật khẩu thành công'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Reset password error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to reset password: {str(e)}'
        }), 500

# Token checker for blacklisted tokens
@auth_bp.before_app_request
def check_if_token_revoked():
    """Check if token is blacklisted"""
    try:
        verify_jwt_in_request(optional=True)
        claims = get_jwt()
        if claims and claims.get('jti') in blacklisted_tokens:
            return jsonify({
                'status': 'error',
                'message': 'Token has been revoked'
            }), 401
    except:
        pass  # Token not present or invalid, let endpoint handle it
