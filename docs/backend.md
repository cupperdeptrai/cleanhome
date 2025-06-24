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
│   │   ├── user.py           # Model User, UserAddress
│   │   ├── service.py        # Model Service, ServiceCategory, Area, ServiceArea
│   │   ├── booking.py        # Model Booking, BookingItem, Review, StaffSchedule
│   │   ├── promotion.py      # Model Promotion, BookingPromotion
│   │   ├── payment.py        # Model Payment, PaymentMethod, TransactionLog
│   │   ├── notification.py   # Model Notification, NotificationSetting
│   │   ├── activity.py       # Model UserActivityLog
│   │   └── setting.py        # Model Setting
│   ├── api/                  # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py           # Xác thực người dùng
│   │   ├── users.py          # API quản lý người dùng và địa chỉ
│   │   ├── services.py       # API quản lý dịch vụ và danh mục
│   │   ├── areas.py          # API quản lý khu vực phục vụ
│   │   ├── bookings.py       # API quản lý đặt lịch
│   │   ├── promotions.py     # API quản lý khuyến mãi
│   │   ├── reports.py        # API cho báo cáo và thống kê
│   │   ├── reviews.py        # API quản lý đánh giá
│   │   ├── staff.py          # API quản lý nhân viên và lịch làm việc
│   │   ├── payments.py       # API quản lý thanh toán
│   │   ├── notifications.py  # API quản lý thông báo
│   │   └── activity.py       # API quản lý nhật ký hoạt động
│   ├── schemas/              # Schemas cho serialization/validation
│   │   ├── __init__.py
│   │   ├── user.py           # User, UserAddress schemas
│   │   ├── service.py        # Service, ServiceCategory, Area schemas
│   │   ├── booking.py        # Booking, BookingItem, Review schemas
│   │   ├── promotion.py      # Promotion schemas
│   │   ├── payment.py        # Payment, PaymentMethod schemas
│   │   ├── notification.py   # Notification schemas
│   │   └── activity.py       # Activity log schemas
│   └── utils/                # Các hàm tiện ích
│       ├── __init__.py
│       ├── helpers.py        # Hàm tiện ích (UUID, ngày, tiền tệ, v.v.)
│       ├── validators.py     # Hàm kiểm tra dữ liệu (ENUM, định dạng, v.v.)
│       ├── config.py         # Cấu hình hệ thống và PostgreSQL
│       ├── email.py          # Tiện ích gửi email
│       ├── notifications.py  # Tiện ích gửi thông báo (email, SMS, push)
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
├── requirements.txt          # Dependencies
├── run.py                    # Entry point để chạy ứng dụng
└── README.md                 # Hướng dẫn

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
```powershell
git clone https://github.com/your-username/cleanhome-backend.git
cd cleanhome-backend
```

2. Tạo và kích hoạt môi trường ảo:
```powershell
python -m venv venv
venv\Scripts\Activate.ps1     # Windows PowerShell
```

3. Cài đặt dependencies:
```powershell
pip install -r requirements.txt
```

4. Tạo file .env từ .env.example và cấu hình:
```powershell
Copy-Item .env.example .env
# Chỉnh sửa file .env với thông tin cấu hình của bạn
```

5. Khởi tạo cơ sở dữ liệu:
```powershell
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

6. Chạy ứng dụng:
```powershell
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
```powershell
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
