import React from 'react';
import { Link } from 'react-router-dom';
import { Booking } from '../../types';
import Card from './Card';
import Button from './Button';

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };
  
  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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
            <p className="text-sm text-gray-900">{booking.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Giá</p>
            <p className="text-sm text-gray-900">{formatPrice(booking.price)}</p>
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
            Đặt lịch vào: {new Date(booking.createdAt).toLocaleString('vi-VN')}
          </p>
          
          <div className="flex space-x-3">
            {booking.status === 'pending' && (
              <Button variant="danger" size="sm">
                Hủy đơn
              </Button>
            )}
            
            {booking.status === 'completed' && (
              <Button variant="outline" size="sm">
                Đánh giá
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              Chi tiết
            </Button>
            
            {booking.status === 'completed' && (
              <Button variant="outline" size="sm">
                Đặt lại
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BookingCard;
