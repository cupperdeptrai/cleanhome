# Cấu trúc Frontend cho CleanHome

## Tổng quan

Frontend của CleanHome được xây dựng dựa trên React, TypeScript và Tailwind CSS, cung cấp giao diện người dùng hiện đại, thân thiện và dễ sử dụng cho cả khách hàng và quản trị viên.

## Công nghệ sử dụng

- **Framework**: React 18
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v7
- **UI Components**: Headless UI
- **Icons**: Heroicons, Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite

## Cấu trúc thư mục

```
src/
├── components/           # Các component tái sử dụng
│   ├── Layout/           # Các component layout
│   │   ├── MainLayout.tsx       # Layout chính cho người dùng
│   │   ├── DashboardLayout.tsx  # Layout cho trang quản trị
│   │   ├── Header.tsx           # Header chung
│   │   └── Footer.tsx           # Footer chung
│   └── UI/               # Các UI component
│       ├── Button.tsx           # Component nút
│       ├── Input.tsx            # Component input
│       ├── Card.tsx             # Component card
│       ├── ServiceCard.tsx      # Card hiển thị dịch vụ
│       └── BookingCard.tsx      # Card hiển thị đơn đặt lịch
├── context/              # React Context
│   └── AuthContext.tsx   # Context quản lý xác thực
├── hooks/                # Custom hooks
│   ├── useAuth.ts        # Hook xử lý authentication
│   ├── useForm.ts        # Hook xử lý form
│   └── useApi.ts         # Hook gọi API
├── pages/                # Các trang
│   ├── Home.tsx          # Trang chủ
│   ├── Services.tsx      # Trang dịch vụ
│   ├── BookingForm.tsx   # Form đặt lịch
│   ├── Bookings.tsx      # Danh sách đặt lịch
│   ├── Profile.tsx       # Trang thông tin cá nhân
│   ├── Support.tsx       # Trang hỗ trợ
│   ├── auth/             # Trang xác thực
│   │   ├── Login.tsx     # Trang đăng nhập
│   │   └── Register.tsx  # Trang đăng ký
│   └── admin/            # Trang quản trị
│       ├── Dashboard.tsx # Trang tổng quan
│       ├── Bookings.tsx  # Quản lý đặt lịch
│       ├── Services.tsx  # Quản lý dịch vụ
│       ├── Staff.tsx     # Quản lý nhân viên
│       ├── Users.tsx     # Quản lý người dùng
│       ├── Promotions.tsx # Quản lý khuyến mãi
│       ├── Reports.tsx   # Báo cáo thống kê
│       └── Settings.tsx  # Cài đặt hệ thống
├── services/             # Các service gọi API
│   ├── api.ts            # Cấu hình axios
│   ├── auth.service.ts   # Service xác thực
│   ├── booking.service.ts # Service đặt lịch
│   ├── service.service.ts # Service dịch vụ
│   └── user.service.ts   # Service người dùng
├── types/                # TypeScript types
│   └── index.ts          # Định nghĩa các interface
├── utils/                # Các hàm tiện ích
│   ├── formatters.ts     # Hàm format dữ liệu
│   ├── validators.ts     # Hàm validate
│   └── helpers.ts        # Các hàm helper khác
├── assets/               # Tài nguyên tĩnh
│   ├── images/           # Hình ảnh
│   └── styles/           # CSS/SCSS
├── App.tsx               # Component chính
├── main.tsx              # Entry point
└── index.css             # Global CSS
```

## Kiến trúc ứng dụng

### Component-based Architecture

CleanHome sử dụng kiến trúc dựa trên component, trong đó UI được chia thành các component nhỏ, tái sử dụng được. Điều này giúp:
- Tăng khả năng tái sử dụng code
- Dễ dàng bảo trì và mở rộng
- Phân chia trách nhiệm rõ ràng

### State Management

- **Local State**: Sử dụng React useState cho state của component
- **Global State**: Sử dụng React Context API cho state toàn cục (authentication, theme, etc.)
- **Form State**: Quản lý trạng thái form với custom hooks

### Routing

Sử dụng React Router v7 để quản lý routing với hai layout chính:
- **MainLayout**: Cho các trang người dùng thông thường
- **DashboardLayout**: Cho các trang quản trị

## Các tính năng chính

### Dành cho khách hàng

#### Trang chủ (Home.tsx)
- Giới thiệu dịch vụ
- Hiển thị các dịch vụ nổi bật
- Hiển thị đánh giá từ khách hàng
- Call-to-action để đặt lịch

#### Trang dịch vụ (Services.tsx)
- Danh sách tất cả dịch vụ
- Bộ lọc theo danh mục, giá
- Chi tiết dịch vụ

