// Admin API Services cho CleanHome - Sử dụng API thực tế
import ApiService from './api';

/**
 * Interface cho thống kê admin dashboard
 */
export interface AdminStats {
  totalBookings: number;
  totalUsers: number;
  totalStaff: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  completedBookingsThisMonth: number;
  avgRating: number;
  bookingGrowth: number;
  revenueGrowth: number;
  userGrowth: number;
}

/**
 * Interface cho assigned staff trong booking
 */
export interface AssignedStaff {
  staffId: string;
  staffName: string;
  staffEmail?: string;
  assignedAt?: string;
  notes?: string;
}

/**
 * Interface cho booking admin
 */
export interface AdminBooking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceId: string;
  serviceName: string;
  staffId: string | null;
  staffName: string | null;
  // Thông tin về nhiều nhân viên được phân công
  assignedStaff?: AssignedStaff[];
  staffCount?: number;
  bookingDate: string;
  bookingTime: string;
  endTime: string | null;
  customerAddress: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'momo' | 'zalopay' | null;
  notes: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho user admin - Cập nhật theo schema database
 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  bio: string | null;
  role: 'customer' | 'staff' | 'admin';
  status: 'active' | 'inactive' | 'locked' | 'pending';
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  lastLoginAt: string | null;
  loginCount: number;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  joinedAt: string;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}


export interface AdminStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'locked' | 'pending';
  avatar: string | null;
  hireDate: string;
  // ❌ ĐÃ XÓA: rating - Không còn đánh giá nhân viên
  totalBookings: number;        // ✅ Tổng số đơn hàng được phân công (đồng bộ từ backend)
  completedBookings: number;    // ✅ Số đơn hàng đã hoàn thành (đồng bộ từ backend)
  assignedServices: string[];   // ✅ Danh sách dịch vụ được phân công (đồng bộ từ backend)
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin Service class - Sử dụng API thực tế
 */
export class AdminService {
  private static readonly API_BASE = '/api/admin';
    /**
   * Lấy JWT token từ localStorage
   */
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    console.log('🔑 AdminService - Token status:', token ? `Có token (${token.substring(0, 50)}...)` : 'KHÔNG CÓ TOKEN');
    if (!token) {
      console.error('❌ AdminService - Không có token trong localStorage. User cần login lại.');
    }
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
  
