from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..extensions import db

class Promotion(db.Model):
    """Model cho bảng promotions - khuyến mãi, mã giảm giá"""
    __tablename__ = 'promotions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # discount_type sử dụng ENUM trong PostgreSQL: 'percentage', 'fixed'
    discount_type = db.Column(db.String(20), nullable=False)
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    min_order_value = db.Column(db.Numeric(10, 2), default=0)
    max_discount = db.Column(db.Numeric(10, 2), nullable=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    usage_limit = db.Column(db.Integer, nullable=True)
    used_count = db.Column(db.Integer, default=0)
    # status sử dụng ENUM trong PostgreSQL: 'active', 'inactive'
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    booking_promotions = db.relationship('BookingPromotion', backref='promotion_info', lazy='dynamic')
    
    def is_valid(self):
        """Kiểm tra xem khuyến mãi có còn hiệu lực hay không"""
        today = datetime.utcnow().date()
        return (
            self.status == 'active' and
            self.start_date <= today <= self.end_date and
            (self.usage_limit is None or self.used_count < self.usage_limit)
        )
    
    def calculate_discount(self, order_value):
        """Tính toán số tiền giảm giá dựa trên giá trị đơn hàng"""
        if order_value < self.min_order_value:
            return 0
        
        if self.discount_type == 'percentage':
            discount = order_value * (self.discount_value / 100)
            # Áp dụng giới hạn giảm giá tối đa nếu có
            if self.max_discount is not None and discount > self.max_discount:
                discount = self.max_discount
        else:  # fixed discount
            discount = self.discount_value
        
        # Đảm bảo giảm giá không vượt quá giá trị đơn hàng
        return min(discount, order_value)
    
    def to_dict(self):
        """Chuyển đổi đối tượng promotion thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'discount_type': self.discount_type,
            'discount_value': float(self.discount_value),
            'min_order_value': float(self.min_order_value),
            'max_discount': float(self.max_discount) if self.max_discount else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'usage_limit': self.usage_limit,
            'used_count': self.used_count,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng Promotion"""
        return f'<Promotion {self.code}>'
