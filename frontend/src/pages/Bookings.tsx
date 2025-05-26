import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import BookingCard from '../components/UI/BookingCard';
import { Booking } from '../types';

// Dữ liệu đơn đặt lịch mẫu
const mockBookings: Booking[] = [
  {
    id: '1',
    userId: '1',
    serviceId: '1',
    serviceName: 'Vệ sinh nhà ở cơ bản',
    date: '2023-07-15',
    time: '09:00',
    address: 'Số 123, Đường Trần Phú, Quận Hà Đông, TP. Hà Nội',
    status: 'completed',
    price: 300000,
    staffId: '2',
    createdAt: '2023-07-10T08:30:00Z',
    notes: 'Có chó trong nhà, xin hãy cẩn thận.',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    updatedAt: '2025-04-15T10:15:00Z'
  },
  {
    id: '2',
    userId: '1',
    serviceId: '6',
    serviceName: 'Vệ sinh điều hòa',
    date: '2023-07-20',
    time: '14:00',
    address: 'Số 123, Đường Trần Phú, Quận Hà Đông, TP. Hà Nội',
    status: 'completed',
    price: 250000,
    staffId: '2',
    createdAt: '2023-07-15T10:15:00Z',
    notes: 'Điều hòa đã 2 năm không vệ sinh.',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    updatedAt: '2025-04-15T10:15:00Z'
  },
  {
    id: '3',
    userId: '1',
    serviceId: '8',
    serviceName: 'Phun khử khuẩn',
    date: '2023-08-05',
    time: '15:00',
    address: 'Số 123, Đường Trần Phú, Quận Hà Đông, TP. Hà Nội',
    status: 'pending',
    price: 500000,
    createdAt: '2023-07-30T14:45:00Z',
    notes: 'Nhà có người già và trẻ nhỏ, cần sử dụng sản phẩm an toàn.',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    updatedAt: '2025-04-15T10:15:00Z'
  }
];

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  
  // Kiểm tra người dùng đã đăng nhập chưa
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=bookings');
      return;
    }
    
    // Giả lập API call để lấy đơn đặt lịch của người dùng
    setBookings(mockBookings);
  }, [user, navigate]);
  
  // Lọc đơn đặt lịch theo trạng thái
  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === filter);
  
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
  
  return (
    <>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Đơn đặt lịch của tôi</h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">Tất cả đơn hàng</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              
              <Link to="/booking">
                <Button>Đặt lịch mới</Button>
              </Link>
            </div>
          </div>
          
          {filteredBookings.length > 0 ? (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-500 mb-4">Bạn chưa có đơn đặt lịch nào.</p>
              <Link to="/booking">
                <Button>Đặt lịch ngay</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Bookings;
