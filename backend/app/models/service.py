"""Service models for CleanHome application"""

import uuid
from datetime import datetime
from sqlalchemy import Enum
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

# Define ENUM types to match database
SERVICE_STATUSES = ['active', 'inactive', 'draft']

class ServiceCategory(db.Model):
    """Service category model"""
    __tablename__ = 'service_categories'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    image = db.Column(db.Text)
    status = db.Column(Enum(*SERVICE_STATUSES, name='service_status'), nullable=False, default='active')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<ServiceCategory {self.name}>'


class Service(db.Model):
    """Service model"""
    __tablename__ = 'services'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = db.Column(UUID(as_uuid=True), db.ForeignKey('service_categories.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(150), nullable=False, unique=True)
    short_description = db.Column(db.String(255))
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    sale_price = db.Column(db.Numeric(10, 2))
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    unit = db.Column(db.String(50), default='Lần')
    thumbnail = db.Column(db.Text)
    is_featured = db.Column(db.Boolean, default=False)
    min_area = db.Column(db.Numeric(10, 2))
    max_area = db.Column(db.Numeric(10, 2))
    price_per_area = db.Column(db.Numeric(10, 2))
    staff_count = db.Column(db.Integer, default=1)
    status = db.Column(Enum(*SERVICE_STATUSES, name='service_status'), nullable=False, default='active')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Service {self.name}>'


class Area(db.Model):
    """Area model"""
    __tablename__ = 'areas'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100))
    city = db.Column(db.String(100))
    delivery_fee = db.Column(db.Numeric(10, 2), default=0)
    status = db.Column(db.String(20), nullable=False, default='active')  # active, inactive
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Area {self.name}>'


class ServiceArea(db.Model):
    """Service area mapping model"""
    __tablename__ = 'service_areas'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_id = db.Column(UUID(as_uuid=True), db.ForeignKey('services.id'), nullable=False)
    area_id = db.Column(UUID(as_uuid=True), db.ForeignKey('areas.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ServiceArea {self.service_id} - {self.area_id}>'


class Review(db.Model):
    """Review model"""
    __tablename__ = 'reviews'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    service_id = db.Column(UUID(as_uuid=True), db.ForeignKey('services.id'), nullable=False)
    staff_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Review {self.id}: {self.rating} stars>'

