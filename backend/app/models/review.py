from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, CheckConstraint, Enum, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.extensions import db
import uuid
from datetime import datetime
import enum


class ReviewStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey('services.id', ondelete='CASCADE'), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    rating = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    comment = Column(Text, nullable=True)
    images = Column(ARRAY(Text), nullable=True)
    admin_reply = Column(Text, nullable=True)
    admin_reply_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(ReviewStatus), default=ReviewStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )
    
    # Relationships
    booking = relationship("Booking", backref="reviews")
    user = relationship("User", foreign_keys=[user_id], backref="user_reviews")
    service = relationship("Service", backref="service_reviews")
    staff = relationship("User", foreign_keys=[staff_id], backref="staff_reviews")
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'booking_id': str(self.booking_id),
            'user_id': str(self.user_id),
            'service_id': str(self.service_id),
            'staff_id': str(self.staff_id) if self.staff_id else None,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'images': self.images,
            'admin_reply': self.admin_reply,
            'admin_reply_at': self.admin_reply_at.isoformat() if self.admin_reply_at else None,
            'status': self.status.value if self.status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