#### Đặt lịch (BookingForm.tsx)
- Form đặt lịch với các bước:
  1. Chọn dịch vụ
  2. Chọn ngày giờ
  3. Nhập thông tin liên hệ
  4. Xác nhận và thanh toán

#### Quản lý đặt lịch (Bookings.tsx)
- Danh sách đặt lịch của người dùng
- Xem chi tiết đặt lịch
- Hủy hoặc thay đổi đặt lịch

#### Thông tin cá nhân (Profile.tsx)
- Xem và cập nhật thông tin cá nhân
- Thay đổi mật khẩu
- Lịch sử đặt lịch

### Dành cho quản trị viên

#### Trang tổng quan (Dashboard.tsx)
- Thống kê tổng quan (đơn hàng, doanh thu, khách hàng)
- Biểu đồ doanh thu
- Danh sách đơn hàng gần đây

#### Quản lý đặt lịch (admin/Bookings.tsx)
- Danh sách tất cả đơn đặt lịch
- Bộ lọc theo trạng thái, ngày, dịch vụ
- Cập nhật trạng thái đơn hàng
- Phân công nhân viên

#### Quản lý dịch vụ (admin/Services.tsx)
- Danh sách dịch vụ
- Thêm/sửa/xóa dịch vụ
- Quản lý danh mục dịch vụ

#### Quản lý nhân viên (admin/Staff.tsx)
- Danh sách nhân viên
- Thêm/sửa/xóa nhân viên
- Xem lịch làm việc của nhân viên

#### Quản lý người dùng (admin/Users.tsx)
- Danh sách người dùng
- Thêm/sửa/xóa người dùng
- Phân quyền người dùng

#### Quản lý khuyến mãi (admin/Promotions.tsx)
- Danh sách khuyến mãi
- Thêm/sửa/xóa khuyến mãi
- Theo dõi sử dụng khuyến mãi

#### Báo cáo thống kê (admin/Reports.tsx)
- Báo cáo doanh thu
- Báo cáo dịch vụ
- Báo cáo khách hàng
- Xuất báo cáo

#### Cài đặt hệ thống (admin/Settings.tsx)
- Thông tin công ty
- Cài đặt email
- Cài đặt thanh toán

## UI/UX Design

### Thiết kế chung
- **Responsive**: Tương thích với các thiết bị di động, máy tính bảng và desktop
- **Accessibility**: Tuân thủ các tiêu chuẩn WCAG
- **Dark/Light mode**: Hỗ trợ chế độ tối và sáng

### Tailwind CSS
- Sử dụng Tailwind CSS để styling
- Custom theme với các màu sắc, font chủ đạo của thương hiệu
- Các component UI nhất quán

### UI Components
- Sử dụng Headless UI cho các component phức tạp (dropdown, modal, etc.)
- Custom UI components cho các thành phần đặc thù của ứng dụng

## Tương tác với Backend

### API Integration
- Sử dụng Axios để gọi API
- Tổ chức các service theo chức năng
- Xử lý lỗi và loading state

### Authentication
- JWT-based authentication
- Lưu trữ token trong localStorage hoặc cookies
- Automatic token refresh
- Protected routes

## Performance Optimization

### Code Splitting
- Lazy loading các component và trang
- Dynamic imports để giảm kích thước bundle

### Memoization
- Sử dụng React.memo, useMemo, useCallback để tối ưu render

### Image Optimization
- Lazy loading images
- Sử dụng các định dạng hiện đại (WebP)
- Responsive images

## Testing

### Unit Testing
- Jest cho unit tests
- Testing Library cho component tests

### Integration Testing
- Testing user flows
- API mocking

### E2E Testing
- Cypress cho end-to-end testing

## Deployment

### Build Process
- Vite build cho production
- Code minification và optimization
- Environment variables

### CI/CD
- GitHub Actions hoặc GitLab CI
- Automated testing
- Automated deployment

## Hướng dẫn phát triển

### Cài đặt
```bash
# Clone repository
git clone 
cd cleanhome

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### Coding Standards
- ESLint cho linting
- Prettier cho formatting
- TypeScript strict mode
- Conventional commits

### Git Workflow
- Feature branches
- Pull requests
- Code reviews
- Semantic versioning

## Kết luận

Frontend của CleanHome được thiết kế với mục tiêu tạo ra một ứng dụng web hiện đại, dễ sử dụng và có khả năng mở rộng. Việc sử dụng React, TypeScript và Tailwind CSS cùng với kiến trúc component-based giúp đảm bảo code dễ bảo trì và phát triển trong tương lai.
