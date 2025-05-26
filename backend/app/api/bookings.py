from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from ..models import Booking, BookingItem, Service, User, StaffSchedule, Payment
from ..extensions import db
from ..utils.helpers import is_valid_uuid, calculate_booking_end_time
from ..utils.validators import (
    validate_required_fields,
    validate_booking_status,
    validate_payment_status,
    validate_payment_method,
    validate_date_format,
    validate_time_format
)

bookings_bp = Blueprint('bookings', __name__)

# Decorator kiểm tra quyền admin hoặc nhân viên
def admin_or_staff_required(f):
    """
    Decorator kiểm tra quyền admin hoặc nhân viên
    ---
    Đảm bảo người dùng hiện tại có quyền admin hoặc nhân viên trước khi thực hiện hành động.
    """
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        
        if not is_valid_uuid(user_id):
            return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
        
        user = User.query.get(user_id)
        
        if not user or (user.role != 'admin' and user.role != 'staff'):
            return jsonify({'message': 'Bạn không có quyền thực hiện hành động này'}), 403
        
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return jwt_required()(decorated_function)

@bookings_bp.route('/', methods=['GET'])
@jwt_required()
def get_bookings():
    """
    Lấy danh sách đơn đặt lịch
    ---
    Người dùng thông thường chỉ có thể xem đơn đặt lịch của họ.
    Admin và nhân viên có thể xem tất cả đơn đặt lịch.
    Hỗ trợ lọc theo trạng thái và phân trang.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Lọc theo trạng thái nếu được cung cấp
    status = request.args.get('status')
    
    query = Booking.query
    
    # Người dùng thông thường chỉ có thể xem đơn đặt lịch của họ
    if user.role == 'customer':
        query = query.filter_by(user_id=user.id)
    # Nhân viên chỉ có thể xem đơn đặt lịch được gán cho họ hoặc chưa được gán cho nhân viên nào
    elif user.role == 'staff':
        query = query.filter((Booking.staff_id == user.id) | (Booking.staff_id == None))
    
    # Lọc theo trạng thái nếu được cung cấp
    if status:
        is_valid, _ = validate_booking_status(status)
        if is_valid:
            query = query.filter_by(status=status)
    
    # Sắp xếp theo ngày đặt và giờ đặt (mới nhất lên đầu)
    query = query.order_by(Booking.booking_date.desc(), Booking.booking_time.desc())
    
    bookings = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'bookings': [booking.to_dict() for booking in bookings.items],
        'total': bookings.total,
        'pages': bookings.pages,
        'page': bookings.page
    }), 200

@bookings_bp.route('/<uuid:id>', methods=['GET'])
@jwt_required()
def get_booking(id):
    """
    Lấy thông tin chi tiết của một đơn đặt lịch
    ---
    Người dùng thông thường chỉ có thể xem đơn đặt lịch của họ.
    Admin và nhân viên được gán có thể xem bất kỳ đơn đặt lịch.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    booking = Booking.query.get(id)
    
    if not booking:
        return jsonify({'message': 'Không tìm thấy đơn đặt lịch'}), 404
    
    # Người dùng thông thường chỉ có thể xem đơn đặt lịch của họ
    if user.role == 'customer' and str(booking.user_id) != str(user.id):
        return jsonify({'message': 'Bạn không có quyền xem đơn đặt lịch này'}), 403
    
    # Nhân viên chỉ có thể xem đơn đặt lịch được gán cho họ hoặc chưa được gán cho nhân viên nào
    if user.role == 'staff' and booking.staff_id and str(booking.staff_id) != str(user.id):
        return jsonify({'message': 'Bạn không có quyền xem đơn đặt lịch này'}), 403
    
    return jsonify({
        'booking': booking.to_dict()
    }), 200

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    """
    Tạo đơn đặt lịch mới
    ---
    Cho phép người dùng tạo đơn đặt lịch mới với dịch vụ và thời gian mong muốn.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['address', 'booking_date', 'booking_time', 'services']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra định dạng ngày và giờ
    is_valid_date, date_error = validate_date_format(data['booking_date'])
    if not is_valid_date:
        return jsonify({'message': date_error}), 400
    
    is_valid_time, time_error = validate_time_format(data['booking_time'])
    if not is_valid_time:
        return jsonify({'message': time_error}), 400
    
    # Chuyển đổi ngày và giờ
    booking_date = datetime.strptime(data['booking_date'], '%Y-%m-%d').date()
    booking_time = datetime.strptime(data['booking_time'], '%H:%M').time()
    
    # Kiểm tra ngày đặt lịch phải là ngày trong tương lai
    if booking_date < datetime.now().date():
        return jsonify({'message': 'Ngày đặt lịch phải là ngày trong tương lai'}), 400
    
    # Kiểm tra dịch vụ
    services_data = data['services']
    if not services_data or not isinstance(services_data, list):
        return jsonify({'message': 'Dịch vụ phải là một mảng không rỗng'}), 400
    
    # Tính tổng thời gian và giá tiền
    total_price = 0
    total_duration = 0
    booking_items = []
    
    for service_data in services_data:
        service_id = service_data.get('service_id')
        quantity = service_data.get('quantity', 1)
        
        if not service_id or not is_valid_uuid(service_id):
            return jsonify({'message': 'ID dịch vụ không hợp lệ'}), 400
        
        if quantity < 1:
            return jsonify({'message': 'Số lượng dịch vụ phải lớn hơn 0'}), 400
        
        service = Service.query.get(service_id)
        if not service or service.status != 'active':
            return jsonify({'message': f'Dịch vụ với ID {service_id} không tồn tại hoặc không hoạt động'}), 400
        
        price = float(service.price) * quantity
        total_price += price
        total_duration += service.duration * quantity
        
        booking_item = {
            'service_id': service_id,
            'quantity': quantity,
            'price': price,
            'subtotal': price,
            'service': service
        }
        booking_items.append(booking_item)
    
    # Tạo đơn đặt lịch
    booking = Booking(
        user_id=user.id,
        service_id=booking_items[0]['service_id'],  # Dịch vụ chính
        address=data['address'],
        booking_date=booking_date,
        booking_time=booking_time,
        notes=data.get('notes'),
        total_price=total_price,
        status='pending',
        payment_status='unpaid'
    )
    
    db.session.add(booking)
    # Sử dụng flush để lấy ID mà không commit
    db.session.flush()
    
    # Tạo các booking items
    for item_data in booking_items:
        booking_item = BookingItem(
            booking_id=booking.id,
            service_id=item_data['service_id'],
            quantity=item_data['quantity'],
            price=item_data['price'],
            subtotal=item_data['subtotal']
        )
        db.session.add(booking_item)
    
    # Commit để lưu tất cả vào cơ sở dữ liệu
    db.session.commit()
    
    return jsonify({
        'message': 'Đặt lịch thành công',
        'booking': booking.to_dict()
    }), 201

@bookings_bp.route('/<uuid:id>', methods=['PUT'])
@jwt_required()
def update_booking(id):
    """
    Cập nhật thông tin đơn đặt lịch
    ---
    Người dùng thông thường chỉ có thể cập nhật đơn đặt lịch của họ và ở trạng thái chờ xác nhận hoặc đã xác nhận.
    Admin và nhân viên có thể cập nhật bất kỳ đơn đặt lịch nào.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    booking = Booking.query.get(id)
    
    if not booking:
        return jsonify({'message': 'Không tìm thấy đơn đặt lịch'}), 404
    
    # Người dùng thông thường chỉ có thể cập nhật đơn đặt lịch của họ
    if user.role == 'customer':
        if str(booking.user_id) != str(user.id):
            return jsonify({'message': 'Bạn không có quyền cập nhật đơn đặt lịch này'}), 403
        
        # Chỉ cho phép cập nhật nếu trạng thái là chờ xác nhận hoặc đã xác nhận
        if booking.status not in ['pending', 'confirmed']:
            return jsonify({'message': f'Không thể cập nhật đơn đặt lịch với trạng thái: {booking.status}'}), 400
    
    data = request.get_json()
    
    # Admin/nhân viên có thể cập nhật tất cả các trường, người dùng thông thường chỉ có thể cập nhật một số trường
    if user.role in ['admin', 'staff']:
        # Cập nhật trạng thái nếu được cung cấp
        if 'status' in data:
            is_valid_status, status_error = validate_booking_status(data['status'])
            if not is_valid_status:
                return jsonify({'message': status_error}), 400
            booking.status = data['status']
        
        # Cập nhật trạng thái thanh toán nếu được cung cấp
        if 'payment_status' in data:
            is_valid_payment_status, payment_status_error = validate_payment_status(data['payment_status'])
            if not is_valid_payment_status:
                return jsonify({'message': payment_status_error}), 400
            booking.payment_status = data['payment_status']
        
        # Cập nhật phương thức thanh toán nếu được cung cấp
        if 'payment_method' in data:
            is_valid_method, method_error = validate_payment_method(data['payment_method'])
            if not is_valid_method:
                return jsonify({'message': method_error}), 400
            booking.payment_method = data['payment_method']
        
        # Cập nhật nhân viên phụ trách nếu được cung cấp
        if 'staff_id' in data:
            staff_id = data['staff_id']
            
            if staff_id:
                if not is_valid_uuid(staff_id):
                    return jsonify({'message': 'ID nhân viên không hợp lệ'}), 400
                
                staff = User.query.get(staff_id)
                if not staff or staff.role != 'staff':
                    return jsonify({'message': 'Không tìm thấy nhân viên'}), 400
                
                booking.staff_id = staff_id
            else:
                # Hủy gán nhân viên nếu staff_id = null
                booking.staff_id = None
    
    # Các trường có thể cập nhật bởi tất cả người dùng
    if 'address' in data:
        booking.address = data['address']
    
    if 'notes' in data:
        booking.notes = data['notes']
    
    # Cập nhật ngày và giờ đặt lịch
    date_time_updated = False
    
    if 'booking_date' in data:
        is_valid_date, date_error = validate_date_format(data['booking_date'])
        if not is_valid_date:
            return jsonify({'message': date_error}), 400
        
        booking_date = datetime.strptime(data['booking_date'], '%Y-%m-%d').date()
        
        # Kiểm tra ngày đặt lịch phải là ngày trong tương lai
        if booking_date < datetime.now().date():
            return jsonify({'message': 'Ngày đặt lịch phải là ngày trong tương lai'}), 400
        
        booking.booking_date = booking_date
        date_time_updated = True
    
    if 'booking_time' in data:
        is_valid_time, time_error = validate_time_format(data['booking_time'])
        if not is_valid_time:
            return jsonify({'message': time_error}), 400
        
        booking.booking_time = datetime.strptime(data['booking_time'], '%H:%M').time()
        date_time_updated = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Cập nhật đơn đặt lịch thành công',
        'booking': booking.to_dict()
    }), 200

