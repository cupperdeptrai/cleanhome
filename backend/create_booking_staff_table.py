"""Script để tạo bảng booking_staff"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db

def create_booking_staff_table():
    """Tạo bảng booking_staff nếu chưa tồn tại"""
    app = create_app()
    
    with app.app_context():
        try:            # Tạo bảng booking_staff  
            with db.engine.connect() as conn:
                conn.execute(db.text("""
                    CREATE TABLE IF NOT EXISTS booking_staff (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        booking_id UUID NOT NULL,
                        staff_id UUID NOT NULL,
                        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        assigned_by UUID,
                        notes TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                        FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
                        UNIQUE(booking_id, staff_id)
                    );
                """))
                
                # Tạo indexes
                conn.execute(db.text("""
                    CREATE INDEX IF NOT EXISTS idx_booking_staff_booking_id ON booking_staff(booking_id);
                    CREATE INDEX IF NOT EXISTS idx_booking_staff_staff_id ON booking_staff(staff_id);
                """))
                
                conn.commit()
            
            print("✅ Tạo bảng booking_staff thành công!")
            
        except Exception as e:
            print(f"❌ Lỗi khi tạo bảng: {str(e)}")

if __name__ == '__main__':
    create_booking_staff_table()
