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
  search?: string;
  isActive?: boolean;
}

/**
 * Interface cho danh mục dịch vụ
 */
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

/**
 * Service quản lý dịch vụ
 * Cung cấp các phương thức để tạo, cập nhật, lấy danh sách dịch vụ
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
      return await ApiService.get<Service[]>(this.BASE_URL, { params });
    } catch (error) {
      console.error('Get services error:', error);
      throw error;
    }
  }

  /**
   * Lấy dịch vụ nổi bật
   * @param limit Số lượng dịch vụ cần lấy
   * @returns Promise<Service[]> Danh sách dịch vụ nổi bật
   */
  public static async getFeaturedServices(limit: number = 5): Promise<Service[]> {
    try {
      return await ApiService.get<Service[]>(`${this.BASE_URL}/featured`, {
        params: { limit },
      });
    } catch (error) {
      console.error('Get featured services error:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết dịch vụ
   * @param id ID dịch vụ
   * @returns Promise<Service> Chi tiết dịch vụ
   */
  public static async getServiceById(id: string): Promise<Service> {
    try {
      return await ApiService.get<Service>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error('Get service error:', error);
      throw error;
    }
  }

  /**
   * Tạo dịch vụ mới
   * @param data Dữ liệu dịch vụ
   * @returns Promise<Service> Dịch vụ đã tạo
   */
  public static async createService(data: CreateServiceDTO): Promise<Service> {
    try {
      return await ApiService.post<Service>(this.BASE_URL, data);
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật dịch vụ
   * @param id ID dịch vụ
   * @param data Dữ liệu cập nhật
   * @returns Promise<Service> Dịch vụ đã cập nhật
   */
  public static async updateService(id: string, data: UpdateServiceDTO): Promise<Service> {
    try {
      return await ApiService.put<Service>(`${this.BASE_URL}/${id}`, data);
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  }

  /**
   * Xóa dịch vụ
   * @param id ID dịch vụ
   * @returns Promise<void>
   */
  public static async deleteService(id: string): Promise<void> {
    try {
      await ApiService.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  }

  /**
   * Kích hoạt/vô hiệu hóa dịch vụ
   * @param id ID dịch vụ
   * @param isActive Trạng thái kích hoạt
   * @returns Promise<Service> Dịch vụ đã cập nhật
   */
  public static async toggleServiceStatus(id: string, isActive: boolean): Promise<Service> {
    try {
      return await ApiService.put<Service>(`${this.BASE_URL}/${id}/status`, { isActive });
    } catch (error) {
      console.error('Toggle service status error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách danh mục dịch vụ
   * @returns Promise<ServiceCategory[]> Danh sách danh mục
   */
  public static async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      return await ApiService.get<ServiceCategory[]>(`${this.BASE_URL}/categories`);
    } catch (error) {
      console.error('Get service categories error:', error);
      throw error;
    }
  }

  /**
   * Lấy dịch vụ theo danh mục
   * @param categoryId ID danh mục
   * @returns Promise<Service[]> Danh sách dịch vụ
   */
  public static async getServicesByCategory(categoryId: string): Promise<Service[]> {
    try {
      return await ApiService.get<Service[]>(`${this.BASE_URL}/categories/${categoryId}`);
    } catch (error) {
      console.error('Get services by category error:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm dịch vụ
   * @param query Từ khóa tìm kiếm
   * @returns Promise<Service[]> Danh sách dịch vụ
   */
  public static async searchServices(query: string): Promise<Service[]> {
    try {
      return await ApiService.get<Service[]>(`${this.BASE_URL}/search`, {
        params: { query },
      });
    } catch (error) {
      console.error('Search services error:', error);
      throw error;
    }
  }
}

export default ServiceService;