@bookings_bp.route('/<uuid:id>', methods=['DELETE'])
@jwt_required()
def cancel_booking(id):
    """
    Hủy hoặc xóa đơn đặt lịch
    ---
    Người dùng thông thường chỉ có thể hủy đơn đặt lịch của họ và ở trạng thái chờ xác nhận hoặc đã xác nhận.
    Admin có thể xóa hoàn toàn đơn đặt lịch, nhân viên chỉ có thể hủy đơn đặt lịch.
    """
    user_id = get_jwt_identity()
    
    if not is_valid_uuid(user_id):
        return jsonify({'message': 'ID người dùng không hợp lệ'}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404
    
    booking = Booking.query.get(id)
    
    if not booking:
        return jsonify({'message': 'Không tìm thấy đơn đặt lịch'}), 404
    
    # Người dùng thông thường chỉ có thể hủy đơn đặt lịch của họ
    if user.role == 'customer':
        if str(booking.user_id) != str(user.id):
            return jsonify({'message': 'Bạn không có quyền hủy đơn đặt lịch này'}), 403
        
        # Chỉ cho phép hủy nếu trạng thái không phải đã hoàn thành hoặc đã hủy
        if booking.status in ['completed', 'cancelled']:
            return jsonify({'message': f'Không thể hủy đơn đặt lịch với trạng thái: {booking.status}'}), 400
        
        # Đặt trạng thái thành đã hủy
        booking.status = 'cancelled'
        db.session.commit()
        
        return jsonify({
            'message': 'Hủy đơn đặt lịch thành công'
        }), 200
    
    # Admin có thể xóa hoàn toàn đơn đặt lịch
    if user.role == 'admin':
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Xóa đơn đặt lịch thành công'
        }), 200
    
    # Nhân viên chỉ có thể hủy đơn đặt lịch
    booking.status = 'cancelled'
    db.session.commit()
    
    return jsonify({
        'message': 'Hủy đơn đặt lịch thành công'
    }), 200

