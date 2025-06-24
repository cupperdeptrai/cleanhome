"""
VNPay Configuration và Utilities
Tích hợp VNPay cho hệ thống thanh toán CleanHome
Author: CleanHome Team
"""

import hashlib
import hmac
import urllib.parse
import urllib.request
import uuid
from datetime import datetime
from flask import current_app


class VNPayConfig:
    """Cấu hình VNPay từ environment variables"""
    
    def __init__(self):
        # VNPay URLs
        self.vnp_payment_url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"  # Sandbox
        # self.vnp_payment_url = "https://vnpayment.vn/paymentv2/vpcpay.html"  # Production
        
        self.vnp_api_url = "http://sandbox.vnpayment.vn/merchant_webapi/merchant.html"  # Sandbox  
        # self.vnp_api_url = "https://vnpayment.vn/merchant_webapi/merchant.html"  # Production
        
        self.vnp_return_url = "http://localhost:5173/payment/return"  # Frontend URL
        self.vnp_notify_url = "http://localhost:5000/api/payments/vnpay/notify"  # Backend URL
        
        # VNPay credentials - Đây là sandbox credentials
        # Production sẽ lấy từ environment variables
        self.vnp_tmncode = current_app.config.get('VNPAY_TMN_CODE', 'DEMOMCP0')  # Merchant Code
        self.vnp_hashsecret = current_app.config.get('VNPAY_HASH_SECRET', 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ')  # Hash Secret
        
        self.vnp_version = "2.1.0"
        
    def get_payment_url(self, order_id, amount, order_desc, bank_code=None, user_ip="127.0.0.1"):
        """
        Tạo URL thanh toán VNPay
        
        Args:
            order_id (str): Mã đơn hàng
            amount (int): Số tiền (VND)
            order_desc (str): Mô tả đơn hàng
            bank_code (str, optional): Mã ngân hàng
            user_ip (str): IP của user
            
        Returns:
            str: URL thanh toán VNPay
        """
        
        # Tạo request data
        vnp_params = {
            'vnp_Version': self.vnp_version,
            'vnp_Command': 'pay',
            'vnp_TmnCode': self.vnp_tmncode,
            'vnp_Amount': str(amount * 100),  # VNPay yêu cầu amount * 100
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': order_id,
            'vnp_OrderInfo': order_desc,
            'vnp_OrderType': 'other',
            'vnp_ReturnUrl': self.vnp_return_url,
            'vnp_IpAddr': user_ip,
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
            'vnp_Locale': 'vn'
        }
        
        # Thêm bank code nếu có
        if bank_code:
            vnp_params['vnp_BankCode'] = bank_code
            
        # Sắp xếp parameters theo alphabet
        sorted_params = sorted(vnp_params.items())
        
        # Tạo query string
        query_string = '&'.join([f"{key}={urllib.parse.quote_plus(str(value))}" for key, value in sorted_params])
        
        # Tạo secure hash
        secure_hash = self._create_secure_hash(query_string)
        
        # Tạo URL cuối cùng
        payment_url = f"{self.vnp_payment_url}?{query_string}&vnp_SecureHash={secure_hash}"
        
        return payment_url
    
    def validate_response(self, vnp_params):
        """
        Validate phản hồi từ VNPay
        
        Args:
            vnp_params (dict): Parameters từ VNPay
            
        Returns:
            bool: True nếu hợp lệ, False nếu không
        """
        
        # Lấy secure hash từ response
        vnp_secure_hash = vnp_params.pop('vnp_SecureHash', None)
        
        if not vnp_secure_hash:
            return False
            
        # Sắp xếp parameters
        sorted_params = sorted(vnp_params.items())
        
        # Tạo query string
        query_string = '&'.join([f"{key}={urllib.parse.quote_plus(str(value))}" for key, value in sorted_params])
        
        # Tạo secure hash để so sánh
        expected_hash = self._create_secure_hash(query_string)
        
        return vnp_secure_hash.upper() == expected_hash.upper()
    
    def _create_secure_hash(self, query_string):
        """
        Tạo secure hash cho VNPay
        
        Args:
            query_string (str): Query string
            
        Returns:
            str: Secure hash
        """
        return hmac.new(
            self.vnp_hashsecret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha512
        ).hexdigest().upper()


# VNPay response codes
VNPAY_RESPONSE_CODES = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
}


def get_client_ip(request):
    """Lấy IP thật của client"""
    if request.environ.get('HTTP_X_FORWARDED_FOR'):
        return request.environ['HTTP_X_FORWARDED_FOR'].split(',')[0]
    elif request.environ.get('HTTP_X_REAL_IP'):
        return request.environ['HTTP_X_REAL_IP']
    else:
        return request.environ.get('REMOTE_ADDR', '127.0.0.1')
