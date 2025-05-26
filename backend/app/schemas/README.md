# Database Schema cho CleanHome

## Tổng quan
Đây là schema cơ sở dữ liệu cho ứng dụng CleanHome, một hệ thống đặt lịch dịch vụ vệ sinh. Schema sử dụng PostgreSQL và bao gồm các bảng chính như users, services, bookings, và các bảng liên quan khác.

## Cấu trúc thư mục
- `database.sql` - File schema chính
- `migrations/` - Thư mục chứa các migration script
- `apply_migrations.sh` - Script để áp dụng các migration

## Các bảng chính
1. **users** - Lưu thông tin người dùng (khách hàng, nhân viên, admin)
2. **service_categories** - Danh mục dịch vụ
3. **services** - Chi tiết các dịch vụ
4. **bookings** - Đơn đặt lịch
5. **booking_items** - Chi tiết đơn đặt lịch
6. **promotions** - Khuyến mãi
7. **staff_schedules** - Lịch làm việc của nhân viên
8. **reviews** - Đánh giá dịch vụ và nhân viên
9. **payments** - Thanh toán

## Migration
Các migration được sử dụng để cập nhật schema cơ sở dữ liệu một cách an toàn mà không làm mất dữ liệu hiện có. Mỗi migration được đóng gói trong một file SQL riêng biệt trong thư mục `migrations/`.

### Migration đặc biệt: `handle_user_role_compatibility.sql`
Migration này xử lý vấn đề tương thích giữa vai trò người dùng từ frontend và backend:

- Frontend sử dụng 'user' làm vai trò cho người dùng thông thường
- Database sử dụng ENUM 'customer' cho vai trò tương ứng

Migration này thêm:
1. Bảng ánh xạ `user_role_mapping` để lưu mối quan hệ giữa vai trò frontend và backend
2. Hàm `map_frontend_role_to_backend()` để chuyển đổi giữa các giá trị
3. Trigger để tự động chuyển đổi khi insert/update dữ liệu

## Áp dụng migrations
Để áp dụng migrations, chạy script `apply_migrations.sh` với các biến môi trường thích hợp:

```bash
# Thiết lập thông tin kết nối database
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=cleanhome
export DB_USER=postgres
export DB_PASSWORD=your_password

# Chạy script
./apply_migrations.sh
```

Hoặc với PowerShell trên Windows:

```powershell
# Thiết lập thông tin kết nối database
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="cleanhome"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your_password"

# Chạy script (cần psql được thêm vào PATH)
bash ./apply_migrations.sh
```

## Vấn đề đã sửa: Đăng ký người dùng mới
Trước đây, khi người dùng đăng ký tài khoản mới, dữ liệu không được lưu vào database do có sự không tương thích giữa:
1. Vai trò người dùng từ frontend ('user') và backend ('customer')
2. Cách xử lý ENUM trong PostgreSQL vs. cách lưu trữ trong model SQLAlchemy

Các sửa đổi đã thực hiện:
1. Cập nhật model User để sử dụng SQLAlchemy ENUM thay vì String
2. Thêm trigger trong database để xử lý chuyển đổi giữa 'user' và 'customer'
3. Cập nhật API đăng ký để xử lý mapping roles
4. Thêm ghi log chi tiết để dễ dàng xác định vấn đề nếu có

## Các thay đổi tiếp theo
Đề xuất một số thay đổi trong tương lai:
1. Tách schema thành các file riêng biệt theo domain (user, service, booking, ...)
2. Thêm các index cho các truy vấn thường xuyên
3. Tối ưu các relationship giữa các bảng
4. Thêm các constraint để đảm bảo tính toàn vẹn dữ liệu 