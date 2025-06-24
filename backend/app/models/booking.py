"""Booking models for CleanHome application"""

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, ENUM
from app.extensions import db

class Booking(db.Model):
    """Booking model"""
    __tablename__ = 'bookings'
      # Use UUID for PostgreSQL
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_code = db.Column(db.String(50), nullable=False, unique=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    address_id = db.Column(UUID(as_uuid=True), nullable=True)
    staff_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    
    # Booking details (match database schema)
    booking_date = db.Column(db.Date, nullable=False)
    booking_time = db.Column(db.Time, nullable=False)  # Changed from start_time
    end_time = db.Column(db.Time, nullable=True)    # Status and payment (using ENUM from database)
    status = db.Column(db.Enum('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', name='booking_status'), nullable=False, default='pending')
    
    # Pricing (match database schema)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    discount = db.Column(db.Numeric(10, 2), default=0)  # Changed from discount_amount
    tax = db.Column(db.Numeric(10, 2), default=0)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)  # Changed from total_amount
    
    # Payment info
    payment_status = db.Column(db.Enum('unpaid', 'pending', 'paid', 'refunded', 'failed', name='payment_status'), nullable=False, default='unpaid')
    payment_method = db.Column(db.Enum('cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay', 'vnpay', name='payment_method'), nullable=True)
    
    # Additional information
    notes = db.Column(db.Text)
    customer_address = db.Column(db.Text, nullable=True)  # Changed from address
    area = db.Column(db.Numeric(10, 2), nullable=True)
    cancel_reason = db.Column(db.Text, nullable=True)  # Changed from cancellation_reason
    cancelled_by = db.Column(UUID(as_uuid=True), nullable=True)
    cancelled_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
      # Relationships
    booking_items = db.relationship('BookingItem', backref='booking', lazy=True)
    assigned_staff = db.relationship('BookingStaff', backref='booking', lazy=True, cascade='all, delete-orphan')
    
    @staticmethod
    def generate_booking_code():
        """Sinh mã booking code duy nhất theo format CHxxxxxxxxxxx"""
        import random
        import string
        from datetime import datetime
        
        # Format: CH + timestamp (6 số cuối) + random (5 ký tự)
        timestamp = str(int(datetime.now().timestamp()))[-6:]  # 6 số cuối của timestamp
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        code = f"CH{timestamp}{random_part}"
          # Kiểm tra trùng lặp
        while Booking.query.filter_by(booking_code=code).first():
            random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
            code = f"CH{timestamp}{random_part}"
            
        return code
    
    def __init__(self, **kwargs):
        """Constructor để tự động sinh booking_code"""
        if 'booking_code' not in kwargs or not kwargs['booking_code']:
            kwargs['booking_code'] = self.generate_booking_code()
        super().__init__(**kwargs)
    
    def get_service_info(self):
        """Lấy thông tin dịch vụ từ booking items"""
        if self.booking_items:
            # Lấy dịch vụ đầu tiên (giả sử mỗi booking chỉ có 1 dịch vụ hiện tại)
            first_item = self.booking_items[0]
            
            # Join với bảng services để lấy tên dịch vụ thực tế
            from app.models.service import Service
            service = Service.query.filter_by(id=first_item.service_id).first()
            
            return {
                'service_id': str(first_item.service_id),
                'service_name': service.name if service else 'Dịch vụ không xác định'
            }
        return {
            'service_id': None,
            'service_name': 'Chưa có dịch vụ'
        }
    def to_dict(self):
        """Chuyển đổi booking thành dictionary để trả về API"""
        service_info = self.get_service_info()
        
        return {
            'id': str(self.id),
            'bookingCode': self.booking_code,
            'userId': str(self.user_id),
            'serviceId': service_info['service_id'],  # Lấy từ booking_items
            'staffId': str(self.staff_id) if self.staff_id else None,
            'date': self.booking_date.strftime('%Y-%m-%d') if self.booking_date else None,
            'time': self.booking_time.strftime('%H:%M') if self.booking_time else None,  # Changed from start_time
            'endTime': self.end_time.strftime('%H:%M') if self.end_time else None,
            'address': self.customer_address,  # Changed from address
            'area': float(self.area) if self.area else None,
            'subtotal': float(self.subtotal) if self.subtotal else 0,
            'discount': float(self.discount) if self.discount else 0,  # Changed from discountAmount
            'tax': float(self.tax) if self.tax else 0,
            'totalAmount': float(self.total_price) if self.total_price else 0,  # Map total_price to totalAmount
            'status': self.status,
            'paymentStatus': self.payment_status,
            'paymentMethod': self.payment_method,
            'notes': self.notes,
            'cancelReason': self.cancel_reason,  # Changed from cancellationReason
            'cancelledBy': str(self.cancelled_by) if self.cancelled_by else None,
            'cancelledAt': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            # Thêm các trường tương thích với frontend
            'serviceName': service_info['service_name'],  # Lấy từ booking_items
            'staffName': None if not self.staff_id else self.get_staff_name(),  # Backward compatibility với staff_id
            # Thông tin về các nhân viên được phân công (nhiều nhân viên)
            'assignedStaff': [staff.to_dict() for staff in self.assigned_staff] if self.assigned_staff else [],
            'staffCount': len(self.assigned_staff) if self.assigned_staff else 0
        }
    
    def get_staff_name(self):
        """Lấy tên nhân viên từ staff_id (backward compatibility)"""
        if self.staff_id:
            from app.models.user import User
            staff = User.query.filter_by(id=self.staff_id).first()
            return staff.name if staff else None
        return None
    
    def __repr__(self):
        return f'<Booking {self.id}: {self.booking_date}>'


class BookingItem(db.Model):
    """Booking item model - services included in a booking"""
    __tablename__ = 'booking_items'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    service_id = db.Column(UUID(as_uuid=True), db.ForeignKey('services.id'), nullable=False)
    
    quantity = db.Column(db.Integer, nullable=False, default=1)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)  # Đổi từ total_price thành subtotal
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<BookingItem {self.id}: {self.booking_id} - {self.service_id}>'


class BookingPromotion(db.Model):
    """Booking promotion model - promotions applied to a booking"""
    __tablename__ = 'booking_promotions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    promotion_id = db.Column(UUID(as_uuid=True), db.ForeignKey('promotions.id'), nullable=False)
    
    discount_amount = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<BookingPromotion {self.id}: {self.booking_id} - {self.promotion_id}>'


class BookingStaff(db.Model):
    """Booking staff model - staff assigned to a booking (many-to-many relationship)"""
    __tablename__ = 'booking_staff'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    staff_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)  # Admin who assigned
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    staff = db.relationship('User', foreign_keys=[staff_id], backref='assigned_bookings')
    assigner = db.relationship('User', foreign_keys=[assigned_by])
    
    # Unique constraint để tránh phân công duplicate
    __table_args__ = (
        db.UniqueConstraint('booking_id', 'staff_id', name='uq_booking_staff'),
    )
    
    def to_dict(self):
        """Chuyển đổi thành dictionary"""
        return {
            'id': str(self.id),
            'bookingId': str(self.booking_id),
            'staffId': str(self.staff_id),
            'staffName': self.staff.name if self.staff else None,
            'assignedAt': self.assigned_at.isoformat() if self.assigned_at else None,
            'assignedBy': str(self.assigned_by) if self.assigned_by else None,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<BookingStaff {self.id}: {self.booking_id} - {self.staff_id}>'

