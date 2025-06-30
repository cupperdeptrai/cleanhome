-- Tạo cơ sở dữ liệu cho ứng dụng CleanHome

-- Tạo các kiểu ENUM
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked', 'pending');
CREATE TYPE service_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'pending', 'paid', 'refunded', 'failed');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay', 'vnpay');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE schedule_status AS ENUM ('available', 'booked', 'off');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE activity_type AS ENUM ('login', 'logout', 'register', 'booking', 'payment', 'profile_update', 'password_change');
CREATE TYPE notification_type AS ENUM ('booking', 'payment', 'promotion', 'system', 'reminder');
CREATE TYPE notification_channel AS ENUM ('app', 'email', 'sms');

-- Tạo bảng users (người dùng)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  avatar TEXT,
  bio TEXT,
  role user_role DEFAULT 'customer',
  status user_status DEFAULT 'active',
  email_verified_at TIMESTAMP WITH TIME ZONE,
  phone_verified_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Bảng địa chỉ người dùng
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  address_name VARCHAR(100),
  recipient_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT NOT NULL,
  district VARCHAR(100),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng khu vực phục vụ
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  status service_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng service_categories (danh mục dịch vụ)
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon TEXT,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  status service_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng services (dịch vụ)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  short_description VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  duration INTEGER NOT NULL, -- Thời lượng tính bằng phút
  unit VARCHAR(50) DEFAULT 'Lần', -- Đơn vị dịch vụ (Lần, Giờ, Gói, v.v.)
  thumbnail TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  min_area DECIMAL(10, 2), -- Diện tích tối thiểu (m2)
  max_area DECIMAL(10, 2), -- Diện tích tối đa (m2)
  price_per_area DECIMAL(10, 2), -- Giá theo diện tích (nếu có)
  staff_count INTEGER DEFAULT 1, -- Số nhân viên cần thiết
  status service_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL
);

-- Bảng khu vực áp dụng dịch vụ
CREATE TABLE service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL,
  area_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
  UNIQUE(service_id, area_id)
);

-- Tạo bảng bookings (đơn đặt lịch)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  address_id UUID,
  staff_id UUID,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  end_time TIME,
  status booking_status DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status payment_status DEFAULT 'unpaid',
  payment_method payment_method,
  notes TEXT,
  customer_address TEXT, -- Lưu trực tiếp địa chỉ nếu không sử dụng địa chỉ có sẵn
  area DECIMAL(10, 2), -- Diện tích (m2)
  cancel_reason TEXT,
  cancelled_by UUID,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES user_addresses(id) ON DELETE SET NULL,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tạo bảng booking_items (chi tiết đơn đặt lịch)
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  service_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  notes TEXT,
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
  is_public BOOLEAN DEFAULT TRUE,
  user_specific BOOLEAN DEFAULT FALSE,
  first_time_only BOOLEAN DEFAULT FALSE,
  service_specific BOOLEAN DEFAULT FALSE,
  category_specific BOOLEAN DEFAULT FALSE,
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
  title VARCHAR(255),
  comment TEXT,
  images TEXT[],
  admin_reply TEXT,
  admin_reply_at TIMESTAMP WITH TIME ZONE,
  status review_status DEFAULT 'pending',
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
  booking_id UUID,
  status schedule_status DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Bảng cài đặt thông báo
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type notification_type NOT NULL,
  app_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, notification_type)
);

-- Tạo bảng notifications (thông báo)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type notification_type NOT NULL,
  notification_channel notification_channel NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng lưu nhật ký hoạt động người dùng
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type activity_type NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



