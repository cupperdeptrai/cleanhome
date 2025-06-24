/**
 * Utility functions cho việc format thời gian theo múi giờ Việt Nam
 */

/**
 * Format ngày giờ đầy đủ theo múi giờ Việt Nam
 * @param dateString - Chuỗi thời gian ISO hoặc timestamp
 * @returns Chuỗi thời gian đã format: "dd/MM/yyyy, HH:mm:ss"
 */
export const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return 'Không xác định';
  
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Format chỉ ngày theo múi giờ Việt Nam
 * @param dateString - Chuỗi thời gian ISO hoặc timestamp
 * @returns Chuỗi ngày đã format: "Thứ X, dd tháng MM năm yyyy"
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'Không xác định';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format chỉ giờ theo múi giờ Việt Nam
 * @param dateString - Chuỗi thời gian ISO hoặc timestamp
 * @returns Chuỗi giờ đã format: "HH:mm"
 */
export const formatTime = (dateString: string | Date): string => {
  if (!dateString) return 'Không xác định';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format ngày ngắn gọn theo múi giờ Việt Nam
 * @param dateString - Chuỗi thời gian ISO hoặc timestamp
 * @returns Chuỗi ngày đã format: "dd/MM/yyyy"
 */
export const formatDateShort = (dateString: string | Date): string => {
  if (!dateString) return 'Không xác định';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format tiền tệ theo định dạng Việt Nam
 * @param amount - Số tiền cần format
 * @returns Chuỗi tiền tệ đã format: "1.000.000 VNĐ"
 */
export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 VNĐ';
  
  return amount.toLocaleString('vi-VN') + ' VNĐ';
};
