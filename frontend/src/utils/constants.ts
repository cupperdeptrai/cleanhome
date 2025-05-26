/**
 * File chứa các hằng số được sử dụng trong toàn bộ ứng dụng
 */

/**
 * Các đường dẫn của ứng dụng
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',
  
  BOOKING: '/booking',
  BOOKING_CONFIRM: '/booking/confirm',
  BOOKING_SUCCESS: '/booking/success',
  
  USER_PROFILE: '/profile',
  USER_BOOKINGS: '/profile/bookings',
  USER_SETTINGS: '/profile/settings',
  
  ADMIN_DASHBOARD: '/admin',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
};

/**
 * Các loại vai trò người dùng
 */
export const USER_ROLES = {
  USER: 'user',
  STAFF: 'staff',
  ADMIN: 'admin',
};

/**
 * Các trạng thái đơn đặt lịch
 */
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * Các danh mục dịch vụ
 */
export const SERVICE_CATEGORIES = [
  {
    id: 'home',
    name: 'Nhà ở',
    description: 'Dịch vụ vệ sinh và chăm sóc nhà ở',
    icon: 'home',
  },
  {
    id: 'office',
    name: 'Văn phòng',
    description: 'Dịch vụ vệ sinh văn phòng chuyên nghiệp',
    icon: 'building',
  },
  {
    id: 'apartment',
    name: 'Chung cư',
    description: 'Dịch vụ vệ sinh chung cư theo khu vực',
    icon: 'apartment',
  },
  {
    id: 'furniture',
    name: 'Nội thất',
    description: 'Dịch vụ vệ sinh và bảo dưỡng nội thất',
    icon: 'furniture',
  },
  {
    id: 'special',
    name: 'Dịch vụ đặc biệt',
    description: 'Các dịch vụ vệ sinh đặc biệt theo yêu cầu',
    icon: 'clean',
  },
];

/**
 * Thời gian làm việc mặc định
 */
export const WORKING_HOURS = {
  START: 8, // 8:00 AM
  END: 20, // 8:00 PM
  INTERVAL: 60, // 60 phút
};

/**
 * Cài đặt phân trang mặc định
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  ITEMS_PER_PAGE_OPTIONS: [5, 10, 20, 50, 100],
};

/**
 * Cài đặt thời gian
 */
export const TIME_SETTINGS = {
  BOOKING_ADVANCE_DAYS: 7, // Số ngày tối đa cho phép đặt lịch trước
  CANCEL_DEADLINE_HOURS: 24, // Số giờ trước khi dịch vụ bắt đầu cho phép hủy lịch
};

/**
 * Các thông báo lỗi chung
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  INVALID_PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự',
  PASSWORDS_NOT_MATCH: 'Mật khẩu nhập lại không khớp',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  NETWORK_ERROR: 'Lỗi kết nối mạng, vui lòng thử lại sau',
  SERVER_ERROR: 'Đã xảy ra lỗi từ máy chủ, vui lòng thử lại sau',
  UNAUTHORIZED: 'Bạn không có quyền truy cập vào trang này',
};

/**
 * Các thông báo thành công
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  PASSWORD_RESET_EMAIL_SENT: 'Email đặt lại mật khẩu đã được gửi',
  PASSWORD_RESET_SUCCESS: 'Đặt lại mật khẩu thành công',
  PROFILE_UPDATE_SUCCESS: 'Cập nhật thông tin thành công',
  PASSWORD_CHANGE_SUCCESS: 'Đổi mật khẩu thành công',
  BOOKING_CREATE_SUCCESS: 'Đặt lịch thành công',
  BOOKING_CANCEL_SUCCESS: 'Hủy lịch thành công',
};

/**
 * Các cài đặt theme
 */
export const THEME = {
  PRIMARY_COLOR: '#4CD62A',
  SECONDARY_COLOR: '#2CB9B0',
  ERROR_COLOR: '#FF4842',
  WARNING_COLOR: '#FFC107',
  INFO_COLOR: '#1890FF',
  SUCCESS_COLOR: '#54D62C',
  BACKGROUND_COLOR: '#F5F5F5',
  TEXT_COLOR: '#212B36',
};

/**
 * Các cài đặt API
 */
export const API_SETTINGS = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
};

/**
 * Các tùy chọn đánh giá
 */
export const RATING_OPTIONS = [
  { value: 1, label: 'Rất tệ' },
  { value: 2, label: 'Tệ' },
  { value: 3, label: 'Bình thường' },
  { value: 4, label: 'Tốt' },
  { value: 5, label: 'Rất tốt' },
];

/**
 * Các tùy chọn thanh toán
 */
export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Tiền mặt', description: 'Thanh toán bằng tiền mặt khi dịch vụ hoàn thành' },
  { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản trước khi dịch vụ' },
  { id: 'momo', name: 'Ví MoMo', description: 'Thanh toán qua ví điện tử MoMo' },
  { id: 'vnpay', name: 'VNPay', description: 'Thanh toán qua cổng VNPay' },
];

export default {
  ROUTES,
  USER_ROLES,
  BOOKING_STATUS,
  SERVICE_CATEGORIES,
  WORKING_HOURS,
  PAGINATION,
  TIME_SETTINGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  THEME,
  API_SETTINGS,
  RATING_OPTIONS,
  PAYMENT_METHODS,
};