-- Tạo bảng settings (cài đặt hệ thống)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  data_type VARCHAR(20) DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng vnpay_transactions để lưu trữ thông tin giao dịch VNPAY
CREATE TABLE vnpay_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vnp_Amount DECIMAL(15, 2) NOT NULL,
  vnp_BankCode VARCHAR(50),
  vnp_BankTranNo VARCHAR(255),
  vnp_CardType VARCHAR(50),
  vnp_OrderInfo VARCHAR(255),
  vnp_PayDate VARCHAR(20),
  vnp_ResponseCode VARCHAR(2),
  vnp_TmnCode VARCHAR(20),
  vnp_TransactionNo VARCHAR(255),
  vnp_TransactionStatus VARCHAR(2),
  vnp_TxnRef VARCHAR(255) NOT NULL UNIQUE,
  vnp_SecureHash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo trigger tự động cập nhật thời gian updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho tất cả các bảng có trường updated_at
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_user_addresses_timestamp BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_services_timestamp BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_service_categories_timestamp BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_bookings_timestamp BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_booking_items_timestamp BEFORE UPDATE ON booking_items FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_promotions_timestamp BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_reviews_timestamp BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_staff_schedules_timestamp BEFORE UPDATE ON staff_schedules FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_payment_methods_timestamp BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_payments_timestamp BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_settings_timestamp BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Tạo trigger ghi log đăng ký người dùng
CREATE OR REPLACE FUNCTION log_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Người dùng mới đã đăng ký: % (%, vai trò: %)', NEW.name, NEW.email, NEW.role;
  
  -- Tự động tạo một bản ghi trong user_activity_logs
  INSERT INTO user_activity_logs (user_id, activity_type, details)
  VALUES (NEW.id, 'register', jsonb_build_object('name', NEW.name, 'email', NEW.email, 'role', NEW.role));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_new_user_registration_after_insert ON users;
CREATE TRIGGER log_new_user_registration_after_insert
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION log_new_user_registration();

