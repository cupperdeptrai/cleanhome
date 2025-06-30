import os
from datetime import timedelta

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://postgres:5432@localhost/cleanhome'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # CORS Configuration
    CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:5000']
    
    # File Upload Configuration
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Logging Configuration
    LOG_FILE = 'logs/cleanhome.log'

    # Cấu hình VNPay cho CleanHome (Sandbox - Demo)
    # URL thanh toán môi trường TEST của VNPay
    VNPAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    # URL API để truy vấn và hoàn tiền giao dịch
    VNPAY_API_URL = 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
    # Mã website (Terminal ID) được cấp bởi VNPay
    VNPAY_TMN_CODE = 'J7DDGA7W'
    # Chuỗi bí mật để tạo checksum bảo mật
    VNPAY_HASH_SECRET_KEY = 'NU00GJWT04BMH5HIXFRYIJXBN5TD134S'
    # URL trả về sau khi thanh toán (backend sẽ xử lý và redirect về frontend)
    VNPAY_RETURN_URL = 'http://localhost:5000/api/vnpay/vnpay_return'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    DEVELOPMENT = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    DEVELOPMENT = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
