from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..extensions import db

class Notification(db.Model):
    """Model cho bảng notifications - thông báo cho người dùng"""
    __tablename__ = 'notifications'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=True)  # Loại thông báo: 'booking', 'system', 'promotion', v.v.
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationship with user
    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic'))
    
    def to_dict(self):
        """Chuyển đổi đối tượng notification thành dictionary để trả về qua API"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        """Hiển thị đại diện của đối tượng Notification"""
        return f'<Notification {self.id}>' 