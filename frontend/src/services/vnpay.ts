/**
 * Service xử lý thanh toán VNPay cho dự án CleanHome
 * Cung cấp các phương thức để tạo thanh toán, kiểm tra trạng thái, xử lý callback
 * Author: CleanHome Team
 */

import ApiService from './api';

/**
 * Interface cho dữ liệu tạo thanh toán VNPay
 */
export interface CreateVnpayPaymentRequest {
  booking_id: string;
}

/**
 * Interface cho response tạo thanh toán VNPay
 */
export interface CreateVnpayPaymentResponse {
  status: string;
  payment_url: string;
  booking_code: string;
  amount: number;
  message: string;
}

/**
 * Interface cho thông tin giao dịch VNPay
 */
export interface VnpayTransaction {
  id: string;
  booking_id: string;
  user_id: string;
  vnp_Amount: number;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate?: string;
  vnp_ResponseCode?: string;
  vnp_TmnCode?: string;
  vnp_TransactionNo?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef: string;
  is_successful: boolean;
  status_message: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface cho trạng thái thanh toán
 */
export interface PaymentStatus {
  status: string;
  booking_code: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  vnpay_transaction?: VnpayTransaction;
}

/**
 * Interface cho danh sách giao dịch của user
 */
export interface UserTransactionsResponse {
  status: string;
  data: VnpayTransaction[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Class VNPay Service
 * Xử lý các chức năng liên quan đến thanh toán VNPay
 */
export class VnpayService {
  
  /**
   * Tạo URL thanh toán VNPay cho booking đã tồn tại
   * @param bookingId ID của booking cần thanh toán
   * @returns Promise<CreateVnpayPaymentResponse> Thông tin URL thanh toán
   */
  public static async createPaymentUrl(bookingId: string): Promise<CreateVnpayPaymentResponse> {
    try {
      console.log('🏦 Tạo URL thanh toán VNPay cho booking:', bookingId);
      
      const response = await ApiService.post<CreateVnpayPaymentResponse>(
        `/bookings/${bookingId}/payment/vnpay`,
        {}
      );
      
      console.log('✅ Tạo URL thanh toán VNPay thành công:', response);
      return response;
    } catch (error) {
      console.error('❌ Lỗi khi tạo URL thanh toán VNPay:', error);
      throw error;
    }
  }

  /**
   * Lấy trạng thái thanh toán của booking
   * @param bookingId ID của booking
   * @returns Promise<PaymentStatus> Trạng thái thanh toán
   */
  public static async getPaymentStatus(bookingId: string): Promise<PaymentStatus> {
    try {
      console.log('📊 Lấy trạng thái thanh toán cho booking:', bookingId);
      
      const response = await ApiService.get<PaymentStatus>(
        `/bookings/${bookingId}/payment/status`
      );
      
      console.log('✅ Lấy trạng thái thanh toán thành công:', response);
      return response;
    } catch (error) {
      console.error('❌ Lỗi khi lấy trạng thái thanh toán:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin giao dịch VNPay theo booking ID
   * @param bookingId ID của booking
   * @returns Promise<VnpayTransaction> Thông tin giao dịch
   */
  public static async getTransactionByBooking(bookingId: string): Promise<VnpayTransaction> {
    try {
      console.log('📋 Lấy thông tin giao dịch VNPay cho booking:', bookingId);
      
      const response = await ApiService.get<{status: string, data: VnpayTransaction}>(
        `/vnpay/transaction/${bookingId}`
      );
      
      console.log('✅ Lấy thông tin giao dịch thành công:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy thông tin giao dịch:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách giao dịch VNPay của user
   * @param userId ID của user
   * @param page Trang hiện tại (mặc định: 1)
   * @param perPage Số item mỗi trang (mặc định: 10)
   * @returns Promise<UserTransactionsResponse> Danh sách giao dịch
   */
  public static async getUserTransactions(
    userId: string, 
    page: number = 1, 
    perPage: number = 10
  ): Promise<UserTransactionsResponse> {
    try {
      console.log('📋 Lấy danh sách giao dịch VNPay của user:', userId);
      
      const response = await ApiService.get<UserTransactionsResponse>(
        `/vnpay/transactions/user/${userId}?page=${page}&per_page=${perPage}`
      );
      
      console.log('✅ Lấy danh sách giao dịch thành công:', response);
      return response;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách giao dịch:', error);
      throw error;
    }
  }

  /**
   * Chuyển hướng người dùng đến trang thanh toán VNPay
   * @param paymentUrl URL thanh toán VNPay
   */
  public static redirectToPayment(paymentUrl: string): void {
    console.log('🔀 Chuyển hướng đến trang thanh toán VNPay:', paymentUrl);
    window.location.href = paymentUrl;
  }

  /**
   * Xử lý kết quả thanh toán từ VNPay return URL
   * @param queryParams Query parameters từ VNPay callback
   * @returns Thông tin kết quả thanh toán
   */
  public static processPaymentResult(queryParams: URLSearchParams) {
    const vnpResponseCode = queryParams.get('vnp_ResponseCode');
    const vnpTxnRef = queryParams.get('vnp_TxnRef');
    const vnpAmount = queryParams.get('vnp_Amount');
    const vnpOrderInfo = queryParams.get('vnp_OrderInfo');
    const vnpTransactionNo = queryParams.get('vnp_TransactionNo');
    const vnpPayDate = queryParams.get('vnp_PayDate');
    const vnpBankCode = queryParams.get('vnp_BankCode');
    const vnpCardType = queryParams.get('vnp_CardType');

    const isSuccess = vnpResponseCode === '00';
    
    return {
      isSuccess,
      responseCode: vnpResponseCode,
      txnRef: vnpTxnRef,
      amount: vnpAmount ? parseInt(vnpAmount) / 100 : 0, // Chuyển về VND
      orderInfo: vnpOrderInfo,
      transactionNo: vnpTransactionNo,
      payDate: vnpPayDate,
      bankCode: vnpBankCode,
      cardType: vnpCardType,
      message: this.getResponseMessage(vnpResponseCode || '99')
    };
  }

  /**
   * Lấy thông báo tương ứng với mã phản hồi VNPay
   * @param responseCode Mã phản hồi từ VNPay
   * @returns Thông báo bằng tiếng Việt
   */
  public static getResponseMessage(responseCode: string): string {
    const messages: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };

    return messages[responseCode] || 'Giao dịch không thành công';
  }

  /**
   * Định dạng số tiền VND
   * @param amount Số tiền
   * @returns Chuỗi định dạng tiền tệ
   */
  public static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Định dạng ngày giờ thanh toán VNPay
   * @param vnpPayDate Chuỗi ngày giờ từ VNPay (format: YYYYMMDDHHmmss)
   * @returns Chuỗi ngày giờ định dạng
   */
  public static formatPayDate(vnpPayDate: string): string {
    if (!vnpPayDate || vnpPayDate.length !== 14) return '';
    
    const year = vnpPayDate.substring(0, 4);
    const month = vnpPayDate.substring(4, 6);
    const day = vnpPayDate.substring(6, 8);
    const hour = vnpPayDate.substring(8, 10);
    const minute = vnpPayDate.substring(10, 12);
    const second = vnpPayDate.substring(12, 14);
    
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }
}

export default VnpayService;
