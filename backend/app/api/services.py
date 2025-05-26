from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Service, ServiceCategory, User
from ..extensions import db
from ..utils.helpers import is_valid_uuid
from ..utils.validators import (
    validate_required_fields,
    validate_positive_number,
    validate_service_status
)

services_bp = Blueprint('services', __name__)

# Decorator kiểm tra quyền admin
def admin_required(f):
    """
    Decorator kiểm tra quyền admin
    ---
    Đảm bảo người dùng hiện tại có quyền admin trước khi thực hiện hành động.
    """
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        
        if not is_valid_uuid(user_id):
            return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
        
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'message': 'Bạn không có quyền thực hiện hành động này'}), 403
        
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return jwt_required()(decorated_function)

@services_bp.route('/', methods=['GET'])
def get_services():
    """
    Lấy danh sách dịch vụ
    ---
    API công khai, không yêu cầu xác thực.
    Chỉ hiển thị các dịch vụ có trạng thái active cho người dùng thông thường.
    Admin có thể xem tất cả các dịch vụ bằng cách thêm tham số include_inactive=true.
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category_id = request.args.get('category_id')
    
    # Khởi tạo query với các dịch vụ active
    query = Service.query.filter_by(status='active')
    
    # Nếu có category_id, lọc theo danh mục
    if category_id and is_valid_uuid(category_id):
        query = query.filter_by(category_id=category_id)
    
    # Nếu admin yêu cầu hiển thị cả dịch vụ không hoạt động
    if request.args.get('include_inactive') == 'true':
        user_id = get_jwt_identity()
        if user_id:
            try:
                user = User.query.get(user_id)
                if user and user.role == 'admin':
                    query = Service.query
                    if category_id and is_valid_uuid(category_id):
                        query = query.filter_by(category_id=category_id)
            except:
                pass  # Tiếp tục với query ban đầu nếu có lỗi
    
    # Sắp xếp dịch vụ theo tên
    services = query.order_by(Service.name).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'services': [service.to_dict() for service in services.items],
        'total': services.total,
        'pages': services.pages,
        'page': services.page
    }), 200

@services_bp.route('/<uuid:id>', methods=['GET'])
def get_service(id):
    """
    Lấy thông tin chi tiết của một dịch vụ
    ---
    API công khai, không yêu cầu xác thực.
    Dịch vụ không hoạt động chỉ hiển thị cho admin.
    """
    service = Service.query.get(id)
    
    if not service:
        return jsonify({'message': 'Không tìm thấy dịch vụ'}), 404
    
    # Nếu dịch vụ không hoạt động, chỉ cho phép admin xem
    if service.status != 'active':
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'message': 'Không tìm thấy dịch vụ'}), 404
        
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'message': 'Không tìm thấy dịch vụ'}), 404
    
    return jsonify({
        'service': service.to_dict()
    }), 200

@services_bp.route('/', methods=['POST'])
@admin_required
def create_service():
    """
    Tạo dịch vụ mới
    ---
    Chỉ admin mới có quyền tạo dịch vụ mới.
    """
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['name', 'price', 'duration', 'category_id']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra giá trị dương
    is_valid_price, price_error = validate_positive_number(data['price'], 'Giá dịch vụ')
    if not is_valid_price:
        return jsonify({'message': price_error}), 400
    
    is_valid_duration, duration_error = validate_positive_number(data['duration'], 'Thời lượng dịch vụ')
    if not is_valid_duration:
        return jsonify({'message': duration_error}), 400
    
    # Kiểm tra trạng thái dịch vụ nếu được cung cấp
    if 'status' in data:
        is_valid_status, status_error = validate_service_status(data['status'])
        if not is_valid_status:
            return jsonify({'message': status_error}), 400
    
    # Kiểm tra danh mục tồn tại
    if not is_valid_uuid(data['category_id']):
        return jsonify({'message': 'ID danh mục không hợp lệ'}), 400
    
    category = ServiceCategory.query.get(data['category_id'])
    if not category:
        return jsonify({'message': 'Danh mục dịch vụ không tồn tại'}), 400
    
    # Tạo dịch vụ mới
    service = Service(
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
        duration=data['duration'],
        category_id=data['category_id'],
        image=data.get('image'),
        status=data.get('status', 'active')
    )
    
    db.session.add(service)
    db.session.commit()
    
    return jsonify({
        'message': 'Tạo dịch vụ thành công',
        'service': service.to_dict()
    }), 201

@services_bp.route('/<uuid:id>', methods=['PUT'])
@admin_required
def update_service(id):
    """
    Cập nhật thông tin dịch vụ
    ---
    Chỉ admin mới có quyền cập nhật thông tin dịch vụ.
    """
    service = Service.query.get(id)
    
    if not service:
        return jsonify({'message': 'Không tìm thấy dịch vụ'}), 404
    
    data = request.get_json()
    
    # Kiểm tra giá dịch vụ nếu được cung cấp
    if 'price' in data:
        is_valid_price, price_error = validate_positive_number(data['price'], 'Giá dịch vụ')
        if not is_valid_price:
            return jsonify({'message': price_error}), 400
    
    # Kiểm tra thời lượng dịch vụ nếu được cung cấp
    if 'duration' in data:
        is_valid_duration, duration_error = validate_positive_number(data['duration'], 'Thời lượng dịch vụ')
        if not is_valid_duration:
            return jsonify({'message': duration_error}), 400
    
    # Kiểm tra trạng thái dịch vụ nếu được cung cấp
    if 'status' in data:
        is_valid_status, status_error = validate_service_status(data['status'])
        if not is_valid_status:
            return jsonify({'message': status_error}), 400
    
    # Kiểm tra danh mục tồn tại nếu được cung cấp
    if 'category_id' in data:
        if not is_valid_uuid(data['category_id']):
            return jsonify({'message': 'ID danh mục không hợp lệ'}), 400
        
        category = ServiceCategory.query.get(data['category_id'])
        if not category:
            return jsonify({'message': 'Danh mục dịch vụ không tồn tại'}), 400
    
    # Cập nhật các trường nếu được cung cấp
    if 'name' in data:
        service.name = data['name']
    if 'description' in data:
        service.description = data['description']
    if 'price' in data:
        service.price = data['price']
    if 'duration' in data:
        service.duration = data['duration']
    if 'category_id' in data:
        service.category_id = data['category_id']
    if 'image' in data:
        service.image = data['image']
    if 'status' in data:
        service.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Cập nhật dịch vụ thành công',
        'service': service.to_dict()
    }), 200

@services_bp.route('/<uuid:id>', methods=['DELETE'])
@admin_required
def delete_service(id):
    """
    Xóa dịch vụ
    ---
    Chỉ admin mới có quyền xóa dịch vụ.
    Nếu dịch vụ đã được sử dụng trong đơn đặt lịch, sẽ chỉ đánh dấu là không hoạt động thay vì xóa.
    """
    service = Service.query.get(id)
    
    if not service:
        return jsonify({'message': 'Không tìm thấy dịch vụ'}), 404
    
    # Kiểm tra xem dịch vụ đã được sử dụng trong đơn đặt lịch nào chưa
    booking_items = service.booking_items.count() if hasattr(service, 'booking_items') else 0
    
    if booking_items > 0:
        # Đánh dấu không hoạt động thay vì xóa
        service.status = 'inactive'
        db.session.commit()
        return jsonify({
            'message': 'Dịch vụ đã được đánh dấu là không hoạt động vì đã được sử dụng trong đơn đặt lịch'
        }), 200
    
    db.session.delete(service)
    db.session.commit()
    
    return jsonify({
        'message': 'Xóa dịch vụ thành công'
    }), 200

@services_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    Lấy danh sách danh mục dịch vụ
    ---
    API công khai, không yêu cầu xác thực.
    Chỉ hiển thị các danh mục có trạng thái active cho người dùng thông thường.
    Admin có thể xem tất cả các danh mục bằng cách thêm tham số include_inactive=true.
    """
    # Khởi tạo query với các danh mục active
    query = ServiceCategory.query.filter_by(status='active')
    
    # Nếu admin yêu cầu hiển thị cả danh mục không hoạt động
    if request.args.get('include_inactive') == 'true':
        user_id = get_jwt_identity()
        if user_id:
            try:
                user = User.query.get(user_id)
                if user and user.role == 'admin':
                    query = ServiceCategory.query
            except:
                pass  # Tiếp tục với query ban đầu nếu có lỗi
    
    # Sắp xếp danh mục theo tên
    categories = query.order_by(ServiceCategory.name).all()
    
    return jsonify({
        'categories': [category.to_dict() for category in categories]
    }), 200

