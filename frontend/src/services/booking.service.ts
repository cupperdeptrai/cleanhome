import ApiService from './api';
import { Booking, CreateBookingData, BookingCreationResponse, UpdateBookingDTO, BookingFilterParams } from '../types';

/**
 * Service quản lý đặt lịch
 * Cung cấp các phương thức để tạo, cập nhật, lấy danh sách đơn đặt lịch
 */
export class BookingService {
  private readonly BASE_URL = '/bookings';

  /**
   * Lấy danh sách đơn đặt lịch của người dùng hiện tại
   * @param params Tham số lọc
   * @returns Promise<Booking[]> Danh sách đơn đặt lịch
   */
  public async getUserBookings(params?: BookingFilterParams): Promise<Booking[]> {
    try {
      return await ApiService.get<Booking[]>(`${this.BASE_URL}/my-bookings`, { params });
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  }

  /**
   * Tạo đơn đặt lịch mới
   * @param bookingData Dữ liệu đơn đặt lịch mới
   * @returns Promise<BookingCreationResponse> Thông tin đơn đặt lịch đã tạo, có thể kèm URL thanh toán
   */
  public async createBooking(bookingData: CreateBookingData): Promise<BookingCreationResponse> {
    try {
      // Gửi request POST đến API để tạo booking mới
      const response = await ApiService.post<BookingCreationResponse>(`${this.BASE_URL}/`, bookingData);
      return response;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết đơn đặt lịch
   * @param id ID của đơn đặt lịch
   * @returns Promise<Booking> Chi tiết đơn đặt lịch
   */
  public async getBookingById(id: string): Promise<Booking> {
    try {
      return await ApiService.get<Booking>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Get booking with id ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật đơn đặt lịch
   * @param id ID của đơn đặt lịch
   * @param bookingData Dữ liệu cập nhật
   * @returns Promise<Booking> Đơn đặt lịch đã được cập nhật
   */
  public async updateBooking(id: string, bookingData: UpdateBookingDTO): Promise<Booking> {
    try {
      return await ApiService.put<Booking>(`${this.BASE_URL}/${id}`, bookingData);
    } catch (error) {
      console.error(`Update booking with id ${id} error:`, error);
      throw error;
    }
  }

  /**
   * Hủy đơn đặt lịch
   * @param id ID của đơn đặt lịch
   * @returns Promise<void>
   */
  public async cancelBooking(id: string): Promise<void> {
    try {
      await ApiService.put<void>(`${this.BASE_URL}/${id}/cancel`);
    } catch (error) {
      console.error(`Cancel booking with id ${id} error:`, error);
      throw error;
    }
  }
}

// Xuất ra một instance duy nhất của service (Singleton Pattern)
const bookingService = new BookingService();
export default bookingService;
