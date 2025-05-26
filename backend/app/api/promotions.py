from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Promotion, User
from ..extensions import db
from ..utils.helpers import is_valid_uuid, generate_promotion_code
from ..utils.validators import (
    validate_required_fields,
    validate_positive_number,
    validate_discount_type,
    validate_service_status,
    validate_promotion_dates
)

promotions_bp = Blueprint('promotions', __name__)

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

@promotions_bp.route('/', methods=['GET'])
def get_promotions():
    """
    Lấy danh sách khuyến mãi
    ---
    API công khai, không yêu cầu xác thực.
    Mặc định chỉ hiển thị khuyến mãi đang hoạt động và trong thời gian hiệu lực.
    Admin có thể xem tất cả khuyến mãi bằng cách thêm tham số include_inactive=true.
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Lấy ngày hiện tại
    today = datetime.utcnow().date()
    
    # Khởi tạo query với các khuyến mãi đang hoạt động và trong thời gian hiệu lực
    query = Promotion.query.filter(
        Promotion.status == 'active',
        Promotion.start_date <= today,
        Promotion.end_date >= today
    )
    
    # Nếu admin yêu cầu hiển thị tất cả khuyến mãi
    if request.args.get('include_inactive') == 'true':
        user_id = get_jwt_identity()
        if user_id:
            try:
                user = User.query.get(user_id)
                if user and user.role == 'admin':
                    query = Promotion.query
            except:
                pass  # Tiếp tục với query ban đầu nếu có lỗi
    
    # Sắp xếp khuyến mãi (sắp hết hạn lên đầu)
    query = query.order_by(Promotion.end_date.asc())
    
    promotions = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'promotions': [promo.to_dict() for promo in promotions.items],
        'total': promotions.total,
        'pages': promotions.pages,
        'page': promotions.page
    }), 200

@promotions_bp.route('/<uuid:id>', methods=['GET'])
def get_promotion(id):
    """
    Lấy thông tin chi tiết của một khuyến mãi
    ---
    Nếu khuyến mãi không hoạt động hoặc hết hạn, chỉ admin mới có thể xem.
    """
    promotion = Promotion.query.get(id)
    
    if not promotion:
        return jsonify({'message': 'Không tìm thấy khuyến mãi'}), 404
    
    # Kiểm tra khuyến mãi có hiệu lực không
    is_valid = promotion.is_valid()
    if not is_valid:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'message': 'Không tìm thấy khuyến mãi'}), 404
        
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'message': 'Không tìm thấy khuyến mãi'}), 404
    
    return jsonify({
        'promotion': promotion.to_dict()
    }), 200

@promotions_bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_promotion_code():
    """
    Kiểm tra tính hợp lệ của mã khuyến mãi
    ---
    Cho phép khách hàng kiểm tra mã khuyến mãi trước khi áp dụng.
    Trả về thông tin chi tiết về khuyến mãi nếu mã hợp lệ.
    """
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['code']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Tìm khuyến mãi theo mã
    promotion = Promotion.query.filter_by(code=data['code']).first()
    
    if not promotion:
        return jsonify({
            'valid': False,
            'message': 'Mã khuyến mãi không tồn tại'
        }), 200
    
    # Kiểm tra tính hợp lệ của khuyến mãi
    if not promotion.is_valid():
        message = 'Mã khuyến mãi đã hết hạn'
        if promotion.status != 'active':
            message = 'Mã khuyến mãi không còn hoạt động'
        elif promotion.used_count >= promotion.usage_limit and promotion.usage_limit is not None:
            message = 'Mã khuyến mãi đã đạt giới hạn sử dụng'
        
        return jsonify({
            'valid': False,
            'message': message
        }), 200
    
    # Kiểm tra giá trị đơn hàng nếu được cung cấp
    if 'order_value' in data and float(data['order_value']) < float(promotion.min_order_value):
        return jsonify({
            'valid': False,
            'message': f'Giá trị đơn hàng tối thiểu phải là {promotion.min_order_value:,.0f} đ'
        }), 200
    
    # Tính toán số tiền giảm giá nếu có giá trị đơn hàng
    discount_amount = None
    if 'order_value' in data:
        order_value = float(data['order_value'])
        if promotion.discount_type == 'percentage':
            discount_amount = order_value * promotion.discount_value / 100
            # Áp dụng giảm giá tối đa nếu có
            if promotion.max_discount is not None and discount_amount > float(promotion.max_discount):
                discount_amount = float(promotion.max_discount)
        else:  # fixed
            discount_amount = float(promotion.discount_value)
    
    return jsonify({
        'valid': True,
        'promotion': promotion.to_dict(),
        'discount_amount': discount_amount
    }), 200

@promotions_bp.route('/', methods=['POST'])
@admin_required
def create_promotion():
    """
    Tạo khuyến mãi mới
    ---
    Chỉ admin mới có quyền tạo khuyến mãi mới.
    """
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['name', 'discount_type', 'discount_value', 'start_date', 'end_date']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra loại giảm giá
    is_valid_discount_type, discount_type_error = validate_discount_type(data['discount_type'])
    if not is_valid_discount_type:
        return jsonify({'message': discount_type_error}), 400
    
    # Kiểm tra giá trị giảm giá dương
    is_valid_discount_value, discount_value_error = validate_positive_number(data['discount_value'], 'Giá trị giảm giá')
    if not is_valid_discount_value:
        return jsonify({'message': discount_value_error}), 400
    
    # Kiểm tra giá trị đơn hàng tối thiểu nếu được cung cấp
    if 'min_order_value' in data:
        is_valid_min_order, min_order_error = validate_positive_number(data['min_order_value'], 'Giá trị đơn hàng tối thiểu', include_zero=True)
        if not is_valid_min_order:
            return jsonify({'message': min_order_error}), 400
    
    # Kiểm tra giảm giá tối đa nếu được cung cấp
    if 'max_discount' in data and data['max_discount']:
        is_valid_max_discount, max_discount_error = validate_positive_number(data['max_discount'], 'Giảm giá tối đa')
        if not is_valid_max_discount:
            return jsonify({'message': max_discount_error}), 400
    
    # Kiểm tra trạng thái nếu được cung cấp
    if 'status' in data:
        is_valid_status, status_error = validate_service_status(data['status'])
        if not is_valid_status:
            return jsonify({'message': status_error}), 400
    
    # Chuyển đổi định dạng ngày
    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Định dạng ngày không hợp lệ. Sử dụng YYYY-MM-DD'}), 400
    
    # Kiểm tra ngày hợp lệ
    is_valid_dates, dates_error = validate_promotion_dates(start_date, end_date)
    if not is_valid_dates:
        return jsonify({'message': dates_error}), 400
    
    # Tạo mã khuyến mãi nếu không được cung cấp
    promotion_code = data.get('code')
    if not promotion_code:
        prefix = data.get('code_prefix', 'CLEAN')
        promotion_code = generate_promotion_code(prefix)
    
    # Kiểm tra mã khuyến mãi đã tồn tại chưa
    existing_promo = Promotion.query.filter_by(code=promotion_code).first()
    if existing_promo:
        return jsonify({'message': 'Mã khuyến mãi đã tồn tại'}), 400
    
    # Tạo khuyến mãi mới
    promotion = Promotion(
        name=data['name'],
        description=data.get('description'),
        discount_type=data['discount_type'],
        discount_value=data['discount_value'],
        code=promotion_code,
        start_date=start_date,
        end_date=end_date,
        min_order_value=data.get('min_order_value', 0),
        max_discount=data.get('max_discount'),
        usage_limit=data.get('usage_limit'),
        used_count=0,
        status=data.get('status', 'active')
    )
    
    db.session.add(promotion)
    db.session.commit()
    
    return jsonify({
        'message': 'Tạo khuyến mãi thành công',
        'promotion': promotion.to_dict()
    }), 201

@promotions_bp.route('/<uuid:id>', methods=['PUT'])
@admin_required
def update_promotion(id):
    """
    Cập nhật thông tin khuyến mãi
    ---
    Chỉ admin mới có quyền cập nhật thông tin khuyến mãi.
    """
    promotion = Promotion.query.get(id)
    
    if not promotion:
        return jsonify({'message': 'Không tìm thấy khuyến mãi'}), 404
    
    data = request.get_json()
    
    # Kiểm tra loại giảm giá nếu được cung cấp
    if 'discount_type' in data:
        is_valid_discount_type, discount_type_error = validate_discount_type(data['discount_type'])
        if not is_valid_discount_type:
            return jsonify({'message': discount_type_error}), 400
    
    # Kiểm tra giá trị giảm giá nếu được cung cấp
    if 'discount_value' in data:
        is_valid_discount_value, discount_value_error = validate_positive_number(data['discount_value'], 'Giá trị giảm giá')
        if not is_valid_discount_value:
            return jsonify({'message': discount_value_error}), 400
    
    # Kiểm tra giá trị đơn hàng tối thiểu nếu được cung cấp
    if 'min_order_value' in data:
        is_valid_min_order, min_order_error = validate_positive_number(data['min_order_value'], 'Giá trị đơn hàng tối thiểu', include_zero=True)
        if not is_valid_min_order:
            return jsonify({'message': min_order_error}), 400
    
    # Kiểm tra giảm giá tối đa nếu được cung cấp
    if 'max_discount' in data and data['max_discount']:
        is_valid_max_discount, max_discount_error = validate_positive_number(data['max_discount'], 'Giảm giá tối đa')
        if not is_valid_max_discount:
            return jsonify({'message': max_discount_error}), 400
    
    # Kiểm tra trạng thái nếu được cung cấp
    if 'status' in data:
        is_valid_status, status_error = validate_service_status(data['status'])
        if not is_valid_status:
            return jsonify({'message': status_error}), 400
    
    # Kiểm tra mã khuyến mãi nếu được cung cấp
    if 'code' in data:
        existing_promo = Promotion.query.filter_by(code=data['code']).first()
        if existing_promo and str(existing_promo.id) != str(id):
            return jsonify({'message': 'Mã khuyến mãi đã tồn tại'}), 400
    
    # Cập nhật ngày nếu được cung cấp
    date_updated = False
    
    if 'start_date' in data:
        try:
            promotion.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            date_updated = True
        except ValueError:
            return jsonify({'message': 'Định dạng ngày bắt đầu không hợp lệ. Sử dụng YYYY-MM-DD'}), 400
    
    if 'end_date' in data:
        try:
            promotion.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            date_updated = True
        except ValueError:
            return jsonify({'message': 'Định dạng ngày kết thúc không hợp lệ. Sử dụng YYYY-MM-DD'}), 400
    
    # Kiểm tra ngày hợp lệ nếu được cập nhật
    if date_updated:
        is_valid_dates, dates_error = validate_promotion_dates(promotion.start_date, promotion.end_date)
        if not is_valid_dates:
            return jsonify({'message': dates_error}), 400
    
    # Cập nhật các trường nếu được cung cấp
    if 'name' in data:
        promotion.name = data['name']
    if 'description' in data:
        promotion.description = data['description']
    if 'discount_type' in data:
        promotion.discount_type = data['discount_type']
    if 'discount_value' in data:
        promotion.discount_value = data['discount_value']
    if 'code' in data:
        promotion.code = data['code']
    if 'min_order_value' in data:
        promotion.min_order_value = data['min_order_value']
    if 'max_discount' in data:
        promotion.max_discount = data['max_discount']
    if 'usage_limit' in data:
        promotion.usage_limit = data['usage_limit']
    if 'status' in data:
        promotion.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Cập nhật khuyến mãi thành công',
        'promotion': promotion.to_dict()
    }), 200

@promotions_bp.route('/<uuid:id>', methods=['DELETE'])
@admin_required
def delete_promotion(id):
    """
    Xóa khuyến mãi
    ---
    Chỉ admin mới có quyền xóa khuyến mãi.
    Nếu khuyến mãi đã được sử dụng, chỉ có thể đánh dấu là không hoạt động.
    """
    promotion = Promotion.query.get(id)
    
    if not promotion:
        return jsonify({'message': 'Không tìm thấy khuyến mãi'}), 404
    
    # Kiểm tra xem khuyến mãi đã được sử dụng chưa
    if promotion.used_count > 0:
        # Đánh dấu không hoạt động thay vì xóa
        promotion.status = 'inactive'
        db.session.commit()
        return jsonify({
            'message': 'Khuyến mãi đã được đánh dấu là không hoạt động vì đã được sử dụng'
        }), 200
    
    db.session.delete(promotion)
    db.session.commit()
    
    return jsonify({
        'message': 'Xóa khuyến mãi thành công'
    }), 200
