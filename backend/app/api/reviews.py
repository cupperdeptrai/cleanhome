"""Reviews API endpoints"""

from flask import Blueprint, jsonify, request

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('', methods=['GET'])
@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    """Get all reviews"""
    return jsonify({'message': 'Reviews endpoint working', 'reviews': []})

@reviews_bp.route('', methods=['POST'])
@reviews_bp.route('/', methods=['POST'])
def create_review():
    """Create a new review"""
    data = request.get_json()
    return jsonify({
        'success': True,
        'message': 'Review created successfully',
        'review': data
    }), 201

@reviews_bp.route('', methods=['OPTIONS'])
@reviews_bp.route('/', methods=['OPTIONS'])
def handle_options():
    """Handle preflight OPTIONS requests"""
    return '', 200

