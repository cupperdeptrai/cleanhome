"""
Script để khởi tạo cơ sở dữ liệu PostgreSQL cho ứng dụng CleanHome.
Tạo cơ sở dữ liệu và các bảng cần thiết dựa theo thông tin trong file .env.

Cách sử dụng:
    python init_database.py [--create] [--reset]

Tham số:
    --create: Tạo cơ sở dữ liệu nếu chưa tồn tại
    --reset: Xóa và tạo lại cơ sở dữ liệu (cẩn thận, dữ liệu sẽ bị mất)
"""
import os
import sys
import argparse
import subprocess
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

# Load biến môi trường từ file .env
load_dotenv()

def get_connection_params():
    """Lấy thông tin kết nối từ biến môi trường"""
    return {
        'dbname': os.environ.get('DB_NAME', 'cleanhome'),
        'user': os.environ.get('DB_USER', 'postgres'),
        'password': os.environ.get('DB_PASSWORD', '5432'),
        'host': os.environ.get('DB_HOST', 'localhost'),
        'port': os.environ.get('DB_PORT', '5432')
    }

def create_database():
    """Tạo cơ sở dữ liệu PostgreSQL nếu chưa tồn tại"""
    params = get_connection_params()
    dbname = params.pop('dbname')
    
    # Kết nối đến PostgreSQL mà không chỉ định cơ sở dữ liệu
    conn = psycopg2.connect(**params, dbname='postgres')
    conn.autocommit = True
    cursor = conn.cursor()
    
    try:
        # Kiểm tra xem cơ sở dữ liệu đã tồn tại chưa
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (dbname,))
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Đang tạo cơ sở dữ liệu '{dbname}'...")
            cursor.execute(sql.SQL("CREATE DATABASE {} ENCODING 'UTF8'").format(sql.Identifier(dbname)))
            print(f"Đã tạo cơ sở dữ liệu '{dbname}' thành công!")
        else:
            print(f"Cơ sở dữ liệu '{dbname}' đã tồn tại.")
    except Exception as e:
        print(f"Lỗi khi tạo cơ sở dữ liệu: {e}")
    finally:
        cursor.close()
        conn.close()

def drop_database():
    """Xóa cơ sở dữ liệu hiện tại"""
    params = get_connection_params()
    dbname = params.pop('dbname')
    
    # Kết nối đến PostgreSQL mà không chỉ định cơ sở dữ liệu
    conn = psycopg2.connect(**params, dbname='postgres')
    conn.autocommit = True
    cursor = conn.cursor()
    
    try:
        # Kiểm tra xem cơ sở dữ liệu đã tồn tại chưa
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (dbname,))
        exists = cursor.fetchone()
        
        if exists:
            print(f"Đang xóa cơ sở dữ liệu '{dbname}'...")
            
            # Ngắt kết nối tất cả các client
            cursor.execute(
                sql.SQL("""
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = %s
                  AND pid <> pg_backend_pid()
                """), 
                (dbname,)
            )
            
            # Xóa cơ sở dữ liệu
            cursor.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(sql.Identifier(dbname)))
            print(f"Đã xóa cơ sở dữ liệu '{dbname}' thành công!")
        else:
            print(f"Cơ sở dữ liệu '{dbname}' không tồn tại.")
    except Exception as e:
        print(f"Lỗi khi xóa cơ sở dữ liệu: {e}")
    finally:
        cursor.close()
        conn.close()

def test_connection():
    """Kiểm tra kết nối đến cơ sở dữ liệu"""
    params = get_connection_params()
    
    try:
        print(f"Đang kết nối đến PostgreSQL với thông số: {params}")
        conn = psycopg2.connect(**params)
        cursor = conn.cursor()
        
        # Kiểm tra phiên bản PostgreSQL
        cursor.execute('SELECT version();')
        version = cursor.fetchone()[0]
        print(f"Kết nối thành công! Phiên bản PostgreSQL: {version}")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Lỗi kết nối: {e}")
        return False

def setup_flask_migrations():
    """Thiết lập Flask-Migrate để quản lý migration"""
    try:
        print("Đang thiết lập Flask-Migrate...")
        subprocess.run(["flask", "db", "init"], check=True)
        print("Đã khởi tạo Flask-Migrate thành công!")
        
        subprocess.run(["flask", "db", "migrate", "-m", "Initial migration"], check=True)
        print("Đã tạo migration thành công!")
        
        subprocess.run(["flask", "db", "upgrade"], check=True)
        print("Đã cập nhật cơ sở dữ liệu thành công!")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"Lỗi khi thiết lập Flask-Migrate: {e}")
        return False

def main():
    """Hàm chính của script"""
    parser = argparse.ArgumentParser(description='Khởi tạo cơ sở dữ liệu cho ứng dụng CleanHome')
    parser.add_argument('--create', action='store_true', help='Tạo cơ sở dữ liệu nếu chưa tồn tại')
    parser.add_argument('--reset', action='store_true', help='Xóa và tạo lại cơ sở dữ liệu (cẩn thận, dữ liệu sẽ bị mất)')
    
    args = parser.parse_args()
    
    print("=== Khởi tạo cơ sở dữ liệu CleanHome ===")
    
    if args.reset:
        confirm = input("CẢNH BÁO: Bạn sắp XÓA và TẠO LẠI cơ sở dữ liệu. Tất cả dữ liệu sẽ bị mất!\nNhập 'yes' để xác nhận: ")
        if confirm.lower() != 'yes':
            print("Hủy thao tác.")
            return
        
        drop_database()
        create_database()
    elif args.create:
        create_database()
    
    # Kiểm tra kết nối
    if test_connection():
        # Thiết lập Flask migrations
        setup_flask_migrations()
    else:
        print("Không thể thiết lập migrations do lỗi kết nối cơ sở dữ liệu.")

if __name__ == "__main__":
    main()
