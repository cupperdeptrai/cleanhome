"""Payment models for CleanHome application"""

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

class Payment(db.Model):
    """Payment model"""
    __tablename__ = 'payments'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(20), nullable=False)  # cash, bank_transfer, vnpay, momo, zalopay
    transaction_id = db.Column(db.String(100))  # External transaction ID
    vnpay_transaction_no = db.Column(db.String(50))  # VNPay transaction number
    vnpay_response_code = db.Column(db.String(10))  # VNPay response code
    vnpay_bank_code = db.Column(db.String(20))  # Bank code from VNPay
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, processing, completed, failed, refunded
    payment_date = db.Column(db.DateTime)
    
    # Payment gateway details
    gateway_response = db.Column(db.Text)  # Store gateway response for debugging
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Payment {self.id}: {self.amount} {self.payment_method}>'


class PaymentMethod(db.Model):
    """Payment method model"""
    __tablename__ = 'payment_methods'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(50), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    
    # Configuration
    config = db.Column(db.Text)  # JSON configuration for payment gateway
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<PaymentMethod {self.name}>'

