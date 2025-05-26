// Định nghĩa các kiểu dữ liệu cho ứng dụng

// Kiểu dữ liệu cho người dùng
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  phone?: string;
  address?: string;
  avatar?: string;
}

// Kiểu dữ liệu cho dịch vụ
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // Thời gian thực hiện (phút)
  image: string;
  category: string;
  isActive: boolean;
}

// Kiểu dữ liệu cho đơn đặt lịch
export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  serviceName?: string; // Tên dịch vụ
  staffId?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  address: string;
  notes?: string; // Lưu ý từ người dùng
  price: number;
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod?: 'cash' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  createdAt: string;
  updatedAt: string;
}

// Kiểu dữ liệu cho khuyến mãi
export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
}

// Kiểu dữ liệu cho đánh giá
export interface Review {
  id: string;
  userId: string;
  bookingId: string;
  serviceId: string;
  staffId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// Kiểu dữ liệu cho slot thời gian trong lịch làm việc
export interface TimeSlot {
  start: string;
  end: string;
  bookingId?: string;
}

// Kiểu dữ liệu cho lịch làm việc của nhân viên theo ngày
export interface StaffSchedule {
  date: string;
  timeSlots: TimeSlot[];
}

// Kiểu dữ liệu cho nhân viên
export interface Staff extends User {
  skills: string[];
  rating: number;
  completedJobs: number;
  isAvailable: boolean;
  schedule: StaffSchedule[];
}

// Kiểu dữ liệu cho thông báo
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'promotion' | 'system' | 'review';
  isRead: boolean;
  createdAt: string;
}

// Kiểu dữ liệu cho thống kê
export interface Stats {
  totalBookings: number;
  totalRevenue: number;
  newCustomers: number;
  newReviews: number;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

// Kiểu dữ liệu cho hoạt động người dùng
export interface Activity {
  id: string;
  userId: string;
  type: string; // e.g., 'booking', 'profile_update', 'password_change', 'login'
  description: string;
  createdAt: string; // ISO date string, e.g., '2023-07-10T08:30:00Z'
}