  /**
   * Lấy thống kê tổng quan cho dashboard
   */
  static async getStats(): Promise<AdminStats> {
    try {
      const response = await fetch(`${this.API_BASE}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy thống kê admin:', error);
      throw error;
    }
  }  /**
   * Lấy danh sách booking cho admin với phân trang
   */
  static async getBookings(page: number = 1, limit: number = 30): Promise<{
    bookings: AdminBooking[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      // Auto-refresh token nếu cần
      await this.refreshTokenIfNeeded();
      
      const headers = this.getAuthHeaders();
      // Thêm cache-busting để tránh cache
      const timestamp = Date.now();
      const apiUrl = `${this.API_BASE}/bookings?page=${page}&limit=${limit}&_t=${timestamp}`;
      
      console.log('📋 AdminService.getBookings - Calling API:', apiUrl);
      console.log('📋 AdminService.getBookings - Headers:', headers);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          ...headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('📋 AdminService.getBookings - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AdminService.getBookings - API Error:', response.status, errorText);
        throw new Error(`Failed to fetch bookings: ${response.status} ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('📋 AdminService.getBookings - Response text (first 200 chars):', responseText.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ AdminService.getBookings - JSON parse error:', parseError);
        console.error('❌ AdminService.getBookings - Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      // Backend trả về {data: [...], total: number, page: number, totalPages: number}
      const bookings = data.data || [];
      const total = data.total || 0;
      const totalPages = data.totalPages || 1;
      const currentPage = data.page || 1;
      
      console.log('📋 AdminService.getBookings - Pagination info:', {
        bookings: bookings.length,
        total,
        totalPages,
        currentPage
      });
      
      // Log sample booking để debug
      if (bookings.length > 0) {
        console.log('📝 AdminService.getBookings - Sample booking data:', {
          id: bookings[0].id,
          bookingCode: bookings[0].bookingCode,
          staffId: bookings[0].staffId,
          staffName: bookings[0].staffName,
          assignedStaff: bookings[0].assignedStaff,
          staffCount: bookings[0].staffCount
        });
      }
      
      return {
        bookings,
        total,
        totalPages,
        currentPage
      };
    } catch (error) {
      console.error('❌ AdminService.getBookings - Error:', error);
      throw error;
    }
  }
  /**
   * Lấy danh sách user cho admin
   */
  static async getUsers(): Promise<AdminUser[]> {
    try {
      const headers = this.getAuthHeaders();
      console.log('👥 AdminService.getUsers - Calling API:', `${this.API_BASE}/users`);
      console.log('👥 AdminService.getUsers - Headers:', headers);
      
      const response = await fetch(`${this.API_BASE}/users`, {
        method: 'GET',
        headers: headers
      });
      
      console.log('👥 AdminService.getUsers - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AdminService.getUsers - API Error:', response.status, errorText);
        throw new Error(`Failed to fetch users: ${response.status} ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('👥 AdminService.getUsers - Response text (first 200 chars):', responseText.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ AdminService.getUsers - JSON parse error:', parseError);
        console.error('❌ AdminService.getUsers - Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      // Backend trả về {data: [...]} hoặc array trực tiếp
      const users = Array.isArray(data) ? data : (data.data || []);
      console.log('👥 AdminService.getUsers - Extracted users count:', users.length);
      
      return users;
    } catch (error) {
      console.error('❌ AdminService.getUsers - Error:', error);
      throw error;
    }
  }
  /**
   * Lấy danh sách nhân viên
   */
  static async getStaff(): Promise<AdminStaff[]> {
    try {
      console.log('📞 AdminService - Gọi API staff:', `${this.API_BASE}/staff`);
      
      const headers = this.getAuthHeaders();
      console.log('📋 AdminService - Headers:', headers);
      
      const response = await fetch(`${this.API_BASE}/staff`, {
        method: 'GET',
        headers: headers
      });
      console.log('📱 AdminService - Staff response status:', response.status);
      
      const responseText = await response.text();
      console.log('📄 AdminService - Staff response text (first 300 chars):', responseText.substring(0, 300));
      
      if (!response.ok) {
        console.error('❌ AdminService - Staff response không OK:', response.status, response.statusText);
        throw new Error(`Failed to fetch staff: ${response.status} ${response.statusText}`);
      }
      
      try {
        const data = JSON.parse(responseText);
        // Backend trả về array trực tiếp cho staff
        if (Array.isArray(data)) {
          console.log('✅ AdminService - Trả về staff array với', data.length, 'items');
          return data;
        } else {
          console.warn('⚠️ AdminService - Staff response format không như expected:', data);
          return [];
        }
      } catch (parseError) {
        console.error('❌ AdminService - Lỗi parse JSON staff response:', parseError);
        console.error('📄 AdminService - Staff full response text:', responseText);
        throw parseError;
      }
    } catch (error) {
      console.error('❌ AdminService - Lỗi tổng thể khi lấy staff:', error);
      throw error;
    }
  }
  /**
   * Cập nhật trạng thái booking
   */
  static async updateBookingStatus(
    bookingId: string, 
    status: AdminBooking['status']
  ): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái booking:', error);
      throw error;
    }
  }  /**
   * Gán nhân viên cho booking
   */
  static async assignStaffToBooking(
    bookingId: string, 
    staffId: string
  ): Promise<void> {
    try {
      console.log('👤 AdminService.assignStaffToBooking - Calling API:', `${this.API_BASE}/bookings/${bookingId}/assign-staff`);
      console.log('👤 AdminService.assignStaffToBooking - Body:', { staffId });
      
      const response = await fetch(`${this.API_BASE}/bookings/${bookingId}/assign-staff`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ staffId }),
      });
      
      console.log('👤 AdminService.assignStaffToBooking - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AdminService.assignStaffToBooking - API Error:', response.status, errorText);
        throw new Error(`Failed to assign staff to booking: ${response.status} ${errorText}`);
      }
      
      console.log('✅ AdminService.assignStaffToBooking - Success');
    } catch (error) {
      console.error('❌ AdminService.assignStaffToBooking - Error:', error);
      throw error;
    }
  }

  /**
   * Gán nhiều nhân viên cho booking
   */
  static async assignMultipleStaffToBooking(
    bookingId: string, 
    staffIds: string[],
    notes?: string
  ): Promise<void> {
    try {
      console.log('👥 AdminService.assignMultipleStaffToBooking - Calling API:', `${this.API_BASE}/bookings/${bookingId}/assign-multiple-staff`);
      console.log('👥 AdminService.assignMultipleStaffToBooking - Body:', { staffIds, notes });
      
      const response = await fetch(`${this.API_BASE}/bookings/${bookingId}/assign-multiple-staff`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ staffIds, notes }),
      });
      
      console.log('👥 AdminService.assignMultipleStaffToBooking - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AdminService.assignMultipleStaffToBooking - API Error:', response.status, errorText);
        throw new Error(`Failed to assign staff to booking: ${response.status} ${errorText}`);
      }
      
      console.log('✅ AdminService.assignMultipleStaffToBooking - Success');
    } catch (error) {
      console.error('❌ AdminService.assignMultipleStaffToBooking - Error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái user
   */
  static async updateUserStatus(
    userId: string, 
    status: AdminUser['status']
  ): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái user:', error);
      throw error;
    }
  }

  // ==================== STAFF MANAGEMENT ====================
  /**
   * Tạo nhân viên mới
   */  static async createStaff(data: {
    name: string;
    email: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'locked' | 'pending';
    bio?: string;
    avatar?: string;
    password?: string;  // Cho phép tự nhập password
  }): Promise<{
    staff: AdminStaff;
    password?: string;
    isGeneratedPassword: boolean;
  }> {
    try {      console.log('🆕 Đang tạo nhân viên mới:', data);
        const response = await ApiService.post<{
        status: string;
        message: string;
        staff: AdminStaff;
        password?: string;
        isGeneratedPassword: boolean;
      }>('/staff/', data);
      
      console.log('✅ Tạo nhân viên thành công:', response);
      console.log('📊 Kiểm tra response structure:', {
        hasStaff: !!response?.staff,
        responseKeys: Object.keys(response || {}),
        fullResponse: response
      });
      
      if (!response || !response.staff) {
        throw new Error('Không nhận được dữ liệu nhân viên từ server');
      }
      
      return {
        staff: response.staff,
        password: response.password,
        isGeneratedPassword: response.isGeneratedPassword
      };
    } catch (error) {
      console.error('❌ Lỗi khi tạo nhân viên:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin nhân viên
   */
  static async updateStaff(
    staffId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      status?: 'active' | 'inactive' | 'locked' | 'pending';
      bio?: string;
      avatar?: string;
      password?: string;
    }
  ): Promise<AdminStaff> {
    try {      console.log('🔄 Đang cập nhật nhân viên:', staffId, data);
      
      const response = await ApiService.put<{
        status: string;
        message: string;
        staff: AdminStaff;
      }>(`/staff/${staffId}`, data);
      
      console.log('✅ Cập nhật nhân viên thành công:', response);
      console.log('📊 Kiểm tra response structure:', {
        hasStaff: !!response?.staff,
        responseKeys: Object.keys(response || {}),
        fullResponse: response
      });
      
      if (!response || !response.staff) {
        throw new Error('Không nhận được dữ liệu nhân viên từ server');
      }
      
      return response.staff;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật nhân viên:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái nhân viên
   */  static async updateStaffStatus(
    staffId: string,
    status: 'active' | 'inactive' | 'locked' | 'pending'
  ): Promise<AdminStaff> {
    try {
      console.log('🔄 Đang cập nhật trạng thái nhân viên:', staffId, status);
      console.log('📤 Request payload:', { status });
      
      const response = await ApiService.put<{
        status: string;
        message: string;
        staff: AdminStaff;
      }>(`/staff/${staffId}/status`, { status });
      
      console.log('📥 Raw response from API:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📊 Response keys:', Object.keys(response || {}));
      
      // Kiểm tra response structure 
      if (!response) {
        console.error('❌ Response is null/undefined');
        throw new Error('Không nhận được response từ server');
      }
      
      if (typeof response !== 'object') {
        console.error('❌ Response is not an object:', response);
        throw new Error('Response format không đúng');
      }
      
      if (!response.staff) {
        console.error('❌ Response missing staff data:', response);
        throw new Error('Không nhận được dữ liệu nhân viên từ server');
      }
      
      console.log('✅ Cập nhật trạng thái thành công:', response.staff);
      return response.staff;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái nhân viên:', error);
      console.error('📊 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Xóa nhân viên
   */
  static async deleteStaff(staffId: string): Promise<void> {
    try {
      console.log('🗑️ Đang xóa nhân viên:', staffId);
      
      await ApiService.delete(`/staff/${staffId}`);
      
      console.log('✅ Xóa nhân viên thành công:', staffId);
    } catch (error) {
      console.error('❌ Lỗi khi xóa nhân viên:', error);
      throw error;
    }
  }
  /**
   * Lấy chi tiết nhân viên
   */
  static async getStaffDetail(staffId: string): Promise<AdminStaff> {
    try {
      const response = await fetch(`${this.API_BASE}/staff/${staffId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch staff detail');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết nhân viên:', error);
      throw error;
    }
  }

  // ==================== REPORTS ====================
  /**
   * Lấy báo cáo booking theo ngày
   */
  static async getDailyReport(startDate: string, endDate: string) {
    try {
      const response = await fetch(`${this.API_BASE}/reports/daily?start=${startDate}&end=${endDate}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch daily report');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo hàng ngày:', error);
      throw error;
    }
  }

  /**
   * Lấy báo cáo booking theo tháng cho cả năm
   */
  static async getMonthlyReport(year: number) {
    try {
      const response = await fetch(`${this.API_BASE}/reports/monthly?year=${year}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch monthly report');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo hàng tháng:', error);
      throw error;
    }
  }

  /**
   * Lấy báo cáo booking theo tháng cụ thể
   */
  static async getMonthlyDetailReport(year: number, month: number) {
    try {
      const response = await fetch(`${this.API_BASE}/reports/monthly-detail?year=${year}&month=${month}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch monthly detail report');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo chi tiết tháng:', error);
      throw error;
    }
  }

  /**
   * Lấy báo cáo booking theo năm
   */
  static async getYearlyReport() {
    try {
      const response = await fetch(`${this.API_BASE}/reports/yearly`);
      if (!response.ok) {
        throw new Error('Failed to fetch yearly report');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo hàng năm:', error);
      throw error;
    }
  }

  // ==================== REVENUE TRACKING ====================

  /**
   * Lấy doanh thu theo khoảng thời gian
   */
  static async getRevenue(startDate: string, endDate: string) {
    try {
      const response = await fetch(`${this.API_BASE}/revenue?start=${startDate}&end=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
      throw error;
    }
  }

  /**
   * Tự động làm mới token khi hết hạn
   */
  private static async refreshTokenIfNeeded(): Promise<void> {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      console.warn('⚠️ AdminService - Không có token, cần đăng nhập lại');
      return;
    }

    try {
      // Test token bằng cách gọi API stats (endpoint nhẹ)
      const testResponse = await fetch(`${this.API_BASE}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (testResponse.status === 401) {
        console.log('🔄 AdminService - Token hết hạn, đang refresh...');
        
        // Thử đăng nhập lại
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'admin@cleanhome.com',
            password: 'admin123'
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          if (loginData.access_token) {
            localStorage.setItem('token', loginData.access_token);
            console.log('✅ AdminService - Token refreshed successfully');
          }
        } else {
          console.error('❌ AdminService - Failed to refresh token');
          // Redirect to login page
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('❌ AdminService - Error checking token:', error);
    }
  }

  /**
   * Cập nhật trạng thái thanh toán của booking
   */
  static async updatePaymentStatus(
    bookingId: string, 
    paymentStatus: AdminBooking['paymentStatus']
  ): Promise<void> {
    try {
      console.log('💳 AdminService.updatePaymentStatus - Calling API:', `${this.API_BASE}/bookings/${bookingId}/payment-status`);
      console.log('💳 AdminService.updatePaymentStatus - Payment status:', paymentStatus);
      
      const response = await fetch(`${this.API_BASE}/bookings/${bookingId}/payment-status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ payment_status: paymentStatus }),
      });
      
      console.log('💳 AdminService.updatePaymentStatus - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AdminService.updatePaymentStatus - API Error:', response.status, errorText);
        throw new Error(`Failed to update payment status: ${response.status} ${errorText}`);
      }
      
      console.log('✅ AdminService.updatePaymentStatus - Success');
    } catch (error) {
      console.error('❌ AdminService.updatePaymentStatus - Error:', error);
      throw error;
    }
  }
}

export default AdminService;
