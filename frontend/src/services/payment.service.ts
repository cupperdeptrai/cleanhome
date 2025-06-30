// frontend/src/services/payment.service.ts

import api from './api';

interface PaymentResponse {
  data: {
    payment_url: string;
  };
}

interface TransactionResponse {
  status: 'success' | 'error';
  data?: {
    id: string;
    booking_id: string;
    vnp_TxnRef: string;
    vnp_Amount: number;
    vnp_ResponseCode: string;
    vnp_TransactionStatus: string;
    is_successful: boolean;
    status_message: string;
    created_at: string;
  };
  message?: string;
}

interface TransactionListResponse {
  status: 'success' | 'error';
  data?: Array<TransactionResponse['data']>;
  pagination?: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
  };
  message?: string;
}

/**
 * Tạo URL thanh toán VNPAY cho booking
 */
export const createPaymentUrl = async (bookingId: string) => {
  try {
    const response = await api.post<PaymentResponse>('/vnpay/create_payment_url', { 
      booking_id: bookingId 
    });
    return response.data;
  } catch (error) {
    console.error('Error creating VNPAY payment URL:', error);
    throw error;
  }
};

/**
 * Lấy thông tin giao dịch theo booking ID
 */
export const getTransactionByBooking = async (bookingId: string) => {
  try {
    const response = await api.get(`/vnpay/transaction/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
};

/**
 * Lấy danh sách giao dịch của người dùng
 */
export const getUserTransactions = async (
  userId: string, 
  page: number = 1, 
  perPage: number = 10
) => {
  try {
    const response = await api.get(
      `/vnpay/transactions/user/${userId}?page=${page}&per_page=${perPage}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

/**
 * Thử lại thanh toán cho booking chưa thanh toán thành công
 */
export const retryPayment = async (bookingId: string) => {
  return createPaymentUrl(bookingId);
};
