import React, { useState } from 'react';
import Button from '../UI/Button';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: string) => void;
  totalAmount: number;
}

/**
 * Modal chọn phương thức thanh toán
 * Hiện tại chỉ hỗ trợ thanh toán tiền mặt, các phương thức khác hiển thị "đang cập nhật"
 */
const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');

  /**
   * Format giá tiền theo định dạng Việt Nam
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  /**
   * Xử lý xác nhận thanh toán
   * Đóng modal và gọi callback với payment method đã chọn
   */
  const handleConfirm = () => {
    onConfirm(selectedMethod);
    onClose();
  };

  /**
   * Đóng modal và reset selection
   */
  const handleClose = () => {
    setSelectedMethod('cash');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              💳 Chọn phương thức thanh toán
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Đóng modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Tổng tiền cần thanh toán */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Tổng tiền cần thanh toán:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {/* Danh sách phương thức thanh toán */}
          <div className="space-y-3">
            {/* Thanh toán tiền mặt - Có sẵn */}
            <label className="flex items-center p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition-colors bg-green-25">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={selectedMethod === 'cash'}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="mr-3 text-green-600 focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💵</span>
                  <div>
                    <div className="font-medium text-gray-900">Thanh toán tiền mặt</div>
                    <div className="text-sm text-green-600 font-medium">✅ Có sẵn</div>
                    <div className="text-xs text-gray-500 mt-1">Thanh toán khi nhân viên hoàn thành dịch vụ</div>
                  </div>
                </div>
              </div>
            </label>            {/* Ví điện tử - Đang cập nhật */}
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg opacity-60 bg-gray-50">
              <input
                type="radio"
                disabled
                aria-label="Ví điện tử - đang cập nhật"
                className="mr-3 opacity-50 cursor-not-allowed"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📱</span>
                  <div>
                    <div className="font-medium text-gray-500">Ví điện tử</div>
                    <div className="text-sm text-orange-500 font-medium">🚧 Đang cập nhật</div>
                    <div className="text-xs text-gray-400 mt-1">MoMo, ZaloPay, VNPay</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thẻ ngân hàng - Đang cập nhật */}
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg opacity-60 bg-gray-50">
              <input
                type="radio"
                disabled
                aria-label="Thẻ ngân hàng - đang cập nhật"
                className="mr-3 opacity-50 cursor-not-allowed"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💳</span>
                  <div>
                    <div className="font-medium text-gray-500">Thẻ tín dụng / Thẻ ghi nợ</div>
                    <div className="text-sm text-orange-500 font-medium">🚧 Đang cập nhật</div>
                    <div className="text-xs text-gray-400 mt-1">Visa, MasterCard, JCB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chuyển khoản ngân hàng - Đang cập nhật */}
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg opacity-60 bg-gray-50">
              <input
                type="radio"
                disabled
                aria-label="Chuyển khoản ngân hàng - đang cập nhật"
                className="mr-3 opacity-50 cursor-not-allowed"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏦</span>
                  <div>
                    <div className="font-medium text-gray-500">Chuyển khoản ngân hàng</div>
                    <div className="text-sm text-orange-500 font-medium">🚧 Đang cập nhật</div>
                    <div className="text-xs text-gray-400 mt-1">Internet Banking, ATM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lưu ý quan trọng */}
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-lg">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Lưu ý:</strong> Thanh toán tiền mặt sẽ được thực hiện khi nhân viên hoàn thành dịch vụ tại địa chỉ của bạn. 
                  Vui lòng chuẩn bị đúng số tiền.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-4 py-2"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedMethod}
              className="px-6 py-2"
            >
              Xác nhận đặt lịch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
