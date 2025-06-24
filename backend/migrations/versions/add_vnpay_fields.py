"""Add VNPay fields to payments table

Revision ID: add_vnpay_fields
Revises: 
Create Date: 2025-06-24 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_vnpay_fields'
down_revision = None  # Thay đổi thành revision trước đó nếu có
branch_labels = None
depends_on = None


def upgrade():
    """Thêm các trường VNPay vào bảng payments"""
    # Thêm các cột mới cho VNPay
    op.add_column('payments', sa.Column('vnpay_transaction_no', sa.String(length=50), nullable=True))
    op.add_column('payments', sa.Column('vnpay_response_code', sa.String(length=10), nullable=True))
    op.add_column('payments', sa.Column('vnpay_bank_code', sa.String(length=20), nullable=True))
    
    # Cập nhật payment_method enum để bao gồm vnpay
    # PostgreSQL yêu cầu ALTER TYPE để thêm enum value
    op.execute("ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'vnpay'")
    
    # Cập nhật status enum để bao gồm processing
    op.execute("ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'processing'")


def downgrade():
    """Xóa các trường VNPay"""
    op.drop_column('payments', 'vnpay_bank_code')
    op.drop_column('payments', 'vnpay_response_code')
    op.drop_column('payments', 'vnpay_transaction_no')
    
    # Lưu ý: Không thể xóa enum values trong PostgreSQL một cách dễ dàng
    # Cần tạo lại enum type nếu muốn xóa values
