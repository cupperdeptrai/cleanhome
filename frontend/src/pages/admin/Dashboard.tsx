import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import AdminService, { AdminStats, AdminBooking } from '../../services/admin.service';
import { formatDate } from '../../utils/dateTime';

const AdminDashboard: React.FC = () => {
  // State cho thống kê và dữ liệu
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tải dữ liệu khi component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Tải dữ liệu dashboard
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tải thống kê và booking gần đây song song
      const [statsData, bookingsResponse] = await Promise.all([
        AdminService.getStats(),
        AdminService.getBookings(1, 5) // Lấy 5 booking đầu tiên
      ]);

      setStats(statsData);
      // Lấy bookings từ response
      setRecentBookings(bookingsResponse.bookings || []);

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu mẫu cho biểu đồ booking trong tuần
  const bookingData = [
    { name: 'T2', bookings: 12 },
    { name: 'T3', bookings: 19 },
    { name: 'T4', bookings: 15 },
    { name: 'T5', bookings: 21 },
    { name: 'T6', bookings: 25 },
    { name: 'T7', bookings: 18 },
    { name: 'CN', bookings: 14 },
  ];

  // Dữ liệu mẫu cho biểu đồ doanh thu theo tháng
  const revenueData = [
    { name: 'Tháng 1', revenue: 40000000 },
    { name: 'Tháng 2', revenue: 30000000 },
    { name: 'Tháng 3', revenue: 50000000 },
    { name: 'Tháng 4', revenue: 45000000 },
    { name: 'Tháng 5', revenue: 60000000 },
    { name: 'Tháng 6', revenue: 55000000 },
  ];

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Hiển thị trạng thái booking
  const renderBookingStatus = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'Đang thực hiện', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
      rescheduled: { label: 'Đã dời lịch', className: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng quan Admin</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tổng đơn đặt lịch */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Tổng đơn đặt lịch</p>
              <p className="text-2xl font-bold mt-1">{stats.totalBookings}</p>
              <p className="text-sm mt-2 text-green-600">
                +{stats.bookingGrowth}% so với tháng trước
              </p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>

        {/* Doanh thu tháng */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Doanh thu tháng</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(stats.monthlyRevenue)}</p>
              <p className="text-sm mt-2 text-green-600">
                +{stats.revenueGrowth}% so với tháng trước
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        {/* Khách hàng mới */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Người dùng mới tháng này</p>
              <p className="text-2xl font-bold mt-1">{stats.newUsersThisMonth}</p>
              <p className="text-sm mt-2 text-green-600">
                +{stats.userGrowth}% so với tháng trước
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        {/* Đánh giá trung bình */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Đánh giá trung bình</p>
              <p className="text-2xl font-bold mt-1">{stats.avgRating}/5</p>
              <p className="text-sm mt-2 text-green-600">
                Từ {stats.completedBookingsThisMonth} đơn hoàn thành
              </p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Đơn đặt lịch trong tuần</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatPrice(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Bookings */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Đơn đặt lịch gần đây</h2>
          <Link to="/admin/bookings" className="text-blue-600 hover:text-blue-800">
            Xem tất cả
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt lịch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.bookingCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{booking.userName}</div>
                      <div className="text-gray-400">{booking.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.serviceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{formatDate(booking.bookingDate)}</div>
                      <div className="text-gray-400">{booking.bookingTime}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderBookingStatus(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatPrice(booking.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
