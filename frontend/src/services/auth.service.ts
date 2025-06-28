import ApiService from './api';

/**
 * Interface cho dữ liệu đăng nhập
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Interface cho dữ liệu đăng ký
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

/**
 * Interface cho dữ liệu người dùng
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'staff' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
}

/**
 * Interface cho token trả về từ server
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Interface cho response từ xác thực
 */
export interface AuthResponse {
  status?: string; // 'success' hoặc 'error' từ backend
  user: User;
  token?: string; // Cho register
  access_token?: string; // Backend login trả về access_token
  refresh_token?: string; // Backend cũng trả về refresh_token
  expires_in?: number; // Thời gian hết hạn token
  message?: string;
  details?: string[]; // Thêm để xử lý lỗi chi tiết từ backend
}

/**
 * Service xác thực người dùng
 * Cung cấp các phương thức để đăng nhập, đăng ký, đăng xuất
 */
export class AuthService {
  /**
   * Đăng nhập
   * @param data Dữ liệu đăng nhập
   * @returns Promise<AuthResponse> Thông tin người dùng và token
   */  public static async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔐 Đăng nhập với dữ liệu:', data);
      console.log('🌐 URL API:', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`);
      
      const response = await ApiService.post<AuthResponse>('/auth/login', data);
      console.log('✅ Phản hồi từ server:', response);
      
      // Backend trả về access_token, không phải token
      const token = response.access_token || response.token;
      if (token && response.user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('💾 Đã lưu token và thông tin người dùng');
      }
      return response;
    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.error('📡 Chi tiết phản hồi lỗi:', axiosError.response?.data);
        console.error('📊 Mã trạng thái:', axiosError.response?.status);
      }
      throw error;
    }
  }

  /**
   * Đăng ký
   * @param data Dữ liệu đăng ký
   * @returns Promise<AuthResponse> Thông tin người dùng và token
   */  public static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<AuthResponse>('/auth/register', data);
      // Backend có thể trả về access_token hoặc token
      const token = response.access_token || response.token;
      if (token && response.user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  /**
   * Đăng xuất
   * @returns Promise<void>
   */
  public static async logout(): Promise<void> {
    try {
      // Gọi API đăng xuất (nếu cần)
      await ApiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa dữ liệu đăng nhập khỏi localStorage
      this.clearAuthData();
    }
  }

  /**
   * Refresh token
   * @returns Promise<AuthTokens> Token mới
   */
  public static async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await ApiService.post<AuthTokens>('/auth/refresh-token', {
        refreshToken,
      });

      // Lưu token mới
      localStorage.setItem('token', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Yêu cầu đặt lại mật khẩu
   * @param email Email của người dùng
   * @returns Promise<void>
   */
  public static async requestPasswordReset(email: string): Promise<void> {
    try {
      await ApiService.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Đặt lại mật khẩu
   * @param token Token xác thực
   * @param newPassword Mật khẩu mới
   * @returns Promise<void>
   */
  public static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await ApiService.post('/auth/reset-password', {
        token,
        newPassword,
      });
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem người dùng đã đăng nhập chưa
   * @returns boolean
   */
  public static isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns User | null
   */
  public static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Xóa dữ liệu xác thực
   */
  private static clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export default AuthService;
