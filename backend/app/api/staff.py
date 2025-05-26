from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.booking import StaffSchedule
from ..models.user import User
from ..schemas.booking import StaffScheduleSchema
from ..utils.validators import validate_required_fields, validate_schedule_status, validate_time_range
from ..utils.helpers import log_activity
from sqlalchemy.exc import SQLAlchemyError
import uuid
from datetime import datetime

bp = Blueprint('staff', __name__)

@bp.route('/schedules', methods=['GET'])
@jwt_required()
def get_schedules():
    """Lấy danh sách lịch làm việc"""
    current_user = db.session.query(User).filter_by(id=get_jwt_identity()).first()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    try:
        query = StaffSchedule.query
        if current_user.role == 'staff':
            query = query.filter_by(staff_id=current_user.id)
        elif current_user.role != 'admin':
            return jsonify({'error': 'Yêu cầu quyền admin hoặc staff'}), 403
        
        schedules = query.paginate(page=page, per_page=per_page, error_out=False)
        schema = StaffScheduleSchema(many=True)
        result = schema.dump(schedules.items)
        
        log_activity(current_user.id, 'read', 'staff_schedule', details={'count': len(result)})
        return jsonify({
            'schedules': result,
            'total': schedules.total,
            'pages': schedules.pages,
            'page': page
        }), 200
    except SQLAlchemyError as e:
        return jsonify({'error': 'Lỗi cơ sở dữ liệu'}), 500

@bp.route('/schedules', methods=['POST'])
@jwt_required()
def create_schedule():
    """Tạo lịch làm việc mới (admin only)"""
    current_user = db.session.query(User).filter_by(id=get_jwt_identity()).first()
    if current_user.role != 'admin':
        return jsonify({'error': 'Yêu cầu quyền admin'}), 403
    
    data = request.get_json()
    required_fields = ['staff_id', 'date', 'start_time', 'end_time']
    is_valid, missing = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'error': f'Thiếu các trường: {", ".join(missing)}'}), 400
    
    is_valid, error = validate_schedule_status(data.get('status', 'available'))
    if not is_valid:
        return jsonify({'error': error}), 400
    
    is_valid, error = validate_time_range(data['start_time'], data['end_time'])
    if not is_valid:
        return jsonify({'error': error}), 400
    
    try:
        schedule = StaffSchedule(
            id=uuid.uuid4(),
            staff_id=data['staff_id'],
            date=data['date'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            status=data.get('status', 'available')
        )
        db.session.add(schedule)
        db.session.commit()
        
        schema = StaffScheduleSchema()
        result = schema.dump(schedule)
        log_activity(current_user.id, 'create', 'staff_schedule', str(schedule.id))
        return jsonify(result), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Lỗi khi tạo lịch làm việc'}), 500

@bp.route('/schedules/<schedule_id>', methods=['PUT'])
@jwt_required()
def update_schedule(schedule_id):
    """Cập nhật lịch làm việc (admin only)"""
    current_user = db.session.query(User).filter_by(id=get_jwt_identity()).first()
    if current_user.role != 'admin':
        return jsonify({'error': 'Yêu cầu quyền admin'}), 403
    
    schedule = StaffSchedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'error': 'Lịch làm việc không tồn tại'}), 404
    
    data = request.get_json()
    if 'status' in data:
        is_valid, error = validate_schedule_status(data['status'])
        if not is_valid:
            return jsonify({'error': error}), 400
    
    if 'start_time' in data and 'end_time' in data:
        is_valid, error = validate_time_range(data['start_time'], data['end_time'])
        if not is_valid:
            return jsonify({'error': error}), 400
    
    try:
        schedule.date = data.get('date', schedule.date)
        schedule.start_time = data.get('start_time', schedule.start_time)
        schedule.end_time = data.get('end_time', schedule.end_time)
        schedule.status = data.get('status', schedule.status)
        db.session.commit()
        
        schema = StaffScheduleSchema()
        result = schema.dump(schedule)
        log_activity(current_user.id, 'update', 'staff_schedule', schedule_id)
        return jsonify(result), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Lỗi khi cập nhật lịch làm việc'}), 500

@bp.route('/schedules/<schedule_id>', methods=['DELETE'])
@jwt_required()
def delete_schedule(schedule_id):
    """Xóa lịch làm việc (admin only)"""
    current_user = db.session.query(User).filter_by(id=get_jwt_identity()).first()
    if current_user.role != 'admin':
        return jsonify({'error': 'Yêu cầu quyền admin'}), 403
    
    schedule = StaffSchedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'error': 'Lịch làm việc không tồn tại'}), 404
    
    try:
        db.session.delete(schedule)
        db.session.commit()
        
        log_activity(current_user.id, 'delete', 'staff_schedule', schedule_id)
        return jsonify({'message': 'Lịch làm việc đã được xóa'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Lỗi khi xóa lịch làm việc'}), 500