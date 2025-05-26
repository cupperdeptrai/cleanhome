from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.notification import Notification
from ..schemas.booking import NotificationSchema
from ..utils.validators import validate_required_fields
from ..utils.helpers import log_activity
from sqlalchemy.exc import SQLAlchemyError
import uuid

bp = Blueprint('notifications', __name__)

@bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """Lấy danh sách thông báo của người dùng"""
    current_user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    try:
        query = Notification.query.filter_by(user_id=current_user_id)
        notifications = query.paginate(page=page, per_page=per_page, error_out=False)
        schema = NotificationSchema(many=True)
        result = schema.dump(notifications.items)
        
        log_activity(current_user_id, 'read', 'notification', details={'count': len(result)})
        return jsonify({
            'notifications': result,
            'total': notifications.total,
            'pages': notifications.pages,
            'page': page
        }), 200
    except SQLAlchemyError as e:
        return jsonify({'error': 'Lỗi cơ sở dữ liệu'}), 500

@bp.route('', methods=['POST'])
@jwt_required()
def create_notification():
    """Tạo thông báo mới (admin only)"""
    current_user = db.session.query(User).filter_by(id=get_jwt_identity()).first()
    if current_user.role != 'admin':
        return jsonify({'error': 'Yêu cầu quyền admin'}), 403
    
    data = request.get_json()
    required_fields = ['user_id', 'title', 'message']
    is_valid, missing = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'error': f'Thiếu các trường: {", ".join(missing)}'}), 400
    
    try:
        notification = Notification(
            id=uuid.uuid4(),
            user_id=data['user_id'],
            title=data['title'],
            message=data['message'],
            type=data.get('type'),
            is_read=False
        )
        db.session.add(notification)
        db.session.commit()
        
        schema = NotificationSchema()
        result = schema.dump(notification)
        log_activity(current_user.id, 'create', 'notification', str(notification.id))
        return jsonify(result), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Lỗi khi tạo thông báo'}), 500

@bp.route('/<notification_id>', methods=['PUT'])
@jwt_required()
def update_notification(notification_id):
    """Cập nhật trạng thái thông báo (đã đọc/chưa đọc)"""
    current_user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()
    
    if not notification:
        return jsonify({'error': 'Thông báo không tồn tại hoặc không thuộc về bạn'}), 404
    
    data = request.get_json()
    if 'is_read' not in data:
        return jsonify({'error': 'Yêu cầu trường is_read'}), 400
    
    try:
        notification.is_read = data['is_read']
        db.session.commit()
        
        schema = NotificationSchema()
        result = schema.dump(notification)
        log_activity(current_user_id, 'update', 'notification', notification_id)
        return jsonify(result), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Lỗi khi cập nhật thông báo'}), 500

@bp.route('/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Xóa thông báo"""
    current_user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()
    
    if not notification:
        return jsonify({'error': 'Thông báo không tồn tại hoặc không thuộc về bạn'}), 404
    
    try:
        db.session.delete(notification)
        db.session.commit()
        
        log_activity(current_user_id, 'delete', 'notification', notification_id)
        return jsonify({'message': 'Thông báo đã được xóa'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Lỗi khi xóa thông báo'}), 500