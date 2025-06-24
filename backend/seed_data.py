"""Seed database with sample data for testing"""

import os
import sys
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from app.models.service import Service
from app.models.booking import Booking

def seed_users():
    """Create sample users"""
    print("Creating sample users...")
    
    # Admin user
    admin = User.query.filter_by(email='admin@cleanhome.com').first()
    if not admin:        admin = User(
            name='Admin User',
            email='admin@cleanhome.com',
            password=generate_password_hash('admin123'),
            phone='0123456789',
            role='admin',
            status='active',
            email_verified_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(admin)
        print("✓ Admin user created")
    
    # Staff users
    staff_data = [
        {
            'name': 'Nguyễn Văn A',
            'email': 'staff1@cleanhome.com',
            'phone': '0987654321'
        },
        {
            'name': 'Trần Thị B',
            'email': 'staff2@cleanhome.com',
            'phone': '0987654322'
        },
        {
            'name': 'Lê Văn C',
            'email': 'staff3@cleanhome.com',
            'phone': '0987654323'
        }
    ]
    
    for staff_info in staff_data:
        staff = User.query.filter_by(email=staff_info['email']).first()
        if not staff:            staff = User(
                name=staff_info['name'],
                email=staff_info['email'],
                password=generate_password_hash('staff123'),
                phone=staff_info['phone'],
                role='staff',
                status='active',
                email_verified_at=datetime.utcnow(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.session.add(staff)
            print(f"✓ Staff user {staff_info['name']} created")
    
    # Customer users
    customer_data = [
        {
            'name': 'Khách hàng 1',
            'email': 'customer1@example.com',
            'phone': '0123456781'
        },
        {
            'name': 'Khách hàng 2',
            'email': 'customer2@example.com',
            'phone': '0123456782'
        },
        {
            'name': 'Khách hàng 3',
            'email': 'customer3@example.com',
            'phone': '0123456783'
        }
    ]
    
    for customer_info in customer_data:
        customer = User.query.filter_by(email=customer_info['email']).first()
        if not customer:            customer = User(
                name=customer_info['name'],
                email=customer_info['email'],
                password=generate_password_hash('customer123'),
                phone=customer_info['phone'],
                role='customer',
                status='active',
                email_verified_at=datetime.utcnow(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.session.add(customer)
            print(f"✓ Customer {customer_info['name']} created")

def seed_services():
    """Create sample services"""
    print("Creating sample services...")
    
    services_data = [
        {
            'name': 'Dọn dẹp nhà cửa cơ bản',
            'description': 'Dịch vụ dọn dẹp nhà cửa cơ bản bao gồm quét, lau nhà, dọn dẹp phòng khách, phòng ngủ',
            'price': 200000,
            'category': 'Nhà cửa',
            'duration': 120,
            'is_active': True
        },
        {
            'name': 'Dọn dẹp nhà cửa cao cấp',
            'description': 'Dịch vụ dọn dẹp nhà cửa cao cấp với đầy đủ thiết bị chuyên nghiệp',
            'price': 350000,
            'category': 'Nhà cửa',
            'duration': 180,
            'is_active': True
        },
        {
            'name': 'Vệ sinh văn phòng',
            'description': 'Dịch vụ vệ sinh văn phòng, lau dọn bàn ghế, sàn nhà, cửa sổ',
            'price': 300000,
            'category': 'Văn phòng',
            'duration': 150,
            'is_active': True
        },
        {
            'name': 'Dọn dẹp sau xây dựng',
            'description': 'Dịch vụ dọn dẹp sau xây dựng, sửa chữa nhà cửa',
            'price': 500000,
            'category': 'Đặc biệt',
            'duration': 240,
            'is_active': True
        },
        {
            'name': 'Vệ sinh máy lạnh',
            'description': 'Dịch vụ vệ sinh, bảo dưỡng máy lạnh chuyên nghiệp',
            'price': 150000,
            'category': 'Thiết bị',
            'duration': 90,
            'is_active': True
        }
    ]
    
    for service_info in services_data:
        service = Service.query.filter_by(name=service_info['name']).first()
        if not service:
            service = Service(
                name=service_info['name'],
                description=service_info['description'],
                price=service_info['price'],
                category=service_info['category'],
                duration=service_info['duration'],
                is_active=service_info['is_active'],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.session.add(service)
            print(f"✓ Service '{service_info['name']}' created")

def seed_bookings():
    """Create sample bookings"""
    print("Creating sample bookings...")
    
    # Get users and services
    customers = User.query.filter_by(role='customer').all()
    staff_users = User.query.filter_by(role='staff').all()
    services = Service.query.all()
    
    if not customers or not services:
        print("❌ No customers or services found. Please run seed_users and seed_services first.")
        return
    
    # Create sample bookings
    booking_data = [
        {
            'status': 'completed',
            'payment_status': 'paid',
            'days_ago': 7
        },
        {
            'status': 'completed',
            'payment_status': 'paid',
            'days_ago': 5
        },
        {
            'status': 'in_progress',
            'payment_status': 'paid',
            'days_ago': 1
        },
        {
            'status': 'confirmed',
            'payment_status': 'paid',
            'days_ago': 0
        },
        {
            'status': 'pending',
            'payment_status': 'unpaid',
            'days_ago': 0
        }
    ]
    
    for i, booking_info in enumerate(booking_data):
        customer = customers[i % len(customers)]
        service = services[i % len(services)]
        staff = staff_users[i % len(staff_users)] if staff_users and booking_info['status'] != 'pending' else None
        
        booking_date = datetime.now() + timedelta(days=-booking_info['days_ago'] if booking_info['days_ago'] > 0 else 1)
        
        booking = Booking(
            user_id=customer.id,
            service_id=service.id,
            staff_id=staff.id if staff else None,
            booking_code=f"BK{datetime.now().strftime('%Y%m%d')}{i+1:03d}",
            booking_date=booking_date.date(),
            booking_time=booking_date.time(),
            customer_address=f"Địa chỉ số {i+1}, Quận 1, TP.HCM",
            subtotal=service.price,
            total_price=service.price,
            status=booking_info['status'],
            payment_status=booking_info['payment_status'],
            payment_method='cash' if booking_info['payment_status'] == 'paid' else None,
            notes=f"Ghi chú cho booking {i+1}",
            created_at=datetime.utcnow() - timedelta(days=booking_info['days_ago']),
            updated_at=datetime.utcnow()
        )
        
        db.session.add(booking)
        print(f"✓ Booking {booking.booking_code} created")

def main():
    """Main function to seed all data"""
    app = create_app()
    
    with app.app_context():
        print("🌱 Starting database seeding...")
        
        try:
            # Create tables if they don't exist
            db.create_all()
            print("✓ Database tables created/verified")
            
            # Seed data
            seed_users()
            seed_services()
            db.session.commit()
            print("✓ Users and services committed to database")
            
            seed_bookings()
            db.session.commit()
            print("✓ Bookings committed to database")
            
            print("🎉 Database seeding completed successfully!")
            
            # Print summary
            print("\n📊 Summary:")
            print(f"   Users: {User.query.count()}")
            print(f"   - Admins: {User.query.filter_by(role='admin').count()}")
            print(f"   - Staff: {User.query.filter_by(role='staff').count()}")
            print(f"   - Customers: {User.query.filter_by(role='customer').count()}")
            print(f"   Services: {Service.query.count()}")
            print(f"   Bookings: {Booking.query.count()}")
            
            print("\n🔑 Test accounts:")
            print("   Admin: admin@cleanhome.com / admin123")
            print("   Staff: staff1@cleanhome.com / staff123")
            print("   Customer: customer1@example.com / customer123")
            
        except Exception as e:
            print(f"❌ Error during seeding: {e}")
            db.session.rollback()

if __name__ == '__main__':
    main()
