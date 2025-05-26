/**
 * File chứa các hàm kiểm tra tính hợp lệ của dữ liệu
 */

/**
 * Kiểm tra email hợp lệ
 * @param email Email cần kiểm tra
 * @returns true nếu email hợp lệ, false nếu không
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra mật khẩu hợp lệ
 * Yêu cầu ít nhất 8 ký tự, có chữ hoa, chữ thường, số
 * @param password Mật khẩu cần kiểm tra
 * @returns true nếu mật khẩu hợp lệ, false nếu không
 */
export const isValidPassword = (password: string): boolean => {
  // Ít nhất 8 ký tự, có chữ hoa, chữ thường, số
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ
 * @param phone Số điện thoại cần kiểm tra
 * @returns true nếu số điện thoại hợp lệ, false nếu không
 */
export const isValidVietnamesePhone = (phone: string): boolean => {
  // Xóa các ký tự không phải số
  const cleaned = phone.replace(/\D/g, '');
  
  // Các tiền tố số điện thoại Việt Nam
  const validMobilePrefixes = ['032', '033', '034', '035', '036', '037', '038', '039', // Viettel
                            '070', '076', '077', '078', '079', // Mobifone
                            '081', '082', '083', '084', '085', // Vinaphone
                            '056', '058', '059', // Vietnamobile
                            '099', // Gmobile
                          ];
                                
  // Kiểm tra độ dài và tiền tố
  if (cleaned.length === 10) {
    const prefix = cleaned.substring(0, 3);
    return validMobilePrefixes.includes(prefix);
  }
  
  return false;
};

/**
 * Kiểm tra độ dài chuỗi nằm trong giới hạn
 * @param text Chuỗi cần kiểm tra
 * @param min Độ dài tối thiểu
 * @param max Độ dài tối đa
 * @returns true nếu độ dài nằm trong giới hạn, false nếu không
 */
export const isValidLength = (text: string, min: number, max: number): boolean => {
  if (!text) return false;
  const length = text.trim().length;
  return length >= min && length <= max;
};

/**
 * Kiểm tra số nằm trong khoảng
 * @param value Số cần kiểm tra
 * @param min Giá trị tối thiểu
 * @param max Giá trị tối đa
 * @returns true nếu số nằm trong khoảng, false nếu không
 */
export const isNumberInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Kiểm tra dữ liệu đăng ký
 * @param data Dữ liệu đăng ký
 * @returns Object chứa lỗi (nếu có)
 */
export const validateRegistration = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Kiểm tra tên
  if (!data.name || !isValidLength(data.name, 2, 50)) {
    errors.name = 'Tên phải từ 2 đến 50 ký tự';
  }
  
  // Kiểm tra email
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  // Kiểm tra mật khẩu
  if (!data.password || !isValidPassword(data.password)) {
    errors.password = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
  }
  
  // Kiểm tra mật khẩu nhập lại
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  }
  
  // Kiểm tra số điện thoại (nếu có)
  if (data.phone && !isValidVietnamesePhone(data.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }
  
  return errors;
};

/**
 * Kiểm tra dữ liệu đăng nhập
 * @param data Dữ liệu đăng nhập
 * @returns Object chứa lỗi (nếu có)
 */
export const validateLogin = (data: {
  email: string;
  password: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Kiểm tra email
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  // Kiểm tra mật khẩu
  if (!data.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  }
  
  return errors;
};

/**
 * Kiểm tra dữ liệu đặt lịch
 * @param data Dữ liệu đặt lịch
 * @returns Object chứa lỗi (nếu có)
 */
export const validateBooking = (data: {
  serviceId: string;
  date: string;
  time: string;
  address?: string;
  notes?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Kiểm tra dịch vụ
  if (!data.serviceId) {
    errors.serviceId = 'Vui lòng chọn dịch vụ';
  }
  
  // Kiểm tra ngày
  if (!data.date) {
    errors.date = 'Vui lòng chọn ngày';
  } else {
    const bookingDate = new Date(data.date);
    const today = new Date();
    
    // Đặt giờ, phút, giây về 0 để so sánh ngày
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      errors.date = 'Không thể đặt lịch cho ngày trong quá khứ';
    }
  }
  
  // Kiểm tra giờ
  if (!data.time) {
    errors.time = 'Vui lòng chọn giờ';
  }
  
  // Kiểm tra địa chỉ (nếu bắt buộc)
  if (!data.address) {
    errors.address = 'Vui lòng nhập địa chỉ';
  }
  
  return errors;
};

/**
 * Kiểm tra dữ liệu cập nhật thông tin người dùng
 * @param data Dữ liệu cập nhật
 * @returns Object chứa lỗi (nếu có)
 */
export const validateUserProfile = (data: {
  name?: string;
  phone?: string;
  address?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Kiểm tra tên
  if (data.name && !isValidLength(data.name, 2, 50)) {
    errors.name = 'Tên phải từ 2 đến 50 ký tự';
  }
  
  // Kiểm tra số điện thoại
  if (data.phone && !isValidVietnamesePhone(data.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }
  
  // Kiểm tra địa chỉ
  if (data.address && !isValidLength(data.address, 5, 200)) {
    errors.address = 'Địa chỉ phải từ 5 đến 200 ký tự';
  }
  
  return errors;
};

/**
 * Kiểm tra dữ liệu đổi mật khẩu
 * @param data Dữ liệu đổi mật khẩu
 * @returns Object chứa lỗi (nếu có)
 */
export const validatePasswordChange = (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Kiểm tra mật khẩu hiện tại
  if (!data.currentPassword) {
    errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
  }
  
  // Kiểm tra mật khẩu mới
  if (!data.newPassword || !isValidPassword(data.newPassword)) {
    errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số';
  }
  
  // Kiểm tra mật khẩu nhập lại
  if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp';
  }
  
  return errors;
};

export default {
  isValidEmail,
  isValidPassword,
  isValidVietnamesePhone,
  isValidLength,
  isNumberInRange,
  validateRegistration,
  validateLogin,
  validateBooking,
  validateUserProfile,
  validatePasswordChange,
};
