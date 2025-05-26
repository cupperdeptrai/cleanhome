import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard: React.FC = () => {
  // Dữ liệu mẫu cho biểu đồ
  const bookingData = [
    { name: 'T2', bookings: 12 },
    { name: 'T3', bookings: 19 },
    { name: 'T4', bookings: 15 },
    { name: 'T5', bookings: 21 },
    { name: 'T6', bookings: 25 },
    { name: 'T7', bookings: 18 },
    { name: 'CN', bookings: 14 },
  ];

  const revenueData = [
    { name: 'Tháng 1', revenue: 4000 },
    { name: 'Tháng 2', revenue: 3000 },
    { name: 'Tháng 3', revenue: 5000 },
    { name: 'Tháng 4', revenue: 4500 },
    { name: 'Tháng 5', revenue: 6000 },
    { name: 'Tháng 6', revenue: 5500 },
  ];

  // Dữ liệu mẫu cho thống kê
  const stats = [
    { title: 'Tổng đơn đặt lịch', value: '124', change: '+12%', icon: '📅' },
    { title: 'Doanh thu tháng', value: '45.5M VND', change: '+8%', icon: '💰' },
    { title: 'Khách hàng mới', value: '38', change: '+15%', icon: '👥' },
    { title: 'Đánh giá trung bình', value: '4.8/5', change: '+0.2', icon: '⭐' },
  ];

  // Dữ liệu mẫu cho đơn đặt lịch gần đây
  const recentBookings = [
    { id: 'B001', customer: 'Nguyễn Văn A', service: 'Vệ sinh nhà ở', date: '15/06/2023', status: 'Hoàn thành' },
    { id: 'B002', customer: 'Trần Thị B', service: 'Giặt thảm, sofa', date: '14/06/2023', status: 'Đang xử lý' },
    { id: 'B003', customer: 'Lê Văn C', service: 'Vệ sinh văn phòng', date: '13/06/2023', status: 'Chờ xác nhận' },
    { id: 'B004', customer: 'Phạm Thị D', service: 'Vệ sinh sau xây dựng', date: '12/06/2023', status: 'Hoàn thành' },
    { id: 'B005', customer: 'Hoàng Văn E', service: 'Vệ sinh kính', date: '11/06/2023', status: 'Đã hủy' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} so với tháng trước
                </p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
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
              <Tooltip />
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
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Đang xử lý' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'Chờ xác nhận' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
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
