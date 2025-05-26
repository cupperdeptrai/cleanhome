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
  status: BookingStatus;
  notes?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface cho dữ liệu tạo đơn đặt lịch
 */
export interface CreateBookingDTO {
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  address?: string;
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
   * Lấy danh sách đơn đặt lịch của người dùng
   * @param userId ID người dùng
   * @returns Promise<Booking[]> Danh sách đơn đặt lịch
   */
  public static async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      return await ApiService.get<Booking[]>(`${this.BASE_URL}/user/${userId}`);
    } catch (error) {
      console.error('Get user bookings error:', error);
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
   * Tạo đơn đặt lịch
   * @param data Dữ liệu đơn đặt lịch
   * @returns Promise<Booking> Đơn đặt lịch đã tạo
   */
  public static async createBooking(data: CreateBookingDTO): Promise<Booking> {
    try {
      return await ApiService.post<Booking>(this.BASE_URL, data);
    } catch (error) {
      console.error('Create booking error:', error);
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
  }

  /**
   * Hủy đơn đặt lịch
   * @param id ID đơn đặt lịch
   * @returns Promise<Booking> Đơn đặt lịch đã hủy
   */
  public static async cancelBooking(id: string): Promise<Booking> {
    try {
      return await ApiService.put<Booking>(`${this.BASE_URL}/${id}/cancel`, {
        status: BookingStatus.CANCELLED,
      });
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
