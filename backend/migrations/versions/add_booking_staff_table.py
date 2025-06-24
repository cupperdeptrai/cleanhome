"""Add booking_staff table for multiple staff assignment

Revision ID: add_booking_staff
Revises: 9e7b543d08a3
Create Date: 2025-06-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = 'add_booking_staff'
down_revision = '9e7b543d08a3'
branch_labels = None
depends_on = None


def upgrade():
    """Tạo bảng booking_staff để hỗ trợ phân công nhiều nhân viên cho 1 booking"""
    op.create_table(
        'booking_staff',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('booking_id', UUID(as_uuid=True), nullable=False),
        sa.Column('staff_id', UUID(as_uuid=True), nullable=False),
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.func.current_timestamp()),
        sa.Column('assigned_by', UUID(as_uuid=True), nullable=True),  # Admin user ID who assigned
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.current_timestamp()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.current_timestamp()),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['staff_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['assigned_by'], ['users.id'], ondelete='SET NULL'),
        
        # Unique constraint to prevent duplicate assignments
        sa.UniqueConstraint('booking_id', 'staff_id', name='uq_booking_staff')
    )
    
    # Create indexes
    op.create_index('idx_booking_staff_booking_id', 'booking_staff', ['booking_id'])
    op.create_index('idx_booking_staff_staff_id', 'booking_staff', ['staff_id'])
    
    # Create trigger for updated_at
    op.execute("""
        CREATE TRIGGER update_booking_staff_timestamp 
        BEFORE UPDATE ON booking_staff 
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    """)


def downgrade():
    """Xóa bảng booking_staff"""
    op.drop_table('booking_staff')
