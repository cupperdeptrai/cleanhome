"""
API endpoints cho quản lý dịch vụ
Đồng bộ với schema SQL PostgreSQL
Author: CleanHome Team
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_, desc
import os
from app.extensions import db
from app.models.service import Service, ServiceCategory, ServiceArea, Review
from app.models.user import User
from app.utils.helpers import admin_required, safe_float, safe_int
from app.utils.validators import validate_service_data
from werkzeug.utils import secure_filename

services_bp = Blueprint('services', __name__)

@services_bp.route('/', methods=['GET'])
@services_bp.route('', methods=['GET'])
def get_services():
    """
    Lấy danh sách tất cả dịch vụ với bộ lọc
    - Hỗ trợ lọc theo: danh mục, giá, trạng thái, tìm kiếm
    - Hỗ trợ phân trang
    - Đồng bộ với bảng services trong PostgreSQL
    """
    try:
        # Lấy tham số từ query string
        category = request.args.get('category')  # Tên danh mục
        min_price = request.args.get('minPrice', type=float)  # Giá tối thiểu
        max_price = request.args.get('maxPrice', type=float)  # Giá tối đa
        is_active = request.args.get('isActive')  # Trạng thái hoạt động
        search = request.args.get('search')  # Từ khóa tìm kiếm
        page = request.args.get('page', 1, type=int)  # Trang hiện tại
        limit = request.args.get('limit', 20, type=int)  # Số item mỗi trang
        
        # Xây dựng query từ model Service (bảng services)
        query = Service.query
        
        # Áp dụng các bộ lọc
        if category:
            # Tìm danh mục theo tên từ bảng service_categories
            category_obj = ServiceCategory.query.filter_by(name=category).first()
            if category_obj:
                query = query.filter(Service.category_id == category_obj.id)
        
        if min_price is not None:
            # Lọc theo giá tối thiểu (trường price)
            query = query.filter(Service.price >= min_price)
            
        if max_price is not None:
            # Lọc theo giá tối đa (trường price)
            query = query.filter(Service.price <= max_price)
            
        if is_active is not None:
            # Lọc theo trạng thái (enum status: active/inactive/draft)
            is_active_bool = is_active.lower() == 'true'
            if is_active_bool:
                query = query.filter(Service.status == 'active')
            else:
                query = query.filter(Service.status != 'active')
            
        if search:
            # Tìm kiếm trong tên và mô tả (name, description)
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Service.name.ilike(search_pattern),
                    Service.description.ilike(search_pattern)
                )
            )
        
        # Thực hiện query với phân trang
        services = query.order_by(Service.name).paginate(
            page=page, per_page=limit, error_out=False
        )
        
        # Format dữ liệu trả về
        result = []
        for service in services.items:
            # Lấy tên danh mục từ bảng service_categories
            category_name = None
            if service.category_id:
                category_obj = ServiceCategory.query.get(service.category_id)
                category_name = category_obj.name if category_obj else None
            
            result.append({
                'id': str(service.id),  # UUID
                'name': service.name,  # Tên dịch vụ
                'description': service.description or service.short_description,  # Mô tả
                'price': float(service.price),  # Giá (Numeric)
                'category': category_name,  # Tên danh mục
                'image': service.thumbnail,  # URL ảnh thumbnail
                'duration': service.duration,  # Thời gian (phút)
                'isActive': service.status == 'active',  # Convert enum thành boolean
                'createdAt': service.created_at.isoformat() if service.created_at else None,
                'updatedAt': service.updated_at.isoformat() if service.updated_at else None
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f"Lỗi khi lấy danh sách dịch vụ: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Không thể lấy danh sách dịch vụ: {str(e)}'
        }), 500

@services_bp.route('/<service_id>', methods=['GET'])
def get_service(service_id):
    """Get specific service"""
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({
                'status': 'error',
                'message': 'Service not found'
            }), 404
        
        # Get category name if category_id exists
        category_name = None
        if service.category_id:
            category_obj = ServiceCategory.query.get(service.category_id)
            category_name = category_obj.name if category_obj else None
        
        result = {
            'id': str(service.id),
            'name': service.name,
            'description': service.description or service.short_description,
            'price': float(service.price),
            'category': category_name,
            'image': service.thumbnail,
            'duration': service.duration,
            'isActive': service.status == 'active',
            'createdAt': service.created_at.isoformat() if service.created_at else None,
            'updatedAt': service.updated_at.isoformat() if service.updated_at else None
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f"Get service error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get service: {str(e)}'
        }), 500

@services_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all service categories"""
    try:
        # Get categories from ServiceCategory model
        categories = ServiceCategory.query.all()
        result = [{'id': str(cat.id), 'name': cat.name, 'description': cat.description} for cat in categories]
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f"Get categories error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get categories: {str(e)}'
        }), 500

