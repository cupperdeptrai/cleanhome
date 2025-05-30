import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Cấu hình mặc định cho Axios
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Instance Axios với cấu hình mặc định
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor để thêm token xác thực vào header của request
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor để xử lý lỗi từ response
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) - đăng xuất người dùng
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Interface cho Response API
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Class API Service
 * Cung cấp các phương thức để gọi API
 */
export class ApiService {
  /**
   * Gọi API GET
   * @param url Đường dẫn API
   * @param config Cấu hình request
   * @returns Promise<T> Dữ liệu trả về
   */  
  public static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Gọi API POST
   * @param url Đường dẫn API
   * @param data Dữ liệu gửi lên
   * @param config Cấu hình request
   * @returns Promise<T> Dữ liệu trả về
   */  
  public static async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Gọi API PUT
   * @param url Đường dẫn API
   * @param data Dữ liệu gửi lên
   * @param config Cấu hình request
   * @returns Promise<T> Dữ liệu trả về
   */  public static async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.put(url, data, config);
      return response.data.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Gọi API DELETE
   * @param url Đường dẫn API
   * @param config Cấu hình request
   * @returns Promise<T> Dữ liệu trả về
   */  public static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient.delete(url, config);
      return response.data.data;
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }
  /**
   * Xử lý lỗi từ API
   * @param error Lỗi từ API
   */
  private static handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Lỗi từ server với mã trạng thái
        console.error('API Error:', error.response.data);
      } else if (error.request) {
        // Không nhận được response từ server
        console.error('API Request Error:', error.request);
      } else {
        // Lỗi khi thiết lập request
        console.error('API Setup Error:', error.message);
      }
    } else if (error instanceof Error) {
      console.error('General Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
  }
}

export default ApiService;
