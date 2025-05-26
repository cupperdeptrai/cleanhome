import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Định nghĩa kiểu dữ liệu cho phản hồi API
 * Bao gồm dữ liệu, mã trạng thái và thông báo lỗi (nếu có)
 */
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

/**
 * Interface cho dữ liệu booking
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
 * Interface cho dữ liệu dịch vụ
 */
interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
}

/**
 * Interface cho dữ liệu tạo booking
 */
interface CreateBookingData {
  serviceId: string;
  date: string;
  time: string;
  [key: string]: any;
}

/**
 * Định nghĩa kiểu dữ liệu cho hook
 * Cung cấp các phương thức gọi API: get, post, put
 */
interface UseApi {
  get: <T>(url: string, config?: object) => Promise<T>;
  post: <T>(url: string, data?: any, config?: object) => Promise<T>;
  put: <T>(url: string, data?: any, config?: object) => Promise<T>;
  loading: boolean;
  error: string | null;
}

/**
 * Dữ liệu mẫu cho các yêu cầu API (giả lập)
 * Trong ứng dụng thực tế, dữ liệu này sẽ được lấy từ backend
 */
const mockApiResponses: Record<string, ApiResponse<any>> = {
  '/services': {
    data: [
      { id: '1', name: 'Vệ sinh nhà cửa', price: 200000, category: 'Nhà ở' },
      { id: '2', name: 'Vệ sinh văn phòng', price: 500000, category: 'Văn phòng' },
    ],
    status: 200,
  },
  '/bookings': {
    data: [
      { id: '1', userId: 'user1', serviceId: '1', date: '2025-05-10', time: '14:00', status: 'pending' },
    ],
    status: 200,
  },
  '/services/featured': {
    data: [
      { id: '1', name: 'Vệ sinh nhà cửa', price: 200000, category: 'Nhà ở' },
    ],
    status: 200,
  },
  '/not-found': {
    data: null,
    status: 404,
    error: 'Không tìm thấy endpoint',
  }
};

/**
 * Hook useApi - cung cấp các phương thức gọi API
 * Trong môi trường phát triển, sử dụng dữ liệu mẫu
 * Trong môi trường sản xuất, sẽ gọi API thực tế
 */
export const useApi = (): UseApi => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Hàm gọi API GET
   * @param url Đường dẫn API
   * @param config Cấu hình cho request
   * @returns Promise<T> Dữ liệu trả về
   */
  const get = useCallback(async <T>(url: string, config?: object): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      // Kiểm tra xem có phải là môi trường phát triển không
      if (process.env.NODE_ENV === 'development') {
        // Giả lập phản hồi API từ mock data
        const response = mockApiResponses[url] || mockApiResponses['/not-found'];
        
        if (response.status >= 400) {
          throw new Error(response.error || 'Lỗi không xác định');
        }
        
        // Giả lập độ trễ mạng
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return response.data as T;
      } else {
        // Trong môi trường sản xuất, gọi API thực tế
        const response = await axios.get<T>(url, config);
        return response.data;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Hàm gọi API POST
   * @param url Đường dẫn API
   * @param data Dữ liệu gửi lên
   * @param config Cấu hình cho request
   * @returns Promise<T> Dữ liệu trả về
   */
  const post = useCallback(async <T>(url: string, data?: any, config?: object): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      // Kiểm tra xem có phải là môi trường phát triển không
      if (process.env.NODE_ENV === 'development') {
        // Giả lập phản hồi API cho POST
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (url === '/bookings/create') {
          const bookingData = data as CreateBookingData;
          const newBooking: Booking = {
            id: Date.now().toString(),
            userId: 'user1',
            serviceId: bookingData.serviceId,
            date: bookingData.date,
            time: bookingData.time,
            status: 'pending',
          };
          return newBooking as unknown as T;
        }
        
        throw new Error('Endpoint không hỗ trợ');
      } else {
        // Trong môi trường sản xuất, gọi API thực tế
        const response = await axios.post<T>(url, data, config);
        return response.data;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Hàm gọi API PUT
   * @param url Đường dẫn API
   * @param data Dữ liệu gửi lên
   * @param config Cấu hình cho request
   * @returns Promise<T> Dữ liệu trả về
   */
  const put = useCallback(async <T>(url: string, data?: any, config?: object): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      // Kiểm tra xem có phải là môi trường phát triển không
      if (process.env.NODE_ENV === 'development') {
        // Giả lập phản hồi API cho PUT
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (url.startsWith('/users/')) {
          return { ...data, updatedAt: new Date().toISOString() } as unknown as T;
        }
        
        throw new Error('Endpoint không hỗ trợ');
      } else {
        // Trong môi trường sản xuất, gọi API thực tế
        const response = await axios.put<T>(url, data, config);
        return response.data;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { get, post, put, loading, error };
};
