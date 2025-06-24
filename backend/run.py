"""CleanHome Backend Application Entry Point"""

import os
import sys
from flask import send_from_directory

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from flask_migrate import Migrate

# Create Flask application
app = create_app()

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Static files route
@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files từ thư mục static"""
    import os
    static_dir = os.path.join(app.root_path, 'static')
    return send_from_directory(static_dir, filename)

@app.cli.command()
def init_db():
    """Initialize the database"""
    try:
        # Create database tables
        db.create_all()
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error creating database tables: {e}")

@app.cli.command()
def reset_db():
    """Reset the database"""
    try:
        db.drop_all()
        db.create_all()
        print("Database reset successfully!")
    except Exception as e:
        print(f"Error resetting database: {e}")

@app.shell_context_processor
def make_shell_context():
    """Make database models available in Flask shell"""
    from app.models.user import User, UserAddress
    from app.models.service import Service, ServiceCategory, Area, ServiceArea
    from app.models.booking import Booking, BookingItem, Review, StaffSchedule
    from app.models.promotion import Promotion, BookingPromotion
    from app.models.payment import Payment, PaymentMethod, TransactionLog
    from app.models.notification import Notification, NotificationSetting
    from app.models.activity import UserActivityLog
    from app.models.setting import Setting
    
    return {
        'db': db,
        'User': User,
        'UserAddress': UserAddress,
        'Service': Service,
        'ServiceCategory': ServiceCategory,
        'Area': Area,
        'ServiceArea': ServiceArea,
        'Booking': Booking,
        'BookingItem': BookingItem,
        'Review': Review,
        'StaffSchedule': StaffSchedule,
        'Promotion': Promotion,
        'BookingPromotion': BookingPromotion,
        'Payment': Payment,
        'PaymentMethod': PaymentMethod,
        'TransactionLog': TransactionLog,
        'Notification': Notification,
        'NotificationSetting': NotificationSetting,
        'UserActivityLog': UserActivityLog,
        'Setting': Setting,
    }

if __name__ == '__main__':
    # Run the application
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=True
    )

