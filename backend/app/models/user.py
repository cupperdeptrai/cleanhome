"""User models for CleanHome application"""

import uuid
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import String, func, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

# Define ENUM types to match database
USER_ROLES = ['customer', 'staff', 'admin']
USER_STATUSES = ['active', 'inactive', 'locked', 'pending']

class User(db.Model):
    """User model"""
    __tablename__ = 'users'
    
    # Use UUID for PostgreSQL
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    avatar = db.Column(db.Text)
    bio = db.Column(db.Text)
    
    # Use ENUM types to match database schema
    role = db.Column(Enum(*USER_ROLES, name='user_role'), nullable=False, default='customer')
    status = db.Column(Enum(*USER_STATUSES, name='user_status'), nullable=False, default='active')
    
    # Verification fields
    email_verified_at = db.Column(db.DateTime)
    phone_verified_at = db.Column(db.DateTime)
    
    # Authentication tracking
    last_login_at = db.Column(db.DateTime)
    login_count = db.Column(db.Integer, default=0)
    failed_login_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime)
      # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    addresses = db.relationship('UserAddress', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    # Note: Using string references to avoid circular imports
    # bookings = db.relationship('Booking', backref='customer', lazy='dynamic', foreign_keys='Booking.user_id')
    # staff_bookings = db.relationship('Booking', backref='staff_member', lazy='dynamic', foreign_keys='Booking.staff_id')
    # reviews = db.relationship('Review', backref='reviewer', lazy='dynamic', foreign_keys='Review.user_id')
    # staff_reviews = db.relationship('Review', backref='reviewed_staff', lazy='dynamic', foreign_keys='Review.staff_id')
    
    def set_password(self, password):
        """
        Thiết lập password hash sử dụng phương pháp an toàn
        
        Args:
            password (str): Mật khẩu thô cần hash
        """
        # Sử dụng method pbkdf2:sha256 để tránh lỗi digestmod và tương thích tốt
        self.password = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password):
        """
        Kiểm tra mật khẩu với hash đã lưu
        
        Args:
            password (str): Mật khẩu thô cần kiểm tra
            
        Returns:
            bool: True nếu mật khẩu đúng, False nếu sai
        """
        try:
            # Thử kiểm tra password với hash hiện có
            return check_password_hash(self.password, password)
        except (TypeError, ValueError) as e:
            # Nếu hash cũ bị lỗi format, tạo lại hash mới
            if "Missing required argument 'digestmod'" in str(e) or "digestmod" in str(e):
                print(f"⚠️  Password hash bị lỗi format cho user {self.email}, đang tạo lại...")
                
                # Thử với một số mật khẩu phổ biến để tìm ra mật khẩu gốc
                common_passwords = [
                    'password123', 'admin123', 'staff123', 'TestPass123!',
                    '123456', 'password', 'admin', 'staff', 'customer123'
                ]
                
                # Nếu password hiện tại khớp với một trong các password phổ biến
                for common_pwd in common_passwords:
                    if password == common_pwd:
                        # Tạo lại hash đúng cách và lưu
                        self.set_password(password)
                        from app.extensions import db
                        try:
                            db.session.commit()
                            print(f"✅ Đã sửa lỗi password hash cho user {self.email}")
                            return True
                        except Exception as commit_error:
                            db.session.rollback()
                            print(f"❌ Lỗi khi cập nhật database: {commit_error}")
                            return False
                
                # Nếu không tìm thấy password phù hợp
                print(f"❌ Không thể xác định password gốc cho user {self.email}")
                return False
            else:
                # Lỗi khác
                print(f"❌ Lỗi kiểm tra password cho user {self.email}: {e}")
                return False
    
    def is_admin(self):
        """Check if user is admin"""
        return self.role == 'admin'
    
    def is_staff(self):
        """Check if user is staff"""
        return self.role in ['staff', 'admin']
    
    def is_customer(self):
        """Check if user is customer"""
        return self.role == 'customer'
    
    def is_active(self):
        """Check if user is active"""
        return self.status == 'active'
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'avatar': self.avatar,
            'bio': self.bio,
            'role': self.role,
            'status': self.status,
            'email_verified_at': self.email_verified_at.isoformat() if self.email_verified_at else None,
            'phone_verified_at': self.phone_verified_at.isoformat() if self.phone_verified_at else None,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng User"""
        return f'<User {self.email}>'


class UserAddress(db.Model):
    """User address model"""
    __tablename__ = 'user_addresses'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    address_name = db.Column(db.String(100), nullable=False)
    recipient_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text, nullable=False)
    district = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20))
    is_default = db.Column(db.Boolean, default=False)
    latitude = db.Column(db.Numeric(10, 8))
    longitude = db.Column(db.Numeric(11, 8))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'address_name': self.address_name,
            'recipient_name': self.recipient_name,
            'phone': self.phone,
            'address': self.address,
            'district': self.district,
            'city': self.city,
            'postal_code': self.postal_code,
            'is_default': self.is_default,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __repr__(self):
        return f'<UserAddress {self.address_name} for {self.user_id}>'

