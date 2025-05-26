import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

// Dữ liệu mẫu cho danh sách đơn hàng
const bookingsData = [
  { 
    id: 'BK001', 
    customer: 'Nguyễn Văn A', 
    service: 'Vệ sinh nhà cửa', 
    date: '15/07/2023', 
    time: '09:00', 
    address: 'Số 123, Đường ABC, Quận 7, TP. HCM',
    staff: 'Nhân viên 1',
    status: 'completed', 
    amount: 300000 
  },
  { 
    id: 'BK002', 
    customer: 'Trần Thị B', 
    service: 'Vệ sinh văn phòng', 
    date: '16/07/2023', 
    time: '14:00', 
    address: 'Số 456, Đường XYZ, Quận 1, TP. HCM',
    staff: 'Nhân viên 2',
    status: 'confirmed', 
    amount: 500000 
  },
  { 
    id: 'BK003', 
    customer: 'Lê Văn C', 
    service: 'Vệ sinh điều hòa', 
    date: '17/07/2023', 
    time: '10:00', 
    address: 'Số 789, Đường DEF, Quận 3, TP. HCM',
    staff: 'Chưa phân công',
    status: 'pending', 
    amount: 250000 
  },
  { 
    id: 'BK004', 
    customer: 'Phạm Thị D', 
    service: 'Vệ sinh sau xây dựng', 
    date: '18/07/2023', 
    time: '08:00', 
    address: 'Số 101, Đường GHI, Quận 2, TP. HCM',
    staff: 'Nhân viên 1',
    status: 'in_progress', 
    amount: 700000 
  },
  { 
    id: 'BK005', 
    customer: 'Hoàng Văn E', 
    service: 'Phun khử khuẩn', 
    date: '19/07/2023', 
    time: '15:00', 
    address: 'Số 202, Đường JKL, Quận 5, TP. HCM',
    staff: 'Nhân viên 2',
    status: 'cancelled', 
    amount: 500000 
  },
  { 
    id: 'BK006', 
    customer: 'Vũ Thị F', 
    service: 'Vệ sinh nhà cửa', 
    date: '20/07/2023', 
    time: '09:30', 
    address: 'Số 303, Đường MNO, Quận 10, TP. HCM',
    staff: 'Chưa phân công',
    status: 'pending', 
    amount: 300000 
  },
  { 
    id: 'BK007', 
    customer: 'Đặng Văn G', 
    service: 'Vệ sinh văn phòng', 
    date: '21/07/2023', 
    time: '13:00', 
    address: 'Số 404, Đường PQR, Quận 4, TP. HCM',
    staff: 'Nhân viên 1',
    status: 'confirmed', 
    amount: 450000 
  },
  { 
    id: 'BK008', 
    customer: 'Bùi Thị H', 
    service: 'Giặt thảm, sofa', 
    date: '22/07/2023', 
    time: '10:30', 
    address: 'Số 505, Đường STU, Quận 8, TP. HCM',
    staff: 'Nhân viên 2',
    status: 'pending', 
    amount: 350000 
  },
];

// Danh sách nhân viên mẫu
const staffList = [
  { id: 1, name: 'Nhân viên 1' },
  { id: 2, name: 'Nhân viên 2' },
  { id: 3, name: 'Nhân viên 3' },
  { id: 4, name: 'Nhân viên 4' },
];

/**
 * Component Bookings - Trang quản lý đơn hàng cho admin
 * @returns Trang quản lý đơn hàng với bộ lọc, tìm kiếm và danh sách đơn hàng
 */
