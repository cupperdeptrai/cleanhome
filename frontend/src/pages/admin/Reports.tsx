import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

/**
 * Interface định nghĩa cấu trúc dữ liệu báo cáo doanh thu
 */
interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

/**
 * Interface định nghĩa cấu trúc dữ liệu báo cáo dịch vụ
 */
interface ServiceData {
  name: string;
  value: number;
  color: string;
}

/**
 * Interface định nghĩa cấu trúc dữ liệu báo cáo khách hàng
 */
interface CustomerData {
  month: string;
  new: number;
  returning: number;
}

/**
 * Component AdminReports - Hiển thị báo cáo và thống kê
 * @returns Giao diện báo cáo với các biểu đồ thống kê
 */
const AdminReports: React.FC = () => {
  // State quản lý khoảng thời gian báo cáo
  const [timeRange, setTimeRange] = useState('month');
  // State quản lý loại báo cáo
  const [reportType, setReportType] = useState('revenue');
  // State quản lý dữ liệu doanh thu
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  // State quản lý dữ liệu dịch vụ
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  // State quản lý dữ liệu khách hàng
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);

  // Dữ liệu mẫu cho báo cáo doanh thu
  useEffect(() => {
    // Trong thực tế, đây sẽ là API call
    const mockRevenueData: RevenueData[] = [
      { month: 'Tháng 1', revenue: 5000000, bookings: 15 },
      { month: 'Tháng 2', revenue: 6200000, bookings: 18 },
      { month: 'Tháng 3', revenue: 8100000, bookings: 24 },
      { month: 'Tháng 4', revenue: 7500000, bookings: 22 },
      { month: 'Tháng 5', revenue: 9200000, bookings: 28 },
      { month: 'Tháng 6', revenue: 11000000, bookings: 32 },
    ];
    setRevenueData(mockRevenueData);

    const mockServiceData: ServiceData[] = [
      { name: 'Vệ sinh nhà cửa', value: 40, color: '#0088FE' },
      { name: 'Vệ sinh văn phòng', value: 30, color: '#00C49F' },
      { name: 'Vệ sinh sau xây dựng', value: 20, color: '#FFBB28' },
      { name: 'Vệ sinh định kỳ', value: 10, color: '#FF8042' },
    ];
    setServiceData(mockServiceData);

    const mockCustomerData: CustomerData[] = [
      { month: 'Tháng 1', new: 10, returning: 5 },
      { month: 'Tháng 2', new: 12, returning: 6 },
      { month: 'Tháng 3', new: 15, returning: 9 },
      { month: 'Tháng 4', new: 13, returning: 9 },
      { month: 'Tháng 5', new: 18, returning: 10 },
      { month: 'Tháng 6', new: 20, returning: 12 },
    ];
    setCustomerData(mockCustomerData);
  }, []);

  /**
   * Lấy dữ liệu biểu đồ doanh thu
   */
  const getRevenueChartData = () => {
    // Trong thực tế, đây sẽ là xử lý dữ liệu từ API
    return revenueData;
  };

  /**
   * Lấy dữ liệu biểu đồ dịch vụ
   */
  const getServiceChartData = () => {
    // Trong thực tế, đây sẽ là xử lý dữ liệu từ API
    return serviceData;
  };

  /**
   * Lấy dữ liệu biểu đồ khách hàng
   */
  const getCustomerChartData = () => {
    // Trong thực tế, đây sẽ là xử lý dữ liệu từ API
    return customerData;
  };

  /**
   * Định dạng số tiền thành chuỗi có định dạng tiền tệ
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Tính tổng doanh thu
   */
  const getTotalRevenue = () => {
    return revenueData.reduce((sum, item) => sum + item.revenue, 0);
  };

  /**
   * Tính tổng số đơn hàng
   */
  const getTotalBookings = () => {
    return revenueData.reduce((sum, item) => sum + item.bookings, 0);
  };

  /**
   * Tính tổng số khách hàng mới
   */
  const getTotalNewCustomers = () => {
    return customerData.reduce((sum, item) => sum + item.new, 0);
  };

  /**
   * Tính tổng số khách hàng quay lại
   */
  const getTotalReturningCustomers = () => {
    return customerData.reduce((sum, item) => sum + item.returning, 0);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Báo cáo thống kê</h2>

      {/* Bộ lọc báo cáo */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label htmlFor="time-range" className="block text-sm font-medium text-gray-700 mb-1">
            Khoảng thời gian
          </label>
          <select
            id="time-range"
            className="border border-gray-300 rounded-md px-3 py-2"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
        <div>
          <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-1">
            Loại báo cáo
          </label>
          <select
            id="report-type"
            className="border border-gray-300 rounded-md px-3 py-2"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="revenue">Doanh thu</option>
            <option value="service">Dịch vụ</option>
            <option value="customer">Khách hàng</option>
          </select>
        </div>
      </div>

      {/* Thẻ tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tổng doanh thu</h3>
          <p className="text-2xl font-semibold mt-1">{formatCurrency(getTotalRevenue())}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
          <p className="text-2xl font-semibold mt-1">{getTotalBookings()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Khách hàng mới</h3>
          <p className="text-2xl font-semibold mt-1">{getTotalNewCustomers()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Khách hàng quay lại</h3>
          <p className="text-2xl font-semibold mt-1">{getTotalReturningCustomers()}</p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">
          {reportType === 'revenue'
            ? 'Biểu đồ doanh thu'
            : reportType === 'service'
            ? 'Biểu đồ dịch vụ'
            : 'Biểu đồ khách hàng'}
        </h3>

        <div className="h-80">
          {reportType === 'revenue' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getRevenueChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => {
                  if (name === 'revenue') return formatCurrency(value as number);
                  return value;
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="bookings" name="Số đơn hàng" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {reportType === 'service' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getServiceChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getServiceChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {reportType === 'customer' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={getCustomerChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="new" name="Khách hàng mới" stroke="#8884d8" />
                <Line
                  type="monotone"
                  dataKey="returning"
                  name="Khách hàng quay lại"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bảng dữ liệu chi tiết */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Dữ liệu chi tiết</h3>
        <div className="overflow-x-auto">
          {reportType === 'revenue' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trung bình/đơn
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.revenue / item.bookings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'service' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ lệ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.value}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'customer' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng mới
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng quay lại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.new}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.returning}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.new + item.returning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