-- Trigger khi cập nhật trạng thái đơn đặt lịch
CREATE OR REPLACE FUNCTION update_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Nếu trạng thái chuyển sang 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = CURRENT_TIMESTAMP;
    
    -- Tạo thông báo cho người dùng
    INSERT INTO notifications (user_id, title, message, notification_type, notification_channel, reference_id, reference_type)
    VALUES (
      NEW.user_id, 
      'Dịch vụ hoàn thành', 
      'Dịch vụ của bạn đã được hoàn thành. Vui lòng đánh giá trải nghiệm của bạn.',
      'booking',
      'app',
      NEW.id,
      'booking'
    );
  END IF;
  
  -- Nếu trạng thái chuyển sang 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = CURRENT_TIMESTAMP;
    
    -- Tạo thông báo cho người dùng
    INSERT INTO notifications (user_id, title, message, notification_type, notification_channel, reference_id, reference_type)
    VALUES (
      NEW.user_id, 
      'Đơn đặt lịch đã bị hủy', 
      'Đơn đặt lịch của bạn đã bị hủy. ' || COALESCE(NEW.cancel_reason, ''),
      'booking',
      'app',
      NEW.id,
      'booking'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_booking_status_trigger
BEFORE UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_booking_status();

-- Trigger khi cập nhật trạng thái thanh toán
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Nếu trạng thái chuyển sang 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Cập nhật trạng thái thanh toán trong booking
    UPDATE bookings SET payment_status = 'paid' WHERE id = NEW.booking_id;
    
    -- Tạo thông báo cho người dùng
    INSERT INTO notifications (
      user_id, 
      title, 
      message, 
      notification_type, 
      notification_channel, 
      reference_id, 
      reference_type
    )
    SELECT 
      b.user_id, 
      'Thanh toán thành công', 
      'Thanh toán đơn đặt lịch #' || b.booking_code || ' đã được xác nhận.',
      'payment',
      'app',
      NEW.id,
      'payment'
    FROM bookings b WHERE b.id = NEW.booking_id;
    
    -- Ghi nhật ký giao dịch
    INSERT INTO transaction_logs (
      user_id, 
      booking_id, 
      payment_id, 
      amount, 
      transaction_type, 
      status, 
      description
    )
    SELECT 
      b.user_id, 
      NEW.booking_id, 
      NEW.id, 
      NEW.amount, 
      'payment', 
      'completed', 
      'Thanh toán cho đơn đặt lịch #' || b.booking_code
    FROM bookings b WHERE b.id = NEW.booking_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_status_trigger
AFTER UPDATE OF status ON payments
FOR EACH ROW
EXECUTE FUNCTION update_payment_status();

-- Xóa các bảng không sử dụng: staff, staff_availability, staff_skills, staff_schedules
-- Các bảng này không cần thiết cho hệ thống hiện tại

-- Chèn dữ liệu mẫu
INSERT INTO users (id, name, email, password, phone, role, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Admin', 'admin@cleanhome.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0901234567', 'admin', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'Nhân viên 1', 'staff1@cleanhome.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0912345678', 'staff', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Nhân viên 2', 'staff2@cleanhome.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0923456789', 'staff', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Khách hàng 1', 'customer1@example.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0934567890', 'customer', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'Khách hàng 2', 'customer2@example.com', '$2a$10$XgNuWtfZy5JqDRFT5l6Xz.Q.3dLj0Yh0LhVVa5IUKQSqN3/hB3vsy', '0945678901', 'customer', 'active');

-- Thêm địa chỉ cho người dùng mẫu
INSERT INTO user_addresses (id, user_id, address_name, recipient_name, phone, address, district, city, is_default) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003', 'Nhà riêng', 'Khách hàng 1', '0934567890', '123 Đường Nguyễn Huệ', 'Quận 1', 'TP. Hồ Chí Minh', true),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440003', 'Văn phòng', 'Khách hàng 1', '0934567890', '456 Đường Lê Lợi', 'Quận 1', 'TP. Hồ Chí Minh', false),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440004', 'Nhà riêng', 'Khách hàng 2', '0945678901', '789 Đường Cách Mạng Tháng 8', 'Quận 3', 'TP. Hồ Chí Minh', true);

-- Thêm khu vực phục vụ (TP. Hồ Chí Minh)
INSERT INTO areas (id, name, city, district, status) VALUES
('550e8400-e29b-41d4-a716-446655440035', 'Khu vực Quận 1', 'TP. Hồ Chí Minh', 'Quận 1', 'active'),
('550e8400-e29b-41d4-a716-446655440036', 'Khu vực Quận 2', 'TP. Hồ Chí Minh', 'Quận 2', 'active'),
('550e8400-e29b-41d4-a716-446655440037', 'Khu vực Quận 3', 'TP. Hồ Chí Minh', 'Quận 3', 'active'),
('550e8400-e29b-41d4-a716-446655440038', 'Khu vực Quận 4', 'TP. Hồ Chí Minh', 'Quận 4', 'active'),
('550e8400-e29b-41d4-a716-446655440039', 'Khu vực Quận 7', 'TP. Hồ Chí Minh', 'Quận 7', 'active');

-- Thêm khu vực phục vụ (Hà Nội)
INSERT INTO areas (id, name, city, district, status) VALUES
('550e8400-e29b-41d4-a716-446655440040', 'Khu vực Quận Ba Đình', 'Hà Nội', 'Quận Ba Đình', 'active'),
('550e8400-e29b-41d4-a716-446655440041', 'Khu vực Quận Hoàn Kiếm', 'Hà Nội', 'Quận Hoàn Kiếm', 'active'),
('550e8400-e29b-41d4-a716-446655440042', 'Khu vực Quận Tây Hồ', 'Hà Nội', 'Quận Tây Hồ', 'active'),
('550e8400-e29b-41d4-a716-446655440043', 'Khu vực Quận Long Biên', 'Hà Nội', 'Quận Long Biên', 'active'),
('550e8400-e29b-41d4-a716-446655440044', 'Khu vực Quận Cầu Giấy', 'Hà Nội', 'Quận Cầu Giấy', 'active'),
('550e8400-e29b-41d4-a716-446655440045', 'Khu vực Quận Đống Đa', 'Hà Nội', 'Quận Đống Đa', 'active'),
('550e8400-e29b-41d4-a716-446655440046', 'Khu vực Quận Hai Bà Trưng', 'Hà Nội', 'Quận Hai Bà Trưng', 'active'),
('550e8400-e29b-41d4-a716-446655440047', 'Khu vực Quận Thanh Xuân', 'Hà Nội', 'Quận Thanh Xuân', 'active');

INSERT INTO service_categories (id, name, description, status) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Vệ sinh nhà cửa', 'Các dịch vụ vệ sinh nhà cửa, căn hộ', 'active'),
('550e8400-e29b-41d4-a716-446655440006', 'Vệ sinh văn phòng', 'Các dịch vụ vệ sinh văn phòng, công ty', 'active'),
('550e8400-e29b-41d4-a716-446655440007', 'Vệ sinh chuyên sâu', 'Dịch vụ vệ sinh chuyên sâu cho các không gian đặc biệt', 'active'),
('550e8400-e29b-41d4-a716-446655440008', 'Vệ sinh định kỳ', 'Dịch vụ vệ sinh theo lịch định kỳ', 'active');

INSERT INTO services (id, category_id, name, slug, short_description, description, price, duration, status) VALUES
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'Vệ sinh nhà cơ bản', 've-sinh-nha-co-ban', 'Dịch vụ vệ sinh cơ bản cho căn hộ', 'Dịch vụ vệ sinh cơ bản cho căn hộ dưới 80m2', 300000, 120, 'active'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'Vệ sinh nhà toàn diện', 've-sinh-nha-toan-dien', 'Dịch vụ vệ sinh toàn diện cho căn hộ', 'Dịch vụ vệ sinh toàn diện cho căn hộ dưới 80m2', 500000, 240, 'active'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440006', 'Vệ sinh văn phòng nhỏ', 've-sinh-van-phong-nho', 'Dịch vụ vệ sinh cho văn phòng nhỏ', 'Dịch vụ vệ sinh cho văn phòng dưới 100m2', 600000, 180, 'active'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440006', 'Vệ sinh văn phòng lớn', 've-sinh-van-phong-lon', 'Dịch vụ vệ sinh cho văn phòng lớn', 'Dịch vụ vệ sinh cho văn phòng trên 100m2', 1000000, 300, 'active'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440008', 'Vệ sinh hàng tuần', 've-sinh-hang-tuan', 'Dịch vụ vệ sinh định kỳ hàng tuần', 'Dịch vụ vệ sinh định kỳ hàng tuần', 250000, 120, 'active'),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440008', 'Vệ sinh hàng tháng', 've-sinh-hang-thang', 'Dịch vụ vệ sinh định kỳ hàng tháng', 'Dịch vụ vệ sinh định kỳ hàng tháng', 400000, 180, 'active');

