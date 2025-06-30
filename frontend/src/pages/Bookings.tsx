import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import BookingCard from '../components/UI/BookingCard';
import { Booking } from '../types'; // Import từ types thay vì service
import BookingService from '../services/booking.service';
import { createPaymentUrl, retryPayment } from '../services/payment.service'; // Import các hàm thanh toán

/**
 * Component trang "Lịch đã đặt"
 * Hiển thị danh sách các booking của người dùng với khả năng filter và tự động refresh
 */

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [paying, setPaying] = useState<string | null>(null); // State để theo dõi booking đang thanh toán
  const [retrying, setRetrying] = useState<string | null>(null); // State để theo dõi booking đang thử lại thanh toán

  /**
   * Hàm xử lý thanh toán qua VNPAY
   * @param bookingId ID của booking cần thanh toán
   */
  const handlePayment = async (bookingId: string) => {
    setPaying(bookingId); // Bắt đầu quá trình thanh toán
    try {
      console.log(`🚀 Bắt đầu quá trình thanh toán cho booking ID: ${bookingId}`);
      const data = await createPaymentUrl(bookingId);
      if (data.payment_url) {
        console.log(`💳 Nhận được URL thanh toán, đang chuyển hướng...`);
        // Chuyển hướng người dùng đến cổng thanh toán VNPAY
        window.location.href = data.payment_url;
      } else {
        console.error('❌ Không nhận được URL thanh toán từ server');
        setError('Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('❌ Lỗi khi tạo URL thanh toán:', err);
      setError('Đã có lỗi xảy ra trong quá trình tạo yêu cầu thanh toán.');
    } finally {
      setPaying(null); // Kết thúc quá trình thanh toán (dù thành công hay thất bại)
    }
  };

  /**
   * Hàm thử lại thanh toán cho booking đã thất bại
   * @param bookingId ID của booking cần thử lại thanh toán
   */
  const handleRetryPayment = async (bookingId: string) => {
    setRetrying(bookingId);
    try {
      console.log(`🔄 Thử lại thanh toán cho booking ID: ${bookingId}`);
      const data = await retryPayment(bookingId);
      if (data.payment_url) {
        console.log(`💳 Nhận được URL thanh toán, đang chuyển hướng...`);
        window.location.href = data.payment_url;
      } else {
        console.error('❌ Không nhận được URL thanh toán từ server');
        setError('Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('❌ Lỗi khi thử lại thanh toán:', err);
      setError('Đã có lỗi xảy ra trong quá trình thử lại thanh toán.');
    } finally {
      setRetrying(null);
    }
  };

  /**
   * Hàm tải danh sách booking từ API
   */
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📅 Đang tải danh sách booking cho user:', user?.email);
      
      // Gọi API để lấy danh sách booking của user hiện tại
      const bookingsData = await BookingService.getUserBookings({
        status: filter === 'all' ? undefined : filter
      });
      
      console.log('📋 Nhận được bookings:', bookingsData);
      
      // Cập nhật state với dữ liệu từ API
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
        console.log(`✅ Đã tải ${bookingsData.length} booking(s)`);
      } else {
        setBookings([]);
        console.log('📭 Không có booking nào');
      }
      
    } catch (error) {
      console.error('❌ Lỗi khi tải danh sách booking:', error);
      
      // TEMPORARY: Sử dụng mock data nếu API thất bại
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 500) {
          console.warn('⚠️ API có lỗi 500, sử dụng mock data tạm thời');
          // Mock data cho testing
          const mockBookings: Booking[] = [
            {
              id: '1',
              userId: user?.id || '',
              serviceId: '1',
              serviceName: 'Vệ sinh nhà cửa cơ bản',
              date: '2025-06-20',
              time: '09:00',
              status: 'confirmed',
              address: '123 Đường ABC, Quận 1, TP.HCM',
              totalAmount: 300000,
              notes: 'Vệ sinh nhà cửa theo yêu cầu',
              createdAt: new Date().toISOString(),
            },
            {
              id: '2', 
              userId: user?.id || '',
              serviceId: '2',
              serviceName: 'Vệ sinh văn phòng',
              date: '2025-06-15',
              time: '14:00', 
              status: 'completed',
              address: '456 Đường XYZ, Quận 2, TP.HCM',
              totalAmount: 500000,
              notes: 'Vệ sinh sau giờ làm việc',
              createdAt: new Date().toISOString(),
            }
          ];
          setBookings(mockBookings);
          console.log('📋 Đã load mock data:', mockBookings.length, 'bookings');
          return; // Exit early với mock data
        }
      }
      
      // Xử lý lỗi network hoặc server
      if (error && typeof error === 'object' && 'code' in error && (error as Error & { code: string }).code === 'ERR_NETWORK') {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 404) {
          // API chưa được implement hoặc endpoint không tồn tại
          console.warn('⚠️ API booking chưa sẵn sàng, sử dụng dữ liệu mẫu');
          setBookings([]); // Tạm thời để trống
        } else {
          setError(axiosError.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách đặt lịch');
        }
      } else {
        setError('Đã xảy ra lỗi không xác định');
      }
    } finally {
      setLoading(false);
    }
  }, [filter, user?.email, user?.id]); // Thêm user?.id vào dependencies

  // Kiểm tra người dùng đã đăng nhập và tải booking khi component mount
  useEffect(() => {
    if (!user) {
      console.log('👤 User chưa đăng nhập, chuyển hướng đến trang login');
      navigate('/login?redirect=bookings');
      return;
    }
    
    // Tải danh sách booking khi user đã đăng nhập
    loadBookings();
  }, [user, navigate, loadBookings]); // Thêm loadBookings vào dependency

  // Tải lại danh sách khi filter thay đổi
  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [loadBookings, user]); // Bây giờ loadBookings đã stable với useCallback

  // Tự động refresh khi được chuyển hướng từ trang đặt lịch thành công
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const refreshParam = urlParams.get('refresh');
    
    if (refreshParam === 'true' && user) {
      console.log('🔄 Được yêu cầu refresh danh sách booking từ URL parameter');
      loadBookings();
      
      // Xóa parameter khỏi URL để tránh refresh liên tục
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, loadBookings, user]);

  // Lắng nghe custom event để refresh khi có booking mới
  useEffect(() => {
    const handleNewBooking = () => {
      console.log('🔄 Nhận được event booking mới, đang refresh danh sách...');
      loadBookings();
    };

    // Đăng ký lắng nghe event
    window.addEventListener('newBookingCreated', handleNewBooking);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('newBookingCreated', handleNewBooking);
    };
  }, [loadBookings]);
  
  // Lọc đơn đặt lịch theo trạng thái (nếu cần filter phía client)
  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === filter);

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách đặt lịch...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="p-6 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={loadBookings}>Thử lại</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Lịch đã đặt</h1>
          <Link to="/booking">
            <Button className="bg-blue-600 hover:bg-blue-700">
              + Đặt lịch mới
            </Button>
          </Link>
        </div>

        {/* Filter buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'pending', label: 'Chờ xác nhận' },
            { key: 'confirmed', label: 'Đã xác nhận' },
            { key: 'completed', label: 'Hoàn thành' },
            { key: 'cancelled', label: 'Đã hủy' },
          ].map(item => (
            <Button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              className={filter === item.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Bookings list */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking}>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-4">
                  {booking.status === 'confirmed' && booking.paymentStatus !== 'paid' && (
                    <Button 
                      onClick={() => handlePayment(booking.id)} 
                      disabled={paying === booking.id}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {paying === booking.id ? 'Đang xử lý...' : 'Thanh toán VNPAY'}
                    </Button>
                  )}
                  {booking.paymentStatus === 'failed' && (
                    <Button 
                      onClick={() => handleRetryPayment(booking.id)} 
                      disabled={retrying === booking.id}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {retrying === booking.id ? 'Đang xử lý...' : 'Thử lại thanh toán'}
                    </Button>
                  )}
                  <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800">Xem chi tiết</Button>
                </div>
              </BookingCard>
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-500">Không có lịch đặt nào.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
