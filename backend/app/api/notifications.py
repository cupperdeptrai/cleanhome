from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models.notification import Notification
from ..models import User
from ..extensions import db
from ..utils.helpers import is_valid_uuid
from ..utils.validators import validate_required_fields
from sqlalchemy.exc import SQLAlchemyError
import uuid

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """
    Lấy danh sách thông báo của người dùng
    ---
    Trả về danh sách thông báo của người dùng hiện tại, hỗ trợ phân trang.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    try:
        query = Notification.query.filter_by(user_id=user_id)
        
        # Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
        query = query.order_by(Notification.created_at.desc())
        
        notifications = query.paginate(page=page, per_page=per_page)
        
        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications.items],
            'total': notifications.total,
            'pages': notifications.pages,
            'page': notifications.page
        }), 200
    except SQLAlchemyError as e:
        return jsonify({'message': f'Lỗi cơ sở dữ liệu: {str(e)}'}), 500

@notifications_bp.route('/<uuid:id>', methods=['GET'])
@jwt_required()
def get_notification(id):
    """
    Lấy chi tiết thông báo
    ---
    Trả về chi tiết của một thông báo cụ thể.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    notification = Notification.query.get(id)
    
    if not notification:
        return jsonify({'message': 'Không tìm thấy thông báo'}), 404
    
    # Kiểm tra xem thông báo có thuộc về người dùng hiện tại không
    if str(notification.user_id) != user_id:
        return jsonify({'message': 'Bạn không có quyền xem thông báo này'}), 403
    
    return jsonify({
        'notification': notification.to_dict()
    }), 200

@notifications_bp.route('/mark-read/<uuid:id>', methods=['PUT'])
@jwt_required()
def mark_notification_read(id):
    """
    Đánh dấu thông báo đã đọc
    ---
    Cập nhật trạng thái của thông báo thành đã đọc.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    notification = Notification.query.get(id)
    
    if not notification:
        return jsonify({'message': 'Không tìm thấy thông báo'}), 404
    
    # Kiểm tra xem thông báo có thuộc về người dùng hiện tại không
    if str(notification.user_id) != user_id:
        return jsonify({'message': 'Bạn không có quyền cập nhật thông báo này'}), 403
    
    try:
        notification.is_read = True
        db.session.commit()
        
        return jsonify({
            'message': 'Đánh dấu thông báo đã đọc thành công',
            'notification': notification.to_dict()
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi cơ sở dữ liệu: {str(e)}'}), 500

@notifications_bp.route('/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    """
    Đánh dấu tất cả thông báo đã đọc
    ---
    Cập nhật trạng thái của tất cả thông báo chưa đọc thành đã đọc.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    try:
        # Lấy tất cả thông báo chưa đọc của người dùng
        unread_notifications = Notification.query.filter_by(user_id=user_id, is_read=False).all()
        
        # Đánh dấu tất cả là đã đọc
        for notification in unread_notifications:
            notification.is_read = True
        
        db.session.commit()
        
        return jsonify({
            'message': f'Đã đánh dấu {len(unread_notifications)} thông báo là đã đọc'
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi cơ sở dữ liệu: {str(e)}'}), 500

@notifications_bp.route('/', methods=['POST'])
@jwt_required()
def create_notification():
    """
    Tạo thông báo mới (chỉ admin)
    ---
    Cho phép admin tạo thông báo mới cho người dùng.
    """
    admin_id = get_jwt_identity()
    
    if not is_valid_uuid(admin_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    admin = User.query.get(admin_id)
    
    if not admin or admin.role != 'admin':
        return jsonify({'message': 'Bạn không có quyền tạo thông báo'}), 403
    
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['user_id', 'title', 'message']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra user_id
    user_id = data['user_id']
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    # Kiểm tra người dùng tồn tại
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    try:
        # Tạo thông báo mới
        notification = Notification(
            user_id=user_id,
            title=data['title'],
            message=data['message'],
            type=data.get('type', 'system'),
            is_read=False
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Tạo thông báo thành công',
            'notification': notification.to_dict()
        }), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi cơ sở dữ liệu: {str(e)}'}), 500

@notifications_bp.route('/batch', methods=['POST'])
@jwt_required()
def create_batch_notifications():
    """
    Tạo nhiều thông báo cùng lúc (chỉ admin)
    ---
    Cho phép admin tạo nhiều thông báo cùng lúc cho nhiều người dùng.
    """
    admin_id = get_jwt_identity()
    
    if not is_valid_uuid(admin_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    admin = User.query.get(admin_id)
    
    if not admin or admin.role != 'admin':
        return jsonify({'message': 'Bạn không có quyền tạo thông báo'}), 403
    
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['user_ids', 'title', 'message']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra user_ids là một mảng
    user_ids = data['user_ids']
    if not isinstance(user_ids, list) or len(user_ids) == 0:
        return jsonify({'message': 'user_ids phải là một mảng không rỗng'}), 400
    
    # Lọc ra các user_id hợp lệ
    valid_user_ids = [user_id for user_id in user_ids if is_valid_uuid(user_id)]
    
    # Lấy danh sách người dùng tồn tại
    users = User.query.filter(User.id.in_(valid_user_ids)).all()
    
    if not users:
        return jsonify({'message': 'Không tìm thấy người dùng nào hợp lệ'}), 404
    
    try:
        notifications = []
        
        # Tạo thông báo cho từng người dùng
        for user in users:
            notification = Notification(
                user_id=user.id,
                title=data['title'],
                message=data['message'],
                type=data.get('type', 'system'),
                is_read=False
            )
            
            db.session.add(notification)
            notifications.append(notification)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Đã tạo {len(notifications)} thông báo thành công',
            'count': len(notifications)
        }), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi cơ sở dữ liệu: {str(e)}'}), 500

@notifications_bp.route('/<uuid:id>', methods=['DELETE'])
@jwt_required()
def delete_notification(id):
    """
    Xóa thông báo
    ---
    Cho phép người dùng xóa thông báo của họ hoặc admin xóa bất kỳ thông báo nào.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    notification = Notification.query.get(id)
    
    if not notification:
        return jsonify({'message': 'Không tìm thấy thông báo'}), 404
    
    # Kiểm tra quyền xóa thông báo
    if user.role != 'admin' and str(notification.user_id) != user_id:
        return jsonify({'message': 'Bạn không có quyền xóa thông báo này'}), 403
    
    try:
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Xóa thông báo thành công'
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi cơ sở dữ liệu: {str(e)}'}), 500