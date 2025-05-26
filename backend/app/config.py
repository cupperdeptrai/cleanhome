from dotenv import load_dotenv
import os

load_dotenv()

class AppConfig:
    @staticmethod
    def get_database_url():
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('5432', '')
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'cleanhome')
        return f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'

    @staticmethod
    def get_jwt_secret_key():
        return os.getenv('JWT_SECRET_KEY', 'default-secret-key')

    @staticmethod
    def get_upload_folder():
        return os.getenv('UPLOAD_FOLDER', 'uploads')

    @staticmethod
    def get_max_content_length():
        return int(os.getenv('MAX_CONTENT_LENGTH', 16777216))

    @staticmethod
    def get_jwt_access_token_expires():
        return 3600  # 1 giờ

    @staticmethod
    def get_jwt_refresh_token_expires():
        return 86400  # 1 ngày
# import os
# from dotenv import load_dotenv

# load_dotenv()

# class Config: 
#     """Base configuration."""
#     SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change')
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
#     JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-key')
#     JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
#     CORS_HEADERS = 'Content-Type'

# class DevelopmentConfig(Config):
#     """Development configuration."""
#     DEBUG = True
#     SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL', 'postgresql://postgres:5432@localhost:5432/doanhhoang_2110900022_datn_db')

# class TestingConfig(Config):
#     """Testing configuration."""
#     TESTING = True
#     SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL', 'postgresql://postgres:5432@localhost:5432/doanhhoang_2110900022_datn_db')

# class ProductionConfig(Config):
#     """Production configuration."""
#     SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
#     JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours

# config = {
#     'development': DevelopmentConfig,
#     'testing': TestingConfig,
#     'production': ProductionConfig,
#     'default': DevelopmentConfig
# } 