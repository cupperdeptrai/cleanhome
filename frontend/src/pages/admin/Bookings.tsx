import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EyeIcon,
  PencilIcon,
  UserPlusIcon,
  CheckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import AdminService, { AdminBooking, AdminStaff } from '../../services/admin.service';
import { formatDate } from '../../utils/dateTime';

/**
 * Component tooltip để hiển thị danh sách nhân viên
 */
const StaffTooltip: React.FC<{ 
  staffList: Array<{staffName: string}>, 
  children: React.ReactNode 
}> = ({ staffList, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-gray-800 text-white text-xs rounded py-2 px-3 max-w-48 shadow-lg">
          <div className="space-y-1">
            {staffList.map((staff, index) => (
              <div key={index} className="whitespace-nowrap">
                {staff.staffName}
              </div>
            ))}
          </div>
          {/* Arrow */}
          <div className="absolute bottom-full left-3 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Component quản lý đơn đặt lịch cho Admin
 */
const AdminBookings: React.FC = () => {
  // State
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
    // Modal state
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  // State cho việc chọn nhiều nhân viên
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [assignNotes, setAssignNotes] = useState('');
  
  // Loading dữ liệu khi component mount
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Tải dữ liệu booking và staff
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookingsData, staffData] = await Promise.all([
        AdminService.getBookings(),
        AdminService.getStaff()
      ]);

      setBookings(bookingsData);
      setStaff(staffData.filter(s => s.status === 'active'));

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setError('Không thể tải dữ liệu đơn đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lọc danh sách booking theo filter
   */
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesStaff = staffFilter === 'all' || 
                        (staffFilter === 'unassigned' && !booking.staffId) ||
                        booking.staffId === staffFilter;
    
    return matchesSearch && matchesStatus && matchesStaff;
  });

  /**
   * Format giá tiền
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  /**
   * Hiển thị trạng thái booking
   */
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

  /**
   * Hiển thị trạng thái thanh toán
   */
  const renderPaymentStatus = (status: string) => {
    const statusConfig = {
      unpaid: { label: 'Chưa thanh toán', className: 'bg-red-100 text-red-800' },
      pending: { label: 'Đang xử lý', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
      refunded: { label: 'Đã hoàn tiền', className: 'bg-blue-100 text-blue-800' },
      failed: { label: 'Thất bại', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };
  /**
   * Xử lý phân công nhiều nhân viên
   */
  const handleAssignMultipleStaff = async () => {
    if (!selectedBooking || selectedStaffIds.length === 0) return;

    try {
      console.log('🔄 Bắt đầu phân công nhiều nhân viên:', {
        bookingId: selectedBooking.id,
        bookingCode: selectedBooking.bookingCode,
        staffIds: selectedStaffIds,
        staffNames: selectedStaffIds.map(id => staff.find(s => s.id === id)?.name),
        notes: assignNotes
      });

      await AdminService.assignMultipleStaffToBooking(selectedBooking.id, selectedStaffIds, assignNotes);
      
      // Cập nhật local state với thông tin nhiều nhân viên
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id 
          ? { 
              ...b, 
              assignedStaff: selectedStaffIds.map(id => {
                const staffMember = staff.find(s => s.id === id);
                return {
                  id,
                  staffName: staffMember?.name || '',
                  staffId: id,
                  assignedAt: new Date().toISOString()
                };
              }),
              staffCount: selectedStaffIds.length
            }
          : b
      ));
      
      setShowAssignModal(false);
      setSelectedBooking(null);
      setSelectedStaffIds([]);  // Reset selection
      setAssignNotes('');       // Reset notes
      
      console.log('✅ Phân công nhiều nhân viên thành công');
      alert(`Phân công ${selectedStaffIds.length} nhân viên thành công!`);
    } catch (error) {
      console.error('❌ Lỗi khi phân công nhiều nhân viên:', error);
      alert('Có lỗi xảy ra khi phân công nhân viên. Vui lòng thử lại.');
    }
  };

  /**
   * Toggle chọn nhân viên
   */
  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };
  /**
   * Xử lý cập nhật trạng thái booking
   */
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedBooking) return;

    try {
      await AdminService.updateBookingStatus(selectedBooking.id, newStatus as AdminBooking['status']);
      
      // Cập nhật local state
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, status: newStatus as AdminBooking['status'] }
          : b
      ));
      
      setShowStatusModal(false);
      setSelectedBooking(null);
      
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  /**
   * Xử lý cập nhật trạng thái thanh toán
   */
  const handleUpdatePaymentStatus = async (bookingId: string, paymentStatus: AdminBooking['paymentStatus']) => {
    try {
      await AdminService.updatePaymentStatus(bookingId, paymentStatus);
      
      // Cập nhật local state
      setBookings(prev => prev.map(b => 
        b.id === bookingId 
          ? { ...b, paymentStatus }
          : b
      ));
      
      alert('Cập nhật trạng thái thanh toán thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái thanh toán');
    }
  };

  /**
   * Kiểm tra xem có thể đánh dấu đã thanh toán không
   * Chỉ cho phép khi booking đã completed và chưa thanh toán
   */
  const canMarkAsPaid = (booking: AdminBooking) => {
    return booking.status === 'completed' && booking.paymentStatus === 'unpaid';
  };

  /**
   * Kiểm tra xem có thể phân công nhân viên không
   * Chỉ cho phép khi chưa có staff và booking không bị hủy
   */
  const canAssignStaff = (booking: AdminBooking) => {
    return !booking.staffId && booking.status !== 'cancelled';
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách đơn đặt lịch...</p>
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
          onClick={loadData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn đặt lịch</h1>
        <div className="text-sm text-gray-500">
          Tổng: {filteredBookings.length} đơn
        </div>
      </div>      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
              aria-label="Lọc theo trạng thái"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
              <option value="rescheduled">Đã dời lịch</option>
            </select>
          </div>

          {/* Staff Filter */}
          <div className="relative">
            <UserPlusIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
              aria-label="Lọc theo nhân viên"
            >
              <option value="all">Tất cả nhân viên</option>
              <option value="unassigned">Chưa phân công</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tải...
              </>
            ) : (
              'Làm mới'
            )}
          </button>        </div>
      </div>

      {/* Bookings Table - Responsive Layout */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Desktop Table View - Optimized for screen fit */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Mã đơn
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng & Dịch vụ
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                  Thời gian
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Nhân viên
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Trạng thái
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Giá
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  {/* Cột 1: Mã đơn */}
                  <td className="px-3 py-4 w-28">
                    <div className="text-sm font-medium text-gray-900 truncate" title={booking.bookingCode}>
                      {booking.bookingCode}
                    </div>
                  </td>
                  
                  {/* Cột 2: Khách hàng & Dịch vụ */}
                  <td className="px-3 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate" title={booking.userName}>
                        {booking.userName}
                      </div>
                      <div className="text-xs text-gray-500 truncate" title={booking.userPhone}>
                        {booking.userPhone}
                      </div>
                      <div className="text-sm text-blue-600 truncate mt-1" title={booking.serviceName}>
                        {booking.serviceName}
                      </div>
                    </div>
                  </td>
                  
                  {/* Cột 3: Thời gian */}
                  <td className="px-3 py-4 w-36">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(booking.bookingDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.bookingTime}
                      </div>
                      {booking.endTime && (
                        <div className="text-xs text-gray-400">
                          đến {booking.endTime}
                        </div>
                      )}
                    </div>
                  </td>
                    {/* Cột 4: Nhân viên */}
                  <td className="px-3 py-4 w-40">
                    <div>
                      {booking.assignedStaff && booking.assignedStaff.length > 0 ? (
                        <div>
                          {booking.assignedStaff.length === 1 ? (
                            <div className="text-sm text-gray-900 truncate" title={booking.assignedStaff[0].staffName}>
                              {booking.assignedStaff[0].staffName}
                            </div>
                          ) : (
                            <StaffTooltip staffList={booking.assignedStaff}>
                              <div className="text-sm text-gray-900 cursor-pointer flex items-center hover:text-blue-600">
                                <span>{booking.assignedStaff.length} nhân viên</span>
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </StaffTooltip>
                          )}
                        </div>
                      ) : booking.staffName ? (
                        <div className="text-sm text-gray-900 truncate" title={booking.staffName}>
                          {booking.staffName}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-600">
                          Chưa phân công
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Cột 5: Trạng thái */}
                  <td className="px-3 py-4 w-32">
                    <div className="space-y-1">
                      {renderBookingStatus(booking.status)}
                      {renderPaymentStatus(booking.paymentStatus)}
                    </div>
                  </td>
                  
                  {/* Cột 6: Giá */}
                  <td className="px-3 py-4 w-20">
                    <div className="text-sm font-semibold text-green-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(booking.totalPrice)}
                    </div>
                  </td>
                  
                  {/* Cột 7: Thao tác */}
                  <td className="px-3 py-4 w-24">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {canAssignStaff(booking) && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowAssignModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Phân công"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                        </button>
                      )}

                      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowStatusModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                          title="Cập nhật trạng thái"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}

                      {canMarkAsPaid(booking) && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(booking.id, 'paid')}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Đánh dấu đã thanh toán"
                        >
                          <BanknotesIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>        </div>

        {/* Tablet View - Simplified table for medium screens */}
        <div className="hidden md:block lg:hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng & Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dịch vụ & Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên & Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  {/* Cột 1: Đơn hàng & Khách hàng */}
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.bookingCode}</div>
                      <div className="text-sm font-semibold text-green-600">{formatPrice(booking.totalPrice)}</div>
                      <div className="text-sm text-gray-900 mt-1">{booking.userName}</div>
                      <div className="text-xs text-gray-500">{booking.userPhone}</div>
                    </div>
                  </td>
                  
                  {/* Cột 2: Dịch vụ & Thời gian */}
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm text-blue-600">{booking.serviceName}</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">{formatDate(booking.bookingDate)}</div>
                      <div className="text-xs text-gray-500">{booking.bookingTime}</div>
                    </div>
                  </td>
                  
                  {/* Cột 3: Nhân viên & Trạng thái */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div>
                        {booking.assignedStaff && booking.assignedStaff.length > 0 ? (
                          <div>
                            {booking.assignedStaff.length === 1 ? (
                              <div className="text-sm text-gray-900">{booking.assignedStaff[0].staffName}</div>
                            ) : (
                              <div className="text-sm text-gray-900">{booking.assignedStaff.length} nhân viên</div>
                            )}
                          </div>
                        ) : booking.staffName ? (
                          <div className="text-sm text-gray-900">{booking.staffName}</div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-600">
                            Chưa phân công
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        {renderBookingStatus(booking.status)}
                        {renderPaymentStatus(booking.paymentStatus)}
                      </div>
                    </div>
                  </td>
                  
                  {/* Cột 4: Thao tác */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 hover:bg-blue-50 rounded text-xs flex items-center"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Chi tiết
                      </button>
                      
                      {canAssignStaff(booking) && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowAssignModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 px-2 py-1 hover:bg-green-50 rounded text-xs flex items-center"
                          title="Phân công"
                        >
                          <UserPlusIcon className="h-4 w-4 mr-1" />
                          Phân công
                        </button>
                      )}

                      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowStatusModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 px-2 py-1 hover:bg-orange-50 rounded text-xs flex items-center"
                          title="Cập nhật trạng thái"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Cập nhật
                        </button>
                      )}

                      {canMarkAsPaid(booking) && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(booking.id, 'paid')}
                          className="text-green-600 hover:text-green-900 px-2 py-1 hover:bg-green-50 rounded text-xs flex items-center"
                          title="Đánh dấu đã thanh toán"
                        >
                          <BanknotesIcon className="h-4 w-4 mr-1" />
                          Thanh toán
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          <div className="p-4 space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                {/* Header with booking code and price */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{booking.bookingCode}</div>
                    <div className="text-lg font-semibold text-green-600">{formatPrice(booking.totalPrice)}</div>
                  </div>
                  <div className="flex space-x-2">
                    {renderBookingStatus(booking.status)}
                  </div>
                </div>

                {/* Customer info */}
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                  <div className="text-xs text-gray-500">{booking.userPhone}</div>
                  <div className="text-sm text-blue-600">{booking.serviceName}</div>
                </div>                {/* Date and staff - Improved layout */}
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(booking.bookingDate)}</div>
                      <div className="text-xs text-gray-500">{booking.bookingTime}{booking.endTime && ` - ${booking.endTime}`}</div>
                    </div>
                  </div>
                  
                  {/* Staff section */}
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">Nhân viên thực hiện:</div>
                    {booking.assignedStaff && booking.assignedStaff.length > 0 ? (
                      <div>
                        {booking.assignedStaff.length === 1 ? (
                          <div className="text-sm text-gray-900 bg-blue-50 px-2 py-1 rounded">
                            {booking.assignedStaff[0].staffName}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.assignedStaff.length} nhân viên được phân công
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {booking.assignedStaff.map((staff, index) => (
                                <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  {staff.staffName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : booking.staffName ? (
                      <div className="text-sm text-gray-900 bg-blue-50 px-2 py-1 rounded">
                        {booking.staffName}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-600">
                        Chưa phân công nhân viên
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment status and actions */}
                <div className="flex justify-between items-center">
                  <div>
                    {renderPaymentStatus(booking.paymentStatus)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {canAssignStaff(booking) && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowAssignModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                        title="Phân công"
                      >
                        <UserPlusIcon className="h-4 w-4" />
                      </button>
                    )}

                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowStatusModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded"
                        title="Cập nhật trạng thái"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}

                    {canMarkAsPaid(booking) && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(booking.id, 'paid')}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                        title="Đánh dấu đã thanh toán"
                      >
                        <BanknotesIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <div className="text-lg font-medium mb-2">Không tìm thấy đơn đặt lịch nào</div>
              <div>Thử điều chỉnh bộ lọc để xem thêm kết quả</div>
            </div>
          </div>
        )}
      </div>      {/* Modal Phân công nhân viên */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              Phân công nhân viên cho đơn {selectedBooking.bookingCode}
            </h3>
            
            {/* Checkbox để chọn nhiều nhân viên */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Chọn nhân viên (có thể chọn nhiều):
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                {staff.map(s => (
                  <label
                    key={s.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStaffIds.includes(s.id)}
                      onChange={() => toggleStaffSelection(s.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-gray-500">
                        Rating: {s.rating}/5 • {s.completedBookings}/{s.totalBookings} đơn hoàn thành
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Ghi chú phân công */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú phân công (tùy chọn):
              </label>
              <textarea
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Ví dụ: Cần 2 nhân viên cho căn hộ lớn, ưu tiên nhân viên có kinh nghiệm..."
              />
            </div>

            {/* Hiển thị số nhân viên đã chọn */}
            {selectedStaffIds.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm font-medium text-blue-800">
                  Đã chọn {selectedStaffIds.length} nhân viên:
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  {selectedStaffIds.map(id => staff.find(s => s.id === id)?.name).join(', ')}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedBooking(null);
                  setSelectedStaffIds([]);
                  setAssignNotes('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignMultipleStaff}
                disabled={selectedStaffIds.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Phân công {selectedStaffIds.length > 0 ? `${selectedStaffIds.length} nhân viên` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cập nhật trạng thái */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">
              Cập nhật trạng thái đơn {selectedBooking.bookingCode}
            </h3>
            
            <div className="space-y-3 mb-6">
              {['confirmed', 'in_progress', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    {renderBookingStatus(status)}
                  </div>
                  <CheckIcon className="h-5 w-5 text-green-600" />
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
