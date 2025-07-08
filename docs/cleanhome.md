# CleanHome - Tổng quan dự án

## Giới thiệu

CleanHome là nền tảng đặt lịch dịch vụ vệ sinh trực tuyến, kết nối khách hàng với các nhà cung cấp dịch vụ vệ sinh chuyên nghiệp.

## Mục tiêu

- **Khách hàng**: Đặt lịch dịch vụ vệ sinh dễ dàng, nhanh chóng
- **Doanh nghiệp**: Tối ưu hóa quy trình quản lý đơn hàng và nhân viên
- **Hiệu quả**: Tăng doanh thu và cải thiện trải nghiệm khách hàng

## Kiến trúc hệ thống

### Frontend (React)
- **Giao diện khách hàng**: Trang chủ, đặt lịch, theo dõi đơn hàng
- **Giao diện quản trị**: Dashboard, quản lý đơn hàng, nhân viên, dịch vụ
- **Responsive**: Tương thích mobile, tablet, desktop

### Backend (Flask API)
- **RESTful API**: Cung cấp dữ liệu cho frontend
- **Authentication**: JWT-based security
- **Database**: PostgreSQL với SQLAlchemy ORM

## Quy trình nghiệp vụ

### Đặt lịch dịch vụ
1. Khách hàng chọn dịch vụ và thời gian
2. Nhập thông tin liên hệ và địa chỉ
3. Xác nhận đơn hàng
4. Admin phân công nhân viên
5. Nhân viên thực hiện dịch vụ
6. Khách hàng đánh giá và thanh toán

### Quản lý đơn hàng
- **Theo dõi**: Pending → Confirmed → In Progress → Completed
- **Phân công**: Tự động/thủ công phân công nhân viên
- **Thông báo**: Email/SMS cho khách hàng và nhân viên

## Tính năng nổi bật

### Khách hàng
- ✅ Đặt lịch trực tuyến 24/7
- ✅ Theo dõi real-time trạng thái đơn hàng
- ✅ Lịch sử dịch vụ và đánh giá
- ✅ Ứng dụng khuyến mãi

### Quản trị viên
- ✅ Dashboard thống kê real-time
- ✅ Quản lý đơn hàng thông minh
- ✅ Phân công nhân viên tối ưu
- ✅ Báo cáo doanh thu chi tiết

### Nhân viên
- ✅ Xem lịch làm việc mobile-friendly
- ✅ Cập nhật tiến độ công việc
- ✅ Nhận thông báo đơn hàng mới

## Lợi ích

### Cho khách hàng
- Tiết kiệm thời gian đặt lịch
- Dịch vụ chuyên nghiệp, đáng tin cậy
- Giá cả minh bạch
- Hỗ trợ 24/7

### Cho doanh nghiệp
- Tăng hiệu quả quản lý
- Giảm chi phí vận hành
- Tăng doanh thu
- Phân tích dữ liệu khách hàng

## Roadmap phát triển

### Phase 1 ✅ (Hoàn thành)
- Hệ thống đặt lịch cơ bản
- Quản lý đơn hàng
- Dashboard admin

### Phase 2 🚧 (Đang phát triển)
- Thanh toán trực tuyến
- Mobile app
- AI recommend services

### Phase 3 📋 (Kế hoạch)
- IoT integration
- Advanced analytics
- Multi-location support
