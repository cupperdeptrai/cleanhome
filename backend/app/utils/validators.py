import re
from datetime import datetime, date, time
import uuid
from .helpers import is_valid_email, is_valid_phone_number, is_valid_uuid

# Danh sách các giá trị enum
USER_ROLES = ['customer', 'staff', 'admin']
USER_STATUSES = ['active', 'locked']
SERVICE_STATUSES = ['active', 'inactive']
BOOKING_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
PAYMENT_STATUSES = ['unpaid', 'paid']
PAYMENT_METHODS = ['cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay']
DISCOUNT_TYPES = ['percentage', 'fixed']
SCHEDULE_STATUSES = ['available', 'booked', 'off']
TRANSACTION_STATUSES = ['pending', 'completed', 'failed', 'refunded']


def validate_required_fields(data, required_fields):
    """
    Kiểm tra xem tất cả các trường bắt buộc có được cung cấp không
    ---
    Args:
        data (dict): Dữ liệu cần kiểm tra
        required_fields (list): Danh sách các trường bắt buộc
    
    Returns:
        tuple: (is_valid, missing_fields)
    """
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    return len(missing_fields) == 0, missing_fields


def validate_enum_value(value, allowed_values, field_name=None):
    """
    Kiểm tra giá trị có nằm trong danh sách giá trị cho phép hay không
    ---
    Args:
        value: Giá trị cần kiểm tra
        allowed_values (list): Danh sách giá trị cho phép
        field_name (str, optional): Tên trường để hiển thị trong thông báo lỗi
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if value in allowed_values:
        return True, None
    
    field_text = f"'{field_name}' " if field_name else ""
    return False, f"Giá trị {field_text}'{value}' không hợp lệ. Phải là một trong {', '.join(allowed_values)}."


def validate_user_role(role):
    """
    Kiểm tra vai trò người dùng có hợp lệ không
    ---
    Args:
        role (str): Vai trò cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_enum_value(role, USER_ROLES, 'role')


def validate_user_status(status):
    """
    Kiểm tra trạng thái người dùng có hợp lệ không
    ---
    Args:
        status (str): Trạng thái cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_enum_value(status, USER_STATUSES, 'status')


def validate_service_status(status):
    """
    Kiểm tra trạng thái dịch vụ có hợp lệ không
    ---
    Args:
        status (str): Trạng thái cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_enum_value(status, SERVICE_STATUSES, 'status')


def validate_booking_status(status):
    """
    Kiểm tra trạng thái đặt lịch có hợp lệ không
    ---
    Args:
        status (str): Trạng thái cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_enum_value(status, BOOKING_STATUSES, 'status')


def validate_payment_status(status):
    """
    Kiểm tra trạng thái thanh toán có hợp lệ không
    ---
    Args:
        status (str): Trạng thái cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_enum_value(status, PAYMENT_STATUSES, 'payment_status')


def validate_payment_method(method):
    """
    Kiểm tra phương thức thanh toán có hợp lệ không
    ---
    Args:
        method (str): Phương thức cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_enum_value(method, PAYMENT_METHODS, 'payment_method')


def validate_discount_type(discount_type):
    """
    Kiểm tra loại giảm giá có hợp lệ không
    ---
    Args:
        discount_type (str): Loại giảm giá cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_enum_value(discount_type, DISCOUNT_TYPES, 'discount_type')


def validate_schedule_status(status):
    """
    Kiểm tra trạng thái lịch làm việc có hợp lệ không
    ---
    Args:
        status (str): Trạng thái cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_enum_value(status, SCHEDULE_STATUSES, 'status')


def validate_transaction_status(status):
    """
    Kiểm tra trạng thái giao dịch có hợp lệ không
    ---
    Args:
        status (str): Trạng thái cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_enum_value(status, TRANSACTION_STATUSES, 'status')


def validate_uuid_format(value, field_name=None):
    """
    Kiểm tra chuỗi có phải là UUID hợp lệ không
    ---
    Args:
        value: Giá trị cần kiểm tra
        field_name (str, optional): Tên trường để hiển thị trong thông báo lỗi
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if is_valid_uuid(value):
        return True, None
    
    field_text = f"{field_name} " if field_name else ""
    return False, f"{field_text}phải là UUID hợp lệ."


def validate_email_format(email):
    """
    Kiểm tra định dạng email có hợp lệ không
    ---
    Args:
        email (str): Email cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if is_valid_email(email):
        return True, None
    return False, "Định dạng email không hợp lệ."


