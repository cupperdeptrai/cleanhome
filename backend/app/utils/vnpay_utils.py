"""
Utility functions cho xử lý kết quả thanh toán VNPAY
Mapping các response code để hiển thị thông báo phù hợp
"""

def get_vnpay_response_message(response_code, transaction_status=None):
    """
    Lấy thông báo tiếng Việt tương ứng với mã response của VNPAY
    
    Args:
        response_code (str): Mã response từ VNPAY
        transaction_status (str): Trạng thái giao dịch từ VNPAY
    
    Returns:
        tuple: (success: bool, message: str, error_type: str)
    """
    
    # Mapping các response code của VNPAY theo tài liệu API
    response_codes = {
        # Thành công
        '00': {
            'success': True,
            'message': 'Giao dịch thành công',
            'error_type': 'success'
        },
        
        # Các lỗi về thẻ/tài khoản
        '05': {
            'success': False,
            'message': 'Thẻ/Tài khoản của khách hàng không đủ số dư để thực hiện giao dịch',
            'error_type': 'insufficient_funds'
        },
        '06': {
            'success': False,
            'message': 'Thẻ/Tài khoản của khách hàng bị khóa hoặc chưa được kích hoạt dịch vụ giao dịch trực tuyến',
            'error_type': 'card_blocked'
        },
        '07': {
            'success': False,
            'message': 'Thẻ/Tài khoản của khách hàng đã bị tạm khóa',
            'error_type': 'card_suspended'
        },
        '09': {
            'success': False,
            'message': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
            'error_type': 'not_registered'
        },
        '10': {
            'success': False,
            'message': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            'error_type': 'authentication_failed'
        },
        '11': {
            'success': False,
            'message': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
            'error_type': 'timeout'
        },
        '12': {
            'success': False,
            'message': 'Thẻ/Tài khoản của khách hàng bị khóa',
            'error_type': 'card_locked'
        },
        '13': {
            'success': False,
            'message': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch',
            'error_type': 'wrong_otp'
        },
        '24': {
            'success': False,
            'message': 'Khách hàng hủy giao dịch',
            'error_type': 'user_cancelled'
        },
        '51': {
            'success': False,
            'message': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
            'error_type': 'insufficient_balance'
        },
        '65': {
            'success': False,
            'message': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
            'error_type': 'daily_limit_exceeded'
        },
        '75': {
            'success': False,
            'message': 'Ngân hàng thanh toán đang bảo trì',
            'error_type': 'bank_maintenance'
        },
        '79': {
            'success': False,
            'message': 'KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
            'error_type': 'password_attempts_exceeded'
        },
        
        # Các lỗi hệ thống
        '99': {
            'success': False,
            'message': 'Các lỗi khác (lỗi hệ thống)',
            'error_type': 'system_error'
        },
        
        # Lỗi default
        'default': {
            'success': False,
            'message': 'Giao dịch không thành công. Vui lòng thử lại sau',
            'error_type': 'unknown_error'
        }
    }
    
    # Lấy thông tin tương ứng với response code
    if response_code in response_codes:
        result = response_codes[response_code]
    else:
        result = response_codes['default']
    
    return result['success'], result['message'], result['error_type']

