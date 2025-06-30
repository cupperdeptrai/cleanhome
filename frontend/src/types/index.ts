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
  staffName?: string; // Tên nhân viên
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  address?: string; // Có thể undefined từ backend
  notes?: string; // Lưu ý từ người dùng
  totalAmount?: number; // Tổng tiền
  subtotal?: number; // Tiền dịch vụ
  discountAmount?: number; // Tiền giảm giá
  paymentStatus?: 'paid' | 'unpaid' | 'refunded' | 'failed' | 'pending';
  paymentMethod?: 'cash' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  createdAt?: string;
  updatedAt?: string;
  // Giữ lại các field cũ để tương thích
  price?: number;
}

/**
 * Kiểu dữ liệu cho việc cập nhật đơn đặt lịch
 */
export interface UpdateBookingDTO {
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  date?: string;
  time?: string;
  notes?: string;
  address?: string;
  staffId?: string;
}

/**
 * Kiểu dữ liệu cho tham số lọc danh sách đơn đặt lịch
 */
export interface BookingFilterParams {
  userId?: string;
  serviceId?: string;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'all';
  fromDate?: string;
  toDate?: string;
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

/**
 * Kiểu dữ liệu cho việc tạo mới đơn đặt lịch
 * Gửi lên API backend
 */
export interface CreateBookingData {
  service_id: string;
  booking_date: string;
  booking_time: string;
  customer_address: string;
  area?: number; // Diện tích (m2) - tuỳ chọn
  quantity?: number; // Số lượng dịch vụ - mặc định là 1
  notes?: string;
  service_notes?: string; // Ghi chú cho service riêng biệt
  payment_method: 'cash' | 'vnpay' | 'bank_transfer' | 'credit_card' | 'momo' | 'zalopay';
  discount?: number; // Giảm giá - mặc định là 0
  tax?: number; // Thuế - mặc định là 0
}

/**
 * Kiểu dữ liệu cho phản hồi từ API khi tạo booking
 * Có thể chứa payment_url nếu thanh toán qua VNPAY
 */
export interface BookingCreationResponse {
  status: string;
  message: string;
  booking: Booking;
  payment_url?: string; // URL thanh toán VNPAY nếu có
}
