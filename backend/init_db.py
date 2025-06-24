"""Database initialization script for CleanHome"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_database():
    """Create the PostgreSQL database if it doesn't exist"""
    
    # Database connection parameters
    db_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', '5432')
    }
    
    db_name = os.getenv('DB_NAME', 'cleanhome')
    
    try:
        # Connect to PostgreSQL server (not to a specific database)
        print("Connecting to PostgreSQL server...")
        connection = psycopg2.connect(**db_params)
        connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = connection.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Creating database '{db_name}'...")
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"Database '{db_name}' created successfully!")
        else:
            print(f"Database '{db_name}' already exists.")
        
        cursor.close()
        connection.close()
        
        # Now connect to the specific database to create extensions
        db_params['database'] = db_name
        connection = psycopg2.connect(**db_params)
        connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = connection.cursor()
        
        # Create UUID extension if not exists
        print("Creating UUID extension...")
        cursor.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        print("UUID extension created/verified.")
        
        cursor.close()
        connection.close()
        
        print("Database setup completed successfully!")
        return True
        
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_connection():
    """Test database connection"""
    
    db_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', '5432'),
        'database': os.getenv('DB_NAME', 'cleanhome')
    }
    
    try:
        print("Testing database connection...")
        connection = psycopg2.connect(**db_params)
        cursor = connection.cursor()
        
        # Test query
        cursor.execute('SELECT version()')
        version = cursor.fetchone()
        print(f"PostgreSQL version: {version[0]}")
        
        cursor.execute('SELECT current_database()')
        current_db = cursor.fetchone()
        print(f"Connected to database: {current_db[0]}")
        
        cursor.close()
        connection.close()
        
        print("Database connection test successful!")
        return True
        
    except psycopg2.Error as e:
        print(f"Database connection failed: {e}")
        return False

if __name__ == '__main__':
    print("=== CleanHome Database Setup ===")
    
    # Create database
    if create_database():
        # Test connection
        test_connection()
    else:
        print("Database setup failed!")
