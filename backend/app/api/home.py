from flask import Blueprint, jsonify

home_bp = Blueprint('home', __name__)

@home_bp.route('/', methods=['GET'])
def index():
    """
    Default endpoint for the API
    Returns information about the API
    """
    return jsonify({
        'name': 'CleanHome API',
        'version': '1.0.0',
        'description': 'API for CleanHome cleaning service booking platform',
        'endpoints': {
            'auth': '/api/auth',
            'users': '/api/users',
            'services': '/api/services',
            'bookings': '/api/bookings',
            'promotions': '/api/promotions'
        },
        'status': 'online'
    }), 200

@home_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    Returns status of the API
    """
    return jsonify({
        'status': 'healthy',
        'message': 'API is running correctly'
    }), 200