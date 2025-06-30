/**
 * Component hiển thị thông tin giao dịch VNPay
 * Hiển thị chi tiết giao dịch và trạng thái thanh toán
 * Author: CleanHome Team
 */

import React, { useEffect, useState } from 'react';
import VnpayService, { VnpayTransaction } from '../../services/vnpay';

interface VnpayTransactionInfoProps {
  bookingId: string;
  className?: string;
}

const VnpayTransactionInfo: React.FC<VnpayTransactionInfoProps> = ({
  bookingId,
  className = ''
}) => {
  const [transaction, setTransaction] = useState<VnpayTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        const transactionData = await VnpayService.getTransactionByBooking(bookingId);
        setTransaction(transactionData);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin giao dịch VNPay:', err);
        setError('Không thể tải thông tin giao dịch');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-3">
            <div className="h-5 w-5 bg-gray-300 rounded mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className={`bg-gray-50 rounded-lg border p-4 ${className}`}>
        <div className="flex items-center text-gray-500">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error || 'Chưa có thông tin giao dịch VNPay'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Thông tin thanh toán VNPay</h3>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            transaction.is_successful 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {transaction.is_successful ? 'Thành công' : 'Thất bại'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mã tham chiếu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã tham chiếu
            </label>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
              {transaction.vnp_TxnRef}
            </p>
          </div>

          {/* Số tiền */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền
            </label>
            <p className="text-sm font-semibold text-gray-900">
              {VnpayService.formatCurrency(transaction.vnp_Amount)}
            </p>
          </div>

          {/* Mã giao dịch VNPay */}
          {transaction.vnp_TransactionNo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã giao dịch VNPay
              </label>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                {transaction.vnp_TransactionNo}
              </p>
            </div>
          )}

          {/* Ngân hàng */}
          {transaction.vnp_BankCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngân hàng
              </label>
              <p className="text-sm text-gray-900">
                {transaction.vnp_BankCode}
              </p>
            </div>
          )}

          {/* Thời gian thanh toán */}
          {transaction.vnp_PayDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian thanh toán
              </label>
              <p className="text-sm text-gray-900">
                {VnpayService.formatPayDate(transaction.vnp_PayDate)}
              </p>
            </div>
          )}

          {/* Loại thẻ */}
          {transaction.vnp_CardType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại thẻ
              </label>
              <p className="text-sm text-gray-900">
                {transaction.vnp_CardType}
              </p>
            </div>
          )}

          {/* Thông tin đơn hàng */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thông tin đơn hàng
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded">
              {transaction.vnp_OrderInfo}
            </p>
          </div>

          {/* Trạng thái */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <p className={`text-sm font-medium ${
              transaction.is_successful ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.status_message}
            </p>
          </div>

          {/* Thời gian tạo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian tạo
            </label>
            <p className="text-sm text-gray-900">
              {new Date(transaction.created_at).toLocaleString('vi-VN')}
            </p>
          </div>

          {/* Thời gian cập nhật */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cập nhật lần cuối
            </label>
            <p className="text-sm text-gray-900">
              {new Date(transaction.updated_at).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VnpayTransactionInfo;
