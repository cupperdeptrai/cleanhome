"""
API endpoints cho báo cáo và thống kê
Đồng bộ với schema SQL PostgreSQL  
Bảng: bookings, payments, services, users
Author: CleanHome Team
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import func, text
from datetime import datetime, timedelta
from app.extensions import db
from app.models.booking import Booking
# from app.models.payment import Payment
from app.models.service import Service
from app.models.user import User
from app.utils.helpers import admin_required

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required
def get_reports():
    """
    Lấy báo cáo tổng quan hệ thống (chỉ dành cho admin)
    - Thống kê doanh thu, booking, dịch vụ
    - Đồng bộ dữ liệu từ PostgreSQL
    """
    try:
        # Thống kê tổng số booking
        total_bookings = Booking.query.count()
        
        # Thống kê doanh thu (từ bảng payments với status = 'completed')
        # total_revenue = db.session.query(func.sum(Payment.amount)).filter(
        #     Payment.status == 'completed'
        # ).scalar() or 0
        
        # Thống kê người dùng
        total_customers = User.query.filter_by(role='customer').count()
        total_staff = User.query.filter_by(role='staff').count()
        
        # Thống kê dịch vụ
        total_services = Service.query.filter_by(status='active').count()
        
        return jsonify({
            'status': 'success',
            'reports': {
                'bookings': {
                    'total': total_bookings,
                    'description': 'Tổng số lượt đặt lịch'
                },
                'revenue': {
                    'total': 0,  # Revenue calculation disabled (Payment model missing)
                    'description': 'Tổng doanh thu (VNĐ)'
                },
                'users': {
                    'customers': total_customers,
                    'staff': total_staff,
                    'description': 'Số lượng người dùng'
                },
                'services': {
                    'active': total_services,
                    'description': 'Số dịch vụ đang hoạt động'
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error', 
            'message': f'Lỗi khi lấy báo cáo: {str(e)}'
        }), 500