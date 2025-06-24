"""Comprehensive seed data with service images"""

import os
import sys
from datetime import datetime
from werkzeug.security import generate_password_hash

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User
from app.models.service import Service, ServiceCategory
from app.models.booking import Booking

def create_service_categories():
    """Create service categories"""
    categories = [
        {
            'name': 'Vệ sinh nhà ở',
            'description': 'Dịch vụ vệ sinh và dọn dẹp nhà ở',
            'image': '/static/uploads/services/house-cleaning.jpg'
        },
        {
            'name': 'Vệ sinh văn phòng',
            'description': 'Dịch vụ vệ sinh văn phòng và không gian làm việc',
            'image': '/static/uploads/services/ve-sinh-van-phong-2.png'
        },
        {
            'name': 'Vệ sinh chuyên sâu',
            'description': 'Dịch vụ vệ sinh chuyên sâu và khử trùng',
            'image': '/static/uploads/services/veSinhKhuKhuan.png'
        }
    ]
    
    created_categories = {}
    for cat_data in categories:
        category = ServiceCategory.query.filter_by(name=cat_data['name']).first()
        if not category:
            category = ServiceCategory(**cat_data)
            db.session.add(category)
            print(f"✓ Category '{cat_data['name']}' created")
        created_categories[cat_data['name']] = category
    
    return created_categories

