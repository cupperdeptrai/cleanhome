#!/usr/bin/env python3
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User
from datetime import datetime
from werkzeug.security import generate_password_hash

def create_test_user():
    app = create_app()
    
    with app.app_context():
        # Delete existing test user if any
        existing = User.query.filter_by(email='test@example.com').first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            print('🗑️ Deleted existing test user')
        
        # Create new test user
        user = User()
        user.name = 'Test User'
        user.email = 'test@example.com'
        user.phone = '0123456789'
        user.password = generate_password_hash('password123')
        user.role = 'customer'
        user.status = 'active'
        user.created_at = datetime.utcnow()
        user.updated_at = datetime.utcnow()
        
        try:
            db.session.add(user)
            db.session.commit()
            
            print('✅ Test user created successfully!')
            print(f'📧 Email: {user.email}')
            print(f'📱 Phone: {user.phone}')
            print(f'🆔 ID: {user.id}')
            print('🔑 Password: password123')
            
        except Exception as e:
            db.session.rollback()
            print(f'❌ Error creating user: {e}')

if __name__ == '__main__':
    create_test_user()
