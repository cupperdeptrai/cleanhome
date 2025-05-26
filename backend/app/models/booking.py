from datetime import datetime, date, time
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..extensions import db

class Booking(db.Model):
    """Model cho bảng bookings - đơn đặt lịch dịch vụ vệ sinh"""
    __tablename__ = 'bookings'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    service_id = db.Column(UUID(as_uuid=True), db.ForeignKey('services.id'), nullable=False)
    staff_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    booking_date = db.Column(db.Date, nullable=False)
    booking_time = db.Column(db.Time, nullable=False)
    # status sử dụng ENUM trong PostgreSQL: 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
    status = db.Column(db.String(20), default='pending')
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    # payment_status sử dụng ENUM trong PostgreSQL: 'unpaid', 'paid'
    payment_status = db.Column(db.String(20), default='unpaid')
    # payment_method sử dụng ENUM trong PostgreSQL: 'cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay'
    payment_method = db.Column(db.String(20), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Các mối quan hệ
    items = db.relationship('BookingItem', backref='booking', lazy='dynamic', cascade='all, delete-orphan')
    promotions = db.relationship('BookingPromotion', backref='booking', lazy='dynamic', cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='booking', lazy='dynamic', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='booking', lazy='dynamic')
    
    # Quan hệ với dịch vụ chính
    service = db.relationship('Service', foreign_keys=[service_id])
    
    # Quan hệ với nhân viên phụ trách
    staff = db.relationship('User', foreign_keys=[staff_id])
    
    def to_dict(self):
        """Chuyển đổi đối tượng booking thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'service_id': str(self.service_id),
            'staff_id': str(self.staff_id) if self.staff_id else None,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'booking_time': self.booking_time.isoformat() if self.booking_time else None,
            'status': self.status,
            'total_price': float(self.total_price),
            'payment_status': self.payment_status,
            'payment_method': self.payment_method,
            'notes': self.notes,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items],
            'service': self.service.to_dict() if self.service else None,
            'staff': self.staff.to_dict() if self.staff else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng Booking"""
        return f'<Booking {self.id}>'


class BookingItem(db.Model):
    """Model cho bảng booking_items - chi tiết các dịch vụ trong đơn đặt lịch"""
    __tablename__ = 'booking_items'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    service_id = db.Column(UUID(as_uuid=True), db.ForeignKey('services.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)  # Giá tại thời điểm đặt
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)  # Tổng giá (price * quantity)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Chuyển đổi đối tượng BookingItem thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'booking_id': str(self.booking_id),
            'service_id': str(self.service_id),
            'quantity': self.quantity,
            'price': float(self.price),
            'subtotal': float(self.subtotal),
            'service': self.service.to_dict() if self.service else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng BookingItem"""
        return f'<BookingItem {self.id}>'


class BookingPromotion(db.Model):
    """Model cho bảng booking_promotions - khuyến mãi áp dụng cho đơn hàng"""
    __tablename__ = 'booking_promotions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    promotion_id = db.Column(UUID(as_uuid=True), db.ForeignKey('promotions.id'), nullable=False)
    discount_amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationship với promotion
    promotion = db.relationship('Promotion')
    
    def to_dict(self):
        """Chuyển đổi đối tượng BookingPromotion thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'booking_id': str(self.booking_id),
            'promotion_id': str(self.promotion_id),
            'discount_amount': float(self.discount_amount),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'promotion': self.promotion.to_dict() if self.promotion else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng BookingPromotion"""
        return f'<BookingPromotion {self.id}>'


class Payment(db.Model):
    """Model cho bảng payments - thông tin thanh toán"""
    __tablename__ = 'payments'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    # payment_method sử dụng ENUM trong PostgreSQL: 'cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay'
    payment_method = db.Column(db.String(20), nullable=False)
    transaction_id = db.Column(db.String(100), nullable=True)
    # status sử dụng ENUM trong PostgreSQL: 'pending', 'completed', 'failed', 'refunded'
    status = db.Column(db.String(20), default='pending')
    payment_date = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Chuyển đổi đối tượng Payment thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'booking_id': str(self.booking_id),
            'amount': float(self.amount),
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng Payment"""
        return f'<Payment {self.id}>'


class Review(db.Model):
    """Model cho bảng reviews - đánh giá dịch vụ"""
    __tablename__ = 'reviews'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    service_id = db.Column(UUID(as_uuid=True), db.ForeignKey('services.id'), nullable=False)
    staff_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 sao
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id])
    service = db.relationship('Service', foreign_keys=[service_id])
    staff = db.relationship('User', foreign_keys=[staff_id])
    
    def to_dict(self):
        """Chuyển đổi đối tượng Review thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'booking_id': str(self.booking_id),
            'user_id': str(self.user_id),
            'service_id': str(self.service_id),
            'staff_id': str(self.staff_id) if self.staff_id else None,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': self.user.to_dict() if self.user else None,
            'service': self.service.to_dict() if self.service else None,
            'staff': self.staff.to_dict() if self.staff else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng Review"""
        return f'<Review {self.id}>'


class StaffSchedule(db.Model):
    """Model cho bảng staff_schedules - lịch làm việc của nhân viên"""
    __tablename__ = 'staff_schedules'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    staff_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    # status sử dụng ENUM trong PostgreSQL: 'available', 'booked', 'off'
    status = db.Column(db.String(20), default='available')
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Chuyển đổi đối tượng StaffSchedule thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'staff_id': str(self.staff_id),
            'date': self.date.isoformat() if self.date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng StaffSchedule"""
        return f'<StaffSchedule {self.id}>'
