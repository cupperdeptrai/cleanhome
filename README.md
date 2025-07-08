# CleanHome - Hệ thống đặt dịch vụ vệ sinh

Nền tảng đặt lịch dịch vụ vệ sinh trực tuyến với giao diện thân thiện và hệ thống quản lý toàn diện.

## Tài khoản demo

| Vai trò | Email | Mật khẩu | Chức năng |
|---------|--------|----------|-----------|
| **Khách hàng** | user@example.com | password | Đặt lịch dịch vụ, xem lịch sử, đánh giá |
| **Nhân viên** | staff@example.com | password | Xem lịch làm việc, cập nhật tiến độ công việc |
| **Quản trị viên** | admin@example.com | password | Quản lý toàn bộ hệ thống, báo cáo, thống kê |

## Chức năng chính

### 👤 Khách hàng
- Đăng ký/đăng nhập tài khoản
- Xem và đặt dịch vụ vệ sinh
- Theo dõi trạng thái đơn hàng
- Đánh giá dịch vụ
- Quản lý thông tin cá nhân

### 👨‍💼 Nhân viên  
- Xem lịch làm việc được phân công
- Cập nhật trạng thái công việc
- Xem thông tin chi tiết đơn hàng

### 🛠️ Quản trị viên
- Dashboard thống kê tổng quan
- Quản lý đơn hàng và phân công nhân viên
- Quản lý dịch vụ và giá cả
- Quản lý người dùng và nhân viên
- Quản lý khuyến mãi
- Báo cáo doanh thu và hiệu suất

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 16+ 
- Python 3.8+
- PostgreSQL 12+

### 1. Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Truy cập: http://localhost:5173
```

### 2. Backend (Flask)
```bash
cd backend

# Tạo môi trường ảo
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Cấu hình database
cp .env.example .env
# Chỉnh sửa .env với thông tin PostgreSQL

# Khởi tạo database
flask db init
flask db migrate -m "Initial migration"  
flask db upgrade

# Chạy server
flask run
# API endpoint: http://localhost:5000
```

## Công nghệ sử dụng

**Frontend:** React 18, TypeScript, Tailwind CSS, Vite  
**Backend:** Flask, SQLAlchemy, PostgreSQL, JWT  
**Deploy:** Docker, Nginx, Gunicorn

## Tài liệu

- [📖 Tổng quan dự án](cleanhome.md)
- [⚛️ Frontend Documentation](frontend.md) 
- [🔧 Backend Documentation](backend.md)

