from sqlalchemy import text
from flask import current_app

def init_db():
    """
    Hàm này dùng để kiểm tra kết nối cơ sở dữ liệu PostgreSQL
    và thực hiện các thiết lập ban đầu nếu cần.
    """    try:
        # Lấy db từ extensions đã được đăng ký với app
        from .extensions import db
        
        # Sử dụng engine của SQLAlchemy để kết nối và thực thi câu lệnh kiểm tra
        with db.engine.connect() as connection:
            # Thực thi câu lệnh SELECT đơn giản để kiểm tra kết nối
            result = connection.execute(text("SELECT version()"))
            version = result.scalar()
            current_app.logger.info(f"Connected to PostgreSQL successfully. Version: {version}")
            
            # Kiểm tra schema và các bảng
            connection.execute(text("SELECT 1 FROM information_schema.tables LIMIT 1"))
            connection.commit()
            
        current_app.logger.info("Database check successful.")
        return True    except Exception as e:
        current_app.logger.error(f"Database connection or execution error: {e}")
        raise  # Re-raise exception để xử lý ở cấp cao hơn