-- Thêm các dịch vụ mới theo yêu cầu
INSERT INTO services (id, category_id, name, slug, short_description, description, price, duration, status) VALUES
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440007', 'Vệ sinh sau xây dựng nhỏ', 've-sinh-sau-xay-dung-nho', 'Dịch vụ vệ sinh sau sửa chữa nhỏ', 'Dịch vụ vệ sinh sau sửa chữa nhỏ, loại bỏ bụi bẩn xây dựng và làm sạch hoàn toàn', 800000, 240, 'active'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440007', 'Vệ sinh sau xây dựng lớn', 've-sinh-sau-xay-dung-lon', 'Dịch vụ vệ sinh sau xây dựng lớn', 'Dịch vụ vệ sinh sau xây dựng, sửa chữa lớn, bao gồm loại bỏ vật liệu xây dựng, bụi và vệ sinh sâu', 1500000, 480, 'active'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440007', 'Giặt thảm', 'giat-tham', 'Dịch vụ giặt thảm chuyên nghiệp', 'Dịch vụ giặt thảm bằng máy chuyên dụng, loại bỏ vết bẩn, bụi bẩn sâu và khử mùi', 180000, 120, 'active'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440007', 'Giặt sofa', 'giat-sofa', 'Dịch vụ giặt sofa tại nhà', 'Dịch vụ giặt sofa tại nhà với công nghệ làm sạch chuyên nghiệp, an toàn cho mọi loại chất liệu', 350000, 180, 'active'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440007', 'Giặt rèm cửa', 'giat-rem-cua', 'Dịch vụ giặt rèm cửa chuyên nghiệp', 'Dịch vụ tháo lắp và giặt rèm cửa, đảm bảo không nhăn, không co rút và sạch sẽ', 250000, 150, 'active'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440007', 'Vệ sinh kính', 've-sinh-kinh', 'Dịch vụ vệ sinh kính chuyên nghiệp', 'Dịch vụ vệ sinh kính chuyên nghiệp cho nhà ở và văn phòng, loại bỏ vết bẩn cứng đầu, mảng bám và cặn canxi', 200000, 120, 'active'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440007', 'Diệt khuẩn, khử mùi', 'diet-khuan-khu-mui', 'Dịch vụ diệt khuẩn và khử mùi chuyên nghiệp', 'Dịch vụ phun khử trùng, diệt khuẩn và khử mùi cho nhà ở và văn phòng, sử dụng hóa chất an toàn cho sức khỏe', 500000, 120, 'active');