def classify_vnpay_error_for_test_cards(response_code):
    """
    Phân loại lỗi VNPAY để mapping với các thẻ test
    
    Mapping dựa trên tài liệu VNPAY test cards:
    - Thẻ mã 1 (9704198526191432198): Thành công -> Response Code 00
    - Thẻ mã 2 (9704195798459170488): Không đủ số dư -> Response Code 05/51  
    - Thẻ mã 3 (9704192181368742): Chưa kích hoạt -> Response Code 06/09
    - Thẻ mã 4 (9704193370791314): Thẻ bị khóa -> Response Code 07/12
    - Thẻ mã 5 (9704194841945513): Thẻ hết hạn -> Response Code 11
    
    Args:
        response_code (str): Mã response từ VNPAY
    
    Returns:
        str: Loại thẻ test tương ứng
    """
    
    # Mapping response code với các thẻ test của VNPAY theo tài liệu chính thức
    test_card_mapping = {
        '00': 'success_card',           # Thẻ mã 1 - Thành công (9704198526191432198)
        '05': 'insufficient_funds',     # Thẻ mã 2 - Không đủ số dư (9704195798459170488)
        '51': 'insufficient_funds',     # Thẻ mã 2 - Không đủ số dư (mã tương đương)
        '06': 'not_activated',          # Thẻ mã 3 - Chưa kích hoạt (9704192181368742)
        '09': 'not_activated',          # Thẻ mã 3 - Chưa kích hoạt (mã tương đương)
        '07': 'card_blocked',           # Thẻ mã 4 - Thẻ bị khóa (9704193370791314)
        '12': 'card_blocked',           # Thẻ mã 4 - Thẻ bị khóa (mã tương đương)
        '11': 'expired_card',           # Thẻ mã 5 - Thẻ hết hạn (9704194841945513)
        '24': 'user_cancelled',         # Người dùng hủy giao dịch
        '13': 'wrong_otp',              # Sai OTP (123456 là OTP test đúng)
        '10': 'authentication_failed',  # Xác thực thất bại quá 3 lần
        '79': 'password_attempts_exceeded', # Nhập sai mật khẩu quá số lần quy định
        '65': 'daily_limit_exceeded',   # Vượt quá hạn mức giao dịch trong ngày
        '75': 'bank_maintenance',       # Ngân hàng đang bảo trì
        '99': 'system_error'            # Lỗi hệ thống
    }
    
    return test_card_mapping.get(response_code, 'unknown_error')

def get_user_friendly_message(response_code, card_type=None):
    """
    Lấy thông báo thân thiện với người dùng dựa trên response code
    
    Args:
        response_code (str): Mã response từ VNPAY
        card_type (str): Loại thẻ test (optional)
    
    Returns:
        dict: Thông tin để hiển thị cho người dùng
    """
    
    success, message, error_type = get_vnpay_response_message(response_code)
    card_classification = classify_vnpay_error_for_test_cards(response_code)
    
    # Thông báo cụ thể cho từng loại lỗi
    user_messages = {
        'success_card': {
            'title': '✅ Thanh toán thành công',
            'message': 'Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận.',
            'action': 'Xem đơn hàng',
            'color': 'green'
        },
        'insufficient_funds': {
            'title': '💳 Thẻ không đủ số dư',
            'message': 'Tài khoản của bạn không đủ số dư để thực hiện giao dịch này. Vui lòng kiểm tra số dư hoặc sử dụng thẻ khác.',
            'action': 'Thử lại',
            'color': 'red'
        },
        'not_activated': {
            'title': '🔒 Thẻ chưa kích hoạt',
            'message': 'Thẻ/tài khoản của bạn chưa được kích hoạt dịch vụ thanh toán trực tuyến. Vui lòng liên hệ ngân hàng để kích hoạt.',
            'action': 'Liên hệ ngân hàng',
            'color': 'orange'
        },
        'card_blocked': {
            'title': '🚫 Thẻ bị khóa',
            'message': 'Thẻ/tài khoản của bạn đã bị khóa. Vui lòng liên hệ ngân hàng để được hỗ trợ.',
            'action': 'Liên hệ ngân hàng',
            'color': 'red'
        },
        'expired_card': {
            'title': '⏰ Thẻ hết hạn',
            'message': 'Thẻ của bạn đã hết hạn hoặc phiên giao dịch đã hết thời gian. Vui lòng sử dụng thẻ khác.',
            'action': 'Thử lại',
            'color': 'gray'
        },
        'wrong_otp': {
            'title': '🔢 Sai mã OTP',
            'message': 'Bạn đã nhập sai mã OTP. Vui lòng thực hiện lại giao dịch và nhập đúng mã OTP.',
            'action': 'Thử lại',
            'color': 'orange'
        },
        'user_cancelled': {
            'title': '❌ Đã hủy giao dịch',
            'message': 'Bạn đã hủy giao dịch thanh toán. Đơn hàng vẫn được giữ, bạn có thể thanh toán lại.',
            'action': 'Thanh toán lại',
            'color': 'blue'
        },
        'system_error': {
            'title': '⚠️ Lỗi hệ thống',
            'message': 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
            'action': 'Thử lại',
            'color': 'red'
        },
        'unknown_error': {
            'title': '❓ Lỗi không xác định',
            'message': 'Giao dịch không thành công. Vui lòng thử lại sau.',
            'action': 'Thử lại',
            'color': 'gray'
        }
    }
    
    result = user_messages.get(card_classification, user_messages['unknown_error'])
    result['response_code'] = response_code
    result['error_type'] = error_type
    result['success'] = success
    
    return result
