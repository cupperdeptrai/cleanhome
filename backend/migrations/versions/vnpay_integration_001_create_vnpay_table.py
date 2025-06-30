"""Tạo bảng vnpay_transactions cho thanh toán VNPAY

Revision ID: vnpay_integration_001
Revises: 6bd495384e90
Create Date: 2025-06-30

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'vnpay_integration_001'
down_revision = '6bd495384e90'
branch_labels = None
depends_on = None


def upgrade():
    # Tạo bảng vnpay_transactions nếu chưa tồn tại
    op.execute("""
        DROP TABLE IF EXISTS vnpay_transactions CASCADE;
        CREATE TABLE vnpay_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            vnp_amount DECIMAL(15, 2) NOT NULL,
            vnp_bankcode VARCHAR(50),
            vnp_banktranno VARCHAR(255),
            vnp_cardtype VARCHAR(50),
            vnp_orderinfo VARCHAR(255),
            vnp_paydate VARCHAR(20),
            vnp_responsecode VARCHAR(2),
            vnp_tmncode VARCHAR(20),
            vnp_transactionno VARCHAR(255),
            vnp_transactionstatus VARCHAR(2),
            vnp_txnref VARCHAR(255) NOT NULL UNIQUE,
            vnp_securehash VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Tạo các indexes để tối ưu hiệu suất
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_vnpay_transactions_booking_id ON vnpay_transactions(booking_id);
    """)
    
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_vnpay_transactions_user_id ON vnpay_transactions(user_id);
    """)
    
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_vnpay_transactions_txn_ref ON vnpay_transactions(vnp_txnref);
    """)
    
    # Thêm trigger để tự động cập nhật updated_at
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_vnpay_transactions_timestamp') THEN
                CREATE TRIGGER update_vnpay_transactions_timestamp 
                BEFORE UPDATE ON vnpay_transactions 
                FOR EACH ROW EXECUTE FUNCTION update_timestamp();
            END IF;
        END $$;
    """)


def downgrade():
    # Xóa trigger
    op.execute("DROP TRIGGER IF EXISTS update_vnpay_transactions_timestamp ON vnpay_transactions;")
    
    # Xóa indexes
    op.execute("DROP INDEX IF EXISTS idx_vnpay_transactions_txn_ref;")
    op.execute("DROP INDEX IF EXISTS idx_vnpay_transactions_user_id;")
    op.execute("DROP INDEX IF EXISTS idx_vnpay_transactions_booking_id;")
    
    # Xóa bảng
    op.execute("DROP TABLE IF EXISTS vnpay_transactions CASCADE;")
