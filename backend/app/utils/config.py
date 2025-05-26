import os
from datetime import timedelta

class AppConfig:
    """
    Lớp chứa các cấu hình chung của ứng dụng CleanHome
    ---
    Các cấu hình này có thể được cập nhật từ file .env hoặc
    từ biến môi trường hệ thống.
    """
    
    # Thông tin công ty
    COMPANY_NAME = "CleanHome"
    COMPANY_EMAIL = "info@cleanhome.com"
    COMPANY_PHONE = "0123.456.789"
    COMPANY_ADDRESS = "123 Đường ABC, Quận 1, TP. HCM"
    
    # Cấu hình dịch vụ
    DEFAULT_BOOKING_DURATION = 120  # Thời lượng mặc định cho dịch vụ (phút)
    MIN_BOOKING_DURATION = 60  # Thời lượng tối thiểu cho dịch vụ (phút)
    MAX_BOOKING_DURATION = 480  # Thời lượng tối đa cho dịch vụ (phút)
    
    # Thời gian làm việc
    WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    WORKING_HOURS_START = "08:00"
    WORKING_HOURS_END = "18:00"
    
    # Giá trị mặc định cho các tham số phân trang
    DEFAULT_PAGE_SIZE = 10
    MAX_PAGE_SIZE = 100
    
    # Các cấu hình thanh toán
    PAYMENT_METHODS = {
        "cash": "Tiền mặt",
        "bank_transfer": "Chuyển khoản ngân hàng",
        "credit_card": "Thẻ tín dụng",
        "momo": "Ví MoMo",
        "zalopay": "ZaloPay"
    }
    
    # Thông tin ngân hàng
    BANK_INFO = {
        "name": "Ngân hàng TMCP Công Thương Việt Nam",
        "account_number": "123456789",
        "account_name": "CÔNG TY TNHH CLEANHOME",
        "branch": "Chi nhánh TP. Hồ Chí Minh"
    }
    
    # Cấu hình cơ sở dữ liệu
    @classmethod
    def get_database_url(cls, env="development"):
        """
        Lấy URL cơ sở dữ liệu dựa trên môi trường
        ---
        Args:
            env (str): Môi trường (development, testing, production)
        
        Returns:
            str: URL cơ sở dữ liệu
        """
        env_mapping = {
            "development": "DEV_DATABASE_URL",
            "testing": "TEST_DATABASE_URL",
            "production": "DATABASE_URL"
        }
        env_var = env_mapping.get(env, "DEV_DATABASE_URL")
        
        # URL mặc định cho PostgreSQL
        default_url = f"postgresql://postgres:postgres@localhost:5432/cleanhome_{env}"
        return os.environ.get(env_var, default_url)
    
    # Cấu hình JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Cấu hình giảm giá
    MAX_PERCENTAGE_DISCOUNT = 50  # Giảm giá tối đa 50%
    MIN_ORDER_FOR_PROMOTION = 200000  # Giá trị đơn hàng tối thiểu để áp dụng khuyến mãi
    
    # Cấu hình email
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME", "example@gmail.com")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "password")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", "CleanHome <noreply@cleanhome.com>")
    
    # Cấu hình upload file
    UPLOAD_FOLDER = os.path.join("static", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
    
    # Cấu hình API
    API_RATE_LIMIT = "200 per minute"  # Giới hạn request API
    
    @classmethod
    def get_setting(cls, key, default=None):
        """
        Lấy giá trị cấu hình theo key
        ---
        Hàm này sẽ tìm trong biến môi trường, cơ sở dữ liệu Settings, 
        hoặc trả về giá trị mặc định của lớp AppConfig
        
        Args:
            key (str): Tên key cấu hình
            default: Giá trị mặc định nếu không tìm thấy
        
        Returns:
            Giá trị cấu hình
        """
        # Thứ tự ưu tiên: Biến môi trường -> Cơ sở dữ liệu -> Giá trị mặc định trong class
        # 1. Kiểm tra biến môi trường
        env_value = os.environ.get(key)
        if env_value is not None:
            return env_value
        
        # 2. Kiểm tra trong Settings model (cần import lazy để tránh circular import)
        try:
            from ..models import Setting
            db_value = Setting.get_value(key)
            if db_value is not None:
                return db_value
        except:
            pass
        
        # 3. Lấy từ thuộc tính của lớp hoặc giá trị mặc định
        return getattr(cls, key, default)


class PostgreSQLConfig:
    """
    Lớp chứa các cấu hình cụ thể cho PostgreSQL
    ---
    Các cấu hình này liên quan đến việc tối ưu và sử dụng các tính năng
    đặc biệt của PostgreSQL trong ứng dụng CleanHome.
    """
    
    # Tên các kiểu ENUM đã định nghĩa trong cơ sở dữ liệu
    USER_ROLE_ENUM = "user_role"
    USER_STATUS_ENUM = "user_status" 
    SERVICE_STATUS_ENUM = "service_status"
    BOOKING_STATUS_ENUM = "booking_status"
    PAYMENT_STATUS_ENUM = "payment_status"
    PAYMENT_METHOD_ENUM = "payment_method" 
    DISCOUNT_TYPE_ENUM = "discount_type"
    SCHEDULE_STATUS_ENUM = "schedule_status"
    TRANSACTION_STATUS_ENUM = "transaction_status"
    
    # Các giá trị mặc định cho UUID
    DEFAULT_UUID_VERSION = 4  # Phiên bản UUID sử dụng
    
    # Các cài đặt postgresql.conf gợi ý
    SUGGESTED_CONFIG = {
        "max_connections": 100,
        "shared_buffers": "1GB",
        "effective_cache_size": "3GB",
        "work_mem": "32MB",
        "maintenance_work_mem": "256MB",
        "random_page_cost": 1.1,
        "effective_io_concurrency": 200,
        "wal_buffers": "16MB",
        "default_statistics_target": 100,
    }
    
    # Thông tin về schema
    DATABASE_SCHEMA = "public"  # Schema mặc định
    
    # Cấu hình kết nối
    CONNECTION_POOLING = {
        "min_size": 5,
        "max_size": 20,
        "max_overflow": 10,
        "pool_timeout": 30,  # seconds
        "pool_recycle": 1800,  # seconds (30 minutes)
        "echo": False
    }
    
    # SQL Queries tối ưu
    OPTIMIZATION_TIPS = {
        "use_index_scan": "Sử dụng EXPLAIN ANALYZE để kiểm tra query plan",
        "avoid_full_table_scan": "Thêm chỉ mục cho các cột thường xuyên tìm kiếm",
        "use_composite_index": "Tạo chỉ mục ghép cho các cột thường xuyên tìm kiếm cùng nhau",
        "pagination": "Sử dụng LIMIT và OFFSET cho phân trang"
    }
