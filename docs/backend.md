# Cấu trúc Backend cho CleanHome

## Tổng quan

Backend của CleanHome được xây dựng dựa trên Flask API và PostgreSQL, cung cấp các endpoint RESTful để frontend React có thể tương tác với cơ sở dữ liệu.

## Công nghệ sử dụng

- **Framework**: Flask (Python)
- **Cơ sở dữ liệu**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Pytest
- **Deployment**: Docker, Gunicorn

## Cấu trúc thư mục

```
backend/
├── app/
│   ├── __init__.py           # Khởi tạo ứng dụng Flask
│   ├── config.py             # Cấu hình ứng dụng
│   ├── extensions.py         # Các extension (SQLAlchemy, JWT, etc.)
│   ├── models/               # Định nghĩa các model
│   │   ├── __init__.py
│   │   ├── user.py           # Model User
│   │   ├── service.py        # Model Service và ServiceCategory
│   │   ├── booking.py        # Model Booking, BookingItem, Payment, Review, StaffSchedule
│   │   ├── promotion.py      # Model Promotion và BookingPromotion
│   │   ├── notification.py   # Model Notification
│   │   └── setting.py        # Model Setting
│   ├── api/                  # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py           # Xác thực người dùng
│   │   ├── users.py          # API quản lý người dùng
│   │   ├── services.py       # API quản lý dịch vụ
│   │   ├── bookings.py       # API quản lý đặt lịch
│   │   ├── promotions.py     # API quản lý khuyến mãi
│   │   ├── reports.py        # API cho báo cáo và thống kê
│   │   ├── reviews.py        # API quản lý đánh giá
│   │   ├── staff.py          # API quản lý nhân viên và lịch làm việc
│   │   ├── payments.py       # API quản lý thanh toán
│   │   └── notifications.py  # API quản lý thông báo
│   ├── schemas/              # Schemas cho serialization/validation
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── service.py
│   │   ├── booking.py
│   │   ├── promotion.py
│   │   ├── database.sql      # SQL schema cho PostgreSQL
│   │   └── payment.py
│   └── utils/                # Các hàm tiện ích
│       ├── __init__.py
│       ├── helpers.py        # Hàm tiện ích (UUID, ngày, tiền tệ, v.v.)
│       ├── validators.py     # Hàm kiểm tra dữ liệu (ENUM, định dạng, v.v.)
│       ├── config.py         # Cấu hình hệ thống và PostgreSQL
│       ├── email.py          # Tiện ích gửi email
│       └── errors.py         # Xử lý lỗi chuẩn hóa
├── migrations/               # Migrations cho cơ sở dữ liệu
│   ├── versions/             # Các phiên bản migration
│   │   └── ...
│   ├── env.py
│   ├── README
│   ├── script.py.mako
│   └── alembic.ini
├── tests/                    # Unit tests và integration tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_users.py
│   ├── test_services.py
│   ├── test_bookings.py
│   └── test_promotions.py
├── static/                   # File tĩnh (uploads, v.v.)
│   └── uploads/              # Thư mục chứa file upload
│       ├── avatars/          # Ảnh đại diện người dùng
│       └── services/         # Ảnh dịch vụ
├── logs/                     # Thư mục chứa log
│   └── app.log
├── .env                      # Biến môi trường
├── .env.example              # Mẫu file .env
├── .gitignore
├── requirements.txt          # Dependencies
├── Dockerfile                # Cấu hình Docker
├── docker-compose.yml        # Cấu hình Docker Compose
├── run.py                    # Entry point để chạy ứng dụng
└── README.md                 # Hướng dẫn

## Mô hình dữ liệu

### User (Người dùng)
- id: Integer, primary key
- name: String, tên người dùng
- email: String, email (unique)
- password: String, mật khẩu (đã hash)
- phone: String, số điện thoại
- address: String, địa chỉ
- avatar: String, đường dẫn ảnh đại diện
- role: Enum('customer', 'staff', 'admin'), vai trò
- status: Enum('active', 'locked'), trạng thái
- created_at: DateTime, thời gian tạo
- updated_at: DateTime, thời gian cập nhật

### Service (Dịch vụ)
- id: Integer, primary key
- category_id: Integer, foreign key đến ServiceCategory
- name: String, tên dịch vụ
- description: Text, mô tả
- price: Decimal, giá
- duration: Integer, thời gian thực hiện (phút)
- image: String, đường dẫn hình ảnh
- status: Enum('active', 'inactive'), trạng thái
- created_at: DateTime, thời gian tạo
- updated_at: DateTime, thời gian cập nhật

### Booking (Đặt lịch)
- id: Integer, primary key
- user_id: Integer, foreign key đến User
- service_id: Integer, foreign key đến Service
- staff_id: Integer, foreign key đến User (staff)
- booking_date: Date, ngày đặt lịch
- booking_time: Time, giờ đặt lịch
- status: Enum('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'), trạng thái
- total_price: Decimal, tổng giá
- payment_status: Enum('unpaid', 'paid'), trạng thái thanh toán
- payment_method: Enum('cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay'), phương thức thanh toán
- notes: Text, ghi chú
- address: Text, địa chỉ
- created_at: DateTime, thời gian tạo
- updated_at: DateTime, thời gian cập nhật

### Promotion (Khuyến mãi)
- id: Integer, primary key
- code: String, mã khuyến mãi (unique)
- name: String, tên khuyến mãi
- description: Text, mô tả
- discount_type: Enum('percentage', 'fixed'), loại giảm giá
- discount_value: Decimal, giá trị giảm giá
- min_order_value: Decimal, giá trị đơn hàng tối thiểu
- max_discount: Decimal, giảm giá tối đa
- start_date: Date, ngày bắt đầu
- end_date: Date, ngày kết thúc
- usage_limit: Integer, giới hạn sử dụng
- used_count: Integer, số lần đã sử dụng
- status: Enum('active', 'inactive'), trạng thái
- created_at: DateTime, thời gian tạo
- updated_at: DateTime, thời gian cập nhật

## API Endpoints

### Authentication
- `POST /api/auth/register`: Đăng ký tài khoản mới
- `POST /api/auth/login`: Đăng nhập
- `POST /api/auth/logout`: Đăng xuất
- `GET /api/auth/me`: Lấy thông tin người dùng hiện tại
- `PUT /api/auth/me`: Cập nhật thông tin người dùng
- `POST /api/auth/change-password`: Đổi mật khẩu

### Users
- `GET /api/users`: Lấy danh sách người dùng (admin only)
- `GET /api/users/<id>`: Lấy thông tin người dùng theo ID
- `POST /api/users`: Tạo người dùng mới (admin only)
- `PUT /api/users/<id>`: Cập nhật thông tin người dùng
- `DELETE /api/users/<id>`: Xóa người dùng

### Services
- `GET /api/services`: Lấy danh sách dịch vụ
- `GET /api/services/<id>`: Lấy thông tin dịch vụ theo ID
- `POST /api/services`: Tạo dịch vụ mới (admin only)
- `PUT /api/services/<id>`: Cập nhật thông tin dịch vụ (admin only)
- `DELETE /api/services/<id>`: Xóa dịch vụ (admin only)

### Bookings
- `GET /api/bookings`: Lấy danh sách đặt lịch
- `GET /api/bookings/<id>`: Lấy thông tin đặt lịch theo ID
- `POST /api/bookings`: Tạo đặt lịch mới
- `PUT /api/bookings/<id>`: Cập nhật thông tin đặt lịch
- `DELETE /api/bookings/<id>`: Hủy đặt lịch
- `PUT /api/bookings/<id>/status`: Cập nhật trạng thái đặt lịch

### Promotions
- `GET /api/promotions`: Lấy danh sách khuyến mãi
- `GET /api/promotions/<id>`: Lấy thông tin khuyến mãi theo ID
- `POST /api/promotions`: Tạo khuyến mãi mới (admin only)
- `PUT /api/promotions/<id>`: Cập nhật thông tin khuyến mãi (admin only)
- `DELETE /api/promotions/<id>`: Xóa khuyến mãi (admin only)
- `POST /api/promotions/validate`: Kiểm tra mã khuyến mãi

### Reports (Admin only)
- `GET /api/reports/revenue`: Báo cáo doanh thu
- `GET /api/reports/bookings`: Báo cáo đặt lịch
- `GET /api/reports/services`: Báo cáo dịch vụ
- `GET /api/reports/users`: Báo cáo người dùng

## Authentication & Authorization

### JWT Authentication
- Sử dụng JWT (JSON Web Tokens) để xác thực người dùng
- Access token có thời hạn ngắn (30 phút)
- Refresh token có thời hạn dài hơn (7 ngày)
- Lưu trữ token trong HTTP-only cookies để tăng tính bảo mật

### Role-based Authorization
- Phân quyền dựa trên vai trò: customer, staff, admin
- Sử dụng decorators để kiểm tra quyền truy cập
- Ví dụ: `@admin_required`, `@staff_required`

## Xử lý lỗi

- Sử dụng HTTP status codes phù hợp
- Trả về thông báo lỗi chi tiết và có ý nghĩa
- Xử lý các trường hợp ngoại lệ một cách nhất quán

## Validation

- Sử dụng Marshmallow để validate dữ liệu đầu vào
- Kiểm tra tính hợp lệ của dữ liệu trước khi xử lý
- Trả về thông báo lỗi chi tiết khi validation thất bại

## Bảo mật

- Mã hóa mật khẩu bằng bcrypt
- Sử dụng HTTPS cho tất cả các request
- Bảo vệ chống lại các cuộc tấn công phổ biến (CSRF, XSS, SQL Injection)
- Rate limiting để ngăn chặn brute force attacks

## Logging

- Ghi log cho tất cả các request và response
- Ghi log lỗi và exceptions
- Sử dụng các cấp độ log khác nhau (DEBUG, INFO, WARNING, ERROR, CRITICAL)

## Cài đặt và chạy

### Yêu cầu
- Python 3.8+
- PostgreSQL 12+
- Virtualenv (khuyến nghị)

### Các bước cài đặt

1. Clone repository:
```bash
git clone https://github.com/your-username/cleanhome-backend.git
cd cleanhome-backend
```

2. Tạo và kích hoạt môi trường ảo:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

4. Tạo file .env từ .env.example và cấu hình:
```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin cấu hình của bạn
```

5. Khởi tạo cơ sở dữ liệu:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

6. Chạy ứng dụng:
```bash
flask run
# hoặc
python run.py
```


## Triển khai

### Môi trường Development
- Sử dụng Flask development server
- Debug mode bật
- SQLite có thể được sử dụng thay cho PostgreSQL

### Môi trường Production
- Sử dụng Gunicorn làm WSGI server
- Nginx làm reverse proxy
- PostgreSQL cho cơ sở dữ liệu
- Cấu hình HTTPS
- Tắt debug mode

## Testing

### Unit Tests
- Kiểm thử các hàm và phương thức riêng lẻ
- Sử dụng pytest

### Integration Tests
- Kiểm thử API endpoints
- Sử dụng test client của Flask

### Chạy tests:
```bash
pytest
# hoặc
python -m pytest
```

## Tài liệu API

- Sử dụng Swagger/OpenAPI để tạo tài liệu API
- Truy cập tài liệu tại `/api/docs`
- Tài liệu bao gồm mô tả endpoints, parameters, request/response schemas

## Kết luận

Backend của CleanHome được thiết kế để cung cấp một API RESTful đầy đủ chức năng, bảo mật và dễ mở rộng. Việc sử dụng Flask và PostgreSQL cho phép xây dựng một hệ thống linh hoạt, có thể xử lý các yêu cầu của ứng dụng đặt lịch dịch vụ vệ sinh một cách hiệu quả.