-- Liên kết dịch vụ với khu vực (TPHCM)
INSERT INTO service_areas (service_id, area_id) VALUES
-- Dịch vụ vệ sinh nhà cơ bản cho tất cả khu vực ở TPHCM
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440035'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440036'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440037'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440038'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440039'),

-- Dịch vụ vệ sinh nhà toàn diện cho tất cả khu vực ở TPHCM
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440035'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440036'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440037'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440038'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440039'),

-- Dịch vụ vệ sinh văn phòng nhỏ cho tất cả khu vực ở TPHCM
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440035'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440036'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440037'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440038'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440039'),

-- Dịch vụ vệ sinh văn phòng lớn cho tất cả khu vực ở TPHCM
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440035'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440036'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440037'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440038'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440039'),

-- Các dịch vụ chuyên sâu cho TPHCM
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440035'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440036'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440037'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440038'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440039'),

-- Dịch vụ mới cho TPHCM
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440035'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440036'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440037'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440038'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440039'),

-- Dịch vụ giặt thảm, sofa, rèm cho TPHCM
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440035'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440036'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440037'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440038'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440039'),

('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440035'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440036'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440037'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440038'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440039'),

-- Liên kết dịch vụ với khu vực (Hà Nội)
-- Dịch vụ vệ sinh nhà cơ bản cho tất cả khu vực ở Hà Nội
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440040'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440041'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440042'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440043'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440044'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440045'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440046'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440047'),

-- Dịch vụ vệ sinh nhà toàn diện cho tất cả khu vực ở Hà Nội
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440040'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440041'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440042'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440043'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440044'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440045'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440046'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440047'),

-- Các dịch vụ mới cho Hà Nội
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440040'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440041'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440042'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440043'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440044'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440045'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440046'),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440047'),

('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440040'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440041'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440042'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440043'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440044'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440045'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440046'),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440047'),