def create_services(categories):
    """Create comprehensive services with images"""
    services_data = [
        {
            'name': 'Dọn dẹp nhà cửa cơ bản',
            'slug': 'don-dep-nha-cua-co-ban',
            'short_description': 'Dịch vụ dọn dẹp nhà cửa hàng ngày',
            'description': 'Dịch vụ dọn dẹp nhà cửa cơ bản bao gồm quét, lau chùi, sắp xếp đồ đạc. Phù hợp cho việc duy trì vệ sinh hàng ngày.',
            'price': 200000,
            'duration': 120,
            'thumbnail': '/static/uploads/services/house-cleaning.jpg',
            'category': 'Vệ sinh nhà ở',
            'is_featured': True
        },
        {
            'name': 'Vệ sinh văn phòng',
            'slug': 've-sinh-van-phong',
            'short_description': 'Dịch vụ vệ sinh không gian làm việc',
            'description': 'Vệ sinh văn phòng chuyên nghiệp, bao gồm lau chùi bàn ghế, hút bụi thảm, lau kính cửa sổ. Đảm bảo môi trường làm việc sạch sẽ.',
            'price': 300000,
            'duration': 180,
            'thumbnail': '/static/uploads/services/ve-sinh-van-phong-2.png',
            'category': 'Vệ sinh văn phòng',
            'is_featured': True
        },        {
            'name': 'Vệ sinh thảm',
            'slug': 've-sinh-tham',
            'short_description': 'Giặt và vệ sinh thảm chuyên nghiệp',
            'description': 'Dịch vụ giặt thảm chuyên nghiệp với máy móc hiện đại, hóa chất an toàn. Loại bỏ vết bẩn cứng đầu và mùi hôi.',
            'price': 150000,
            'duration': 90,
            'thumbnail': '/static/uploads/services/veSinhTham.png',
            'category': 'Vệ sinh chuyên sâu'
        },{
            'name': 'Lau kính cửa sổ',
            'slug': 'lau-kinh-cua-so',
            'short_description': 'Dịch vụ lau kính cửa sổ sạch sẽ',
            'description': 'Lau kính cửa sổ chuyên nghiệp với dụng cụ hiện đại, đảm bảo kính trong suốt không có vết ố.',
            'price': 100000,
            'duration': 60,
            'thumbnail': '/static/uploads/services/veSinhKinh.png',
            'category': 'Vệ sinh nhà ở'
        },        {
            'name': 'Vệ sinh nhà bếp',
            'slug': 've-sinh-nha-bep',
            'short_description': 'Vệ sinh nhà bếp và thiết bị',
            'description': 'Vệ sinh nhà bếp toàn diện: tủ bếp, bếp gas, máy hút mùi, tủ lạnh. Loại bỏ dầu mỡ và vi khuẩn.',
            'price': 250000,
            'duration': 150,
            'thumbnail': '/static/uploads/services/veSinhNhaCua.png',
            'category': 'Vệ sinh nhà ở'
        },        {
            'name': 'Dọn dẹp sau xây dựng',
            'slug': 'don-dep-sau-xay-dung',
            'short_description': 'Dọn dẹp sau công trình xây dựng',
            'description': 'Dịch vụ dọn dẹp chuyên nghiệp sau thi công xây dựng, sửa chữa. Loại bỏ bụi bẩn và mảnh vụn.',
            'price': 500000,
            'duration': 240,
            'thumbnail': '/static/uploads/services/veSinhSauXayDung.png',
            'category': 'Vệ sinh chuyên sâu'
        },        {
            'name': 'Dọn dẹp cuối kỳ thuê',
            'slug': 'don-dep-cuoi-ky-thue',
            'short_description': 'Dọn dẹp trả nhà cuối kỳ thuê',
            'description': 'Dịch vụ dọn dẹp toàn diện khi chuyển nhà hoặc trả nhà thuê. Đảm bảo nhà sạch sẽ như mới.',
            'price': 400000,
            'duration': 200,
            'thumbnail': '/static/uploads/services/veSinhRemCua.png',
            'category': 'Vệ sinh chuyên sâu'
        },        {
            'name': 'Khử trùng diệt khuẩn',
            'slug': 'khu-trung-diet-khuan',
            'short_description': 'Dịch vụ khử trùng diệt khuẩn',
            'description': 'Dịch vụ phun khử trùng, diệt khuẩn với hóa chất an toàn. Bảo vệ sức khỏe gia đình.',
            'price': 300000,
            'duration': 120,
            'thumbnail': '/static/uploads/services/veSinhKhuKhuan.png',
            'category': 'Vệ sinh chuyên sâu',
            'is_featured': True
        },        {
            'name': 'Giặt ủi quần áo',
            'slug': 'giat-ui-quan-ao',
            'short_description': 'Dịch vụ giặt ủi quần áo',
            'description': 'Dịch vụ giặt ủi quần áo chuyên nghiệp với máy móc hiện đại. Quần áo sạch sẽ, thơm tho.',
            'price': 50000,
            'duration': 60,
            'thumbnail': '/static/uploads/services/veSinhvanPhong.png',
            'category': 'Vệ sinh nhà ở'
        },
        {
            'name': 'Vệ sinh hàng tuần',
            'slug': 've-sinh-hang-tuan',
            'short_description': 'Dịch vụ vệ sinh định kỳ hàng tuần',
            'description': 'Gói vệ sinh định kỳ hàng tuần, duy trì nhà cửa luôn sạch sẽ với giá ưu đãi.',
            'price': 180000,
            'duration': 100,
            'thumbnail': '/static/uploads/services/veSinhHangTuan.png',
            'category': 'Vệ sinh nhà ở',
            'is_featured': True
        },
        {
            'name': 'Vệ sinh hàng tháng',
            'slug': 've-sinh-hang-thang',
            'short_description': 'Dịch vụ vệ sinh định kỳ hàng tháng',
            'description': 'Gói vệ sinh tổng thể hàng tháng, làm sạch toàn bộ ngôi nhà một cách chi tiết.',
            'price': 350000,
            'duration': 200,
            'thumbnail': '/static/uploads/services/veSinhHangThang.png',
            'category': 'Vệ sinh nhà ở'
        },
        {
            'name': 'Vệ sinh sofa',
            'slug': 've-sinh-sofa',
            'short_description': 'Giặt vệ sinh sofa và nệm',
            'description': 'Dịch vụ vệ sinh sofa, ghế da, nệm với công nghệ hơi nước và hóa chất chuyên dụng.',
            'price': 200000,
            'duration': 90,
            'thumbnail': '/static/uploads/services/veSinhSofa.png',
            'category': 'Vệ sinh chuyên sâu'
        }
    ]
    
    for service_data in services_data:
        service = Service.query.filter_by(slug=service_data['slug']).first()
        if not service:
            # Get category
            category_name = service_data.pop('category')
            category = categories.get(category_name)
            
            service = Service(
                category_id=category.id if category else None,
                status='active',
                **service_data
            )
            db.session.add(service)
            print(f"✓ Service '{service_data['name']}' created")

def main():
    """Seed comprehensive data with images"""
    app = create_app()
    
    with app.app_context():
        print("Creating comprehensive seed data with images...")
        
        try:
            # Create tables
            db.create_all()
            
            # Create admin user
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
                print("✓ Admin user created")
              # Create sample customer
            customer = User.query.filter_by(email='customer@example.com').first()
            if not customer:
                customer = User(
                    name='Test Customer',
                    email='customer@example.com',
                    password=generate_password_hash('customer123'),
                    phone='0987654321',
                    role='customer',
                    status='active'
                )
                db.session.add(customer)
                print("✓ Customer user created")
            
            # Create categories and services
            categories = create_service_categories()
            create_services(categories)
            
            db.session.commit()
            print("\n✅ Comprehensive data seeded successfully!")
            
            print("\n🔑 Test accounts:")
            print("   Admin: admin@cleanhome.com / admin123")
            print("   Customer: customer@example.com / customer123")
            
            print(f"\n📊 Data summary:")
            print(f"   Categories: {ServiceCategory.query.count()}")
            print(f"   Services: {Service.query.count()}")
            print(f"   Users: {User.query.count()}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    main()
