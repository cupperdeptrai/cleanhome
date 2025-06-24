import React from 'react';
import Button from '../UI/Button';
import { Booking } from '../../types';
import { formatDateTime } from '../../utils/dateTime';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  booking 
}) => {
  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };
  
  // Format ngày tháng đầy đủ cho booking date và time
  const formatBookingDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return {
      date: new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date),
      time: timeString
    };
  };
  
  // Hiển thị trạng thái đơn hàng với icon
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: 'Chờ xác nhận',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳'
      },
      confirmed: {
        label: 'Đã xác nhận',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '✅'
      },
      completed: {
        label: 'Hoàn thành',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: '🎉'
      },
      cancelled: {
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: '❌'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
        <span className="mr-2">{config.icon}</span>
        {config.label}
      </span>
    );
  };
  if (!isOpen) return null;

  const { date, time } = formatBookingDateTime(booking.date, booking.time);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Chi tiết đơn đặt lịch
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Mã đơn: #{booking.id}
            </p>
          </div>          <button
            onClick={onClose}
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
          {/* Status */}
          <div className="mb-6 flex justify-center">
            {renderStatusBadge(booking.status)}
          </div>

          {/* Service Info */}
          <div className="mb-6">            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Thông tin dịch vụ
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{booking.serviceName}</p>
              <p className="text-sm text-gray-600 mt-1">
                Dịch vụ vệ sinh chuyên nghiệp
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-6">            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📅</span>
              Thông tin đặt lịch
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="bg-gray-50 rounded-lg p-4">                <div className="flex items-center mb-2">
                  <span className="mr-2">📅</span>
                  <span className="text-sm font-medium text-gray-700">Ngày</span>
                </div>
                <p className="text-gray-900">{date}</p>                <div className="flex items-center mt-3 mb-2">
                  <span className="mr-2">⏰</span>
                  <span className="text-sm font-medium text-gray-700">Giờ</span>
                </div>
                <p className="text-gray-900">{time}</p>
              </div>

              {/* Address */}
              <div className="bg-gray-50 rounded-lg p-4">                <div className="flex items-center mb-2">
                  <span className="mr-2">📍</span>
                  <span className="text-sm font-medium text-gray-700">Địa chỉ</span>
                </div>
                <p className="text-gray-900">{booking.address}</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Thông tin thanh toán
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tổng tiền:</span>                <span className="text-xl font-semibold text-gray-900">
                  {formatPrice(booking.totalAmount || booking.price || 0)}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Đã bao gồm VAT và phí dịch vụ
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="mb-6">              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📝</span>
                Ghi chú
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Booking Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Lịch sử đơn hàng
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Đơn hàng được tạo</p>                    <p className="text-xs text-gray-500">
                      {formatDateTime(booking.createdAt || '')}
                    </p>
                  </div>
                </div>
                
                {booking.status !== 'pending' && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.status === 'confirmed' ? 'Đã xác nhận' :
                         booking.status === 'completed' ? 'Hoàn thành' :
                         booking.status === 'cancelled' ? 'Đã hủy' : 'Cập nhật trạng thái'}
                      </p>                      <p className="text-xs text-gray-500">
                        {formatDateTime(booking.updatedAt || booking.createdAt || '')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <Button
            onClick={onClose}
            className="w-full"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
