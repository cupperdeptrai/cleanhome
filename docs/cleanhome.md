# CleanHome - Hệ thống đặt dịch vụ vệ sinh

## Giới thiệu

CleanHome là một nền tảng trực tuyến toàn diện cho phép người dùng dễ dàng đặt lịch và quản lý các dịch vụ vệ sinh nhà cửa, văn phòng. Hệ thống được thiết kế với giao diện thân thiện với người dùng, quy trình đặt lịch đơn giản và hệ thống quản trị mạnh mẽ cho các quản trị viên.

## Mục tiêu dự án

- Cung cấp nền tảng trực tuyến thuận tiện cho việc đặt dịch vụ vệ sinh
- Tối ưu hóa quy trình quản lý đơn hàng và nhân viên
- Nâng cao trải nghiệm khách hàng thông qua giao diện dễ sử dụng
- Cung cấp công cụ phân tích và báo cáo cho việc ra quyết định kinh doanh
- Tăng cường hiệu quả vận hành và giảm chi phí quản lý

## Đối tượng người dùng

### Khách hàng
- Người cần dịch vụ vệ sinh nhà cửa, văn phòng
- Mong muốn đặt lịch nhanh chóng, thuận tiện
- Cần theo dõi trạng thái đơn hàng và lịch sử sử dụng dịch vụ

### Quản trị viên
- Người quản lý hệ thống và vận hành dịch vụ
- Cần công cụ để quản lý đơn hàng, dịch vụ, nhân viên
- Cần báo cáo thống kê để đánh giá hiệu quả kinh doanh

### Nhân viên
- Người thực hiện dịch vụ vệ sinh
- Cần xem lịch làm việc và thông tin đơn hàng
- Cập nhật trạng thái công việc

## Kiến trúc hệ thống

CleanHome được xây dựng theo mô hình client-server với kiến trúc 3 tầng:

1. **Presentation Layer (Frontend)**
   - React + TypeScript
   - Tailwind CSS
   - Responsive design
   - Progressive Web App (PWA)

2. **Application Layer (Backend)**
   - Flask API (Python)
   - RESTful API endpoints
   - JWT Authentication
   - Business logic

3. **Data Layer**
   - PostgreSQL database
   - Data models và relationships
   - Data validation
   - Backup và recovery

## Công nghệ sử dụng

### Frontend
- **Framework**: React 18
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v7
- **UI Components**: Headless UI
- **Icons**: Heroicons, Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite

### Backend
- **Framework**: Flask (Python)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Pytest
- **Deployment**: Docker, Gunicorn

### Database
- **RDBMS**: PostgreSQL
- **Migration**: Alembic
- **Backup**: Automated daily backups

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Hosting**: AWS/GCP/Azure
- **Monitoring**: Prometheus, Grafana

## Tính năng chính

### Dành cho khách hàng

#### Quản lý tài khoản
- Đăng ký, đăng nhập, quên mật khẩu
- Cập nhật thông tin cá nhân
- Quản lý địa chỉ

#### Đặt lịch dịch vụ
- Xem danh sách dịch vụ
- Tìm kiếm và lọc dịch vụ
- Đặt lịch với quy trình đơn giản
- Áp dụng mã khuyến mãi
- Chọn phương thức thanh toán

#### Quản lý đơn hàng
- Xem danh sách đơn hàng
- Theo dõi trạng thái đơn hàng
- Hủy hoặc thay đổi đơn hàng
- Đánh giá dịch vụ sau khi hoàn thành

#### Hỗ trợ khách hàng
- FAQ (Câu hỏi thường gặp)
- Form liên hệ
- Live chat (tùy chọn)

### Dành cho quản trị viên

#### Dashboard
- Tổng quan về doanh thu, đơn hàng, khách hàng
- Biểu đồ và thống kê
- Thông báo và cảnh báo

#### Quản lý đơn hàng
- Xem tất cả đơn hàng
- Lọc và tìm kiếm đơn hàng
- Cập nhật trạng thái đơn hàng
- Phân công nhân viên

#### Quản lý dịch vụ
- Thêm/sửa/xóa dịch vụ
- Quản lý danh mục dịch vụ
- Cài đặt giá và thời gian

#### Quản lý người dùng
- Quản lý khách hàng
- Quản lý nhân viên
- Phân quyền người dùng

#### Quản lý khuyến mãi
- Tạo và quản lý mã khuyến mãi
- Cài đặt điều kiện áp dụng
- Theo dõi hiệu quả khuyến mãi

#### Báo cáo và thống kê
- Báo cáo doanh thu
- Báo cáo dịch vụ
- Báo cáo khách hàng
- Xuất báo cáo

#### Cài đặt hệ thống
- Thông tin công ty
- Cài đặt email
- Cài đặt thanh toán

### Dành cho nhân viên

#### Lịch làm việc
- Xem lịch làm việc
- Nhận thông báo đơn hàng mới

