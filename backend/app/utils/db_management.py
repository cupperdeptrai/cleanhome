"""
Các công cụ hỗ trợ quản lý cơ sở dữ liệu PostgreSQL.
Cung cấp các hàm để tạo, kiểm tra và quản lý cơ sở dữ liệu.
"""
import os
import subprocess
import psycopg2
from psycopg2 import sql
from flask import current_app
from .config import AppConfig
import logging

logger = logging.getLogger(__name__)

def get_db_connection_params():
    """
    Lấy các thông số kết nối cơ sở dữ liệu từ biến môi trường.
    
    Returns:
        dict: Dictionary chứa các thông số kết nối
    """
    return {
        'dbname': os.environ.get('DB_NAME', 'cleanhome'),
        'user': os.environ.get('DB_USER', 'postgres'),
        'password': os.environ.get('DB_PASSWORD', '5432'),
        'host': os.environ.get('DB_HOST', 'localhost'),
        'port': os.environ.get('DB_PORT', '5432')
    }

def test_connection():
    """
    Kiểm tra kết nối đến cơ sở dữ liệu PostgreSQL.
    
    Returns:
        tuple: (bool, str) - (Kết nối thành công?, Thông báo)
    """
    params = get_db_connection_params()
    
    try:
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        cur.execute('SELECT version();')
        version = cur.fetchone()[0]
        cur.close()
        conn.close()
        return True, f"Kết nối thành công: {version}"
    except Exception as e:
        return False, f"Lỗi kết nối: {str(e)}"

def create_database():
    """
    Tạo cơ sở dữ liệu nếu chưa tồn tại.
    
    Returns:
        tuple: (bool, str) - (Thành công?, Thông báo)
    """
    params = get_db_connection_params()
    db_name = params.pop('dbname')
    
    try:
        # Kết nối đến PostgreSQL server (không chỉ định database)
        conn = psycopg2.connect(**params, dbname='postgres')
        conn.autocommit = True
        cur = conn.cursor()
        
        # Kiểm tra xem database đã tồn tại chưa
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (db_name,))
        exists = cur.fetchone()
        
        if not exists:
            # Tạo database mới
            cur.execute(sql.SQL("CREATE DATABASE {} ENCODING 'UTF8'").format(sql.Identifier(db_name)))
            message = f"Đã tạo cơ sở dữ liệu '{db_name}'"
        else:
            message = f"Cơ sở dữ liệu '{db_name}' đã tồn tại"
        
        cur.close()
        conn.close()
        return True, message
    except Exception as e:
        return False, f"Lỗi khi tạo cơ sở dữ liệu: {str(e)}"

def backup_database(backup_file=None):
    """
    Sao lưu cơ sở dữ liệu sử dụng pg_dump.
    
    Args:
        backup_file (str, optional): Đường dẫn file sao lưu. Mặc định là cleanhome_backup.sql trong thư mục hiện tại.
    
    Returns:
        tuple: (bool, str) - (Thành công?, Thông báo)
    """
    params = get_db_connection_params()
    
    if backup_file is None:
        backup_file = os.path.join(os.getcwd(), 'backup', f"{params['dbname']}_backup.sql")
    
    # Đảm bảo thư mục backup tồn tại
    os.makedirs(os.path.dirname(backup_file), exist_ok=True)
    
    try:
        # Sử dụng pg_dump để sao lưu
        cmd = [
            'pg_dump',
            '-h', params['host'],
            '-p', params['port'],
            '-U', params['user'],
            '-F', 'c',  # Custom format
            '-b',  # Include large objects
            '-v',  # Verbose
            '-f', backup_file,
            params['dbname']
        ]
        
        # Thiết lập biến môi trường PGPASSWORD
        env = os.environ.copy()
        env['PGPASSWORD'] = params['password']
        
        # Thực thi lệnh
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            return True, f"Sao lưu thành công vào file {backup_file}"
        else:
            return False, f"Lỗi sao lưu: {result.stderr}"
    except Exception as e:
        return False, f"Lỗi khi sao lưu cơ sở dữ liệu: {str(e)}"

def restore_database(backup_file):
    """
    Khôi phục cơ sở dữ liệu từ file sao lưu.
    
    Args:
        backup_file (str): Đường dẫn file sao lưu.
    
    Returns:
        tuple: (bool, str) - (Thành công?, Thông báo)
    """
    if not os.path.exists(backup_file):
        return False, f"File sao lưu {backup_file} không tồn tại"
    
    params = get_db_connection_params()
    
    try:
        # Sử dụng pg_restore để khôi phục
        cmd = [
            'pg_restore',
            '-h', params['host'],
            '-p', params['port'],
            '-U', params['user'],
            '-d', params['dbname'],
            '-v',  # Verbose
            '--clean',  # Clean (drop) database objects before recreating
            backup_file
        ]
        
        # Thiết lập biến môi trường PGPASSWORD
        env = os.environ.copy()
        env['PGPASSWORD'] = params['password']
        
        # Thực thi lệnh
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            return True, "Khôi phục cơ sở dữ liệu thành công"
        else:
            return False, f"Lỗi khôi phục: {result.stderr}"
    except Exception as e:
        return False, f"Lỗi khi khôi phục cơ sở dữ liệu: {str(e)}"

def initialize_database(app):
    """
    Khởi tạo cơ sở dữ liệu cho ứng dụng Flask.
    
    Args:
        app: Flask application instance
    
    Returns:
        bool: True nếu thành công, False nếu thất bại
    """
    with app.app_context():
        try:
            # Kiểm tra kết nối
            success, message = test_connection()
            if not success:
                app.logger.error(message)
                
                # Thử tạo database
                db_success, db_message = create_database()
                app.logger.info(db_message)
                
                if not db_success:
                    return False
                
                # Kiểm tra lại kết nối sau khi tạo database
                success, message = test_connection()
                if not success:
                    app.logger.error(f"Vẫn không thể kết nối sau khi tạo database: {message}")
                    return False
            
            app.logger.info(message)
            
            # Các tác vụ khởi tạo khác nếu cần
            # ...
            
            return True
        except Exception as e:
            app.logger.error(f"Lỗi khởi tạo database: {str(e)}")
            return False
