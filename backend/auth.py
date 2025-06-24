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
        
        current_app.logger.info(f"New user registered: {user.email}")
        
        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'user': user.to_dict()
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
            user.failed_login_attempts += 1
            
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

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email'):
            return jsonify({
                'status': 'error',
                'message': 'Email is required'
            }), 400
        
        user = User.query.filter_by(email=data['email'].lower().strip()).first()
        
        # Always return success to prevent email enumeration
        response_message = 'If the email exists, a password reset link has been sent'
        
        if user and user.is_active():
            # TODO: Implement email sending
            # For now, just log the reset request
            current_app.logger.info(f"Password reset requested for: {user.email}")
            
            # In a real implementation, you would:
            # 1. Generate a secure reset token
            # 2. Store it in database with expiration
            # 3. Send email with reset link
        
        return jsonify({
            'status': 'success',
            'message': response_message
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Forgot password error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Request failed. Please try again later.'
        }), 500

@auth_bp.route('/verify-token', methods=['POST'])
@jwt_required()
def verify_token():
    """Verify if current token is valid"""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        
        user = User.query.get(user_id)
        if not user or not user.is_active():
            return jsonify({
                'status': 'error',
                'message': 'Invalid token or user not active'
            }), 401
        
        return jsonify({
            'status': 'success',
            'message': 'Token is valid',
            'user_id': user_id,
            'role': claims.get('role'),
            'exp': claims.get('exp')
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Token verification failed: {str(e)}'
        }), 401

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
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'status': 'error',
                'message': 'Email and password are required'
            }), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({
                'status': 'error',
                'message': 'Email already registered'
            }), 409
        
        # Create new user
        user = User(
            name=data.get('name', ''),
            email=data['email'],
            phone=data.get('phone', ''),
            role=data.get('role', 'customer')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Registration failed: {str(e)}'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'status': 'error',
                'message': 'Email and password are required'
            }), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({
                'status': 'error',
                'message': 'Invalid email or password'
            }), 401
        
        # Check if user is active
        if not user.is_active():
            return jsonify({
                'status': 'error',
                'message': 'Account is not active'
            }), 401
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
          # Update login stats
        user.login_count += 1
        from sqlalchemy import func
        user.last_login_at = func.now()
        user.failed_login_attempts = 0
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Login failed: {str(e)}'
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
        
        return jsonify({
            'status': 'success',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get user info: {str(e)}'
        }), 500

