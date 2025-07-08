/**
 * Promotion Service - Handle API calls for promotions
 */
import ApiService from './api';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionData {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  usageLimit?: number;
}

export interface UpdatePromotionData extends Partial<CreatePromotionData> {}

export interface BestPromotionResponse {
  promotion: {
    id: string;
    code: string;
    name: string;
    description: string;
    discountAmount: number;
    finalAmount: number;
  } | null;
  message?: string;
}

class PromotionService {
  private static baseUrl = '/promotions';

  /**
   * Get all promotions (admin) or active promotions (users)
   */
  static async getPromotions(): Promise<Promotion[]> {
    try {
      const response = await ApiService.get(this.baseUrl);
      
      if (response.status === 'success') {
        return response.promotions;
      } else {
        throw new Error(response.message || 'Failed to get promotions');
      }
    } catch (error: any) {
      console.error('Error getting promotions:', error);
      throw new Error(error?.response?.data?.message || 'Failed to get promotions');
    }
  }

  /**
   * Create a new promotion (admin only)
   */
  static async createPromotion(data: CreatePromotionData): Promise<void> {
    try {
      const response = await ApiService.post(this.baseUrl, data);
      
      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to create promotion');
      }
    } catch (error: any) {
      console.error('Error creating promotion:', error);
      throw new Error(error?.response?.data?.message || 'Failed to create promotion');
    }
  }

  /**
   * Update a promotion (admin only)
   */
  static async updatePromotion(id: string, data: UpdatePromotionData): Promise<void> {
    try {
      const response = await ApiService.put(`${this.baseUrl}/${id}`, data);
      
      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to update promotion');
      }
    } catch (error: any) {
      console.error('Error updating promotion:', error);
      throw new Error(error?.response?.data?.message || 'Failed to update promotion');
    }
  }

  /**
   * Toggle promotion active status (admin only)
   */
  static async togglePromotionStatus(id: string): Promise<boolean> {
    try {
      const response = await ApiService.patch(`${this.baseUrl}/${id}/toggle`);
      
      if (response.status === 'success') {
        return response.isActive;
      } else {
        throw new Error(response.message || 'Failed to toggle promotion status');
      }
    } catch (error: any) {
      console.error('Error toggling promotion status:', error);
      throw new Error(error?.response?.data?.message || 'Failed to toggle promotion status');
    }
  }

  /**
   * Delete a promotion (admin only)
   */
  static async deletePromotion(id: string): Promise<void> {
    try {
      const response = await ApiService.delete(`${this.baseUrl}/${id}`);
      
      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to delete promotion');
      }
    } catch (error: any) {
      console.error('Error deleting promotion:', error);
      throw new Error(error?.response?.data?.message || 'Failed to delete promotion');
    }
  }

  /**
   * Get the best applicable promotion for a user's order
   */
  static async getBestPromotionForUser(userId: string, orderValue: number): Promise<BestPromotionResponse> {
    try {
      const response = await ApiService.post(`${this.baseUrl}/apply/${userId}`, {
        orderValue
      });
      
      if (response.status === 'success') {
        return {
          promotion: response.promotion,
          message: response.message
        };
      } else {
        throw new Error(response.message || 'Failed to get best promotion');
      }
    } catch (error: any) {
      console.error('Error getting best promotion:', error);
      throw new Error(error?.response?.data?.message || 'Failed to get best promotion');
    }
  }
}

export default PromotionService;
