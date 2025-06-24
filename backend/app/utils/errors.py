"""Error handling utilities"""

from flask import jsonify, current_app
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import HTTPException
import traceback


def handle_error(error, default_message="An error occurred", status_code=500):
    """
    Generic error handler
    
    Args:
        error: The exception that occurred
        default_message: Default error message if none can be extracted
        status_code: HTTP status code to return
        
    Returns:
        tuple: (response, status_code)
    """
    current_app.logger.error(f"Error: {str(error)}")
    current_app.logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Extract meaningful error message
    if hasattr(error, 'message'):
        message = error.message
    elif hasattr(error, 'description'):
        message = error.description
    else:
        message = str(error) if str(error) else default_message
    
    return jsonify({
        'status': 'error',
        'message': message,
        'error_type': type(error).__name__
    }), status_code


def handle_validation_error(error: ValidationError):
    """
    Handle Marshmallow validation errors
    
    Args:
        error: ValidationError instance
        
    Returns:
        tuple: (response, status_code)
    """
    return jsonify({
        'status': 'error',
        'message': 'Validation failed',
        'errors': error.messages
    }), 400


def handle_integrity_error(error: IntegrityError):
    """
    Handle SQLAlchemy integrity errors
    
    Args:
        error: IntegrityError instance
        
    Returns:
        tuple: (response, status_code)
    """
    error_message = str(error.orig) if error.orig else str(error)
    
    # Check for common integrity constraint violations
    if 'unique constraint' in error_message.lower() or 'duplicate key' in error_message.lower():
        if 'email' in error_message.lower():
            message = 'Email address already exists'
        elif 'phone' in error_message.lower():
            message = 'Phone number already exists'
        else:
            message = 'A record with this information already exists'
        status_code = 409
    elif 'foreign key constraint' in error_message.lower():
        message = 'Referenced record does not exist'
        status_code = 400
    elif 'not null constraint' in error_message.lower():
        message = 'Required field is missing'
        status_code = 400
    else:
        message = 'Database constraint violation'
        status_code = 400
    
    current_app.logger.error(f"Integrity error: {error_message}")
    
    return jsonify({
        'status': 'error',
        'message': message,
        'error_type': 'IntegrityError'
    }), status_code


def handle_http_error(error: HTTPException):
    """
    Handle HTTP exceptions
    
    Args:
        error: HTTPException instance
        
    Returns:
        tuple: (response, status_code)
    """
    return jsonify({
        'status': 'error',
        'message': error.description,
        'error_type': 'HTTPError'
    }), error.code


class APIError(Exception):
    """Custom API error class"""
    
    def __init__(self, message, status_code=500, payload=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload
    
    def to_dict(self):
        """Convert error to dictionary"""
        result = {
            'status': 'error',
            'message': self.message,
            'error_type': 'APIError'
        }
        if self.payload:
            result.update(self.payload)
        return result


class ValidationAPIError(APIError):
    """Custom validation error class"""
    
    def __init__(self, message, errors=None):
        super().__init__(message, status_code=400)
        self.errors = errors or {}
    
    def to_dict(self):
        """Convert error to dictionary"""
        result = super().to_dict()
        if self.errors:
            result['errors'] = self.errors
        return result


class AuthenticationError(APIError):
    """Authentication error"""
    
    def __init__(self, message="Authentication required"):
        super().__init__(message, status_code=401)


class AuthorizationError(APIError):
    """Authorization error"""
    
    def __init__(self, message="Access denied"):
        super().__init__(message, status_code=403)


class NotFoundError(APIError):
    """Resource not found error"""
    
    def __init__(self, message="Resource not found"):
        super().__init__(message, status_code=404)


class ConflictError(APIError):
    """Resource conflict error"""
    
    def __init__(self, message="Resource conflict"):
        super().__init__(message, status_code=409)


def register_error_handlers(app):
    """Register error handlers with Flask app"""
    
    @app.errorhandler(ValidationError)
    def handle_marshmallow_error(error):
        return handle_validation_error(error)
    
    @app.errorhandler(IntegrityError)
    def handle_sqlalchemy_error(error):
        return handle_integrity_error(error)
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return handle_http_error(error)
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        return jsonify(error.to_dict()), error.status_code
    
    @app.errorhandler(Exception)
    def handle_generic_error(error):
        return handle_error(error)
    
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({
            'status': 'error',
            'message': 'Endpoint not found',
            'error_type': 'NotFound'
        }), 404
    
    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        return jsonify({
            'status': 'error',
            'message': 'Method not allowed',
            'error_type': 'MethodNotAllowed'
        }), 405
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({
            'status': 'error',
            'message': 'Internal server error',
            'error_type': 'InternalServerError'
        }), 500