def validate_phone_format(phone):
    """
    Kiểm tra định dạng số điện thoại có hợp lệ không
    ---
    Args:
        phone (str): Số điện thoại cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not phone:  # Số điện thoại có thể không bắt buộc
        return True, None
    
    if is_valid_phone_number(phone):
        return True, None
    return False, "Định dạng số điện thoại không hợp lệ. Ví dụ đúng: 0912345678, +84912345678"


def validate_date_format(date_str, format_str="%Y-%m-%d"):
    """
    Kiểm tra chuỗi ngày tháng có đúng định dạng không
    ---
    Args:
        date_str (str): Chuỗi ngày tháng cần kiểm tra
        format_str (str): Định dạng ngày tháng mong muốn
    
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        datetime.strptime(date_str, format_str)
        return True, None
    except ValueError:
        return False, f"Định dạng ngày tháng không hợp lệ. Ví dụ đúng: {datetime.now().strftime(format_str)}"


def validate_time_format(time_str, format_str="%H:%M"):
    """
    Kiểm tra chuỗi thời gian có đúng định dạng không
    ---
    Args:
        time_str (str): Chuỗi thời gian cần kiểm tra
        format_str (str): Định dạng thời gian mong muốn
    
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        datetime.strptime(time_str, format_str)
        return True, None
    except ValueError:
        return False, f"Định dạng thời gian không hợp lệ. Ví dụ đúng: {datetime.now().strftime(format_str)}"


def validate_positive_number(value, field_name=None, include_zero=False):
    """
    Kiểm tra giá trị có phải là số dương không
    ---
    Args:
        value: Giá trị cần kiểm tra
        field_name (str, optional): Tên trường để hiển thị trong thông báo lỗi
        include_zero (bool): Có bao gồm số 0 hay không
    
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        num_value = float(value)
        if include_zero:
            if num_value >= 0:
                return True, None
            operator = ">="
        else:
            if num_value > 0:
                return True, None
            operator = ">"
            
        field_text = f"{field_name} " if field_name else "Giá trị "
        return False, f"{field_text}phải {operator} 0."
    except (ValueError, TypeError):
        field_text = f"{field_name} " if field_name else ""
        return False, f"{field_text}phải là số."


def validate_rating(rating):
    """
    Kiểm tra xếp hạng có nằm trong phạm vi hợp lệ không (1-5)
    ---
    Args:
        rating: Giá trị xếp hạng cần kiểm tra
    
    Returns:
        tuple: (is_valid, error_message)
    """
    try:
        rating_value = int(rating)
        if 1 <= rating_value <= 5:
            return True, None
        return False, "Xếp hạng phải từ 1 đến 5 sao."
    except (ValueError, TypeError):
        return False, "Xếp hạng phải là số nguyên."


def validate_promotion_dates(start_date, end_date):
    """
    Kiểm tra ngày bắt đầu và kết thúc khuyến mãi có hợp lệ không
    ---
    Args:
        start_date (str or date): Ngày bắt đầu
        end_date (str or date): Ngày kết thúc
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Chuyển đổi chuỗi ngày thành đối tượng date nếu cần
    if isinstance(start_date, str):
        try:
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        except ValueError:
            return False, "Định dạng ngày bắt đầu không hợp lệ. Sử dụng định dạng YYYY-MM-DD."
    
    if isinstance(end_date, str):
        try:
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return False, "Định dạng ngày kết thúc không hợp lệ. Sử dụng định dạng YYYY-MM-DD."
    
    # Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    if end_date < start_date:
        return False, "Ngày kết thúc phải sau ngày bắt đầu."
    
    return True, None


def validate_time_range(start_time, end_time):
    """
    Kiểm tra khoảng thời gian có hợp lệ không
    ---
    Args:
        start_time (str or time): Thời gian bắt đầu
        end_time (str or time): Thời gian kết thúc
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Chuyển đổi chuỗi thời gian thành đối tượng time nếu cần
    if isinstance(start_time, str):
        try:
            start_time = datetime.strptime(start_time, "%H:%M").time()
        except ValueError:
            return False, "Định dạng thời gian bắt đầu không hợp lệ. Sử dụng định dạng HH:MM."
    
    if isinstance(end_time, str):
        try:
            end_time = datetime.strptime(end_time, "%H:%M").time()
        except ValueError:
            return False, "Định dạng thời gian kết thúc không hợp lệ. Sử dụng định dạng HH:MM."
    
    # Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
    if end_time <= start_time:
        return False, "Thời gian kết thúc phải sau thời gian bắt đầu."
    
    return True, None
