# CleanHome - Hệ thống đặt dịch vụ vệ sinh

CleanHome là một nền tảng trực tuyến toàn diện cho phép người dùng dễ dàng đặt lịch và quản lý các dịch vụ vệ sinh nhà cửa, văn phòng.

## Cấu trúc thư mục dự án

```
cleanhome/
├── frontend/                # Frontend React application
│   ├── public/              # Public assets
│   ├── src/                 # Source code
│   │   ├── assets/          # Static assets (images, fonts)
│   │   ├── components/      # Reusable components
│   │   │   ├── Layout/      # Layout components
│   │   │   └── UI/          # UI components
│   │   ├── context/         # React Context
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   └── auth/        # Authentication pages
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main App component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── .eslintrc.js         # ESLint configuration
│   ├── .prettierrc          # Prettier configuration
│   ├── index.html           # HTML template
│   ├── package.json         # Dependencies and scripts
│   ├── postcss.config.js    # PostCSS configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── vite.config.ts       # Vite configuration
│
backend/
├── app/
│   ├── __init__.py              # Application factory
│   ├── config.py                # Cấu hình theo môi trường
│   ├── extensions.py            # Khởi tạo các extension: db, jwt, migrate, ma, cors
│
│   ├── models/                  # Models (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── ...                 
│
│   ├── schemas/                 # Marshmallow Schemas
│   │   ├── __init__.py
│   │   ├── user_schema.py
│   │   └── ...
│
│   ├── routes/                  # Flask Blueprints
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   └── ...
│
│   ├── services/                # Business logic (optional nhưng nên có)
│   │   ├── __init__.py
│   │   └── user_service.py
│
│   ├── utils/                   # JWT utils, helpers, validators
│   │   ├── __init__.py
│   │   ├── jwt.py
│   │   └── ...
│
│   └── cli.py                   # Custom CLI commands (optional)
│
├── migrations/                  # Flask-Migrate folder
│   └── ...
│
├── .env                         # Env vars
├── .flaskenv                    # FLASK_APP + FLASK_ENV
├── requirements.txt
├── run.py                       # Entry point
├── config.example.env           # Env template
└── README.md
│
├── docs/                    # Documentation
│   ├── frontend.md          # Frontend documentation
│   ├── backend.md           # Backend documentation
│   └── cleanhome.md         # Project overview
└── 
```

## Tài liệu

Để hiểu rõ hơn về dự án, vui lòng tham khảo các tài liệu sau:

- [Tổng quan dự án](.docs\cleanhome.md)
- [Tài liệu Frontend](docs\frontend.md)
- [Tài liệu Backend](.docs\backend.md)

## Cài đặt và chạy dự án

## Tài khoản demo:
Email: user@example.com / staff@example.com / admin@example.com
Mật khẩu: password

### Yêu cầu

- Node.js 16+
- Python 3.8+
- PostgreSQL 12+

### Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo và kích hoạt môi trường ảo
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env từ .env.example
cp .env.example .env
# Chỉnh sửa file .env với thông tin cấu hình của bạn

# Khởi tạo cơ sở dữ liệu
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Chạy ứng dụng
flask run
```

