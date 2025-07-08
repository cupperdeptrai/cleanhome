# Frontend - React Application

## Tổng quan

Frontend CleanHome được xây dựng bằng React 18 với TypeScript, cung cấp giao diện người dùng hiện đại và responsive cho cả khách hàng và quản trị viên.

## Công nghệ chính

- **React 18** - Framework UI component-based
- **TypeScript** - Type safety và development experience  
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool nhanh và hiện đại
- **React Router v7** - Client-side routing

## Cấu trúc thư mục

```
src/
├── components/          # UI components tái sử dụng
│   ├── Layout/         # Layout components
│   └── UI/             # Button, Input, Card...
├── pages/              # Page components
│   ├── auth/           # Login, Register
│   └── admin/          # Admin dashboard
├── services/           # API calls
├── hooks/              # Custom React hooks
├── context/            # React Context
├── types/              # TypeScript interfaces
└── utils/              # Helper functions
```

## Tính năng chính

### Giao diện khách hàng

#### 🏠 Trang chủ
- Hero section giới thiệu dịch vụ
- Danh sách dịch vụ nổi bật
- Testimonials từ khách hàng
- Call-to-action đặt lịch

#### 🛍️ Đặt lịch dịch vụ
- **Chọn dịch vụ**: Grid view với filter và search
- **Chọn thời gian**: Calendar picker với time slots
- **Thông tin**: Form nhập địa chỉ và ghi chú
- **Thanh toán**: Xác nhận đơn hàng

#### 📋 Quản lý đơn hàng
- Danh sách đơn hàng với status badges
- Filter theo trạng thái và ngày
- Chi tiết đơn hàng với timeline
- Đánh giá dịch vụ sau hoàn thành

### Giao diện quản trị

#### 📊 Dashboard
- **Stats cards**: Tổng đơn hàng, doanh thu, khách hàng
- **Charts**: Biểu đồ doanh thu, trend analysis
- **Quick actions**: Các thao tác nhanh
- **Recent activities**: Hoạt động gần đây

#### 📦 Quản lý đơn hàng
- **Table view**: Compact table với pagination
- **Filters**: Theo status, date range, staff
- **Bulk actions**: Cập nhật nhiều đơn cùng lúc
- **Staff assignment**: Phân công nhân viên

#### 👥 Quản lý người dùng
- **User management**: CRUD operations
- **Role assignment**: Customer, Staff, Admin
- **Status control**: Active/Inactive/Locked

## UI/UX Design

### Design System
- **Colors**: Primary blue, accent green, semantic colors
- **Typography**: Inter font với clear hierarchy  
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable với variant support

### Responsive Design
- **Mobile-first**: Thiết kế ưu tiên mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation**: Hamburger menu trên mobile, sidebar trên desktop

### Accessibility
- **Keyboard navigation**: Tab support đầy đủ
- **Screen reader**: ARIA labels và semantic HTML
- **Color contrast**: WCAG AA compliance
- **Focus indicators**: Rõ ràng và dễ nhận biết
```

Giao diện CleanHome được thiết kế để cung cấp trải nghiệm người dùng tối ưu với hiệu suất cao và khả năng bảo trì tốt.
- **State Management**: React Context API
- **Routing**: React Router v7
- **UI Components**: Headless UI
- **Icons**: Heroicons, Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite

## Kết luận

Frontend của CleanHome được thiết kế với mục tiêu tạo ra một ứng dụng web hiện đại, dễ sử dụng và có khả năng mở rộng. Việc sử dụng React, TypeScript và Tailwind CSS cùng với kiến trúc component-based giúp đảm bảo code dễ bảo trì và phát triển trong tương lai.
