import ApiService from './api';

/**
 * Interface cho dịch vụ
 */
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  duration?: number; // Thời gian dịch vụ (phút)
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface cho dữ liệu tạo dịch vụ
 */
export interface CreateServiceDTO {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  duration?: number;
  isActive?: boolean;
}

/**
 * Interface cho dữ liệu cập nhật dịch vụ
 */
export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  duration?: number;
  isActive?: boolean;
}

/**
 * Interface cho tham số lọc danh sách dịch vụ
 */
export interface ServiceFilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  search?: string;
}

/**
 * Interface cho phản hồi phân trang
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service quản lý dịch vụ - Sử dụng API thực tế
 */
export class ServiceService {
  private static readonly BASE_URL = '/services';
  /**
   * Lấy danh sách dịch vụ
   * @param params Tham số lọc
   * @returns Promise<Service[]> Danh sách dịch vụ
   */
  public static async getServices(params?: ServiceFilterParams): Promise<Service[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.category) queryParams.append('category', params.category);
      if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.search) queryParams.append('search', params.search);
        const url = `${this.BASE_URL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      return await ApiService.get<Service[]>(url);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dịch vụ:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách dịch vụ nổi bật
   * @param limit Số lượng dịch vụ nổi bật
   * @returns Promise<Service[]> Danh sách dịch vụ nổi bật
   */
  public static async getFeaturedServices(limit: number = 5): Promise<Service[]> {
    try {
      return await ApiService.get<Service[]>(`${this.BASE_URL}/featured`, {
        params: { limit }
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dịch vụ nổi bật:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết dịch vụ theo ID
   * @param id ID của dịch vụ
   * @returns Promise<Service> Chi tiết dịch vụ
   */
  public static async getServiceById(id: string): Promise<Service> {
    try {
      return await ApiService.get<Service>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết dịch vụ:', error);
      throw error;
    }
  }

  /**
   * Tạo dịch vụ mới (Admin only)
   * @param data Dữ liệu dịch vụ mới
   * @returns Promise<Service> Dịch vụ vừa được tạo
   */
  public static async createService(data: CreateServiceDTO): Promise<Service> {
    try {
      return await ApiService.post<Service>(this.BASE_URL, data);
    } catch (error) {
      console.error('Lỗi khi tạo dịch vụ:', error);
      throw error;
    }
  }

  /**
   * Cập nhật dịch vụ (Admin only)
   * @param id ID của dịch vụ
   * @param data Dữ liệu cập nhật
   * @returns Promise<Service> Dịch vụ đã được cập nhật
   */  public static async updateService(id: string, data: UpdateServiceDTO): Promise<Service> {
    try {
      console.log('🔄 ServiceService.updateService - Gọi API PUT:', {
        url: `${this.BASE_URL}/${id}`,
        data: data
      });
      
      const result = await ApiService.put<Service>(`${this.BASE_URL}/${id}`, data);
      
      console.log('📋 ServiceService.updateService - Kết quả từ API:', result);
      console.log('🔍 ServiceService.updateService - Kiểm tra cấu trúc:', {
        hasId: !!result?.id,
        id: result?.id,
        isObject: typeof result === 'object',
        keys: Object.keys(result || {})
      });
      
      return result;
    } catch (error) {
      console.error('Lỗi khi cập nhật dịch vụ:', error);
      throw error;
    }
  }

  /**
   * Xóa dịch vụ (Admin only)
   * @param id ID của dịch vụ
   * @returns Promise<void>
   */  public static async deleteService(id: string): Promise<void> {
    try {
      console.log('🗑️ ServiceService.deleteService - Gọi API DELETE:', {
        url: `${this.BASE_URL}/${id}`,
        id: id
      });
      
      const response = await ApiService.delete(`${this.BASE_URL}/${id}`);
      
      console.log('✅ ServiceService.deleteService - Xóa thành công:', id);
      console.log('📋 Response from delete:', response);
    } catch (error) {
      console.error('❌ ServiceService.deleteService - Lỗi:', error);
      
      // Log chi tiết lỗi
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('📊 Chi tiết lỗi API:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          message: axiosError.message
        });
      }
      
      throw error;
    }
  }

  /**
   * Lấy danh sách danh mục dịch vụ
   * @returns Promise<string[]> Danh sách danh mục
   */
  public static async getCategories(): Promise<string[]> {
    try {
      return await ApiService.get<string[]>(`${this.BASE_URL}/categories`);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm dịch vụ
   * @param query Từ khóa tìm kiếm
   * @param filters Bộ lọc bổ sung
   * @returns Promise<Service[]> Kết quả tìm kiếm
   */
  public static async searchServices(query: string, filters?: ServiceFilterParams): Promise<Service[]> {
    try {
      const params = { search: query, ...filters };
      return await this.getServices(params);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm dịch vụ:', error);
      throw error;
    }
  }

  /**
   * Lấy dịch vụ theo danh mục
   * @param category Danh mục dịch vụ
   * @param limit Số lượng giới hạn
   * @returns Promise<Service[]> Danh sách dịch vụ trong danh mục
   */
  public static async getServicesByCategory(category: string, limit?: number): Promise<Service[]> {
    try {
      const params: ServiceFilterParams = { category, isActive: true };
      const services = await this.getServices(params);
      
      if (limit && limit > 0) {
        return services.slice(0, limit);
      }
      
      return services;
    } catch (error) {
      console.error('Lỗi khi lấy dịch vụ theo danh mục:', error);
      throw error;
    }
  }
  /**
   * Kiểm tra dịch vụ có tồn tại không
   * @param id ID của dịch vụ
   * @returns Promise<boolean> true nếu dịch vụ tồn tại
   */
  public static async serviceExists(id: string): Promise<boolean> {
    try {
      await this.getServiceById(id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cập nhật trạng thái dịch vụ (Admin only)
   * @param id ID của dịch vụ
   * @param isActive Trạng thái mới
   * @returns Promise<Service> Dịch vụ đã được cập nhật
   */
  public static async updateServiceStatus(id: string, isActive: boolean): Promise<Service> {
    try {
      return await this.updateService(id, { isActive });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái dịch vụ:', error);
      throw error;
    }
  }

  /**
   * Upload ảnh cho dịch vụ (Admin only)
   * @param serviceId ID của dịch vụ
   * @param file File ảnh
   * @returns Promise<string> URL của ảnh đã upload
   */
  public static async uploadServiceImage(serviceId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${this.BASE_URL}/${serviceId}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Lỗi khi upload ảnh dịch vụ:', error);
      throw error;
    }
  }
}

export default ServiceService;