('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440040'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440041'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440042'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440043'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440044'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440045'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440046'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440047'),

('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440040'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440041'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440042'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440043'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440044'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440045'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440046'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440047'),

('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440040'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440041'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440042'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440043'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440044'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440045'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440046'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440047');


INSERT INTO promotions (id, code, name, description, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, usage_limit, status) VALUES
('550e8400-e29b-41d4-a716-446655440017', 'WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho khách hàng lần đầu sử dụng dịch vụ', 'percentage', 10, 0, 100000, '2023-01-01', '2023-12-31', 100, 'active'),
('550e8400-e29b-41d4-a716-446655440018', 'SUMMER25', 'Khuyến mãi hè', 'Giảm 25% cho dịch vụ vệ sinh nhà cửa', 'percentage', 25, 500000, 200000, '2023-06-01', '2023-08-31', 50, 'active'),
('550e8400-e29b-41d4-a716-446655440019', 'FIXED100K', 'Giảm 100K', 'Giảm trực tiếp 100K cho hóa đơn từ 500K', 'fixed', 100000, 500000, 100000, '2023-01-01', '2023-12-31', 200, 'active');


-- Chi tiết đơn đặt lịch
INSERT INTO booking_items (booking_id, service_id, quantity, unit_price, subtotal) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440009', 1, 300000, 300000),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440010', 1, 500000, 500000),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440011', 1, 600000, 600000);

-- Áp dụng khuyến mãi cho đơn hàng
INSERT INTO booking_promotions (booking_id, promotion_id, discount_amount) VALUES
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440019', 100000);


-- Thêm đánh giá mẫu
INSERT INTO reviews (booking_id, user_id, service_id, staff_id, rating, title, comment, status) VALUES
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 5, 'Dịch vụ tuyệt vời', 'Nhân viên rất chuyên nghiệp và làm việc rất sạch sẽ. Tôi rất hài lòng với kết quả.', 'approved');

-- Thêm thông báo mẫu
INSERT INTO notifications (user_id, title, message, notification_type, notification_channel, reference_id, reference_type) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Đơn đặt lịch đã hoàn thành', 'Đơn đặt lịch #BK-2023060001 đã được hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.', 'booking', 'app', '550e8400-e29b-41d4-a716-446655440050', 'booking'),
('550e8400-e29b-41d4-a716-446655440004', 'Đơn đặt lịch đã được xác nhận', 'Đơn đặt lịch #BK-2023060002 đã được xác nhận. Nhân viên sẽ đến đúng hẹn.', 'booking', 'app', '550e8400-e29b-41d4-a716-446655440051', 'booking'),
('550e8400-e29b-41d4-a716-446655440003', 'Khuyến mãi mới', 'Sử dụng mã SUMMER25 để được giảm 25% cho dịch vụ vệ sinh nhà cửa.', 'promotion', 'app', '550e8400-e29b-41d4-a716-446655440018', 'promotion');

-- Thêm cài đặt thông báo cho người dùng
INSERT INTO notification_settings (user_id, notification_type, app_enabled, email_enabled, sms_enabled) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'booking', true, true, false),
('550e8400-e29b-41d4-a716-446655440003', 'payment', true, true, false),
('550e8400-e29b-41d4-a716-446655440003', 'promotion', true, false, false),
('550e8400-e29b-41d4-a716-446655440004', 'booking', true, true, false),
('550e8400-e29b-41d4-a716-446655440004', 'payment', true, true, false),
('550e8400-e29b-41d4-a716-446655440004', 'promotion', false, false, false);