@bookings_bp.route('/assign-staff', methods=['POST'])
@admin_or_staff_required
def assign_staff():
    """
    Gán nhân viên cho đơn đặt lịch
    ---
    Chỉ admin và nhân viên mới có quyền gán nhân viên cho đơn đặt lịch.
    """
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['booking_id', 'staff_id']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra định dạng UUID
    if not is_valid_uuid(data['booking_id']):
        return jsonify({'message': 'ID đơn đặt lịch không hợp lệ'}), 400
    
    if not is_valid_uuid(data['staff_id']):
        return jsonify({'message': 'ID nhân viên không hợp lệ'}), 400
    
    # Tìm đơn đặt lịch và nhân viên
    booking = Booking.query.get(data['booking_id'])
    staff = User.query.get(data['staff_id'])
    
    if not booking:
        return jsonify({'message': 'Không tìm thấy đơn đặt lịch'}), 404
    
    if not staff or staff.role != 'staff':
        return jsonify({'message': 'Không tìm thấy nhân viên'}), 404
    
    # Cập nhật đơn đặt lịch
    booking.staff_id = staff.id
    
    # Nếu trạng thái đang chờ xác nhận, cập nhật thành đã xác nhận
    if booking.status == 'pending':
        booking.status = 'confirmed'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Gán nhân viên thành công',
        'booking': booking.to_dict()
    }), 200

