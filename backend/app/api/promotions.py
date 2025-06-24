"""Promotions API endpoints"""

from flask import Blueprint, jsonify

promotions_bp = Blueprint('promotions', __name__)

@promotions_bp.route('/', methods=['GET'])
def get_promotions():
    """Get all promotions"""
    return jsonify({'message': 'Promotions endpoint working', 'promotions': []})

