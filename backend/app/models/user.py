from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import UUID, ENUM
import uuid
from ..extensions import db

class User(db.Model):
    """Model cho bảng users - lưu thông tin người dùng trong hệ thống"""
    __tablename__ = 'users'
    
    # Khóa chính sử dụng UUID thay vì số nguyên tự tăng
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    avatar = db.Column(db.Text, nullable=True)
    # role sử dụng ENUM trong PostgreSQL: 'customer', 'staff', 'admin'
    # Map từ 'user' trong frontend thành 'customer' trong database
    role = db.Column(ENUM('customer', 'staff', 'admin', name='user_role'), default='customer')
    # status sử dụng ENUM trong PostgreSQL: 'active', 'locked'
    status = db.Column(ENUM('active', 'locked', name='user_status'), default='active')
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Quan hệ với các bảng khác
    bookings = db.relationship('Booking', backref='client', lazy='dynamic')
    staff_schedules = db.relationship('StaffSchedule', backref='staff', lazy='dynamic', cascade='all, delete-orphan')
    
    @property
    def password_hash(self):
        """Getter cho trường password - không cho phép đọc mật khẩu"""
        raise AttributeError('password không phải là thuộc tính có thể đọc')
    
    @password_hash.setter
    def password_hash(self, password):
        """Setter cho trường password - mã hóa mật khẩu trước khi lưu"""
        # Trong database, trường này gọi là 'password'
        self.password = generate_password_hash(password)
    
    def verify_password(self, password):
        """Phương thức kiểm tra mật khẩu"""
        return check_password_hash(self.password, password)
    
    def to_dict(self):
        """Chuyển đổi đối tượng user thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'avatar': self.avatar,
            'role': self.role,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng User"""
        return f'<User {self.email}>'
