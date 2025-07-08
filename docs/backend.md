# Backend - Flask API

## Tổng quan

Backend CleanHome được xây dựng bằng Flask với PostgreSQL, cung cấp RESTful API để frontend tương tác với cơ sở dữ liệu.

## Công nghệ chính

- **Flask** - Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM (Object-Relational Mapping)
- **JWT** - Authentication & authorization
- **Marshmallow** - Serialization & validation

## Cấu trúc thư mục

```
backend/
├── app/
│   ├── __init__.py         # Application factory
│   ├── extensions.py       # SQLAlchemy, JWT, CORS
│   ├── models/            # Database models
│   │   ├── user.py        # User, authentication
│   │   ├── booking.py     # Booking, payment
│   │   └── service.py     # Service, category
│   ├── api/               # API endpoints
│   │   ├── auth.py        # Authentication
│   │   ├── bookings.py    # Booking management
│   │   ├── users.py       # User management
│   │   └── admin.py       # Admin operations
│   ├── schemas/           # Request/response schemas
│   └── utils/             # Helpers, validators
├── migrations/            # Database migrations
├── tests/                 # Unit & integration tests
└── requirements.txt       # Python dependencies
```

## API Endpoints

### Authentication
```
POST /api/auth/login       # User login
POST /api/auth/register    # User registration  
POST /api/auth/logout      # User logout
GET  /api/auth/me          # Get current user
```

### Bookings
```
GET    /api/bookings       # List bookings (filtered by user role)
POST   /api/bookings       # Create new booking
GET    /api/bookings/{id}  # Get booking details
PUT    /api/bookings/{id}  # Update booking
DELETE /api/bookings/{id}  # Cancel booking
```

### Services
```
GET    /api/services       # List all services
GET    /api/services/{id}  # Get service details
POST   /api/services       # Create service (admin only)
PUT    /api/services/{id}  # Update service (admin only)
```

### Admin
```
GET /api/admin/stats       # Dashboard statistics
GET /api/admin/users       # User management
PUT /api/admin/users/{id}  # Update user (role, status)
```

Backend CleanHome cung cấp API mạnh mẽ, bảo mật và có khả năng mở rộng để hỗ trợ đầy đủ các tính năng của ứng dụng.

## Công nghệ sử dụng

- **Framework**: Flask (Python)
- **Cơ sở dữ liệu**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Pytest
- **Deployment**: Docker, Gunicorn


## Kết luận

Backend của CleanHome được thiết kế để cung cấp một API RESTful đầy đủ chức năng, bảo mật và dễ mở rộng. Việc sử dụng Flask và PostgreSQL cho phép xây dựng một hệ thống linh hoạt, có thể xử lý các yêu cầu của ứng dụng đặt lịch dịch vụ vệ sinh một cách hiệu quả.