@bookings_bp.route('/unassign-staff', methods=['POST'])
@admin_or_staff_required
def unassign_staff():
    """
    Hủy gán nhân viên cho đơn đặt lịch
    ---
    Chỉ admin và nhân viên mới có quyền hủy gán nhân viên cho đơn đặt lịch.
    """
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['booking_id']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra định dạng UUID
    if not is_valid_uuid(data['booking_id']):
        return jsonify({'message': 'ID đơn đặt lịch không hợp lệ'}), 400
    
    # Tìm đơn đặt lịch
    booking = Booking.query.get(data['booking_id'])
    
    if not booking:
        return jsonify({'message': 'Không tìm thấy đơn đặt lịch'}), 404
    
    # Kiểm tra xem đơn đặt lịch có nhân viên nào được gán không
    if not booking.staff_id:
        return jsonify({'message': 'Đơn đặt lịch chưa có nhân viên nào được gán'}), 400
    
    # Kiểm tra quyền hạn
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Nhân viên chỉ có thể hủy gán chính mình
    if user.role == 'staff' and str(booking.staff_id) != str(user.id):
        return jsonify({'message': 'Bạn không có quyền hủy gán nhân viên này'}), 403
    
    # Hủy gán nhân viên
    booking.staff_id = None
    
    # Nếu trạng thái đã xác nhận, cập nhật lại thành chờ xác nhận
    if booking.status == 'confirmed':
        booking.status = 'pending'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Hủy gán nhân viên thành công',
        'booking': booking.to_dict()
    }), 200

@bookings_bp.route('/<uuid:id>/update-status', methods=['PUT'])
@admin_or_staff_required
def update_booking_status(id):
    """
    Cập nhật trạng thái đơn đặt lịch
    ---
    Chỉ admin và nhân viên mới có quyền cập nhật trạng thái đơn đặt lịch.
    """
    booking = Booking.query.get(id)
    
    if not booking:
        return jsonify({'message': 'Không tìm thấy đơn đặt lịch'}), 404
    
    data = request.get_json()
    
    # Kiểm tra các trường bắt buộc
    required_fields = ['status']
    is_valid, missing_fields = validate_required_fields(data, required_fields)
    if not is_valid:
        return jsonify({'message': f'Thiếu thông tin bắt buộc: {", ".join(missing_fields)}'}), 400
    
    # Kiểm tra trạng thái hợp lệ
    is_valid_status, status_error = validate_booking_status(data['status'])
    if not is_valid_status:
        return jsonify({'message': status_error}), 400
    
    # Kiểm tra quyền hạn nếu là nhân viên
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Nhân viên chỉ có thể cập nhật đơn đặt lịch được gán cho họ
    if user.role == 'staff' and booking.staff_id and str(booking.staff_id) != str(user.id):
        return jsonify({'message': 'Bạn không có quyền cập nhật đơn đặt lịch này'}), 403
    
    # Cập nhật trạng thái
    old_status = booking.status
    booking.status = data['status']
    
    # Xử lý các logic bổ sung khi trạng thái thay đổi
    if data['status'] == 'completed' and old_status != 'completed':
        # Nếu trạng thái mới là hoàn thành, cập nhật trạng thái thanh toán nếu thanh toán là tiền mặt
        if booking.payment_method == 'cash':
            booking.payment_status = 'paid'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Cập nhật trạng thái đơn đặt lịch thành công',
        'booking': booking.to_dict()
    }), 200
