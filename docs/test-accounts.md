# 🔐 DANH SÁCH TÀI KHOẢN TEST - CLEANHOME

## ✅ TÀI KHOẢN ĐÃ ĐƯỢC SỬA VÀ CÓ THỂ ĐĂNG NHẬP

### 👤 CUSTOMER ACCOUNTS
| Email | Password | Role | Status | Ghi chú |
|-------|----------|------|--------|---------|
| `customer1@example.com` | `password123` | customer | active | Khách hàng mẫu 1 |
| `customer2@example.com` | `password123` | customer | active | Khách hàng mẫu 2 |
| `6789masoi@gmail.com` | `TestPass123!` | customer | active | User đăng ký qua API |
| `testemail@gmail.com` | `TestPass123!` | customer | active | User đăng ký qua API |

### 👔 STAFF ACCOUNTS  
| Email | Password | Role | Status | Ghi chú |
|-------|----------|------|--------|---------|
| `staff1@cleanhome.com` | `staff123` | staff | active | Nhân viên mẫu 1 |
| `staff2@cleanhome.com` | `staff123` | staff | active | Nhân viên mẫu 2 |

### 🛡️ ADMIN ACCOUNTS
| Email | Password | Role | Status | Ghi chú |
|-------|----------|------|--------|---------|
| `admin@cleanhome.com` | `admin123` | admin | active | Quản trị viên hệ thống |

---

## 🔧 VẤN ĐỀ ĐÃ ĐƯỢC GIẢI QUYẾT

### 1. **Lỗi Password Hash**
- **Vấn đề**: Password hash bị lỗi format `Missing required argument 'digestmod'`
- **Nguyên nhân**: Hash cũ không tương thích với phiên bản werkzeug mới
- **Giải pháp**: 
  - Cập nhật User model với method `pbkdf2:sha256`
  - Chạy script `simple_fix_passwords.py` để sửa tất cả password hash
  - Test thành công 7/7 user

### 2. **Lỗi CORS Configuration** 
- **Vấn đề**: Frontend (port 5173) không thể gọi API backend (port 5000)
- **Nguyên nhân**: CORS origin sai (cấu hình cho port 3000 thay vì 5173)
- **Giải pháp**: 
  - Cập nhật `CORS_ORIGINS` trong config.py
  - Sửa extensions.py để chỉ allow port 5173
  - Tạo file `.env` cho frontend với `VITE_API_URL=http://localhost:5000/api`

### 3. **Lỗi React State Update**
- **Vấn đề**: Warning "Cannot update component while rendering different component"
- **Nguyên nhân**: Navigation được gọi trong render cycle
- **Giải pháp**:
  - Tách logic redirect thành 2 useEffect riêng biệt
  - Sử dụng flag `shouldRedirect` để kiểm soát timing
  - Thêm delay nhỏ trước khi navigate

---

## 🚀 CÁCH SỬ DỤNG

### Đăng nhập Frontend:
1. Mở browser và vào `http://localhost:5173`
2. Click "Đăng nhập" 
3. Sử dụng một trong các tài khoản ở bảng trên
4. Ví dụ: `admin@cleanhome.com` / `admin123`

### Test API trực tiếp:
```bash
# Test đăng nhập
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cleanhome.com","password":"admin123"}'

# Test đăng ký user mới  
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"newuser@test.com","password":"StrongPass123!"}'
```

---

## 📝 NOTES

- Tất cả password đã được hash với `pbkdf2:sha256` method
- Database PostgreSQL kết nối thành công
- CORS đã được cấu hình đúng cho development
- Backend chạy trên `http://localhost:5000`
- Frontend chạy trên `http://localhost:5173`
- Migration database đã hoàn tất với 20 tables

---

**Last Updated**: June 14, 2025  
**Status**: ✅ ALL WORKING - SẴN SÀNG CHO DEVELOPMENT
