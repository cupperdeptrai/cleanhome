-- Xóa các bảng và kiểu dữ liệu cũ nếu tồn tại
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS staff_schedules CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS booking_promotions CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS booking_items CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS user_status;
DROP TYPE IF EXISTS service_status;
DROP TYPE IF EXISTS booking_status;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS discount_type;
DROP TYPE IF EXISTS schedule_status;
DROP TYPE IF EXISTS transaction_status;

-- Tạo các kiểu ENUM
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'locked');
CREATE TYPE service_status AS ENUM ('active', 'inactive');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE schedule_status AS ENUM ('available', 'booked', 'off');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Tạo bảng users (người dùng)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  avatar TEXT,
  role user_role DEFAULT 'customer',
  status user_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng service_categories (danh mục dịch vụ)
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image TEXT,
  status service_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng services (dịch vụ)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL,
  image TEXT,
  status service_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL
);

-- Tạo bảng bookings (đơn đặt lịch)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  staff_id UUID,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status booking_status DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status payment_status DEFAULT 'unpaid',
  payment_method payment_method,
  notes TEXT,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tạo bảng booking_items (chi tiết đơn đặt lịch)
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  service_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Tạo bảng promotions (khuyến mãi)
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  status service_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng booking_promotions (áp dụng khuyến mãi cho đơn hàng)
CREATE TABLE booking_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  promotion_id UUID NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);

-- Tạo bảng reviews (đánh giá)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  staff_id UUID,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tạo bảng staff_schedules (lịch làm việc của nhân viên)
CREATE TABLE staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status schedule_status DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tạo bảng payments (thanh toán)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  transaction_id VARCHAR(100),
  status transaction_status DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Tạo bảng notifications (thông báo)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tạo bảng settings (cài đặt hệ thống)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo trigger ghi log đăng ký người dùng
CREATE OR REPLACE FUNCTION log_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Người dùng mới đã đăng ký: % (%, vai trò: %)', NEW.name, NEW.email, NEW.role;
  IF NEW.role = 'user' THEN
    RAISE WARNING 'Cảnh báo: Người dùng % (%) có vai trò "user". Frontend cần sửa thành "customer".';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_new_user_registration_after_insert ON users;
CREATE TRIGGER log_new_user_registration_after_insert
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION log_new_user_registration();

-- Chèn dữ liệu mẫu
INSERT INTO users (id, name, email, password, phone, role, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Admin', 'admin@cleanhome.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0901234567', 'admin', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'Nhân viên 1', 'staff1@cleanhome.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0912345678', 'staff', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Nhân viên 2', 'staff2@cleanhome.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0923456789', 'staff', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Khách hàng 1', 'customer1@example.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0934567890', 'customer', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'Khách hàng 2', 'customer2@example.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0945678901', 'customer', 'active');

INSERT INTO service_categories (id, name, description, status) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Vệ sinh nhà cửa', 'Các dịch vụ vệ sinh nhà cửa, căn hộ', 'active'),
('550e8400-e29b-41d4-a716-446655440006', 'Vệ sinh văn phòng', 'Các dịch vụ vệ sinh văn phòng, công ty', 'active'),
('550e8400-e29b-41d4-a716-446655440007', 'Vệ sinh sau xây dựng', 'Dịch vụ vệ sinh sau khi hoàn thành xây dựng, sửa chữa', 'active'),
('550e8400-e29b-41d4-a716-446655440008', 'Vệ sinh định kỳ', 'Dịch vụ vệ sinh theo lịch định kỳ', 'active');

INSERT INTO services (id, category_id, name, description, price, duration, status) VALUES
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'Vệ sinh nhà cơ bản', 'Dịch vụ vệ sinh cơ bản cho căn hộ dưới 80m2', 300000, 120, 'active'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'Vệ sinh nhà toàn diện', 'Dịch vụ vệ sinh toàn diện cho căn hộ dưới 80m2', 500000, 240, 'active'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440006', 'Vệ sinh văn phòng nhỏ', 'Dịch vụ vệ sinh cho văn phòng dưới 100m2', 600000, 180, 'active'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440006', 'Vệ sinh văn phòng lớn', 'Dịch vụ vệ sinh cho văn phòng trên 100m2', 1000000, 300, 'active'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440007', 'Vệ sinh sau xây dựng nhỏ', 'Dịch vụ vệ sinh sau sửa chữa nhỏ', 800000, 240, 'active'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440007', 'Vệ sinh sau xây dựng lớn', 'Dịch vụ vệ sinh sau xây dựng, sửa chữa lớn', 1500000, 480, 'active'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440008', 'Vệ sinh hàng tuần', 'Dịch vụ vệ sinh định kỳ hàng tuần', 250000, 120, 'active'),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440008', 'Vệ sinh hàng tháng', 'Dịch vụ vệ sinh định kỳ hàng tháng', 400000, 180, 'active');

INSERT INTO promotions (id, code, name, description, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, usage_limit, status) VALUES
('550e8400-e29b-41d4-a716-446655440017', 'WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho khách hàng lần đầu sử dụng dịch vụ', 'percentage', 10, 0, 100000, '2023-01-01', '2023-12-31', 100, 'active'),
('550e8400-e29b-41d4-a716-446655440018', 'SUMMER25', 'Khuyến mãi hè', 'Giảm 25% cho dịch vụ vệ sinh nhà cửa', 'percentage', 25, 500000, 200000, '2023-06-01', '2023-08-31', 50, 'active'),
('550e8400-e29b-41d4-a716-446655440019', 'FIXED100K', 'Giảm 100K', 'Giảm trực tiếp 100K cho hóa đơn từ 500K', 'fixed', 100000, 500000, 100000, '2023-01-01', '2023-12-31', 200, 'active');

INSERT INTO settings (id, key, value, description) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'company_name', 'CleanHome', 'Tên công ty'),
('550e8400-e29b-41d4-a716-446655440021', 'company_address', '123 Đường ABC, Quận 1, TP. HCM', 'Địa chỉ công ty'),
('550e8400-e29b-41d4-a716-446655440022', 'company_phone', '0123 456 789', 'Số điện thoại công ty'),
('550e8400-e29b-41d4-a716-446655440023', 'company_email', 'info@cleanhome.com', 'Email công ty'),
('550e8400-e29b-41d4-a716-446655440024', 'working_hours', '08:00-18:00', 'Giờ làm việc'),
('550e8400-e29b-41d4-a716-446655440025', 'working_days', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', 'Ngày làm việc'),
('550e8400-e29b-41d4-a716-446655440026', 'currency', 'VND', 'Đơn vị tiền tệ'),
('550e8400-e29b-41d4-a716-446655440027', 'date_format', 'DD/MM/YYYY', 'Định dạng ngày'),
('550e8400-e29b-41d4-a716-446655440028', 'time_format', 'HH:mm', 'Định dạng giờ');