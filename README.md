# Hướng dẫn chạy dự án CleanHome

## Cài đặt và Khởi động

### Backend (Python Flask)

1. **Thiết lập môi trường Python**
   ```
   cd e:\cleanhome\backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Khởi tạo cơ sở dữ liệu**
   ```
   python init_database_with_sample.py
   ```

3. **Chạy backend server**
   ```
   python app.py
   ```
   Server sẽ chạy tại `http://localhost:3001`

### Frontend (React)

1. **Cài đặt các gói phụ thuộc**
   ```
   cd e:\cleanhome\frontend
   npm install
   ```

2. **Chạy development server**
   ```
   npm run dev
   ```
   Frontend sẽ chạy tại `http://localhost:5173`

## Thông tin đăng nhập mẫu

### Tài khoản Admin
- Email: admin@cleanhome.com
- Mật khẩu: 123123

### Tài khoản Nhân viên
- Email: staff1@cleanhome.com
- Mật khẩu: 123123

### Tài khoản Khách hàng
- Email: customer1@example.com
- Mật khẩu: 123123

## Xử lý lỗi phổ biến

### Lỗi "Network Error" khi đăng ký/đăng nhập
1. Kiểm tra xem backend server có đang chạy không
2. Kiểm tra cổng mạng (port) mà backend đang chạy (3001)
3. Kiểm tra cấu hình CORS trong backend

### Lỗi không thể đăng ký
1. Kiểm tra xem cơ sở dữ liệu đã được khởi tạo đúng cách chưa
2. Kiểm tra logs trong backend để xem lỗi chi tiết
