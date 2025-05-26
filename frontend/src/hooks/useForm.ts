import { useState, useCallback } from 'react';
import { useApi } from './useApi';

/**
 * Định nghĩa kiểu dữ liệu cho đơn đặt lịch
 * Bao gồm thông tin dịch vụ, ngày giờ và trạng thái
 */
interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

/**
 * Định nghĩa kiểu dữ liệu cho dữ liệu đặt lịch mới
 * Không bao gồm id và status (sẽ được tạo tự động)
 */
export interface BookingFormData {
  userId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  address?: string;
}

/**
 * Định nghĩa kiểu dữ liệu cho hook
 * Cung cấp các phương thức để quản lý đơn đặt lịch
 */
interface UseBooking {
  bookings: Booking[];
  checkAvailability: (date: string, time: string) => Promise<boolean>;
  createBooking: (bookingData: BookingFormData) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook useBooking - cung cấp logic quản lý đơn đặt lịch
 * Sử dụng useApi hook để gọi API
 * @returns UseBooking Interface với các phương thức quản lý booking
 */
export const useBooking = (): UseBooking => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { get, post, put } = useApi();

  /**
   * Kiểm tra thời gian có sẵn để đặt lịch
   * @param date Ngày đặt lịch (format: YYYY-MM-DD)
   * @param time Giờ đặt lịch (format: HH:MM)
   * @returns Promise<boolean> true nếu thời gian có sẵn, false nếu đã được đặt
   */
  const checkAvailability = useCallback(async (date: string, time: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const existingBookings = await get<Booking[]>('/bookings');
      const isAvailable = !existingBookings.some(
        (booking) => booking.date === date && booking.time === time && booking.status !== 'cancelled'
      );
      return isAvailable;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi kiểm tra thời gian';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [get]);

  /**
   * Tạo đơn đặt lịch mới
   * @param bookingData Dữ liệu đặt lịch
   * @returns Promise<Booking> Đơn đặt lịch đã được tạo
   */
  const createBooking = useCallback(async (bookingData: BookingFormData): Promise<Booking> => {
    setLoading(true);
    setError(null);
    try {
      // Kiểm tra xem thời gian có sẵn không
      const isAvailable = await checkAvailability(bookingData.date, bookingData.time);
      if (!isAvailable) {
        throw new Error('Khung giờ đã được đặt, vui lòng chọn thời gian khác');
      }

      // Tạo booking mới
      const response = await post<Booking>('/bookings/create', bookingData);
      
      // Cập nhật state
      setBookings((prevBookings) => [...prevBookings, response]);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi đặt lịch';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAvailability, post]);

  /**
   * Hủy đơn đặt lịch
   * @param bookingId ID của đơn đặt lịch cần hủy
   * @returns Promise<boolean> true nếu hủy thành công
   */
  const cancelBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await put<Booking>(`/bookings/${bookingId}/cancel`, { status: 'cancelled' });
      
      // Cập nhật state
      setBookings((prevBookings) => 
        prevBookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
        )
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi hủy đặt lịch';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [put]);

  /**
   * Lấy danh sách đơn đặt lịch của người dùng
   * @param userId ID của người dùng
   * @returns Promise<Booking[]> Danh sách đơn đặt lịch
   */
  const getUserBookings = useCallback(async (userId: string): Promise<Booking[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await get<Booking[]>(`/bookings/user/${userId}`);
      setBookings(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi lấy danh sách đặt lịch';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [get]);

  return { 
    bookings, 
    checkAvailability, 
    createBooking, 
    cancelBooking, 
    getUserBookings, 
    loading, 
    error 
  };
};
