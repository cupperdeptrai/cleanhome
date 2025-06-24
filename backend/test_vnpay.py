"""
Script test VNPay integration
Chạy script này để test các chức năng VNPay
"""

import sys
import os

# Thêm đường dẫn backend vào sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.vnpay import VNPayConfig
from flask import Flask

def test_vnpay_config():
    """Test VNPay configuration"""
    
    app = Flask(__name__)
    app.config['VNPAY_TMN_CODE'] = 'DEMOMCP0'
    app.config['VNPAY_HASH_SECRET'] = 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ'
    
    with app.app_context():
        vnpay = VNPayConfig()
        
        print("=== VNPay Configuration Test ===")
        print(f"Payment URL: {vnpay.vnp_payment_url}")
        print(f"Return URL: {vnpay.vnp_return_url}")
        print(f"TMN Code: {vnpay.vnp_tmncode}")
        print(f"Hash Secret: {vnpay.vnp_hashsecret[:10]}...")
        
        # Test tạo payment URL
        test_order_id = "test_order_123"
        test_amount = 100000  # 100,000 VND
        test_desc = "Test payment CleanHome"
        
        payment_url = vnpay.get_payment_url(
            order_id=test_order_id,
            amount=test_amount,
            order_desc=test_desc
        )
        
        print(f"\n=== Test Payment URL ===")
        print(f"Order ID: {test_order_id}")
        print(f"Amount: {test_amount:,} VND")
        print(f"Description: {test_desc}")
        print(f"Payment URL: {payment_url}")
        
        # Test validate response
        print(f"\n=== Test Response Validation ===")
        
        # Giả lập response từ VNPay (success)
        test_response = {
            'vnp_Amount': '10000000',  # 100,000 * 100
            'vnp_BankCode': 'NCB',
            'vnp_BankTranNo': 'VNP14123456',
            'vnp_CardType': 'ATM',
            'vnp_OrderInfo': 'Test payment CleanHome',
            'vnp_PayDate': '20250624100000',
            'vnp_ResponseCode': '00',
            'vnp_TmnCode': 'DEMOMCP0',
            'vnp_TransactionNo': '14123456',
            'vnp_TransactionStatus': '00',
            'vnp_TxnRef': test_order_id,
            'vnp_SecureHashType': 'SHA512'
        }
        
        # Tạo hash cho test response
        import urllib.parse
        sorted_params = sorted(test_response.items())
        query_string = '&'.join([f"{key}={urllib.parse.quote_plus(str(value))}" for key, value in sorted_params])
        secure_hash = vnpay._create_secure_hash(query_string)
        
        test_response['vnp_SecureHash'] = secure_hash
        
        is_valid = vnpay.validate_response(test_response.copy())
        print(f"Response validation: {'✅ VALID' if is_valid else '❌ INVALID'}")
        
        return True

def test_bank_codes():
    """Test các mã ngân hàng VNPay hỗ trợ"""
    
    bank_codes = {
        'VIETCOMBANK': 'Ngân hàng TMCP Ngoại Thương Việt Nam',
        'VIETINBANK': 'Ngân hàng TMCP Công Thương Việt Nam', 
        'BIDV': 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
        'AGRIBANK': 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam',
        'OCB': 'Ngân hàng TMCP Phương Đông',
        'MB': 'Ngân hàng TMCP Quân đội',
        'TECHCOMBANK': 'Ngân hàng TMCP Kỹ thương Việt Nam',
        'ACB': 'Ngân hàng TMCP Á Châu',
        'VPBANK': 'Ngân hàng TMCP Việt Nam Thịnh vượng',
        'TPB': 'Ngân hàng TMCP Tiên Phong',
        'SACOMBANK': 'Ngân hàng TMCP Sài Gòn Thương Tín',
        'HDBANK': 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh',
        'VIETCAPITALBANK': 'Ngân hàng TMCP Bản Việt',
        'SCB': 'Ngân hàng TMCP Sài Gòn',
        'VIB': 'Ngân hàng TMCP Quốc tế Việt Nam',
        'SHB': 'Ngân hàng TMCP Sài Gòn - Hà Nội',
        'EXIMBANK': 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam',
        'MSBANK': 'Ngân hàng TMCP Hàng Hải',
        'NAMABANK': 'Ngân hàng TMCP Nam Á',
        'VNMART': 'Ví điện tử VnMart',
        'VIETQR': 'Cổng quét mã VietQR',
        'VISA': 'Thẻ quốc tế Visa',
        'MASTERCARD': 'Thẻ quốc tế MasterCard',
        'JCB': 'Thẻ quốc tế JCB'
    }
    
    print("\n=== Các ngân hàng VNPay hỗ trợ ===")
    for code, name in bank_codes.items():
        print(f"{code:15} - {name}")

if __name__ == "__main__":
    print("🚀 Testing VNPay Integration for CleanHome")
    print("=" * 50)
    
    try:
        test_vnpay_config()
        test_bank_codes()
        
        print("\n" + "=" * 50)
        print("✅ VNPay integration test completed successfully!")
        print("\n📝 Next steps:")
        print("1. Cập nhật database với migration: flask db upgrade")
        print("2. Restart backend server")
        print("3. Test API endpoints với Postman hoặc frontend")
        print("4. Cấu hình VNPay credentials thật trong production")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
