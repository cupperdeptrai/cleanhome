from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models.booking import Review, Booking
from ..models.user import User
from ..extensions import db
from ..utils.helpers import is_valid_uuid
from ..utils.validators import validate_required_fields
from sqlalchemy.exc import SQLAlchemyError
import uuid

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/', methods=['GET'])
@jwt_required()
def get_reviews():
    """
    Lấy danh sách đánh giá
    ---
    Người dùng thông thường chỉ có thể xem đánh giá công khai.
    Admin và nhân viên có thể xem tất cả đánh giá.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    service_id = request.args.get('service_id')
    staff_id = request.args.get('staff_id')
    
    query = Review.query
    
    # Lọc theo dịch vụ nếu được cung cấp
    if service_id and is_valid_uuid(service_id):
        query = query.filter_by(service_id=service_id)
    
    # Lọc theo nhân viên nếu được cung cấp
    if staff_id and is_valid_uuid(staff_id):
        query = query.filter_by(staff_id=staff_id)
    
    # Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
    query = query.order_by(Review.created_at.desc())
    
    reviews = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'reviews': [review.to_dict() for review in reviews.items],
        'total': reviews.total,
        'pages': reviews.pages,
        'page': reviews.page
    }), 200

@reviews_bp.route('/<uuid:id>', methods=['GET'])
@jwt_required()
def get_review(id):
    """
    Lấy chi tiết đánh giá
    ---
    Trả về chi tiết của một đánh giá cụ thể.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    review = Review.query.get(id)
    
    if not review:
        return jsonify({'message': 'Không tìm thấy đánh giá'}), 404
    
    return jsonify({
        'review': review.to_dict()
    }), 200

