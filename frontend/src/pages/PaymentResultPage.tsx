/**
 * Trang hiển thị kết quả thanh toán VNPay
 * Xử lý callback từ VNPay và hiển thị kết quả cho người dùng
 * Author: CleanHome Team
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VnpayService from '../services/vnpay';

interface PaymentResult {
  isSuccess: boolean;
  responseCode: string | null;
  txnRef: string | null;
  amount: number;
  orderInfo: string | null;
  transactionNo: string | null;
  payDate: string | null;
  bankCode: string | null;
  cardType: string | null;
  message: string;
}

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Xử lý kết quả thanh toán từ URL parameters
    const result = VnpayService.processPaymentResult(searchParams);
    setPaymentResult(result);
    setIsLoading(false);

    // Log kết quả thanh toán
    console.log('🏦 Kết quả thanh toán VNPay:', result);
  }, [searchParams]);

  const handleBackToBookings = () => {
    navigate('/bookings');
  };

  const handleTryAgain = () => {
    // Trích xuất booking code từ orderInfo hoặc txnRef
    const bookingCode = paymentResult?.orderInfo?.match(/CH\w+/)?.[0] || 
                       paymentResult?.txnRef?.match(/CH\w+/)?.[0];
    
    if (bookingCode) {
      navigate(`/booking/${bookingCode}`);
    } else {
      navigate('/bookings');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi kết quả thanh toán</h2>
          <p className="text-gray-600 mb-6">Không thể xử lý kết quả thanh toán từ VNPay</p>
          <button
            onClick={handleBackToBookings}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 ${paymentResult.isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-center">
              {paymentResult.isSuccess ? (
                <div className="text-green-500">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="text-red-500">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            <h1 className={`text-xl font-bold text-center mt-4 ${paymentResult.isSuccess ? 'text-green-800' : 'text-red-800'}`}>
              {paymentResult.isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
            </h1>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-4">
              {/* Mã giao dịch */}
              {paymentResult.txnRef && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mã tham chiếu</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{paymentResult.txnRef}</p>
                </div>
              )}

              {/* Số tiền */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Số tiền</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {VnpayService.formatCurrency(paymentResult.amount)}
                </p>
              </div>

              {/* Thông tin đơn hàng */}
              {paymentResult.orderInfo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thông tin đơn hàng</label>
                  <p className="mt-1 text-sm text-gray-900">{paymentResult.orderInfo}</p>
                </div>
              )}

              {/* Mã giao dịch VNPay */}
              {paymentResult.transactionNo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mã giao dịch VNPay</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{paymentResult.transactionNo}</p>
                </div>
              )}

              {/* Thời gian thanh toán */}
              {paymentResult.payDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian thanh toán</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {VnpayService.formatPayDate(paymentResult.payDate)}
                  </p>
                </div>
              )}

              {/* Ngân hàng */}
              {paymentResult.bankCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngân hàng</label>
                  <p className="mt-1 text-sm text-gray-900">{paymentResult.bankCode}</p>
                </div>
              )}

              {/* Loại thẻ */}
              {paymentResult.cardType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại thẻ</label>
                  <p className="mt-1 text-sm text-gray-900">{paymentResult.cardType}</p>
                </div>
              )}

              {/* Thông báo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <p className={`mt-1 text-sm ${paymentResult.isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                  {paymentResult.message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBackToBookings}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Về danh sách booking
            </button>
            
            {!paymentResult.isSuccess && (
              <button
                onClick={handleTryAgain}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            )}
          </div>
        </div>

        {/* Lưu ý */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Lưu ý</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  {paymentResult.isSuccess 
                    ? 'Booking của bạn đã được xác nhận và thanh toán thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.'
                    : 'Nếu bạn gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ với chúng tôi để được hỗ trợ.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
