from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..extensions import db

class ServiceCategory(db.Model):
    """Model cho bảng service_categories - danh mục dịch vụ vệ sinh"""
    __tablename__ = 'service_categories'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.Text, nullable=True)
    # status sử dụng ENUM trong PostgreSQL: 'active', 'inactive'
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Quan hệ với các dịch vụ
    services = db.relationship('Service', backref='category', lazy='dynamic')
    
    def to_dict(self):
        """Chuyển đổi đối tượng category thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'image': self.image,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng ServiceCategory"""
        return f'<ServiceCategory {self.name}>'


class Service(db.Model):
    """Model cho bảng services - dịch vụ vệ sinh"""
    __tablename__ = 'services'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = db.Column(UUID(as_uuid=True), db.ForeignKey('service_categories.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # Thời gian thực hiện (phút)
    image = db.Column(db.Text, nullable=True)
    # status sử dụng ENUM trong PostgreSQL: 'active', 'inactive'
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Quan hệ với đơn hàng 
    booking_items = db.relationship('BookingItem', backref='service', lazy='dynamic')
    
    def to_dict(self):
        """Chuyển đổi đối tượng service thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'category_id': str(self.category_id),
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'duration': self.duration,
            'image': self.image,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'category': self.category.to_dict() if self.category else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng Service"""
        return f'<Service {self.name}>'
