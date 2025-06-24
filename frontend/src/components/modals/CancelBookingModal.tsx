import React, { useState } from 'react';
import Button from '../UI/Button';
import { Booking } from '../../types';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onConfirm: (reason?: string) => Promise<void>;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  booking, 
  onConfirm 
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  // Các lý do hủy đơn có sẵn
  const cancelReasons = [
    'Thay đổi lịch trình',
    'Không cần dịch vụ nữa',
    'Tìm được dịch vụ khác',
    'Vấn đề về giá cả',
    'Lý do cá nhân',
    'Khác'
  ];

  // Đóng modal và reset form
  const handleClose = () => {
    setReason('');
    setSelectedReason('');
    onClose();
  };

  // Xử lý xác nhận hủy
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const finalReason = selectedReason === 'Khác' ? reason : selectedReason;
      await onConfirm(finalReason || 'Không có lý do');
      handleClose();
    } catch (error) {
      console.error('Lỗi khi hủy đơn:', error);
      alert('Có lỗi xảy ra khi hủy đơn. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">          <div className="flex items-center">
            <span className="text-red-600 mr-3 text-2xl">⚠️</span>
            <h2 className="text-lg font-semibold text-gray-900">
              Xác nhận hủy đơn
            </h2>
          </div>          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Đóng modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. 
              Bạn có chắc chắn muốn hủy đơn đặt lịch này không?
            </p>
          </div>

          {/* Booking Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{booking.serviceName}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Mã đơn: #{booking.id}</p>
              <p>Ngày: {new Date(booking.date + 'T00:00:00').toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} - {booking.time}</p>
              <p>Địa chỉ: {booking.address}</p>
              <p>Giá: {formatPrice(booking.totalAmount || booking.price || 0)}</p>
            </div>
          </div>

          {/* Cancel Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Lý do hủy đơn (tùy chọn)
            </label>
            
            {/* Predefined reasons */}
            <div className="space-y-2 mb-4">
              {cancelReasons.map((reasonOption) => (
                <label key={reasonOption} className="flex items-center">
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reasonOption}
                    checked={selectedReason === reasonOption}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{reasonOption}</span>
                </label>
              ))}
            </div>

            {/* Custom reason input */}
            {selectedReason === 'Khác' && (
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Vui lòng nhập lý do khác..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={200}
              />
            )}
          </div>

          {/* Refund Policy */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Chính sách hoàn tiền
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Hủy trước 24h: Hoàn 100% phí dịch vụ</li>
              <li>• Hủy trước 12h: Hoàn 50% phí dịch vụ</li>
              <li>• Hủy trong vòng 12h: Không hoàn tiền</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Quay lại
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
