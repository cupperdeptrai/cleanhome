from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import Payment, Booking, User
from ..extensions import db
from ..utils.helpers import is_valid_uuid
from ..utils.validators import (
    validate_required_fields,
    validate_payment_method,
    validate_payment_status
)

payments_bp = Blueprint('payments', __name__)

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

@payments_bp.route('/', methods=['GET'])
@jwt_required()
def get_payments():
    """
    Lấy danh sách thanh toán
    ---
    Admin có thể xem tất cả thanh toán.
    Người dùng thông thường chỉ có thể xem thanh toán của họ.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    query = Payment.query
    
    # Nếu không phải admin, chỉ xem thanh toán của mình
    if user.role != 'admin':
        # Join với booking để lấy user_id
        query = query.join(Booking).filter(Booking.user_id == user.id)
    
    # Sắp xếp theo thời gian tạo giảm dần
    query = query.order_by(Payment.created_at.desc())
    
    payments = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'payments': [payment.to_dict() for payment in payments.items],
        'total': payments.total,
        'pages': payments.pages,
        'page': payments.page
    }), 200

@payments_bp.route('/<uuid:id>', methods=['GET'])
@jwt_required()
def get_payment(id):
    """
    Lấy thông tin chi tiết của một thanh toán
    ---
    Admin có thể xem bất kỳ thanh toán.
    Người dùng thông thường chỉ có thể xem thanh toán của họ.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    payment = Payment.query.get(id)
    
    if not payment:
        return jsonify({'message': 'Không tìm thấy thanh toán'}), 404
    
    # Kiểm tra quyền xem thanh toán
    if user.role != 'admin':
        booking = Booking.query.get(payment.booking_id)
        if not booking or str(booking.user_id) != str(user.id):
            return jsonify({'message': 'Bạn không có quyền xem thanh toán này'}), 403
    
    return jsonify({
        'payment': payment.to_dict()
    }), 200

@payments_bp.route('/', methods=['POST'])
@jwt_required()
def create_payment():
    """
    Tạo thanh toán mới
    ---
    Cho phép người dùng hoặc admin tạo thanh toán mới cho đơn đặt lịch.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['booking_id', 'amount', 'payment_method']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra booking_id
    booking_id = data['booking_id']
    if not is_valid_uuid(booking_id):
        return jsonify({'message': 'ID đơn đặt lịch không hợp lệ'}), 400
    
    # Lấy đơn đặt lịch
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'message': 'Không tìm thấy đơn đặt lịch'}), 404
    
    # Kiểm tra quyền tạo thanh toán
    if user.role != 'admin' and str(booking.user_id) != str(user.id):
        return jsonify({'message': 'Bạn không có quyền tạo thanh toán cho đơn đặt lịch này'}), 403
    
    # Kiểm tra payment_method
    payment_method = data['payment_method']
    is_valid, error = validate_payment_method(payment_method)
    if not is_valid:
        return jsonify({'message': error}), 400
    
    # Lấy status từ request hoặc mặc định là 'pending'
    status = data.get('status', 'pending')
    is_valid, error = validate_payment_status(status)
    if not is_valid:
        return jsonify({'message': error}), 400
    
    # Tạo đối tượng Payment mới
    payment = Payment(
        booking_id=booking_id,
        amount=data['amount'],
        payment_method=payment_method,
        transaction_id=data.get('transaction_id'),
        status=status,
        payment_date=datetime.now() if status == 'completed' else None
    )
    
    try:
        db.session.add(payment)
        
        # Cập nhật trạng thái thanh toán của đơn đặt lịch nếu thanh toán hoàn tất
        if status == 'completed':
            booking.payment_status = 'paid'
            booking.payment_method = payment_method
        
        db.session.commit()
        
        return jsonify({
            'message': 'Tạo thanh toán thành công',
            'payment': payment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Đã xảy ra lỗi khi tạo thanh toán: {str(e)}'}), 500

@payments_bp.route('/<uuid:id>', methods=['PUT'])
@admin_required
def update_payment_status(id):
    """
    Cập nhật trạng thái thanh toán
    ---
    Chỉ admin mới có quyền cập nhật trạng thái thanh toán.
    """
    payment = Payment.query.get(id)
    
    if not payment:
        return jsonify({'message': 'Không tìm thấy thanh toán'}), 404
    
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['status']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra status
    status = data['status']
    is_valid, error = validate_payment_status(status)
    if not is_valid:
        return jsonify({'message': error}), 400
    
    try:
        # Cập nhật trạng thái thanh toán
        payment.status = status
        
        # Nếu trạng thái là completed, cập nhật payment_date nếu chưa có
        if status == 'completed' and not payment.payment_date:
            payment.payment_date = datetime.now()
        
        # Cập nhật trạng thái thanh toán của đơn đặt lịch
        booking = Booking.query.get(payment.booking_id)
        if booking:
            if status == 'completed':
                booking.payment_status = 'paid'
            elif status == 'refunded':
                booking.payment_status = 'unpaid'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Cập nhật trạng thái thanh toán thành công',
            'payment': payment.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Đã xảy ra lỗi khi cập nhật trạng thái thanh toán: {str(e)}'}), 500

@payments_bp.route('/bookings/<uuid:booking_id>', methods=['GET'])
@jwt_required()
def get_payments_by_booking(booking_id):
    """
    Lấy danh sách thanh toán theo đơn đặt lịch
    ---
    Admin có thể xem tất cả thanh toán.
    Người dùng thông thường chỉ có thể xem thanh toán của họ.
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
    
    # Kiểm tra quyền xem thanh toán
    if user.role != 'admin' and str(booking.user_id) != str(user.id):
        return jsonify({'message': 'Bạn không có quyền xem thanh toán của đơn đặt lịch này'}), 403
    
    # Lấy danh sách thanh toán theo booking_id
    payments = Payment.query.filter_by(booking_id=booking_id).order_by(Payment.created_at.desc()).all()
    
    return jsonify({
        'payments': [payment.to_dict() for payment in payments]
    }), 200