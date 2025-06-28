"""Models package for CleanHome application"""

# Import all models to ensure they are registered with SQLAlchemy
from .user import User, UserAddress
from .service import Service, ServiceCategory, Area, ServiceArea, Review
from .booking import Booking, BookingItem, BookingPromotion
from .promotion import Promotion
# from .payment import Payment
from .notification import Notification, NotificationSetting
from .setting import Setting
from .activity import UserActivityLog

__all__ = [
    'User', 'UserAddress',
    'Service', 'ServiceCategory', 'Area', 'ServiceArea', 'Review',
    'Booking', 'BookingItem', 'BookingPromotion',
    'Promotion',
    # 'Payment',
    'Notification', 'NotificationSetting',
    'Setting',
    'UserActivityLog'
]