@services_bp.route('/categories/<uuid:id>', methods=['GET'])
def get_category(id):
    """
    Lấy thông tin chi tiết của một danh mục dịch vụ
    ---
    API công khai, không yêu cầu xác thực.
    Danh mục không hoạt động chỉ hiển thị cho admin.
    """
    category = ServiceCategory.query.get(id)
    
    if not category:
        return jsonify({'message': 'Không tìm thấy danh mục dịch vụ'}), 404
    
    # Nếu danh mục không hoạt động, chỉ cho phép admin xem
    if category.status != 'active':
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'message': 'Không tìm thấy danh mục dịch vụ'}), 404
        
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'message': 'Không tìm thấy danh mục dịch vụ'}), 404
    
    return jsonify({
        'category': category.to_dict()
    }), 200

@services_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    """
    Tạo danh mục dịch vụ mới
    ---
    Chỉ admin mới có quyền tạo danh mục dịch vụ mới.
    """
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['name']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra trạng thái danh mục nếu được cung cấp
    if 'status' in data:
        is_valid_status, status_error = validate_service_status(data['status'])
        if not is_valid_status:
            return jsonify({'message': status_error}), 400
    
    # Tạo danh mục mới
    category = ServiceCategory(
        name=data['name'],
        description=data.get('description'),
        image=data.get('image'),
        status=data.get('status', 'active')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({
        'message': 'Tạo danh mục dịch vụ thành công',
        'category': category.to_dict()
    }), 201

@services_bp.route('/categories/<uuid:id>', methods=['PUT'])
@admin_required
def update_category(id):
    """
    Cập nhật thông tin danh mục dịch vụ
    ---
    Chỉ admin mới có quyền cập nhật thông tin danh mục dịch vụ.
    """
    category = ServiceCategory.query.get(id)
    
    if not category:
        return jsonify({'message': 'Không tìm thấy danh mục dịch vụ'}), 404
    
    data = request.get_json()
    
    # Kiểm tra trạng thái danh mục nếu được cung cấp
    if 'status' in data:
        is_valid_status, status_error = validate_service_status(data['status'])
        if not is_valid_status:
            return jsonify({'message': status_error}), 400
    
    # Cập nhật các trường nếu được cung cấp
    if 'name' in data:
        category.name = data['name']
    if 'description' in data:
        category.description = data['description']
    if 'image' in data:
        category.image = data['image']
    if 'status' in data:
        category.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Cập nhật danh mục dịch vụ thành công',
        'category': category.to_dict()
    }), 200

@services_bp.route('/categories/<uuid:id>', methods=['DELETE'])
@admin_required
def delete_category(id):
    """
    Xóa danh mục dịch vụ
    ---
    Chỉ admin mới có quyền xóa danh mục dịch vụ.
    Không thể xóa danh mục đã có dịch vụ, chỉ có thể đánh dấu là không hoạt động.
    """
    category = ServiceCategory.query.get(id)
    
    if not category:
        return jsonify({'message': 'Không tìm thấy danh mục dịch vụ'}), 404
    
    # Kiểm tra xem danh mục có dịch vụ nào không
    services_count = Service.query.filter_by(category_id=id).count()
    
    if services_count > 0:
        # Đánh dấu không hoạt động thay vì xóa
        category.status = 'inactive'
        db.session.commit()
        return jsonify({
            'message': 'Danh mục dịch vụ đã được đánh dấu là không hoạt động vì đã có dịch vụ liên kết'
        }), 200
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({
        'message': 'Xóa danh mục dịch vụ thành công'
    }), 200
