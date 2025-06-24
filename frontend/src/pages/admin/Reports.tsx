import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { AdminService } from '../../services/admin.service';
import { formatDate, formatCurrency } from '../../utils/dateTime';
import { 
  exportBusinessReport, 
  calculateBusinessInsights, 
  type ExcelReportData,
  type BusinessSummary 
} from '../../utils/excelExport';
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
import { 
  CalendarIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

/**
 * Interface cho dữ liệu báo cáo
 */
interface ReportData {
  date?: string;
  month?: number;
  year?: number;
  bookings: number;
  revenue: number;
  completed: number;
  cancelled: number;
  avgRating?: number;
}

/**
 * Trang Báo cáo Admin - Phiên bản mới đồng bộ với schema
 */
const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalCompleted: 0,
    totalCancelled: 0,
    avgRating: 0,
    completionRate: 0,
    cancellationRate: 0
  });  // Load dữ liệu báo cáo
  const loadReportData = React.useCallback(async () => {
    try {
      setLoading(true);
      let data: ReportData[] = [];

      switch (reportType) {
        case 'daily':
          data = await AdminService.getDailyReport(dateRange.startDate, dateRange.endDate);
          break;
        case 'monthly':
          data = await AdminService.getMonthlyReport(selectedYear);
          break;        case 'yearly': {
          const yearlyData = await AdminService.getYearlyReport();
          data = yearlyData.map((item: {
            year: number;
            totalBookings: number;
            totalRevenue: number;
            totalCompleted: number;
            totalCancelled: number;
            avgRating: number;
          }) => ({
            year: item.year,
            bookings: item.totalBookings,
            revenue: item.totalRevenue,
            completed: item.totalCompleted,
            cancelled: item.totalCancelled,
            avgRating: item.avgRating
          }));
          break;
        }
      }

      setReportData(data);
      calculateSummary(data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo:', error);
    } finally {
      setLoading(false);
    }
  }, [reportType, dateRange, selectedYear]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Xuất báo cáo Excel
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      alert('Không có dữ liệu để xuất báo cáo');
      return;
    }

    // Chuyển đổi dữ liệu thành format Excel
    const excelData: ExcelReportData[] = reportData.map(item => ({
      period: reportType === 'daily' 
        ? formatDate(item.date || '') 
        : reportType === 'monthly' 
          ? `Tháng ${item.month}/${item.year}` 
          : `Năm ${item.year}`,
      totalBookings: item.bookings,
      completedBookings: item.completed,
      cancelledBookings: item.cancelled,
      inProgressBookings: item.bookings - item.completed - item.cancelled,
      totalRevenue: item.revenue,
      completionRate: item.bookings > 0 ? (item.completed / item.bookings) * 100 : 0,
      cancellationRate: item.bookings > 0 ? (item.cancelled / item.bookings) * 100 : 0,
      avgRating: item.avgRating || 0,
      avgOrderValue: item.bookings > 0 ? item.revenue / item.bookings : 0,
      topServices: 'Đang cập nhật', // TODO: Lấy từ API
      customerRetentionRate: 85 // TODO: Tính toán thực tế
    }));

    // Tính toán insights
    const insights = calculateBusinessInsights(excelData);

    // Tạo business summary
    const businessSummary: BusinessSummary = {
      reportPeriod: reportType === 'monthly' 
        ? `Tháng năm ${selectedYear}` 
        : reportType === 'yearly' 
          ? 'Theo năm' 
          : `${dateRange.startDate} đến ${dateRange.endDate}`,
      totalData: {
        totalBookings: summary.totalBookings,
        totalRevenue: summary.totalRevenue,
        totalCompleted: summary.totalCompleted,
        totalCancelled: summary.totalCancelled,
        avgRating: summary.avgRating,
        completionRate: summary.completionRate,
        cancellationRate: summary.cancellationRate,
        avgOrderValue: summary.totalBookings > 0 ? summary.totalRevenue / summary.totalBookings : 0
      },
      periodData: excelData,
      insights
    };

    // Xuất file Excel
    const exportType = reportType === 'yearly' ? 'yearly' : 'monthly';
    const period = reportType === 'monthly' ? selectedYear : new Date().getFullYear();
    
    exportBusinessReport(businessSummary, exportType, period);
  };

  // Tính toán tổng hợp
  const calculateSummary = (data: ReportData[]) => {
    const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
    const totalCancelled = data.reduce((sum, item) => sum + item.cancelled, 0);
    const avgRating = data.reduce((sum, item) => sum + (item.avgRating || 0), 0) / data.length;

    setSummary({
      totalBookings,
      totalRevenue,
      totalCompleted,
      totalCancelled,
      avgRating: isNaN(avgRating) ? 0 : avgRating,
      completionRate: totalBookings > 0 ? (totalCompleted / totalBookings) * 100 : 0,
      cancellationRate: totalBookings > 0 ? (totalCancelled / totalBookings) * 100 : 0
    });
  };

  // Format dữ liệu cho biểu đồ
  const formatChartData = () => {
    return reportData.map(item => ({
      ...item,
      name: reportType === 'daily' 
        ? formatDate(item.date || '') 
        : reportType === 'monthly' 
          ? `Tháng ${item.month}` 
          : `Năm ${item.year}`,
      revenueInMillion: Math.round(item.revenue / 1000000)
    }));
  };

  // Dữ liệu cho biểu đồ tròn trạng thái đơn hàng
  const statusPieData = [
    { name: 'Hoàn thành', value: summary.totalCompleted, color: '#10B981' },
    { name: 'Hủy', value: summary.totalCancelled, color: '#EF4444' },
    { name: 'Khác', value: summary.totalBookings - summary.totalCompleted - summary.totalCancelled, color: '#F59E0B' }
  ];

  const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <div className="space-y-6">        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
            <p className="mt-2 text-sm text-gray-700">
              Xem báo cáo doanh thu và hiệu suất kinh doanh
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleExportExcel}
              disabled={loading || reportData.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
              Xuất Excel
            </button>
          </div>
        </div>        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Report Type */}
            <div>
              <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-2">
                Loại báo cáo
              </label>
              <select
                id="report-type"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'daily' | 'monthly' | 'yearly')}
              >
                <option value="daily">Theo ngày</option>
                <option value="monthly">Theo tháng</option>
                <option value="yearly">Theo năm</option>
              </select>
            </div>

            {/* Date Range for Daily Report */}
            {reportType === 'daily' && (
              <>
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Từ ngày
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Đến ngày
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  />
                </div>
              </>
            )}

            {/* Year Selector for Monthly Report */}
            {reportType === 'monthly' && (
              <div>
                <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Năm
                </label>
                <select
                  id="year-select"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Export Excel Button */}
            <div className="flex flex-col justify-end">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xuất báo cáo
              </label>
              <button
                onClick={handleExportExcel}
                disabled={loading || reportData.length === 0}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                title={`Xuất báo cáo Excel ${reportType === 'monthly' ? 'theo tháng' : reportType === 'yearly' ? 'theo năm' : 'theo ngày'}`}
              >
                <DocumentArrowDownIcon className="-ml-1 mr-2 h-4 w-4" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tổng đơn hàng</dt>
                    <dd className="text-lg font-medium text-gray-900">{summary.totalBookings.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tổng doanh thu</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(summary.totalRevenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentChartBarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tỷ lệ hoàn thành</dt>
                    <dd className="text-lg font-medium text-gray-900">{summary.completionRate.toFixed(1)}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Đánh giá TB</dt>
                    <dd className="text-lg font-medium text-gray-900">{summary.avgRating.toFixed(1)}/5</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Bookings Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Doanh thu & Số đơn hàng
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'revenueInMillion') {
                        return [`${value} triệu VNĐ`, 'Doanh thu'];
                      }
                      return [value, name === 'bookings' ? 'Số đơn hàng' : name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="bookings" fill="#3B82F6" name="Số đơn hàng" />
                  <Bar yAxisId="right" dataKey="revenueInMillion" fill="#10B981" name="Doanh thu (triệu VNĐ)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Phân bố trạng thái đơn hàng
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >                    {statusPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Completion Rate Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Xu hướng tỷ lệ hoàn thành
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={formatChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'completionRate') {
                      return [`${value}%`, 'Tỷ lệ hoàn thành'];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={(data) => data.bookings > 0 ? (data.completed / data.bookings * 100).toFixed(1) : 0}
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Tỷ lệ hoàn thành (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Chi tiết dữ liệu
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {reportType === 'daily' ? 'Ngày' : reportType === 'monthly' ? 'Tháng' : 'Năm'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoàn thành
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hủy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ lệ hoàn thành
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reportType === 'daily' 
                        ? formatDate(item.date || '') 
                        : reportType === 'monthly' 
                          ? `Tháng ${item.month}/${item.year}` 
                          : `Năm ${item.year}`
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.bookings.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {item.completed.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {item.cancelled.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.bookings > 0 ? ((item.completed / item.bookings) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {reportData.length === 0 && (
          <div className="text-center py-12">
            <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dữ liệu</h3>
            <p className="mt-1 text-sm text-gray-500">
              Không tìm thấy dữ liệu báo cáo trong khoảng thời gian đã chọn.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminReports;
