"""
Script để test VNPay integration trực tiếp
"""

from datetime import datetime, date, time
from app import create_app
from app.models.booking import Booking
from app.models.service import Service
from app.models.user import User
from app.extensions import db
from app.api.vnpay import generate_vnpay_payment_url
from flask import request

def test_vnpay_integration():
    """Test VNPay integration bằng cách tạo booking và URL thanh toán"""
    app = create_app()
    
    with app.app_context():
        # Mock request context
        with app.test_request_context('http://localhost:5000/test'):
            try:
                # Lấy user và service để test
                user = User.query.filter_by(email='test@example.com').first()
                service = Service.query.first()
                
                if not user or not service:
                    print("❌ Không tìm thấy user hoặc service để test")
                    return
                
                print(f"👤 User: {user.name} ({user.id})")
                print(f"🛠️ Service: {service.name} - {service.price} VND")
                
                # Tạo booking test
                test_booking = Booking(
                    user_id=user.id,
                    booking_date=date.today(),
                    booking_time=time(14, 0),  # 2:00 PM
                    customer_address="123 Test Street, Ho Chi Minh City",
                    area=50.0,
                    notes="Test booking for VNPay integration",
                    subtotal=service.price,
                    discount=0,
                    tax=0,
                    total_price=service.price,
                    payment_method='vnpay',
                    payment_status='pending',
                    status='pending'
                )
                
                db.session.add(test_booking)
                db.session.flush()  # Get ID for booking
                
                print(f"📝 Created booking: {test_booking.booking_code}")
                print(f"💰 Total amount: {test_booking.total_price} VND")
                
                # Test VNPay URL generation
                payment_url = generate_vnpay_payment_url(test_booking, request)
                
                if payment_url:
                    print(f"✅ VNPay URL generated successfully!")
                    print(f"🔗 Payment URL: {payment_url}")
                    
                    # Check if VnpayTransaction was created
                    from app.models.vnpay import VnpayTransaction
                    transaction = VnpayTransaction.query.filter_by(booking_id=test_booking.id).first()
                    if transaction:
                        print(f"💳 VnpayTransaction created: {transaction.vnp_txnref}")
                        print(f"💵 Amount: {transaction.vnp_amount} VND")
                    else:
                        print("⚠️ No VnpayTransaction found")
                    
                    db.session.commit()
                    print("🎉 Test completed successfully!")
                    return payment_url
                else:
                    print("❌ Failed to generate VNPay URL")
                    db.session.rollback()
                    
            except Exception as e:
                db.session.rollback()
                print(f"❌ Error during test: {str(e)}")
                import traceback
                traceback.print_exc()

if __name__ == "__main__":
    test_vnpay_integration()