-- Thêm cài đặt hệ thống
INSERT INTO settings (id, key, value, description, data_type) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'company_name', 'CleanHome', 'Tên công ty', 'string'),
('550e8400-e29b-41d4-a716-446655440021', 'company_address', '123 Đường ABC, Quận 1, TP. HCM', 'Địa chỉ công ty', 'string'),
('550e8400-e29b-41d4-a716-446655440022', 'company_phone', '0123 456 789', 'Số điện thoại công ty', 'string'),
('550e8400-e29b-41d4-a716-446655440023', 'company_email', 'info@cleanhome.com', 'Email công ty', 'string'),
('550e8400-e29b-41d4-a716-446655440024', 'working_hours', '08:00-18:00', 'Giờ làm việc', 'string'),
('550e8400-e29b-41d4-a716-446655440025', 'working_days', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', 'Ngày làm việc', 'string'),
('550e8400-e29b-41d4-a716-446655440026', 'currency', 'VND', 'Đơn vị tiền tệ', 'string'),
('550e8400-e29b-41d4-a716-446655440027', 'date_format', 'DD/MM/YYYY', 'Định dạng ngày', 'string'),
('550e8400-e29b-41d4-a716-446655440028', 'time_format', 'HH:mm', 'Định dạng giờ', 'string'),
('550e8400-e29b-41d4-a716-446655440029', 'tax_rate', '10', 'Thuế suất (%)', 'number'),
('550e8400-e29b-41d4-a716-446655440070', 'booking_advance_days', '1', 'Số ngày tối thiểu đặt trước', 'number'),
('550e8400-e29b-41d4-a716-446655440071', 'booking_cancel_hours', '24', 'Số giờ trước lịch hẹn có thể hủy miễn phí', 'number'),
('550e8400-e29b-41d4-a716-446655440072', 'maintenance_mode', 'false', 'Chế độ bảo trì hệ thống', 'boolean'),
('550e8400-e29b-41d4-a716-446655440073', 'service_quality_message', 'Chúng tôi cam kết chất lượng dịch vụ. Nếu bạn không hài lòng, chúng tôi sẽ làm lại miễn phí.', 'Thông điệp chất lượng dịch vụ', 'string');

-- Bảng nhật ký hoạt động
INSERT INTO user_activity_logs (user_id, activity_type, ip_address, details) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'login', '192.168.1.1', '{"device": "Web browser", "location": "Ho Chi Minh City"}'),
('550e8400-e29b-41d4-a716-446655440003', 'booking', '192.168.1.1', '{"booking_id": "550e8400-e29b-41d4-a716-446655440050", "service": "Vệ sinh nhà cơ bản"}'),
('550e8400-e29b-41d4-a716-446655440004', 'login', '192.168.1.2', '{"device": "Mobile app", "location": "Ho Chi Minh City"}'),
('550e8400-e29b-41d4-a716-446655440004', 'booking', '192.168.1.2', '{"booking_id": "550e8400-e29b-41d4-a716-446655440051", "service": "Vệ sinh nhà toàn diện"}');

-- Tạo chỉ mục để tối ưu hiệu suất truy vấn
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_services_category ON services (category_id);
CREATE INDEX idx_services_status ON services (status);
CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_staff ON bookings (staff_id);
CREATE INDEX idx_bookings_date ON bookings (booking_date);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_payment_status ON bookings (payment_status);
CREATE INDEX idx_booking_items_booking ON booking_items (booking_id);
CREATE INDEX idx_booking_items_service ON booking_items (service_id);
CREATE INDEX idx_staff_schedules_staff ON staff_schedules (staff_id);
CREATE INDEX idx_staff_schedules_date ON staff_schedules (date);
CREATE INDEX idx_reviews_service ON reviews (service_id);
CREATE INDEX idx_reviews_user ON reviews (user_id);
CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_read ON notifications (is_read);
CREATE INDEX idx_user_activity_logs_user ON user_activity_logs (user_id);
CREATE INDEX idx_user_activity_logs_type ON user_activity_logs (activity_type);



-- Index cho bảng vnpay_transactions
CREATE INDEX idx_vnpay_transactions_booking_id ON vnpay_transactions(booking_id);
CREATE INDEX idx_vnpay_transactions_user_id ON vnpay_transactions(user_id);
CREATE INDEX idx_vnpay_transactions_txn_ref ON vnpay_transactions(vnp_TxnRef);

-- Thêm trigger để tự động cập nhật updated_at cho vnpay_transactions
CREATE TRIGGER update_vnpay_transactions_timestamp BEFORE UPDATE ON vnpay_transactions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
