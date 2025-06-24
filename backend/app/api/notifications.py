"""Notifications API endpoints"""

from flask import Blueprint, jsonify

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    """Get all notifications"""
    return jsonify({'message': 'Notifications endpoint working', 'notifications': []})

