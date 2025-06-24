import ApiService from './api';

/**
 * Enum cho trạng thái đơn đặt lịch
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Interface cho đơn đặt lịch
 */
export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  serviceName?: string; // Tên dịch vụ
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  address?: string;
  totalAmount?: number;
  staffId?: string;
  staffName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface cho dữ liệu tạo đơn đặt lịch mới
 */
export interface CreateBookingDTO {
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  address?: string;
}

/**
 * Interface cho dữ liệu tạo booking với payment method
 */
export interface CreateBookingData {
  service_id: string;
  booking_date: string; // YYYY-MM-DD format
  booking_time: string; // HH:MM format  
  duration?: number;
  customer_address: string;
  phone: string;
  notes?: string;
  payment_method: 'cash'; // Chỉ hỗ trợ tiền mặt hiện tại
}

/**
 * Interface cho dữ liệu cập nhật đơn đặt lịch
 */
export interface UpdateBookingDTO {
  status?: BookingStatus;
  date?: string;
  time?: string;
  notes?: string;
  address?: string;
}

/**
 * Interface cho tham số lọc danh sách đơn đặt lịch
 */
export interface BookingFilterParams {
  userId?: string;
  serviceId?: string;
  status?: BookingStatus;
  fromDate?: string;
  toDate?: string;
}

/**
 * Service quản lý đặt lịch
 * Cung cấp các phương thức để tạo, cập nhật, lấy danh sách đơn đặt lịch
 */
export class BookingService {
  private static readonly BASE_URL = '/bookings';

  /**
   * Lấy danh sách đơn đặt lịch
   * @param params Tham số lọc
   * @returns Promise<Booking[]> Danh sách đơn đặt lịch
   */
  public static async getBookings(params?: BookingFilterParams): Promise<Booking[]> {
    try {
      return await ApiService.get<Booking[]>(this.BASE_URL, { params });
    } catch (error) {
      console.error('Get bookings error:', error);
      throw error;
    }
  }
  /**
   * Lấy danh sách đơn đặt lịch của người dùng hiện tại
   * @param filters Bộ lọc tùy chọn
   * @returns Promise<Booking[]> Danh sách đơn đặt lịch
   */  public static async getUserBookings(filters?: {
    status?: string;
  }): Promise<Booking[]> {
    try {
      // Gọi API để lấy booking của user hiện tại (đã authenticated)
      // Backend sẽ tự động lấy userId từ JWT token
      const params = new URLSearchParams();
      
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const queryString = params.toString();
      const url = queryString ? `/bookings/my-bookings?${queryString}` : '/bookings/my-bookings';
      
      console.log('🔗 Calling API:', url);
      console.log('🔑 Token available:', !!localStorage.getItem('token'));
      console.log('🎯 API Base URL:', import.meta.env.VITE_API_URL);
      
      const result = await ApiService.get<Booking[]>(url);
      console.log('✅ API Response received:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Get user bookings error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách đơn đặt lịch của người dùng cụ thể (dành cho admin)
   * @param userId ID người dùng
   * @returns Promise<Booking[]> Danh sách đơn đặt lịch
   */
  public static async getBookingsByUserId(userId: string): Promise<Booking[]> {
    try {
      return await ApiService.get<Booking[]>(`${this.BASE_URL}/user/${userId}`);
    } catch (error) {
      console.error('Get user bookings by ID error:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết đơn đặt lịch
   * @param id ID đơn đặt lịch
   * @returns Promise<Booking> Chi tiết đơn đặt lịch
   */
  public static async getBookingById(id: string): Promise<Booking> {
    try {
      return await ApiService.get<Booking>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error('Get booking error:', error);
      throw error;
    }
  }
  /**
   * Tạo đơn đặt lịch mới với payment method
   * @param bookingData Dữ liệu đặt lịch bao gồm thông tin thanh toán
   * @returns Promise<Booking> Thông tin booking vừa tạo
   */
  public static async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    try {
      console.log('📅 Đang tạo booking mới với dữ liệu:', bookingData);
      
      // Validate payment method - chỉ cho phép tiền mặt
      if (bookingData.payment_method !== 'cash') {
        throw new Error('Hiện tại chỉ hỗ trợ thanh toán bằng tiền mặt');
      }
      
      // Gọi API tạo booking
      const response = await ApiService.post<{
        status: string;
        message: string;
        booking: Booking;
      }>(`${this.BASE_URL}/`, bookingData);
      
      console.log('✅ Tạo booking thành công:', response.booking);
      
      // Trả về thông tin booking đã tạo
      return response.booking;      
    } catch (error) {
      console.error('❌ Lỗi khi tạo booking:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đơn đặt lịch
   * @param id ID đơn đặt lịch
   * @param data Dữ liệu cập nhật
   * @returns Promise<Booking> Đơn đặt lịch đã cập nhật
   */
  public static async updateBooking(id: string, data: UpdateBookingDTO): Promise<Booking> {
    try {
      return await ApiService.put<Booking>(`${this.BASE_URL}/${id}`, data);
    } catch (error) {
      console.error('Update booking error:', error);
      throw error;
    }
  }

  /**
   * Xác nhận đơn đặt lịch
   * @param id ID đơn đặt lịch
   * @returns Promise<Booking> Đơn đặt lịch đã xác nhận
   */
  public static async confirmBooking(id: string): Promise<Booking> {
    try {
      return await ApiService.put<Booking>(`${this.BASE_URL}/${id}/confirm`, {
        status: BookingStatus.CONFIRMED,
      });
    } catch (error) {
      console.error('Confirm booking error:', error);
      throw error;
    }
  }

  /**
   * Hoàn thành đơn đặt lịch
   * @param id ID đơn đặt lịch
   * @returns Promise<Booking> Đơn đặt lịch đã hoàn thành
   */
  public static async completeBooking(id: string): Promise<Booking> {
    try {
      return await ApiService.put<Booking>(`${this.BASE_URL}/${id}/complete`, {
        status: BookingStatus.COMPLETED,
      });
    } catch (error) {
      console.error('Complete booking error:', error);
      throw error;
    }
  }  /**
   * Hủy đơn đặt lịch
   * @param id ID đơn đặt lịch
   * @param reason Lý do hủy (tùy chọn)
   * @returns Promise<Booking> Đơn đặt lịch đã hủy
   */
  public static async cancelBooking(id: string, reason?: string): Promise<Booking> {
    try {
      const data: Record<string, string> = {
        status: BookingStatus.CANCELLED,
      };
      
      // Thêm lý do hủy nếu có
      if (reason) {
        data.cancel_reason = reason;
      }
      
      return await ApiService.put<Booking>(`${this.BASE_URL}/${id}/cancel`, data);
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem thời gian có sẵn để đặt lịch không
   * @param date Ngày đặt lịch
   * @param time Giờ đặt lịch
   * @returns Promise<boolean> Trạng thái khả dụng
   */
  public static async checkAvailability(date: string, time: string): Promise<boolean> {
    try {
      const response = await ApiService.get<{ available: boolean }>(`${this.BASE_URL}/check-availability`, {
        params: { date, time },
      });
      return response.available;
    } catch (error) {
      console.error('Check availability error:', error);
      throw error;
    }
  }

  /**
   * Xóa đơn đặt lịch (chỉ admin)
   * @param id ID đơn đặt lịch
   * @returns Promise<void>
   */
  public static async deleteBooking(id: string): Promise<void> {
    try {
      await ApiService.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error('Delete booking error:', error);
      throw error;
    }
  }
}

export default BookingService;
