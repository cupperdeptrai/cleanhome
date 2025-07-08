"""
Flask extensions initialization
Khởi tạo các extension cho ứng dụng CleanHome
"""

from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

# Khởi tạo các extension objects
db = SQLAlchemy()           # ORM database
ma = Marshmallow()          # Serialization/Deserialization
jwt = JWTManager()          # JWT authentication
cors = CORS()               # Cross-Origin Resource Sharing
migrate = Migrate()         # Database migrations

def init_extensions(app):
    """
    Khởi tạo tất cả Flask extensions với app instance
    
    Args:
        app: Flask application instance
    """
    
    # Khởi tạo database ORM
    db.init_app(app)
    
    # Khởi tạo Marshmallow (phải sau SQLAlchemy)
    ma.init_app(app)
    
    # Khởi tạo JWT manager
    jwt.init_app(app)
    
    # Khởi tạo CORS với cấu hình chi tiết
    cors.init_app(app, 
        origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173', 'http://localhost:5174']),
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
        supports_credentials=True,
        send_wildcard=False
    )
    
    # Khởi tạo Flask-Migrate
    migrate.init_app(app, db)
    
    # Cấu hình JWT callbacks
    setup_jwt_callbacks(jwt)

def setup_jwt_callbacks(jwt_manager):
    """
    Cấu hình các callback cho JWT
    
    Args:
        jwt_manager: JWTManager instance
    """
    
    @jwt_manager.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """Callback khi token hết hạn"""
        return {
            'error': 'Token đã hết hạn',
            'code': 'token_expired'
        }, 401
    
    @jwt_manager.invalid_token_loader
    def invalid_token_callback(error):
        """Callback khi token không hợp lệ"""
        return {
            'error': 'Token không hợp lệ',
            'code': 'invalid_token'
        }, 401
    
    @jwt_manager.unauthorized_loader
    def missing_token_callback(error):
        """Callback khi thiếu token"""
        return {
            'error': 'Yêu cầu token xác thực',
            'code': 'authorization_required'
        }, 401
