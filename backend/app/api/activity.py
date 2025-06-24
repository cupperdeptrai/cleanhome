"""Activity API endpoints"""

from flask import Blueprint, jsonify

activity_bp = Blueprint('activity', __name__)

@activity_bp.route('/', methods=['GET'])
def get_activity():
    """Get user activity"""
    return jsonify({'message': 'Activity endpoint working', 'activity': []})

