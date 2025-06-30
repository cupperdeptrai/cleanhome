/**
 * Component nút thanh toán VNPay cho booking
 * Hiển thị nút thanh toán và xử lý logic tạo URL thanh toán
 * Author: CleanHome Team
 */

import React, { useState } from 'react';
import VnpayService from '../../services/vnpay';

interface VnpayPaymentButtonProps {
  bookingId: string;
  bookingCode: string;
  amount: number;
  disabled?: boolean;
  onPaymentStart?: () => void;
  onPaymentError?: (error: string) => void;
  className?: string;
}

const VnpayPaymentButton: React.FC<VnpayPaymentButtonProps> = ({
  bookingId,
  bookingCode,
  amount,
  disabled = false,
  onPaymentStart,
  onPaymentError,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Xử lý khi người dùng click nút thanh toán VNPay
   */
  const handleVnpayPayment = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    try {
      // Gọi callback trước khi bắt đầu thanh toán
      onPaymentStart?.();

      console.log('🏦 Bắt đầu thanh toán VNPay cho booking:', bookingCode);
      console.log('💰 Số tiền thanh toán:', VnpayService.formatCurrency(amount));

      // Tạo URL thanh toán VNPay
      const response = await VnpayService.createPaymentUrl(bookingId);

      // Thông báo thành công (nếu có hệ thống notification)
      console.log('✅ Đã tạo URL thanh toán VNPay thành công');

      // Chuyển hướng đến trang thanh toán VNPay
      setTimeout(() => {
        VnpayService.redirectToPayment(response.payment_url);
      }, 500);

    } catch (error: unknown) {
      console.error('❌ Lỗi khi tạo thanh toán VNPay:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo thanh toán VNPay';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Gọi callback lỗi
      onPaymentError?.(errorMessage);
      
      // Hiển thị alert tạm thời (có thể thay bằng notification system)
      alert(`Lỗi thanh toán: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleVnpayPayment}
      disabled={disabled || isLoading}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 
        bg-blue-600 text-white font-medium rounded-lg 
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
            />
          </svg>
          <span>Thanh toán VNPay</span>
        </>
      )}
    </button>
  );
};

export default VnpayPaymentButton;
