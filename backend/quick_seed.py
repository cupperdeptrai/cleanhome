"""Quick seed script for testing"""

import os
import sys
from datetime import datetime
from werkzeug.security import generate_password_hash

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from app.models.service import Service
from app.models.booking import Booking

def main():
    """Seed basic data"""
    app = create_app()
    
    with app.app_context():
        print("Creating sample data...")
        
        try:
            # Create tables
            db.create_all()
            
            # Create admin user if not exists
            admin = User.query.filter_by(email='admin@cleanhome.com').first()
            if not admin:
                admin = User(
                    name='Admin User',
                    email='admin@cleanhome.com',
                    password=generate_password_hash('admin123'),
                    phone='0123456789',
                    role='admin',
                    status='active'
                )
                db.session.add(admin)
                print("✓ Admin user created")            # Create sample service
            service = Service.query.filter_by(name='Dọn dẹp nhà cửa').first()
            if not service:
                service = Service(
                    name='Dọn dẹp nhà cửa',
                    slug='don-dep-nha-cua',
                    description='Dịch vụ dọn dẹp nhà cửa cơ bản',
                    price=200000,
                    duration=120,
                    status='active'
                )
                db.session.add(service)
                print("✓ Sample service created")
            
            db.session.commit()
            print("✅ Data seeded successfully!")
            
            print("\n🔑 Test accounts:")
            print("   Admin: admin@cleanhome.com / admin123")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()

if __name__ == '__main__':
    main()