#### Quản lý công việc
- Xem chi tiết đơn hàng
- Cập nhật trạng thái công việc
- Báo cáo vấn đề

## Quy trình nghiệp vụ

### Quy trình đặt lịch
1. Khách hàng đăng nhập vào hệ thống
2. Khách hàng chọn dịch vụ vệ sinh
3. Khách hàng chọn ngày giờ và địa điểm
4. Khách hàng xác nhận thông tin và thanh toán
5. Hệ thống gửi email xác nhận đặt lịch
6. Admin phân công nhân viên
7. Nhân viên thực hiện dịch vụ
8. Khách hàng xác nhận hoàn thành và đánh giá

### Quy trình quản lý đơn hàng
1. Admin nhận đơn hàng mới
2. Admin xác nhận đơn hàng
3. Admin phân công nhân viên
4. Nhân viên nhận thông báo và xác nhận
5. Nhân viên thực hiện dịch vụ
6. Nhân viên cập nhật trạng thái hoàn thành
7. Khách hàng xác nhận và đánh giá
8. Admin xác nhận hoàn thành đơn hàng

## Mô hình dữ liệu

### Các entity chính
- **User**: Thông tin người dùng (khách hàng, nhân viên, admin)
- **Service**: Thông tin dịch vụ vệ sinh
- **Booking**: Thông tin đặt lịch
- **Promotion**: Thông tin khuyến mãi
- **Review**: Đánh giá của khách hàng
- **Payment**: Thông tin thanh toán

### Quan hệ giữa các entity
- User - Booking: One-to-Many (một người dùng có thể có nhiều đơn đặt lịch)
- Service - Booking: One-to-Many (một dịch vụ có thể được đặt nhiều lần)
- User (Staff) - Booking: One-to-Many (một nhân viên có thể được phân công nhiều đơn)
- Booking - Review: One-to-One (một đơn hàng có một đánh giá)
- Booking - Payment: One-to-One (một đơn hàng có một thanh toán)
- Promotion - Booking: One-to-Many (một khuyến mãi có thể áp dụng cho nhiều đơn hàng)

## Giao diện người dùng

### Thiết kế chung
- **Responsive**: Tương thích với các thiết bị di động, máy tính bảng và desktop
- **Accessibility**: Tuân thủ các tiêu chuẩn WCAG
- **Dark/Light mode**: Hỗ trợ chế độ tối và sáng
- **Đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Anh

### Trang chính
- Header với logo, menu, tìm kiếm, đăng nhập/đăng ký
- Hero section giới thiệu dịch vụ
- Danh sách dịch vụ nổi bật
- Các bước đặt lịch
- Đánh giá từ khách hàng
- Footer với thông tin liên hệ, sitemap

### Trang quản trị
- Sidebar với menu điều hướng
- Header với thông tin người dùng, thông báo
- Nội dung chính thay đổi theo từng trang
- Responsive design cho cả desktop và tablet

## Bảo mật

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password hashing với bcrypt
- HTTPS cho tất cả các request

### Bảo vệ dữ liệu
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Compliance
- GDPR compliance
- Data privacy
- Secure payment processing

## Triển khai

### Môi trường phát triển
- Local development environment
- Development server
- Staging server

### Môi trường sản xuất
- Production server
- Load balancing
- CDN cho static assets
- Database replication

### Monitoring & Maintenance
- Application monitoring
- Error tracking
- Performance monitoring
- Regular backups
- Security updates

## Roadmap

### Phase 1: MVP (Minimum Viable Product)
- Đăng ký, đăng nhập
- Danh sách dịch vụ
- Đặt lịch cơ bản
- Quản lý đơn hàng đơn giản
- Admin dashboard cơ bản

### Phase 2: Enhanced Features
- Thanh toán trực tuyến
- Hệ thống đánh giá
- Khuyến mãi và mã giảm giá
- Báo cáo và thống kê
- Quản lý nhân viên nâng cao

### Phase 3: Advanced Features
- Mobile app (React Native)
- Tích hợp chatbot
- Hệ thống thông báo realtime
- Tích hợp với các nền tảng khác
- Analytics và machine learning

## Kết luận

CleanHome là một hệ thống toàn diện giúp tối ưu hóa quy trình đặt lịch và quản lý dịch vụ vệ sinh. Với kiến trúc hiện đại, giao diện thân thiện và tính năng đầy đủ, CleanHome không chỉ nâng cao trải nghiệm khách hàng mà còn giúp doanh nghiệp vận hành hiệu quả hơn.

Dự án được phát triển với công nghệ tiên tiến, tuân thủ các tiêu chuẩn phát triển phần mềm và có khả năng mở rộng trong tương lai. Việc tích hợp các công nghệ như React, Flask và PostgreSQL đảm bảo hệ thống vận hành ổn định, bảo mật và có hiệu suất cao.
