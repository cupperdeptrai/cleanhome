/**
 * File chứa các hàm tiện ích sử dụng trong toàn bộ ứng dụng
 */

/**
 * Tạo một ID duy nhất
 * @returns ID duy nhất dựa trên timestamp và số ngẫu nhiên
 */
export const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Lấy thời gian hiện tại dưới dạng chuỗi ISO
 * @returns Chuỗi ngày giờ định dạng ISO
 */
export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

/**
 * Kiểm tra xem giá trị có rỗng không (null, undefined, chuỗi rỗng, mảng rỗng)
 * @param value Giá trị cần kiểm tra
 * @returns true nếu giá trị rỗng, false nếu không
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Làm tròn số đến số thập phân chỉ định
 * @param value Số cần làm tròn
 * @param decimals Số chữ số thập phân (mặc định: 2)
 * @returns Số đã làm tròn
 */
export const roundNumber = (value: number, decimals: number = 2): number => {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

/**
 * Phát hiện thiết bị di động
 * @returns true nếu là thiết bị di động, false nếu không
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Lấy danh sách các ngày trong khoảng thời gian
 * @param startDate Ngày bắt đầu
 * @param endDate Ngày kết thúc
 * @returns Mảng các đối tượng Date
 */
export const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Lấy danh sách các khung giờ trong ngày
 * @param startHour Giờ bắt đầu (mặc định: 8)
 * @param endHour Giờ kết thúc (mặc định: 20)
 * @param interval Khoảng thời gian giữa các khung giờ (phút, mặc định: 60)
 * @returns Mảng các chuỗi thời gian (định dạng: 'HH:MM')
 */
export const getTimeSlots = (startHour: number = 8, endHour: number = 20, interval: number = 60): string[] => {
  const slots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      slots.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  
  return slots;
};

/**
 * Lấy khoảng cách giữa hai ngày, tính bằng ngày
 * @param date1 Ngày thứ nhất
 * @param date2 Ngày thứ hai
 * @returns Số ngày chênh lệch
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Kiểm tra định dạng email
 * @param email Địa chỉ email cần kiểm tra
 * @returns true nếu định dạng hợp lệ, false nếu không
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra định dạng số điện thoại Việt Nam
 * @param phone Số điện thoại cần kiểm tra
 * @returns true nếu định dạng hợp lệ, false nếu không
 */
export const isValidVietnamesePhone = (phone: string): boolean => {
  // Xóa các ký tự không phải số
  const cleaned = phone.replace(/\D/g, '');
  
  // Kiểm tra độ dài và tiền tố theo chuẩn Việt Nam
  if (cleaned.length !== 10 && cleaned.length !== 11) {
    return false;
  }
  
  // Kiểm tra tiền tố
  const prefix = cleaned.substring(0, 2);
  const validPrefixes = ['03', '05', '07', '08', '09'];
  
  if (cleaned.length === 10 && validPrefixes.includes(prefix)) {
    return true;
  }
  
  const prefix4 = cleaned.substring(0, 4);
  if (cleaned.length === 11 && prefix4 === '0162') {
    return true;
  }
  
  return false;
};

/**
 * Lọc và sắp xếp mảng đối tượng theo thuộc tính
 * @param array Mảng cần lọc và sắp xếp
 * @param filterKey Khóa lọc
 * @param filterValue Giá trị lọc
 * @param sortKey Khóa sắp xếp
 * @param sortOrder Thứ tự sắp xếp ('asc' hoặc 'desc')
 * @returns Mảng đã lọc và sắp xếp
 */
export const filterAndSortArray = <T>(
  array: T[],
  filterKey?: keyof T,
  filterValue?: any,
  sortKey?: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] => {
  // Tạo bản sao của mảng để tránh thay đổi mảng gốc
  let result = [...array];
  
  // Lọc mảng nếu cần
  if (filterKey && filterValue !== undefined) {
    result = result.filter(item => item[filterKey] === filterValue);
  }
  
  // Sắp xếp mảng nếu cần
  if (sortKey) {
    result.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      
      // Xử lý các kiểu dữ liệu khác nhau
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }
      
      // Xử lý các kiểu dữ liệu khác (Date, boolean, v.v.)
      if (valueA instanceof Date && valueB instanceof Date) {
        return sortOrder === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }
      
      return 0;
    });
  }
  
  return result;
};

/**
 * Kiểm tra thời gian có nằm trong khoảng làm việc không
 * @param time Chuỗi thời gian cần kiểm tra (định dạng: 'HH:MM')
 * @param startHour Giờ bắt đầu làm việc (mặc định: 8)
 * @param endHour Giờ kết thúc làm việc (mặc định: 20)
 * @returns true nếu thời gian nằm trong khoảng làm việc, false nếu không
 */
export const isWithinWorkingHours = (
  time: string,
  startHour: number = 8,
  endHour: number = 20
): boolean => {
  if (!time || !time.includes(':')) return false;
  
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  
  if (isNaN(hour)) return false;
  
  return hour >= startHour && hour < endHour;
};

/**
 * Chuyển đổi chuỗi ngày tháng sang đối tượng Date
 * @param dateString Chuỗi ngày tháng (định dạng: 'DD/MM/YYYY')
 * @returns Đối tượng Date
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Xử lý định dạng DD/MM/YYYY
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  }
  
  // Xử lý định dạng YYYY-MM-DD
  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const [year, month, day] = parts.map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        return new Date(year, month - 1, day);
      } else {
        // DD-MM-YYYY
        const [day, month, year] = parts.map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        return new Date(year, month - 1, day);
      }
    }
  }
  
  // Thử phân tích cú pháp thông thường
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Trộn (shuffle) một mảng
 * @param array Mảng cần trộn
 * @returns Mảng đã được trộn
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default {
  generateId,
  getCurrentDateTime,
  isEmpty,
  roundNumber,
  isMobileDevice,
  getDatesInRange,
  getTimeSlots,
  getDaysDifference,
  isValidEmail,
  isValidVietnamesePhone,
  filterAndSortArray,
  isWithinWorkingHours,
  parseDate,
  shuffleArray,
};
