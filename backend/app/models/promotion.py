"""Promotion models for CleanHome application"""

import uuid
from datetime import datetime, date
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

class Promotion(db.Model):
    """Promotion model"""
    __tablename__ = 'promotions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    
    # Discount details
    type = db.Column(db.String(20), nullable=False)  # percentage, fixed
    value = db.Column(db.Numeric(10, 2), nullable=False)  # percentage or fixed amount
    min_order_value = db.Column(db.Numeric(10, 2), default=0)
    max_discount = db.Column(db.Numeric(10, 2))
    
    # Validity period
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    
    # Usage limits
    usage_limit = db.Column(db.Integer)  # null means unlimited
    used_count = db.Column(db.Integer, default=0)
    
    status = db.Column(db.String(20), nullable=False, default='active')  # active, inactive, expired
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Promotion {self.code}: {self.name}>'
    
    def is_valid(self, order_value=0):
        """Check if promotion is valid"""
        today = date.today()
        
        # Check if promotion is active
        if self.status != 'active':
            return False, "Promotion is not active"
        
        # Check date validity
        if today < self.start_date:
            return False, "Promotion has not started yet"
        
        if today > self.end_date:
            return False, "Promotion has expired"
        
        # Check usage limit
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False, "Promotion usage limit reached"
        
        # Check minimum order value
        if order_value < self.min_order_value:
            return False, f"Minimum order value is {self.min_order_value}"
        
        return True, "Promotion is valid"
    
    def calculate_discount(self, order_value):
        """Calculate discount amount"""
        if self.type == 'percentage':
            discount = order_value * (self.value / 100)
            if self.max_discount:
                discount = min(discount, self.max_discount)
        else:  # fixed
            discount = self.value
        
        return min(discount, order_value)

