import ApiService from './api';

/**
 * Interface cho dữ liệu đánh giá
 */
export interface ReviewData {
  id?: string;
  bookingId: string;
  userId: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface cho tạo đánh giá mới
 */
export interface CreateReviewData {
  bookingId: string;
  rating: number;
  comment: string;
}

/**
 * Service quản lý đánh giá dịch vụ
 * Cung cấp các phương thức để tạo, lấy, cập nhật đánh giá
 */
export class ReviewService {
  private static readonly BASE_URL = '/reviews';

  /**
   * Tạo đánh giá mới cho booking
   * @param reviewData Dữ liệu đánh giá
   * @returns Promise<ReviewData> Đánh giá đã tạo
   */
  public static async createReview(reviewData: CreateReviewData): Promise<ReviewData> {
    try {
      console.log('⭐ Đang tạo đánh giá:', reviewData);
      
      const response = await ApiService.post<ReviewData>(this.BASE_URL, reviewData);
      console.log('✅ Đánh giá đã được tạo:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Lỗi khi tạo đánh giá:', error);
      throw error;
    }
  }

  /**
   * Lấy đánh giá theo booking ID
   * @param bookingId ID của booking
   * @returns Promise<ReviewData | null> Đánh giá nếu có
   */
  public static async getReviewByBookingId(bookingId: string): Promise<ReviewData | null> {
    try {
      console.log('🔍 Đang tìm đánh giá cho booking:', bookingId);
      
      const response = await ApiService.get<ReviewData>(`${this.BASE_URL}/booking/${bookingId}`);
      console.log('📋 Tìm thấy đánh giá:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Lỗi khi lấy đánh giá:', error);
      
      // Nếu lỗi 404 (không tìm thấy), trả về null
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      
      throw error;
    }
  }

  /**
   * Cập nhật đánh giá
   * @param reviewId ID của đánh giá
   * @param reviewData Dữ liệu đánh giá mới
   * @returns Promise<ReviewData> Đánh giá đã cập nhật
   */
  public static async updateReview(reviewId: string, reviewData: Partial<CreateReviewData>): Promise<ReviewData> {
    try {
      console.log('📝 Đang cập nhật đánh giá:', reviewId, reviewData);
      
      const response = await ApiService.put<ReviewData>(`${this.BASE_URL}/${reviewId}`, reviewData);
      console.log('✅ Đánh giá đã được cập nhật:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật đánh giá:', error);
      throw error;
    }
  }

  /**
   * Xóa đánh giá
   * @param reviewId ID của đánh giá
   * @returns Promise<void>
   */
  public static async deleteReview(reviewId: string): Promise<void> {
    try {
      console.log('🗑️ Đang xóa đánh giá:', reviewId);
      
      await ApiService.delete(`${this.BASE_URL}/${reviewId}`);
      console.log('✅ Đánh giá đã được xóa');
    } catch (error) {
      console.error('❌ Lỗi khi xóa đánh giá:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách đánh giá của user hiện tại
   * @returns Promise<ReviewData[]> Danh sách đánh giá
   */
  public static async getUserReviews(): Promise<ReviewData[]> {
    try {
      console.log('📋 Đang lấy danh sách đánh giá của user');
      
      const response = await ApiService.get<ReviewData[]>(`${this.BASE_URL}/my-reviews`);
      console.log('✅ Đã lấy danh sách đánh giá:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách đánh giá:', error);
      throw error;
    }
  }
}

export default ReviewService;
