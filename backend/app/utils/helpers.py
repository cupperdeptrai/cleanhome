import uuid
import re
from datetime import datetime, timedelta
import json
from flask import current_app
import secrets
import string

def generate_uuid():
    """
    Tạo UUID mới
    ---
    Hàm này tạo UUID phiên bản 4 dùng cho khóa chính của các model.
    
    Returns:
        UUID: Một UUID mới
    """
    return uuid.uuid4()


def is_valid_uuid(value):
    """
    Kiểm tra một chuỗi có phải là UUID hợp lệ hay không
    ---
    Args:
        value (str): Chuỗi cần kiểm tra
    
    Returns:
        bool: True nếu là UUID hợp lệ, False nếu không
    """
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def format_timestamp(timestamp, format_str="%d/%m/%Y %H:%M:%S"):
    """
    Định dạng timestamp thành chuỗi ngày tháng theo định dạng mong muốn
    ---
    Args:
        timestamp (datetime): Đối tượng datetime cần định dạng
        format_str (str): Định dạng ngày tháng, mặc định là Ngày/Tháng/Năm Giờ:Phút:Giây
    
    Returns:
        str: Chuỗi ngày tháng đã được định dạng
    """
    if not timestamp:
        return None
    
    if isinstance(timestamp, str):
        try:
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except ValueError:
            return timestamp
    
    return timestamp.strftime(format_str)


def calculate_time_slots(start_time, end_time, duration_minutes=60):
    """
    Tính toán các khoảng thời gian có sẵn trong một khoảng
    ---
    Hàm này sẽ tạo danh sách các khoảng thời gian từ giờ bắt đầu đến giờ kết thúc,
    với độ dài mỗi khoảng là duration_minutes.
    
    Args:
        start_time (datetime): Thời gian bắt đầu
        end_time (datetime): Thời gian kết thúc
        duration_minutes (int): Độ dài mỗi khoảng thời gian (phút)
    
    Returns:
        list: Danh sách các khoảng thời gian [(start1, end1), (start2, end2), ...]
    """
    slots = []
    current = start_time
    
    while current + timedelta(minutes=duration_minutes) <= end_time:
        end_slot = current + timedelta(minutes=duration_minutes)
        slots.append((current, end_slot))
        current = end_slot
    
    return slots


def format_currency(amount, currency="VND"):
    """
    Định dạng số tiền với đơn vị tiền tệ
    ---
    Args:
        amount (float): Số tiền cần định dạng
        currency (str): Đơn vị tiền tệ (mặc định là VND)
    
    Returns:
        str: Chuỗi số tiền đã được định dạng (ví dụ: 1,000,000 VND)
    """
    # Làm tròn số
    amount = round(float(amount), 0)
    # Định dạng số với dấu phân cách hàng nghìn
    formatted = "{:,.0f}".format(amount)
    # Thêm đơn vị tiền tệ
    return f"{formatted} {currency}"


def jsonify_dict(dict_data):
    """
    Chuyển đổi dữ liệu từ dictionary sang JSON string
    ---
    Đặc biệt hữu ích cho việc lưu trữ dữ liệu phức tạp vào cơ sở dữ liệu
    
    Args:
        dict_data (dict): Dictionary cần chuyển đổi
    
    Returns:
        str: Chuỗi JSON
    """
    try:
        return json.dumps(dict_data, ensure_ascii=False)
    except (TypeError, ValueError):
        return '{}'


def parse_json(json_str):
    """
    Phân tích chuỗi JSON thành dictionary
    ---
    Args:
        json_str (str): Chuỗi JSON cần phân tích
    
    Returns:
        dict: Dictionary từ chuỗi JSON, hoặc dict rỗng nếu có lỗi
    """
    try:
        return json.loads(json_str) if json_str else {}
    except (TypeError, ValueError):
        return {}


def generate_random_string(length=10):
    """
    Tạo chuỗi ngẫu nhiên với độ dài cho trước
    ---
    Hữu ích cho việc tạo mã giảm giá, mã đơn hàng, v.v.
    
    Args:
        length (int): Độ dài chuỗi cần tạo
    
    Returns:
        str: Chuỗi ngẫu nhiên
    """
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def generate_promotion_code(prefix="CLEAN", length=6):
    """
    Tạo mã khuyến mãi với tiền tố cho trước
    ---
    Args:
        prefix (str): Tiền tố cho mã khuyến mãi
        length (int): Độ dài phần ngẫu nhiên của mã
    
    Returns:
        str: Mã khuyến mãi
    """
    random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(length))
    return f"{prefix}{random_part}"


def is_valid_phone_number(phone):
    """
    Kiểm tra số điện thoại có hợp lệ không (định dạng Việt Nam)
    ---
    Args:
        phone (str): Số điện thoại cần kiểm tra
    
    Returns:
        bool: True nếu số điện thoại hợp lệ, False nếu không
    """
    # Mẫu cho số điện thoại Việt Nam (cả số cũ và mới)
    # Hỗ trợ các định dạng: 0xxx, 84xxx, +84xxx
    pattern = r'^(\+84|84|0)[3|5|7|8|9][0-9]{8}$'
    return bool(re.match(pattern, phone))


def is_valid_email(email):
    """
    Kiểm tra địa chỉ email có hợp lệ không
    ---
    Args:
        email (str): Địa chỉ email cần kiểm tra
    
    Returns:
        bool: True nếu địa chỉ email hợp lệ, False nếu không
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def calculate_booking_end_time(start_time, duration_minutes):
    """
    Tính thời gian kết thúc dịch vụ dựa trên thời gian bắt đầu và thời lượng
    ---
    Args:
        start_time (datetime): Thời gian bắt đầu
        duration_minutes (int): Thời lượng dịch vụ (phút)
    
    Returns:
        datetime: Thời gian kết thúc
    """
    return start_time + timedelta(minutes=duration_minutes)


def log_activity(user_id, action, entity_type, entity_id=None, details=None):
    """
    Ghi lại hoạt động của người dùng
    ---
    Hàm này có thể được mở rộng để lưu vào cơ sở dữ liệu hoặc file log
    
    Args:
        user_id (str): ID của người dùng thực hiện hành động
        action (str): Hành động (create, update, delete, v.v.)
        entity_type (str): Loại đối tượng (user, booking, service, v.v.)
        entity_id (str, optional): ID của đối tượng
        details (dict, optional): Chi tiết bổ sung
    """
    timestamp = datetime.utcnow()
    log_entry = {
        'timestamp': timestamp.isoformat(),
        'user_id': str(user_id),
        'action': action,
        'entity_type': entity_type,
        'entity_id': str(entity_id) if entity_id else None,
        'details': details
    }
    
    # Ghi vào log của ứng dụng (có thể mở rộng để lưu vào DB)
    current_app.logger.info(f"Activity: {json.dumps(log_entry)}")
    return log_entry
