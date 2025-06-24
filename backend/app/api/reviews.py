"""Reviews API endpoints"""

from flask import Blueprint, jsonify

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    """Get all reviews"""
    return jsonify({'message': 'Reviews endpoint working', 'reviews': []})

