"""Promotions API endpoints"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date
from decimal import Decimal

from app.extensions import db
from app.models.promotion import Promotion
from app.models.user import User
from app.utils.helpers import admin_required

promotions_bp = Blueprint('promotions', __name__)

@promotions_bp.route('/', methods=['GET'])
@jwt_required()
def get_promotions():
    """Get all promotions for admin or active promotions for users"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user and user.role == 'admin':
            # Admin can see all promotions
            promotions = Promotion.query.order_by(Promotion.created_at.desc()).all()
        else:
            # Regular users can only see active promotions
            today = date.today()
            promotions = Promotion.query.filter(
                Promotion.status == 'active',
                Promotion.start_date <= today,
                Promotion.end_date >= today
            ).order_by(Promotion.created_at.desc()).all()
        
        promotions_data = []
        for promo in promotions:
            promotions_data.append({
                'id': str(promo.id),
                'code': promo.code,
                'name': promo.name,
                'description': promo.description,
                'discountType': promo.discount_type,
                'discountValue': float(promo.discount_value),
                'minOrderValue': float(promo.min_order_value or 0),
                'maxDiscount': float(promo.max_discount) if promo.max_discount else None,
                'startDate': promo.start_date.isoformat(),
                'endDate': promo.end_date.isoformat(),
                'isActive': promo.status == 'active',
                'usageLimit': promo.usage_limit,
                'usageCount': promo.used_count,
                'createdAt': promo.created_at.isoformat(),
                'updatedAt': promo.updated_at.isoformat()
            })
        
        return jsonify({
            'status': 'success',
            'promotions': promotions_data,
            'total': len(promotions_data)
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get promotions: {str(e)}'
        }), 500

@promotions_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_promotion():
    """Create a new promotion (admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['code', 'name', 'discountType', 'discountValue', 'startDate', 'endDate']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Check if code already exists
        existing_promo = Promotion.query.filter_by(code=data['code']).first()
        if existing_promo:
            return jsonify({
                'status': 'error',
                'message': 'Promotion code already exists'
            }), 400
        
        # Parse dates
        start_date = datetime.strptime(data['startDate'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['endDate'], '%Y-%m-%d').date()
        
        if end_date <= start_date:
            return jsonify({
                'status': 'error',
                'message': 'End date must be after start date'
            }), 400
        
        # Create promotion
        promotion = Promotion(
            code=data['code'],
            name=data['name'],
            description=data.get('description', ''),
            discount_type=data['discountType'],
            discount_value=Decimal(str(data['discountValue'])),
            min_order_value=Decimal(str(data.get('minOrderValue', 0))),
            max_discount=Decimal(str(data['maxDiscount'])) if data.get('maxDiscount') else None,
            start_date=start_date,
            end_date=end_date,
            usage_limit=data.get('usageLimit'),
            status='active' if data.get('isActive', True) else 'inactive'
        )
        
        db.session.add(promotion)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Promotion created successfully',
            'promotion': {
                'id': str(promotion.id),
                'code': promotion.code,
                'name': promotion.name
            }
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'Promotion code already exists'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to create promotion: {str(e)}'
        }), 500

@promotions_bp.route('/<promotion_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_promotion(promotion_id):
    """Update a promotion (admin only)"""
    try:
        promotion = Promotion.query.get(promotion_id)
        if not promotion:
            return jsonify({
                'status': 'error',
                'message': 'Promotion not found'
            }), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            promotion.name = data['name']
        if 'description' in data:
            promotion.description = data['description']
        if 'discountType' in data:
            promotion.discount_type = data['discountType']
        if 'discountValue' in data:
            promotion.discount_value = Decimal(str(data['discountValue']))
        if 'minOrderValue' in data:
            promotion.min_order_value = Decimal(str(data['minOrderValue']))
        if 'maxDiscount' in data:
            promotion.max_discount = Decimal(str(data['maxDiscount'])) if data['maxDiscount'] else None
        if 'startDate' in data:
            promotion.start_date = datetime.strptime(data['startDate'], '%Y-%m-%d').date()
        if 'endDate' in data:
            promotion.end_date = datetime.strptime(data['endDate'], '%Y-%m-%d').date()
        if 'usageLimit' in data:
            promotion.usage_limit = data['usageLimit']
        if 'isActive' in data:
            promotion.status = 'active' if data['isActive'] else 'inactive'
        
        promotion.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Promotion updated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to update promotion: {str(e)}'
        }), 500

@promotions_bp.route('/<promotion_id>/toggle', methods=['PATCH'])
@jwt_required()
@admin_required
def toggle_promotion_status(promotion_id):
    """Toggle promotion active status (admin only)"""
    try:
        promotion = Promotion.query.get(promotion_id)
        if not promotion:
            return jsonify({
                'status': 'error',
                'message': 'Promotion not found'
            }), 404
        
        # Toggle status
        promotion.status = 'inactive' if promotion.status == 'active' else 'active'
        promotion.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': f'Promotion {"activated" if promotion.status == "active" else "deactivated"} successfully',
            'isActive': promotion.status == 'active'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to toggle promotion status: {str(e)}'
        }), 500

@promotions_bp.route('/<promotion_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_promotion(promotion_id):
    """Delete a promotion (admin only)"""
    try:
        promotion = Promotion.query.get(promotion_id)
        if not promotion:
            return jsonify({
                'status': 'error',
                'message': 'Promotion not found'
            }), 404
        
        db.session.delete(promotion)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Promotion deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to delete promotion: {str(e)}'
        }), 500

@promotions_bp.route('/apply/<user_id>', methods=['POST'])
@jwt_required()
def get_best_promotion_for_user(user_id):
    """Get the best applicable promotion for a user's order"""
    try:
        data = request.get_json()
        order_value = Decimal(str(data.get('orderValue', 0)))
        
        if order_value <= 0:
            return jsonify({
                'status': 'error',
                'message': 'Invalid order value'
            }), 400
        
        # Get all active promotions
        today = date.today()
        active_promotions = Promotion.query.filter(
            Promotion.status == 'active',
            Promotion.start_date <= today,
            Promotion.end_date >= today
        ).all()
        
        best_promotion = None
        best_discount = 0
        
        # Find the promotion that gives the highest discount
        for promo in active_promotions:
            is_valid, message = promo.is_valid(order_value)
            if is_valid:
                discount = promo.calculate_discount(order_value)
                if discount > best_discount:
                    best_discount = discount
                    best_promotion = promo
        
        if best_promotion:
            return jsonify({
                'status': 'success',
                'promotion': {
                    'id': str(best_promotion.id),
                    'code': best_promotion.code,
                    'name': best_promotion.name,
                    'description': best_promotion.description,
                    'discountAmount': float(best_discount),
                    'finalAmount': float(order_value - best_discount)
                }
            })
        else:
            return jsonify({
                'status': 'success',
                'promotion': None,
                'message': 'No applicable promotions found'
            })
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to find promotion: {str(e)}'
        }), 500