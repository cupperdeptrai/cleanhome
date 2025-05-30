"""
Script khởi tạo cơ sở dữ liệu và thêm dữ liệu mẫu
"""
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv
import logging

# Thiết lập logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('db_init.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Load biến môi trường từ .env
load_dotenv()

# Đường dẫn đến file SQL
SQL_FILE_PATH = os.path.join('app', 'schemas', 'database.sql')

# Thông tin kết nối database
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "5432")
DB_NAME = os.environ.get("DB_NAME", "cleanhome_dev")

def create_database():
    """Tạo cơ sở dữ liệu nếu chưa tồn tại"""
    try:
        # Kết nối đến PostgreSQL server
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Kiểm tra xem database đã tồn tại chưa
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (DB_NAME,))
        exists = cursor.fetchone()
        
        if not exists:
            # Tạo database mới
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            logger.info(f"Đã tạo cơ sở dữ liệu {DB_NAME}")
        else:
            logger.info(f"Cơ sở dữ liệu {DB_NAME} đã tồn tại")
            
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Lỗi khi tạo cơ sở dữ liệu: {str(e)}")
        return False

def execute_sql_file():
    """Thực thi file SQL để tạo bảng và thêm dữ liệu mẫu"""
    try:
        # Đọc nội dung file SQL
        with open(SQL_FILE_PATH, 'r', encoding='utf-8') as file:
            sql_script = file.read()
        
        # Kết nối đến database
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = conn.cursor()
        
        # Thực thi script SQL
        cursor.execute(sql_script)
        
        # Commit các thay đổi
        conn.commit()
        
        cursor.close()
        conn.close()
        
        logger.info("Đã thực thi file SQL thành công. Bảng và dữ liệu mẫu đã được tạo.")
        return True
    except Exception as e:
        logger.error(f"Lỗi khi thực thi file SQL: {str(e)}")
        return False

def main():
    """Hàm chính để khởi tạo cơ sở dữ liệu"""
    logger.info("Bắt đầu khởi tạo cơ sở dữ liệu...")
    
    # Tạo database nếu chưa tồn tại
    if not create_database():
        logger.error("Không thể tạo cơ sở dữ liệu. Kết thúc.")
        return
    
    # Thực thi file SQL
    if not execute_sql_file():
        logger.error("Không thể thực thi file SQL. Kết thúc.")
        return
    
    logger.info("Khởi tạo cơ sở dữ liệu thành công!")

if __name__ == "__main__":
    main()