@reviews_bp.route('/bookings/<uuid:booking_id>', methods=['POST'])
@jwt_required()
def create_review(booking_id):
    """
    Tạo đánh giá mới cho một đơn đặt lịch
    ---
    Cho phép người dùng tạo đánh giá cho đơn đặt lịch của họ.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    # Kiểm tra booking_id
    if not is_valid_uuid(booking_id):
        return jsonify({'message': 'ID đơn đặt lịch không hợp lệ'}), 400
    
    # Lấy đơn đặt lịch
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Không tìm thấy đơn đặt lịch'}), 404
    
    # Kiểm tra xem đơn đặt lịch có thuộc về người dùng hiện tại không
    if str(booking.user_id) != user_id:
        return jsonify({'message': 'Bạn không có quyền đánh giá đơn đặt lịch này'}), 403
    
    # Kiểm tra xem đơn đặt lịch đã hoàn thành chưa
    if booking.status != 'completed':
        return jsonify({'message': 'Bạn chỉ có thể đánh giá đơn đặt lịch đã hoàn thành'}), 400
    
    # Kiểm tra xem đã có đánh giá cho đơn đặt lịch này chưa
    existing_review = Review.query.filter_by(booking_id=booking_id, user_id=user_id).first()
    if existing_review:
        return jsonify({'message': 'Bạn đã đánh giá đơn đặt lịch này rồi'}), 400
    
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['rating', 'comment']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra rating hợp lệ (1-5 sao)
    rating = data['rating']
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'message': 'Đánh giá phải là số nguyên từ 1 đến 5'}), 400
    
    try:
        # Tạo đánh giá mới
        review = Review(
            booking_id=booking_id,
            user_id=user_id,
            service_id=booking.service_id,
            staff_id=booking.staff_id,
            rating=rating,
            comment=data['comment']
        )
        
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            'message': 'Tạo đánh giá thành công',
            'review': review.to_dict()
        }), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi cơ sở dữ liệu: {str(e)}'}), 500

@reviews_bp.route('/<uuid:id>', methods=['PUT'])
@jwt_required()
def update_review(id):
    """
    Cập nhật đánh giá
    ---
    Cho phép người dùng cập nhật đánh giá của họ.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    review = Review.query.get(id)
    
    if not review:
        return jsonify({'message': 'Không tìm thấy đánh giá'}), 404
    
    # Kiểm tra quyền cập nhật đánh giá
    if str(review.user_id) != user_id and user.role != 'admin':
        return jsonify({'message': 'Bạn không có quyền cập nhật đánh giá này'}), 403
    
    data = request.get_json()
    
    # Cập nhật rating nếu được cung cấp
    if 'rating' in data:
        rating = data['rating']
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'message': 'Đánh giá phải là số nguyên từ 1 đến 5'}), 400
        review.rating = rating
    
    # Cập nhật comment nếu được cung cấp
    if 'comment' in data:
        review.comment = data['comment']
    
    # Cập nhật thời gian chỉnh sửa
    review.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        
        return jsonify({
            'message': 'Cập nhật đánh giá thành công',
            'review': review.to_dict()
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi cơ sở dữ liệu: {str(e)}'}), 500

@reviews_bp.route('/<uuid:id>', methods=['DELETE'])
@jwt_required()
def delete_review(id):
    """
    Xóa đánh giá
    ---
    Cho phép người dùng xóa đánh giá của họ hoặc admin xóa bất kỳ đánh giá nào.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    review = Review.query.get(id)
    
    if not review:
        return jsonify({'message': 'Không tìm thấy đánh giá'}), 404
    
    # Kiểm tra quyền xóa đánh giá
    if str(review.user_id) != user_id and user.role != 'admin':
        return jsonify({'message': 'Bạn không có quyền xóa đánh giá này'}), 403
    
    try:
        db.session.delete(review)
        db.session.commit()
        
        return jsonify({
            'message': 'Xóa đánh giá thành công'
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi cơ sở dữ liệu: {str(e)}'}), 500

@reviews_bp.route('/services/<uuid:service_id>', methods=['GET'])
def get_service_reviews(service_id):
    """
    Lấy danh sách đánh giá của một dịch vụ
    ---
    Trả về danh sách đánh giá của một dịch vụ cụ thể.
    """
    if not is_valid_uuid(service_id):
        return jsonify({'message': 'ID dịch vụ không hợp lệ'}), 400
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = Review.query.filter_by(service_id=service_id)
    
    # Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
    query = query.order_by(Review.created_at.desc())
    
    reviews = query.paginate(page=page, per_page=per_page)
    
    # Tính toán số lượng đánh giá và trung bình đánh giá
    total_reviews = reviews.total
    average_rating = 0
    if total_reviews > 0:
        sum_rating = db.session.query(db.func.sum(Review.rating)).filter(Review.service_id == service_id).scalar() or 0
        average_rating = round(sum_rating / total_reviews, 1)
    
    return jsonify({
        'service_id': str(service_id),
        'total_reviews': total_reviews,
        'average_rating': average_rating,
        'reviews': [review.to_dict() for review in reviews.items],
        'pages': reviews.pages,
        'page': reviews.page
    }), 200

@reviews_bp.route('/staff/<uuid:staff_id>', methods=['GET'])
def get_staff_reviews(staff_id):
    """
    Lấy danh sách đánh giá của một nhân viên
    ---
    Trả về danh sách đánh giá của một nhân viên cụ thể.
    """
    if not is_valid_uuid(staff_id):
        return jsonify({'message': 'ID nhân viên không hợp lệ'}), 400
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = Review.query.filter_by(staff_id=staff_id)
    
    # Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
    query = query.order_by(Review.created_at.desc())
    
    reviews = query.paginate(page=page, per_page=per_page)
    
    # Tính toán số lượng đánh giá và trung bình đánh giá
    total_reviews = reviews.total
    average_rating = 0
    if total_reviews > 0:
        sum_rating = db.session.query(db.func.sum(Review.rating)).filter(Review.staff_id == staff_id).scalar() or 0
        average_rating = round(sum_rating / total_reviews, 1)
    
    return jsonify({
        'staff_id': str(staff_id),
        'total_reviews': total_reviews,
        'average_rating': average_rating,
        'reviews': [review.to_dict() for review in reviews.items],
        'pages': reviews.pages,
        'page': reviews.page
    }), 200