const Bookings: React.FC = () => {
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    service: '',
  });

  // State cho từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  
  // State cho đơn hàng đang xem chi tiết
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // State cho đơn hàng đang chỉnh sửa
  const [editingBooking, setEditingBooking] = useState<any>(null);

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trong thực tế, sẽ gọi API để tìm kiếm đơn hàng
    console.log('Searching for:', searchQuery);
  };

  // Hàm xử lý xuất báo cáo
  const handleExportReport = () => {
    // Trong thực tế, sẽ gọi API để xuất báo cáo
    console.log('Exporting report with filters:', filters);
  };

  // Hàm xử lý xem chi tiết đơn hàng
  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setEditingBooking(null);
  };

  // Hàm xử lý chỉnh sửa đơn hàng
  const handleEditBooking = (booking: any) => {
    setEditingBooking({...booking});
    setSelectedBooking(null);
  };

  // Hàm xử lý lưu thay đổi đơn hàng
  const handleSaveBooking = () => {
    // Trong thực tế, sẽ gọi API để cập nhật đơn hàng
    console.log('Saving booking:', editingBooking);
    setEditingBooking(null);
  };

  // Hàm xử lý đóng modal
  const handleCloseModal = () => {
    setSelectedBooking(null);
    setEditingBooking(null);
  };

  // Hàm định dạng số tiền thành chuỗi có dấu phân cách
  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
  };

  // Hàm lấy màu cho trạng thái đơn hàng
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Hàm lấy tên tiếng Việt cho trạng thái đơn hàng
  const getStatusName = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Đang chờ';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Lọc danh sách đơn hàng theo bộ lọc và từ khóa tìm kiếm
  const filteredBookings = bookingsData.filter(booking => {
    // Lọc theo trạng thái
    if (filters.status && booking.status !== filters.status) return false;
    
    // Lọc theo dịch vụ
    if (filters.service && booking.service !== filters.service) return false;
    
    // Lọc theo từ khóa tìm kiếm (id, khách hàng, địa chỉ)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.customer.toLowerCase().includes(query) ||
        booking.address.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Danh sách các dịch vụ duy nhất để hiển thị trong bộ lọc
  const uniqueServices = Array.from(new Set(bookingsData.map(booking => booking.service)));

  return (
    <>
      <div className="space-y-6">
        {/* Tiêu đề và nút xuất báo cáo */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Quản lý đơn hàng</h2>
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* Bộ lọc trạng thái */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Đang chờ</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Bộ lọc từ ngày */}
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Bộ lọc đến ngày */}
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Bộ lọc dịch vụ */}
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                Dịch vụ
              </label>
              <select
                id="service"
                name="service"
                value={filters.service}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Tất cả dịch vụ</option>
                {uniqueServices.map((service, index) => (
                  <option key={index} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="mt-6">
            <form onSubmit={handleSearch} className="flex w-full md:max-w-md">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tìm kiếm theo mã đơn, khách hàng, địa chỉ..."
                />
              </div>
              <button
                type="submit"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>

        {/* Danh sách đơn hàng */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày & Giờ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.date} {booking.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.staff}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {getStatusName(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(booking.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal xem chi tiết đơn hàng */}
      {selectedBooking && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Chi tiết đơn hàng {selectedBooking.id}
                    </h3>
                    <div className="mt-2 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Khách hàng:</p>
                          <p className="text-sm font-medium">{selectedBooking.customer}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Dịch vụ:</p>
                          <p className="text-sm font-medium">{selectedBooking.service}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Ngày:</p>
                          <p className="text-sm font-medium">{selectedBooking.date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Giờ:</p>
                          <p className="text-sm font-medium">{selectedBooking.time}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ:</p>
                        <p className="text-sm font-medium">{selectedBooking.address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Nhân viên:</p>
                          <p className="text-sm font-medium">{selectedBooking.staff}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trạng thái:</p>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                            {getStatusName(selectedBooking.status)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Giá trị:</p>
                        <p className="text-sm font-medium">{formatCurrency(selectedBooking.amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleEditBooking(selectedBooking)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa đơn hàng */}
      {editingBooking && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Chỉnh sửa đơn hàng {editingBooking.id}
                    </h3>
                    <div className="mt-2 space-y-3">
                      <div>
                        <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <select
                          id="edit-status"
                          value={editingBooking.status}
                          onChange={(e) => setEditingBooking({...editingBooking, status: e.target.value})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="pending">Đang chờ</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="in_progress">Đang thực hiện</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="edit-staff" className="block text-sm font-medium text-gray-700 mb-1">
                          Phân công nhân viên
                        </label>
                        <select
                          id="edit-staff"
                          value={editingBooking.staff === 'Chưa phân công' ? '' : editingBooking.staff}
                          onChange={(e) => setEditingBooking({...editingBooking, staff: e.target.value || 'Chưa phân công'})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Chưa phân công</option>
                          {staffList.map(staff => (
                            <option key={staff.id} value={staff.name}>{staff.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày
                        </label>
                        <input
                          type="date"
                          id="edit-date"
                          value={editingBooking.date}
                          onChange={(e) => setEditingBooking({...editingBooking, date: e.target.value})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-time" className="block text-sm font-medium text-gray-700 mb-1">
                          Giờ
                        </label>
                        <input
                          type="time"
                          id="edit-time"
                          value={editingBooking.time}
                          onChange={(e) => setEditingBooking({...editingBooking, time: e.target.value})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Ghi chú
                        </label>
                        <textarea
                          id="edit-notes"
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Nhập ghi chú cho đơn hàng..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveBooking}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Bookings;
