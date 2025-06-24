"""Areas API endpoints"""

from flask import Blueprint, jsonify

areas_bp = Blueprint('areas', __name__)

@areas_bp.route('/', methods=['GET'])
def get_areas():
    """Get all service areas"""
    return jsonify({'message': 'Areas endpoint working', 'areas': []})

