from . import db

def init_db():
    """Kiểm tra kết nối và khởi tạo database nếu cần"""
    try:
        # Kiểm tra kết nối đến database
        with db.engine.connect() as connection:
            connection.execute("SELECT 1")
        print("Kết nối database thành công")
    except Exception as e:
        print(f"Lỗi kết nối database: {e}")
        raise