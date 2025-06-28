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
  async (error) => {
    const originalRequest = error.config;
    
    // Xử lý lỗi 401 (Unauthorized) - thử refresh token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Kiểm tra nếu có refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Thử refresh token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          if (response.data && response.data.access_token) {
            const newToken = response.data.access_token;
            localStorage.setItem('token', newToken);
            
            // Cập nhật header và thử lại request
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('❌ Refresh token failed:', refreshError);
        }
      }
      
      // Nếu refresh thất bại hoặc không có refresh token, đăng xuất
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Chỉ redirect nếu không phải trang login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?message=session_expired';
      }
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
   */  public static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
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
      console.log('📤 POST Request:', { url, data, config });
      console.log('🔗 Full URL:', `${API_URL}${url}`);
      const response = await apiClient.post(url, data, config);
      console.log('📥 POST Response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ POST Error:', error);
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
      const response = await apiClient.put(url, data, config);
      // Kiểm tra xem response có wrapper data hay không
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data;
      }
      return response.data;
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
      const response = await apiClient.delete(url, config);
      // Kiểm tra xem response có wrapper data hay không
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data;
      }
      return response.data;
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
