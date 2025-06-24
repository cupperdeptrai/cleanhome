"""Utility functions for validation"""

import re
import uuid
from typing import Any, Optional


def validate_uuid(uuid_string: str) -> bool:
    """
    Validate if a string is a valid UUID
    
    Args:
        uuid_string: String to validate
        
    Returns:
        bool: True if valid UUID, False otherwise
    """
    try:
        uuid.UUID(uuid_string)
        return True
    except (ValueError, TypeError):
        return False


def validate_phone_number(phone: str) -> bool:
    """
    Validate Vietnamese phone number format
    
    Args:
        phone: Phone number string
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not phone:
        return False
    
    # Remove spaces and special characters
    clean_phone = re.sub(r'[\s\-\(\)\+]', '', phone)
    
    # Vietnamese phone number patterns
    patterns = [
        r'^(84|0)[3-9]\d{8}$',  # Vietnamese mobile
        r'^(84|0)2\d{8}$',      # Vietnamese landline
    ]
    
    return any(re.match(pattern, clean_phone) for pattern in patterns)


def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email string
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password_strength(password: str) -> tuple[bool, list[str]]:
    """
    Validate password strength
    
    Args:
        password: Password string
        
    Returns:
        tuple: (is_valid, list_of_errors)
    """
    errors = []
    
    if len(password) < 6:
        errors.append("Password must be at least 6 characters long")
    
    if len(password) > 128:
        errors.append("Password must be no more than 128 characters long")
    
    if not re.search(r'[A-Za-z]', password):
        errors.append("Password must contain at least one letter")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number")
    
    # Check for common weak passwords
    weak_passwords = [
        '123456', 'password', '123456789', '12345678', '12345',
        '1234567', '1234567890', 'qwerty', 'abc123', 'password123'
    ]
    
    if password.lower() in weak_passwords:
        errors.append("Password is too common")
    
    return len(errors) == 0, errors


def validate_password(password: str) -> dict:
    """
    Validate password and return detailed result
    
    Args:
        password: Password string
        
    Returns:
        dict: {
            'valid': bool,
            'errors': list,
            'strength': str
        }
    """
    if not password:
        return {
            'valid': False,
            'errors': ['Password is required'],
            'strength': 'weak'
        }
    
    is_valid, errors = validate_password_strength(password)
    
    # Determine password strength
    strength_score = 0
    
    if len(password) >= 8:
        strength_score += 1
    if re.search(r'[a-z]', password):
        strength_score += 1
    if re.search(r'[A-Z]', password):
        strength_score += 1
    if re.search(r'\d', password):
        strength_score += 1
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        strength_score += 1
    
    if strength_score >= 4:
        strength = 'strong'
    elif strength_score >= 3:
        strength = 'medium'
    else:
        strength = 'weak'
    
    return {
        'valid': is_valid,
        'errors': errors,
        'strength': strength
    }


def sanitize_string(value: Any, max_length: Optional[int] = None) -> str:
    """
    Sanitize string input
    
    Args:
        value: Input value
        max_length: Maximum allowed length
        
    Returns:
        str: Sanitized string
    """
    if value is None:
        return ""
    
    # Convert to string and strip whitespace
    sanitized = str(value).strip()
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\']', '', sanitized)
    
    # Truncate if necessary
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized


def validate_coordinate(lat: Optional[float], lng: Optional[float]) -> bool:
    """
    Validate latitude and longitude coordinates
    
    Args:
        lat: Latitude
        lng: Longitude
        
    Returns:
        bool: True if valid coordinates, False otherwise
    """
    if lat is None and lng is None:
        return True  # Both None is acceptable
    
    if lat is None or lng is None:
        return False  # One None and one not None is invalid
    
    # Check latitude range
    if not (-90 <= lat <= 90):
        return False
    
    # Check longitude range
    if not (-180 <= lng <= 180):
        return False
    
    return True


def validate_vietnamese_address_components(district: str, city: str) -> bool:
    """
    Validate Vietnamese address components
    
    Args:
        district: District name
        city: City name
        
    Returns:
        bool: True if valid, False otherwise
    """
    # Vietnamese cities
    valid_cities = [
        'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
        'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
        'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
        'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
        'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
        'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
        'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
        'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
        'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
        'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
        'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
        'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
        'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
    ]
    
    # For now, just check if they are non-empty strings
    # In production, you might want to validate against actual district/city data
    return bool(district and district.strip()) and bool(city and city.strip())


def validate_postal_code(postal_code: Optional[str]) -> bool:
    """
    Validate Vietnamese postal code
    
    Args:
        postal_code: Postal code string
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not postal_code:
        return True  # Postal code is optional
    
    # Vietnamese postal codes are 6 digits
    pattern = r'^\d{6}$'
    return re.match(pattern, postal_code) is not None


def validate_service_data(data: dict) -> tuple[bool, str]:
    """
    Validate service data
    
    Args:
        data: Service data dictionary
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check required fields
    required_fields = ['name', 'description', 'price', 'category']
    for field in required_fields:
        if not data.get(field):
            return False, f'{field} is required'
    
    # Validate name
    name = data.get('name', '').strip()
    if len(name) < 3:
        return False, 'Service name must be at least 3 characters'
    if len(name) > 100:
        return False, 'Service name must be less than 100 characters'
    
    # Validate description
    description = data.get('description', '').strip()
    if len(description) < 10:
        return False, 'Service description must be at least 10 characters'
    if len(description) > 1000:
        return False, 'Service description must be less than 1000 characters'
    
    # Validate price
    try:
        price = float(data.get('price', 0))
        if price < 0:
            return False, 'Service price must be non-negative'
        if price > 10000000:  # 10 million VND max
            return False, 'Service price is too high'
    except (ValueError, TypeError):
        return False, 'Invalid price format'
    
    # Validate category
    category = data.get('category', '').strip()
    if len(category) < 2:
        return False, 'Service category must be at least 2 characters'
    
    # Validate duration if provided
    duration = data.get('duration')
    if duration is not None:
        try:
            duration_int = int(duration)
            if duration_int < 0:
                return False, 'Service duration must be non-negative'
            if duration_int > 1440:  # 24 hours max
                return False, 'Service duration cannot exceed 24 hours'
        except (ValueError, TypeError):
            return False, 'Invalid duration format'
    
    return True, ''

