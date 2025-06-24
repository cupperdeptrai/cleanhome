"""
Test script đơn giản để kiểm tra VNPay API
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_vnpay_api():
    """Test VNPay API endpoints"""
    
    print("🚀 Testing VNPay API Endpoints")
    print("=" * 50)
    
    # 1. Test health check
    try:
        response = requests.get(f"{BASE_URL}/api/payments/")
        print(f"📡 GET /api/payments/ - Status: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Expected 401 (authentication required)")
        else:
            print(f"   ⚠️  Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 2. Test VNPay create endpoint (without auth)
    try:
        test_data = {
            "booking_id": "test-booking-123",
            "bank_code": "NCB"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payments/vnpay/create",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 POST /api/payments/vnpay/create - Status: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Expected 401 (authentication required)")
        else:
            print(f"   ⚠️  Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 3. Test VNPay return endpoint
    try:
        # Giả lập query parameters từ VNPay
        params = {
            'vnp_Amount': '10000000',
            'vnp_BankCode': 'NCB',
            'vnp_OrderInfo': 'Test payment CleanHome',
            'vnp_ResponseCode': '00',
            'vnp_TmnCode': 'DEMOMCP0',
            'vnp_TxnRef': 'test-order-123',
            'vnp_TransactionNo': '14123456',
            'vnp_SecureHash': 'test-hash'
        }
        
        response = requests.get(f"{BASE_URL}/api/payments/vnpay/return", params=params)
        print(f"📡 GET /api/payments/vnpay/return - Status: {response.status_code}")
        print(f"   Response: {response.json() if response.headers.get('Content-Type', '').startswith('application/json') else response.text[:100]}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ VNPay API test completed!")
    print("\n📝 Notes:")
    print("- Endpoints yêu cầu JWT authentication sẽ trả về 401")
    print("- VNPay return endpoint có thể trả về validation error do test hash")
    print("- Backend server cần chạy trên http://localhost:5000")

if __name__ == "__main__":
    test_vnpay_api()
