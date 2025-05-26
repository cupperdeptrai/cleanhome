/**
 * Định dạng số tiền sang định dạng tiền tệ Việt Nam
 * @param amount Số tiền cần định dạng
 * @param currency Đơn vị tiền tệ (mặc định: 'VND')
 * @returns Chuỗi đã định dạng (ví dụ: 100,000 ₫)
 */
export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });
  
  return formatter.format(amount);
};

/**
 * Định dạng ngày tháng theo định dạng Việt Nam
 * @param dateString Chuỗi ngày tháng hoặc đối tượng Date
 * @param format Định dạng (mặc định: 'DD/MM/YYYY')
 * @returns Chuỗi ngày tháng đã định dạng
 */
export const formatDate = (dateString: string | Date, format: string = 'DD/MM/YYYY'): string => {
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Ngày không hợp lệ';
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'HH:mm DD/MM/YYYY':
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    case 'HH:mm':
      return `${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Định dạng giờ từ chuỗi 24 giờ sang 12 giờ
 * @param time Chuỗi giờ (định dạng 24 giờ, ví dụ: '14:30')
 * @returns Chuỗi giờ định dạng 12 giờ (ví dụ: '2:30 PM')
 */
export const formatTime12Hour = (time: string): string => {
  if (!time || !time.includes(':')) return time;
  
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  
  if (isNaN(hour)) return time;
  
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minuteStr} ${suffix}`;
};

/**
 * Định dạng số điện thoại Việt Nam
 * @param phone Chuỗi số điện thoại cần định dạng
 * @returns Chuỗi số điện thoại đã định dạng (ví dụ: 090.123.4567)
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Xóa các ký tự không phải số
  const cleaned = phone.replace(/\D/g, '');
  
  // Kiểm tra độ dài và định dạng theo chuẩn Việt Nam
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1.$2.$3');
  }
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1.$2.$3');
  }
  
  // Trả về số đã làm sạch nếu không khớp với cấu trúc chuẩn
  return cleaned;
};

/**
 * Định dạng địa chỉ email, ẩn một phần để bảo vệ thông tin
 * @param email Địa chỉ email cần ẩn một phần
 * @returns Địa chỉ email đã được ẩn một phần (ví dụ: j***@example.com)
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  
  const [username, domain] = email.split('@');
  
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  
  return `${username[0]}${username
    .substring(1, username.length - 1)
    .replace(/./g, '*')}${username[username.length - 1]}@${domain}`;
};

/**
 * Chuyển đổi độ dài thời gian sang chuỗi thời gian dễ đọc
 * @param minutes Số phút
 * @returns Chuỗi thời gian (ví dụ: "1 giờ 30 phút")
 */
export const formatDuration = (minutes: number): string => {
  if (isNaN(minutes) || minutes < 0) {
    return '';
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} phút`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }
  
  return `${hours} giờ ${remainingMinutes} phút`;
};

/**
 * Định dạng trạng thái đặt lịch sang chuỗi tiếng Việt dễ đọc
 * @param status Trạng thái đặt lịch
 * @returns Chuỗi trạng thái đã định dạng
 */
export const formatBookingStatus = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'completed':
      return 'Đã hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

/**
 * Chuyển đổi chuỗi thành định dạng tiêu đề (capitalize)
 * @param text Chuỗi cần chuyển đổi
 * @returns Chuỗi đã được chuyển đổi
 */
export const toTitleCase = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Rút gọn chuỗi nếu dài quá giới hạn
 * @param text Chuỗi cần rút gọn
 * @param maxLength Độ dài tối đa (mặc định: 50)
 * @returns Chuỗi đã rút gọn
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

export default {
  formatCurrency,
  formatDate,
  formatTime12Hour,
  formatPhoneNumber,
  maskEmail,
  formatDuration,
  formatBookingStatus,
  toTitleCase,
  truncateText,
};
