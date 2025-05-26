import ApiService from './api';
import { Booking } from './booking.service';

/**
 * Interface cho thông tin người dùng
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'staff' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface cho dữ liệu cập nhật thông tin người dùng
 */
export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

/**
 * Interface cho dữ liệu đổi mật khẩu
 */
export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Interface cho tham số lọc danh sách người dùng
 */
export interface UserFilterParams {
  role?: 'user' | 'staff' | 'admin';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Interface cho thông tin tài khoản
 */
export interface UserProfile {
  user: User;
  stats?: {
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
  };
  recentBookings?: Booking[];
}

/**
 * Service quản lý thông tin người dùng
 * Cung cấp các phương thức để lấy, cập nhật thông tin người dùng
 */
export class UserService {
  private static readonly BASE_URL = '/users';

  /**
   * Lấy danh sách người dùng (chỉ admin)
   * @param params Tham số lọc
   * @returns Promise<User[]> Danh sách người dùng
   */
  public static async getUsers(params?: UserFilterParams): Promise<User[]> {
    try {
      return await ApiService.get<User[]>(this.BASE_URL, { params });
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns Promise<UserProfile> Thông tin người dùng
   */
  public static async getCurrentUser(): Promise<UserProfile> {
    try {
      return await ApiService.get<UserProfile>(`${this.BASE_URL}/me`);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   * @param id ID người dùng
   * @returns Promise<User> Thông tin người dùng
   */
  public static async getUserById(id: string): Promise<User> {
    try {
      return await ApiService.get<User>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param data Dữ liệu cập nhật
   * @returns Promise<User> Thông tin người dùng đã cập nhật
   */
  public static async updateProfile(data: UpdateUserDTO): Promise<User> {
    try {
      return await ApiService.put<User>(`${this.BASE_URL}/me`, data);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Đổi mật khẩu
   * @param data Dữ liệu đổi mật khẩu
   * @returns Promise<{ success: boolean, message: string }> Kết quả đổi mật khẩu
   */
  public static async changePassword(data: ChangePasswordDTO): Promise<{ success: boolean; message: string }> {
    try {
      return await ApiService.post<{ success: boolean; message: string }>(`${this.BASE_URL}/change-password`, data);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật avatar người dùng
   * @param file File ảnh
   * @returns Promise<{ avatarUrl: string }> URL ảnh đã tải lên
   */
  public static async updateAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      return await ApiService.post<{ avatarUrl: string }>(`${this.BASE_URL}/me/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Update avatar error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật vai trò người dùng (chỉ admin)
   * @param userId ID người dùng
   * @param role Vai trò mới
   * @returns Promise<User> Thông tin người dùng đã cập nhật
   */
  public static async updateUserRole(userId: string, role: 'user' | 'staff' | 'admin'): Promise<User> {
    try {
      return await ApiService.put<User>(`${this.BASE_URL}/${userId}/role`, { role });
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  /**
   * Xóa tài khoản người dùng (chỉ admin)
   * @param userId ID người dùng
   * @returns Promise<void>
   */
  public static async deleteUser(userId: string): Promise<void> {
    try {
      await ApiService.delete(`${this.BASE_URL}/${userId}`);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê người dùng
   * @returns Promise<UserStats> Thống kê người dùng
   */
  public static async getUserStats(): Promise<{
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
  }> {
    try {
      return await ApiService.get<{
        totalUsers: number;
        newUsers: number;
        activeUsers: number;
      }>(`${this.BASE_URL}/stats`);
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Khóa/mở khóa tài khoản người dùng (chỉ admin)
   * @param userId ID người dùng
   * @param isActive Trạng thái khóa
   * @returns Promise<User> Thông tin người dùng đã cập nhật
   */
  public static async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      return await ApiService.put<User>(`${this.BASE_URL}/${userId}/status`, { isActive });
    } catch (error) {
      console.error('Toggle user status error:', error);
      throw error;
    }
  }
}

export default UserService;
