import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../../types';
import Card from './Card';
import Button from './Button';
import ReviewModal from '../modals/ReviewModal';
import BookingDetailsModal from '../modals/BookingDetailsModal';
import CancelBookingModal from '../modals/CancelBookingModal';
import { ReviewService } from '../../services/review.service';
import { BookingService } from '../../services/booking.service';
import { formatDateTime, formatDate } from '../../utils/dateTime';

interface BookingCardProps {
  booking: Booking;
  onBookingUpdate?: () => void; // Callback để refresh danh sách sau khi cập nhật
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onBookingUpdate }) => {
  const navigate = useNavigate();
  
  // State cho các modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Xử lý gửi đánh giá
  const handleSubmitReview = async (rating: number, comment: string) => {
    try {
      await ReviewService.createReview({
        bookingId: booking.id,
        rating,
        comment
      });
      alert('Đánh giá đã được gửi thành công!');
      if (onBookingUpdate) {
        onBookingUpdate(); // Refresh danh sách để cập nhật trạng thái
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      throw error; // Re-throw để modal xử lý
    }
  };

  // Xử lý hủy đơn
  const handleCancelBooking = async (reason?: string) => {
    try {
      await BookingService.cancelBooking(booking.id, reason);
      alert('Đơn hàng đã được hủy thành công!');
      if (onBookingUpdate) {
        onBookingUpdate(); // Refresh danh sách để cập nhật trạng thái
      }
    } catch (error) {
      console.error('Lỗi khi hủy đơn:', error);
      throw error; // Re-throw để modal xử lý
    }
  };

  // Xử lý đặt lại dịch vụ
  const handleRebook = () => {
    // Điều hướng đến trang đặt lịch với thông tin dịch vụ đã chọn
    navigate('/booking', { 
      state: { 
        serviceId: booking.serviceId,
        serviceName: booking.serviceName,
        previousBooking: booking
      } 
    });
  };
  // Format địa chỉ hiển thị đẹp hơn
  const formatAddress = (address: string) => {
    if (!address) return '';
    
    // Tách địa chỉ thành các phần và định dạng lại
    const parts = address.split(', ').map(part => part.trim()).filter(Boolean);
    
    // Nếu địa chỉ quá dài, rút gọn để hiển thị
    if (parts.length > 4) {
      return parts.slice(0, 2).join(', ') + '... ' + parts.slice(-2).join(', ');
    }
    
    return address;
  };
  
  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };
  
  // Hiển thị trạng thái đơn hàng
  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Chờ xác nhận
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Đã xác nhận
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{booking.serviceName}</h3>
            <p className="text-sm text-gray-500">Mã đơn: #{booking.id}</p>
          </div>
          <div className="mt-2 md:mt-0">
            {renderStatus(booking.status)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Ngày & Giờ</p>
            <p className="text-sm text-gray-900">{formatDate(booking.date)} - {booking.time}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Địa chỉ</p>
            <p className="text-sm text-gray-900" title={booking.address}>
              {formatAddress(booking.address || '')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Giá</p>
            <p className="text-sm text-gray-900">{formatPrice(booking.totalAmount || booking.price || 0)}</p>
          </div>
        </div>
        
        {booking.notes && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Ghi chú</p>
            <p className="text-sm text-gray-900">{booking.notes}</p>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-2 sm:mb-0">
            Đặt lịch vào: {formatDateTime(booking.createdAt || '')}
          </p>
          
          <div className="flex space-x-3">
            {booking.status === 'pending' && (
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Hủy đơn
              </Button>
            )}
            
            {booking.status === 'completed' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
              >
                Đánh giá
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsDetailsModalOpen(true)}
            >
              Chi tiết
            </Button>
            
            {booking.status === 'completed' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRebook}
              >
                Đặt lại
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        booking={booking}
        onSubmit={handleSubmitReview}
      />

      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        booking={booking}
      />

      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        booking={booking}
        onConfirm={handleCancelBooking}
      />
    </Card>
  );
};

export default BookingCard;
