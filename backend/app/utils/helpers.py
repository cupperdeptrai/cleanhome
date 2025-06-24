"""Helper functions and decorators"""

import functools
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.models.user import User

def admin_required(f):
    """Decorator to require admin role for API access"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        
        # Get user from database
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        # Check if user is admin
        if user.role != 'admin':
            return jsonify({
                'status': 'error',
                'message': 'Admin access required'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def staff_required(f):
    """Decorator to require staff or admin role for API access"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        
        # Get user from database
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        # Check if user is staff or admin
        if user.role not in ['staff', 'admin']:
            return jsonify({
                'status': 'error',
                'message': 'Staff access required'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def generate_booking_code():
    """Generate unique booking code"""
    import random
    import string
    return 'BK' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def safe_float(value, default=0.0):
    """Safely convert value to float"""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def safe_int(value, default=0):
    """Safely convert value to int"""
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default

