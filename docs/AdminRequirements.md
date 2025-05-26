# Yêu cầu cho trang Admin Dashboard

## 1. Tổng quan

Trang Admin Dashboard cần cung cấp giao diện quản lý toàn diện cho người quản trị hệ thống, cho phép họ theo dõi và quản lý tất cả các khía cạnh của dịch vụ vệ sinh.

## 2. Chức năng chính

### 2.1. Trang tổng quan (Dashboard)
- **Thống kê tổng quan**: Hiển thị số lượng đơn hàng, doanh thu, khách hàng mới, đánh giá mới
- **Biểu đồ doanh thu**: Theo ngày, tuần, tháng, năm
- **Đơn hàng gần đây**: Danh sách 5-10 đơn hàng mới nhất
- **Thông báo hệ thống**: Các thông báo quan trọng cần xử lý

### 2.2. Quản lý đơn hàng (Bookings)
- **Danh sách đơn hàng**: Hiển thị tất cả đơn hàng với bộ lọc (theo trạng thái, ngày, dịch vụ)
- **Chi tiết đơn hàng**: Xem thông tin chi tiết của từng đơn hàng
- **Cập nhật trạng thái**: Thay đổi trạng thái đơn hàng (đang chờ, đã xác nhận, đang thực hiện, hoàn thành, hủy)
- **Phân công nhân viên**: Gán nhân viên cho đơn hàng
- **Xuất báo cáo**: Xuất danh sách đơn hàng theo các tiêu chí

### 2.3. Quản lý dịch vụ (Services)
- **Danh sách dịch vụ**: Hiển thị tất cả dịch vụ hiện có
- **Thêm/Sửa/Xóa dịch vụ**: Quản lý thông tin dịch vụ (tên, mô tả, giá, thời gian, hình ảnh)
- **Phân loại dịch vụ**: Quản lý danh mục dịch vụ
- **Trạng thái dịch vụ**: Bật/tắt hiển thị dịch vụ trên trang người dùng

### 2.4. Quản lý người dùng (Users)
- **Danh sách người dùng**: Hiển thị tất cả người dùng (khách hàng, nhân viên, admin)
- **Thêm/Sửa/Xóa người dùng**: Quản lý thông tin người dùng
- **Phân quyền**: Thay đổi vai trò người dùng (khách hàng, nhân viên, admin)
- **Khóa tài khoản**: Tạm khóa hoặc mở khóa tài khoản người dùng

### 2.5. Quản lý nhân viên (Staff)
- **Danh sách nhân viên**: Hiển thị tất cả nhân viên
- **Thêm/Sửa/Xóa nhân viên**: Quản lý thông tin nhân viên
- **Lịch làm việc**: Xem và quản lý lịch làm việc của nhân viên
- **Thống kê hiệu suất**: Số đơn hàng đã hoàn thành, đánh giá từ khách hàng

### 2.6. Quản lý khuyến mãi (Promotions)
- **Danh sách khuyến mãi**: Hiển thị tất cả chương trình khuyến mãi
- **Thêm/Sửa/Xóa khuyến mãi**: Quản lý thông tin khuyến mãi (mã, tên, mô tả, loại giảm giá, giá trị, thời gian)
- **Trạng thái khuyến mãi**: Bật/tắt khuyến mãi

### 2.7. Báo cáo và thống kê (Reports)
- **Báo cáo doanh thu**: Theo ngày, tuần, tháng, năm
- **Báo cáo dịch vụ**: Thống kê dịch vụ được đặt nhiều nhất
- **Báo cáo khách hàng**: Khách hàng thân thiết, khách hàng mới
- **Báo cáo nhân viên**: Hiệu suất làm việc của nhân viên
- **Xuất báo cáo**: Xuất báo cáo dưới dạng PDF, Excel

### 2.8. Cài đặt hệ thống (Settings)
- **Thông tin công ty**: Tên, logo, địa chỉ, thông tin liên hệ
- **Cài đặt email**: Mẫu email thông báo, xác nhận đơn hàng
- **Cài đặt thanh toán**: Phương thức thanh toán, cài đặt cổng thanh toán
- **Cài đặt chung**: Múi giờ, ngôn ngữ, định dạng ngày tháng

## 3. Yêu cầu giao diện

### 3.1. Bố cục chung
- **Sidebar**: Menu điều hướng chính với các mục quản lý
- **Header**: Thông tin người dùng, thông báo, tìm kiếm nhanh
- **Nội dung chính**: Hiển thị nội dung tương ứng với mục đang chọn
- **Responsive**: Tương thích với các thiết bị di động và máy tính bảng

### 3.2. Thiết kế
- **Giao diện hiện đại**: Sử dụng Tailwind CSS để tạo giao diện đẹp và dễ sử dụng
- **Bảng và danh sách**: Hỗ trợ phân trang, sắp xếp, lọc dữ liệu
- **Biểu đồ và đồ thị**: Hiển thị dữ liệu trực quan bằng các biểu đồ
- **Form**: Thiết kế form dễ sử dụng với validation

## 4. Yêu cầu kỹ thuật

### 4.1. Phát triển
- **React và TypeScript**: Sử dụng React với TypeScript để phát triển
- **State Management**: Sử dụng Context API hoặc Redux để quản lý state
- **API Integration**: Kết nối với backend API để lấy và cập nhật dữ liệu
- **Authentication**: Xác thực và phân quyền người dùng

### 4.2. Hiệu suất
- **Lazy Loading**: Tải các component khi cần thiết
- **Memoization**: Sử dụng React.memo, useMemo, useCallback để tối ưu hiệu suất
- **Code Splitting**: Chia nhỏ code để giảm kích thước bundle

### 4.3. Bảo mật
- **Role-based Access Control**: Kiểm soát quyền truy cập dựa trên vai trò
- **Input Validation**: Kiểm tra và xác thực đầu vào từ người dùng
- **Secure API Calls**: Đảm bảo các cuộc gọi API được bảo mật

## 5. Kế hoạch triển khai

### 5.1. Giai đoạn 1: Thiết lập cơ bản
- Tạo layout chung cho admin dashboard
- Thiết lập routing và authentication
- Xây dựng trang Dashboard tổng quan

### 5.2. Giai đoạn 2: Quản lý cốt lõi
- Phát triển quản lý đơn hàng
- Phát triển quản lý dịch vụ
- Phát triển quản lý người dùng và nhân viên

### 5.3. Giai đoạn 3: Tính năng bổ sung
- Phát triển quản lý khuyến mãi
- Phát triển báo cáo và thống kê
- Phát triển cài đặt hệ thống

### 5.4. Giai đoạn 4: Hoàn thiện
- Tối ưu hiệu suất
- Kiểm thử và sửa lỗi
- Triển khai và tích hợp với hệ thống hiện tại
