"""Activity models for CleanHome application"""

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

class UserActivityLog(db.Model):
    """User activity log model"""
    __tablename__ = 'user_activity_logs'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    action = db.Column(db.String(100), nullable=False)  # login, logout, create_booking, etc.
    description = db.Column(db.Text)
    ip_address = db.Column(db.String(45))  # IPv6 compatible
    user_agent = db.Column(db.Text)
      # Optional reference to related objects
    reference_id = db.Column(UUID(as_uuid=True))  # ID of related booking, payment, etc.
    reference_type = db.Column(db.String(50))  # booking, payment, etc.
    
    # Additional data
    extra_data = db.Column(db.Text)  # JSON data for additional context
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserActivityLog {self.id}: {self.action}>'

