from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from flask_migrate import Migrate
from .utils.config import AppConfig
import os

# Khởi tạo các extension
db = SQLAlchemy()
jwt = JWTManager()
ma = Marshmallow()
migrate = Migrate()

def create_app():
    """Khởi tạo và cấu hình ứng dụng Flask"""
    app = Flask(__name__)

    # Cấu hình ứng dụng từ AppConfig
    app.config['SQLALCHEMY_DATABASE_URI'] = AppConfig.get_database_url()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = AppConfig.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = AppConfig.JWT_ACCESS_TOKEN_EXPIRES
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = AppConfig.JWT_REFRESH_TOKEN_EXPIRES
    app.config['UPLOAD_FOLDER'] = AppConfig.UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = AppConfig.MAX_CONTENT_LENGTH
    app.config['CORS_HEADERS'] = 'Content-Type'

    # Khởi tạo các extension
    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Tạo thư mục upload nếu chưa tồn tại
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Đăng ký blueprints
    from app.api import auth_bp, bookings_bp, users_bp, promotions_bp, services_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(promotions_bp, url_prefix='/api/promotions')
    app.register_blueprint(services_bp, url_prefix='/api/services')

    # Kiểm tra kết nối database
    with app.app_context():
        from .database import init_db
        init_db()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)