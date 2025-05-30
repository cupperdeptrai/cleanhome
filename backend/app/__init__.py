from flask import Flask
from flask_cors import CORS
import os
import logging
from .utils.config import AppConfig
from .extensions import db, jwt, ma, migrate

def create_app():
    """Khởi tạo và cấu hình ứng dụng Flask"""
    app = Flask(__name__)    # Thiết lập logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('app.log', encoding='utf-8')
        ]
    )    # Cấu hình ứng dụng từ AppConfig
    app.config['SQLALCHEMY_DATABASE_URI'] = AppConfig.get_database_url()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = AppConfig.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = AppConfig.JWT_ACCESS_TOKEN_EXPIRES
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = AppConfig.JWT_REFRESH_TOKEN_EXPIRES
    app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', AppConfig.UPLOAD_FOLDER)
    app.config['MAX_CONTENT_LENGTH'] = AppConfig.MAX_CONTENT_LENGTH
    app.config['CORS_HEADERS'] = 'Content-Type'
    
    # Cấu hình CORS để cho phép các requests từ frontend
    app.config['CORS_ORIGINS'] = ['http://localhost:5173', 'http://127.0.0.1:5173']
    
    # Khởi tạo các extension
    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
      # Áp dụng CORS
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)
      # Tạo thư mục upload nếu chưa tồn tại
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Đăng ký blueprints
    from app.api import (
        auth_bp, bookings_bp, users_bp, promotions_bp, services_bp, 
        home_bp, payments_bp, reviews_bp, notifications_bp
    )
    app.register_blueprint(home_bp)  # Register at root level (no prefix)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(promotions_bp, url_prefix='/api/promotions')
    app.register_blueprint(services_bp, url_prefix='/api/services')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    # Kiểm tra kết nối database
    with app.app_context():
        try:
            app.logger.info("Checking database connection...")
            from .database import init_db
            init_db()
            app.logger.info("Database connection successful!")
        except Exception as e:
            app.logger.error(f"Error during init_db: {e}")
            
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)