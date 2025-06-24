"""Flask extensions initialization"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_marshmallow import Marshmallow

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
mail = Mail()
ma = Marshmallow()  # Thêm Marshmallow
limiter = Limiter(
    get_remote_address,
    default_limits=["1000 per day", "100 per hour"]
)

def init_extensions(app):
    """Initialize all Flask extensions with the app"""
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)  # Thêm Marshmallow init
      # Configure CORS với origins từ config
    # Frontend Vite chạy trên port 5173, backend Flask chạy trên port 5000
    cors.init_app(app, 
                  origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173']),
                  supports_credentials=True,
                  allow_headers=['Content-Type', 'Authorization'])
    
    mail.init_app(app)
    limiter.init_app(app)
    
    # JWT configuration
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        # TODO: Implement token blacklist check
        return False
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            'message': 'Token has expired',
            'error': 'token_expired'
        }, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {
            'message': 'Invalid token',
            'error': 'invalid_token'
        }, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            'message': 'Authorization token is required',
            'error': 'authorization_required'
        }, 401