@services_bp.route('/featured', methods=['GET'])
def get_featured_services():
    """Get featured services"""
    try:
        limit = request.args.get('limit', 5, type=int)
        
        # Get featured active services
        services = Service.query.filter(
            and_(Service.status == 'active', Service.is_featured == True)
        ).limit(limit).all()
        
        result = []
        for service in services:
            # Get category name if category_id exists
            category_name = None
            if service.category_id:
                category_obj = ServiceCategory.query.get(service.category_id)
                category_name = category_obj.name if category_obj else None
            
            result.append({
                'id': str(service.id),
                'name': service.name,
                'description': service.description or service.short_description,
                'price': float(service.price),
                'category': category_name,
                'image': service.thumbnail,
                'duration': service.duration,
                'isActive': service.status == 'active',
                'createdAt': service.created_at.isoformat() if service.created_at else None,
                'updatedAt': service.updated_at.isoformat() if service.updated_at else None
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f"Get featured services error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get featured services: {str(e)}'
        }), 500

@services_bp.route('/', methods=['POST'])
@services_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_service():
    """Create new service (Admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'description', 'price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Find category by name if provided
        category_id = None
        if data.get('category'):
            category_obj = ServiceCategory.query.filter_by(name=data['category']).first()
            if category_obj:
                category_id = category_obj.id
        
        # Create new service
        new_service = Service(
            name=data['name'],
            slug=data['name'].lower().replace(' ', '-'),
            short_description=data.get('description')[:255] if data.get('description') else None,
            description=data.get('description'),
            price=safe_float(data['price']),
            duration=safe_int(data.get('duration', 60)),
            thumbnail=data.get('image'),
            category_id=category_id,
            status='active' if data.get('isActive', True) else 'inactive'
        )
        
        db.session.add(new_service)
        db.session.commit()
        
        # Get category name for response
        category_name = None
        if new_service.category_id:
            category_obj = ServiceCategory.query.get(new_service.category_id)
            category_name = category_obj.name if category_obj else None
        
        result = {
            'id': str(new_service.id),
            'name': new_service.name,
            'description': new_service.description or new_service.short_description,
            'price': float(new_service.price),
            'category': category_name,
            'image': new_service.thumbnail,
            'duration': new_service.duration,
            'isActive': new_service.status == 'active',
            'createdAt': new_service.created_at.isoformat(),
            'updatedAt': new_service.updated_at.isoformat()
        }
        
        return jsonify(result), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create service error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to create service: {str(e)}'
        }), 500

@services_bp.route('/<service_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_service(service_id):
    """Update service (Admin only)"""
    try:
        data = request.get_json()
        
        service = Service.query.get(service_id)
        if not service:
            return jsonify({
                'status': 'error',
                'message': 'Service not found'
            }), 404
        
        # Update fields
        if 'name' in data:
            service.name = data['name']
            service.slug = data['name'].lower().replace(' ', '-')
        if 'description' in data:
            service.description = data['description']
            service.short_description = data['description'][:255] if data['description'] else None
        if 'price' in data:
            service.price = safe_float(data['price'])
        if 'category' in data:
            # Find category by name
            category_obj = ServiceCategory.query.filter_by(name=data['category']).first()
            service.category_id = category_obj.id if category_obj else None
        if 'image' in data:
            service.thumbnail = data['image']
        if 'duration' in data:
            service.duration = safe_int(data['duration'])
        if 'isActive' in data:
            service.status = 'active' if data['isActive'] else 'inactive'
        
        db.session.commit()
        
        # Get updated category name
        category_name = None
        if service.category_id:
            category_obj = ServiceCategory.query.get(service.category_id)
            category_name = category_obj.name if category_obj else None
        
        result = {
            'id': str(service.id),
            'name': service.name,
            'description': service.description or service.short_description,
            'price': float(service.price),
            'category': category_name,
            'image': service.thumbnail,
            'duration': service.duration,
            'isActive': service.status == 'active',
            'createdAt': service.created_at.isoformat() if service.created_at else None,
            'updatedAt': service.updated_at.isoformat() if service.updated_at else None
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update service error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to update service: {str(e)}'
        }), 500

@services_bp.route('/<service_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_service(service_id):
    """Delete service (Admin only)"""
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({
                'status': 'error',
                'message': 'Service not found'
            }), 404        # Check if service has any active bookings
        from app.models.booking import Booking, BookingItem
        active_bookings = db.session.query(Booking).join(BookingItem).filter(
            and_(
                BookingItem.service_id == service_id,
                Booking.status.in_(['pending', 'confirmed', 'in_progress'])
            )
        ).count()
        
        current_app.logger.info(f"Found {active_bookings} active bookings for service {service_id}")
        
        if active_bookings > 0:
            # Lấy danh sách booking IDs để thông báo cụ thể
            active_booking_ids = db.session.query(Booking.id).join(BookingItem).filter(
                and_(
                    BookingItem.service_id == service_id,
                    Booking.status.in_(['pending', 'confirmed', 'in_progress'])
                )
            ).all()
            booking_ids = [str(b.id) for b in active_booking_ids]
            current_app.logger.info(f"Active booking IDs: {booking_ids}")
            
            return jsonify({
                'status': 'error',
                'message': f'Không thể xóa dịch vụ vì có {active_bookings} booking đang hoạt động (ID: {", ".join(booking_ids)})'
            }), 400
        
        # Xóa các bản ghi liên quan trước khi xóa service
        current_app.logger.info(f"Deleting service {service_id} and related records")
          # Xóa service areas
        service_areas = ServiceArea.query.filter_by(service_id=service_id).all()
        for area in service_areas:
            db.session.delete(area)
        current_app.logger.info(f"Deleted {len(service_areas)} service areas")        # Xóa reviews
        reviews = Review.query.filter_by(service_id=service_id).all()
        for review in reviews:
            db.session.delete(review)
        current_app.logger.info(f"Deleted {len(reviews)} reviews")
        
        # Xóa booking items (nếu có)
        from app.models.booking import BookingItem
        booking_items = BookingItem.query.filter_by(service_id=service_id).all()
        for item in booking_items:
            db.session.delete(item)
        current_app.logger.info(f"Deleted {len(booking_items)} booking items")
        
        # Cuối cùng xóa service
        db.session.delete(service)
        db.session.commit()
        
        current_app.logger.info(f"Successfully deleted service {service_id}")
        return jsonify({
            'status': 'success',
            'message': 'Service deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete service error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to delete service: {str(e)}'
        }), 500

@services_bp.route('/<service_id>/upload-image', methods=['POST'])
@jwt_required()
@admin_required
def upload_service_image(service_id):
    """Upload image for service (Admin only)"""
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({
                'status': 'error',
                'message': 'Service not found'
            }), 404
        
        if 'image' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image file provided'
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({
                'status': 'error',
                'message': 'Invalid file type'
            }), 400
        
        # Save file
        filename = secure_filename(f"service_{service_id}_{file.filename}")
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'static/uploads')
        service_folder = os.path.join(upload_folder, 'services')
        
        if not os.path.exists(service_folder):
            os.makedirs(service_folder)
        
        file_path = os.path.join(service_folder, filename)
        file.save(file_path)
        
        # Update service with image URL
        image_url = f"/static/uploads/services/{filename}"
        service.thumbnail = image_url
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'imageUrl': image_url
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Upload service image error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to upload image: {str(e)}'
        }), 500
