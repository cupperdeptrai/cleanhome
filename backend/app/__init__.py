"""Flask application factory"""

import os
import sys
import logging
from flask import Flask

# Add the parent directory to the Python path to find config module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import config
from app.extensions import init_extensions, db
from app.utils.errors import register_error_handlers

def create_app(config_name=None):
    """Application factory pattern"""
    
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Disable automatic trailing slash redirect for CORS compatibility
    app.url_map.strict_slashes = False
    
    # Initialize extensions
    init_extensions(app)
    
    # Setup logging
    setup_logging(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Create upload directories
    create_directories(app)
    
    return app

def register_blueprints(app):
    """Register all API blueprints"""
    
    # Import blueprints
    from app.api.auth import auth_bp
    from app.api.users import users_bp
    from app.api.services import services_bp
    from app.api.areas import areas_bp
    from app.api.bookings import bookings_bp
    from app.api.promotions import promotions_bp
    from app.api.reviews import reviews_bp
    from app.api.staff import staff_bp
    # from app.api.payments import payments_bp
    from app.api.notifications import notifications_bp
    from app.api.activity import activity_bp
    from app.api.reports import reports_bp
    from app.api.admin import admin_bp
    from app.api.vnpay import vnpay_bp
    
    # Register blueprints with URL prefix
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(services_bp, url_prefix='/api/services')
    app.register_blueprint(areas_bp, url_prefix='/api/areas')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(promotions_bp, url_prefix='/api/promotions')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(staff_bp, url_prefix='/api/staff')
    # app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(activity_bp, url_prefix='/api/activity')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(vnpay_bp, url_prefix='/api/vnpay')

def setup_logging(app):
    """Setup application logging"""
    if not app.debug and not app.testing:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        file_handler = logging.FileHandler(app.config['LOG_FILE'])
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('CleanHome startup')

def create_directories(app):
    """Create necessary directories"""
    upload_folder = app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
        os.makedirs(os.path.join(upload_folder, 'avatars'))
        os.makedirs(os.path.join(upload_folder, 'services'))
    
    if not os.path.exists('logs'):
        os.makedirs('logs')
