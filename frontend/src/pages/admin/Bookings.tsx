import React, { useState, useEffect, useCallback } from 'react';
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
 * Component phân trang
 */
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Tạo danh sách trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7; // Số trang tối đa hiển thị
    
    if (totalPages <= maxVisible) {
      // Nếu tổng số trang ít, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Hiển thị thông minh: 1 ... 3 4 [5] 6 7 ... 10
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        {/* Mobile pagination */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Trước
        </button>
        <div className="flex items-center">
          <span className="text-sm text-gray-700 bg-blue-50 px-3 py-1 rounded-full">
            {currentPage} / {totalPages}
          </span>
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau →
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
            <span className="font-medium">{endItem}</span> trong{' '}
            <span className="font-medium">{totalItems}</span> đơn đặt lịch
          </p>
          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
            Trang <span className="font-medium text-blue-700">{currentPage}</span> / <span className="font-medium text-blue-700">{totalPages}</span>
          </div>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Trang trước</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            
            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Trang sau</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [itemsPerPage] = useState(30); // 30 đơn mỗi trang
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  
  // Modal state
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // State cho việc chọn nhiều nhân viên
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [assignNotes, setAssignNotes] = useState('');
  
  // Debug logging để theo dõi data changes
  React.useEffect(() => {
    if (bookings.length > 0) {
      console.log('🔍 AdminBookings - Current bookings data sample:', {
        totalBookings: bookings.length,
        firstBooking: {
          id: bookings[0].id,
          bookingCode: bookings[0].bookingCode,
          staffId: bookings[0].staffId,
          staffName: bookings[0].staffName,
          assignedStaff: bookings[0].assignedStaff,
          staffCount: bookings[0].staffCount
        }
      });
    }
  }, [bookings]);

  /**
   * Tải dữ liệu booking và staff
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 AdminBookings - Bắt đầu load data...');

      const [bookingsResponse, staffData] = await Promise.all([
        AdminService.getBookings(currentPage, itemsPerPage),
        AdminService.getStaff()
      ]);

      console.log('📊 AdminBookings - Loaded bookings:', bookingsResponse.bookings.length);
      console.log('👥 AdminBookings - Loaded staff:', staffData.length);
      
      // Log một số booking để kiểm tra format dữ liệu
      if (bookingsResponse.bookings.length > 0) {
        console.log('📝 AdminBookings - Sample booking:', {
          id: bookingsResponse.bookings[0].id,
          bookingCode: bookingsResponse.bookings[0].bookingCode,
          staffId: bookingsResponse.bookings[0].staffId,
          staffName: bookingsResponse.bookings[0].staffName,
          assignedStaff: bookingsResponse.bookings[0].assignedStaff,
          staffCount: bookingsResponse.bookings[0].staffCount
        });
      }

      setBookings(bookingsResponse.bookings);
      setTotalBookings(bookingsResponse.total);
      setTotalPages(bookingsResponse.totalPages);
      setStaff(staffData.filter(s => s.status === 'active'));

    } catch (error) {
      console.error('❌ AdminBookings - Lỗi khi tải dữ liệu:', error);
      setError('Không thể tải dữ liệu đơn đặt lịch');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);
  
  // Loading dữ liệu khi component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

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
   * Hiển thị trạng thái booking với style đẹp hơn
   */
  const renderBookingStatus = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      confirmed: { label: 'Đã xác nhận', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
      in_progress: { label: 'Đang thực hiện', className: 'bg-purple-50 text-purple-700 border border-purple-200' },
      completed: { label: 'Hoàn thành', className: 'bg-green-50 text-green-700 border border-green-200' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-50 text-red-700 border border-red-200' },
      rescheduled: { label: 'Đã dời lịch', className: 'bg-orange-50 text-orange-700 border border-orange-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded ${config.className}`}>
        {config.label}
      </span>
    );
  };

  /**
   * Hiển thị trạng thái thanh toán với style đẹp hơn
   */
  const renderPaymentStatus = (status: string) => {
    const statusConfig = {
      unpaid: { label: 'Chưa thanh toán', className: 'bg-red-50 text-red-700 border border-red-200' },
      pending: { label: 'Đang xử lý', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
      paid: { label: 'Đã thanh toán', className: 'bg-green-50 text-green-700 border border-green-200' },
      refunded: { label: 'Đã hoàn tiền', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
      failed: { label: 'Thất bại', className: 'bg-red-50 text-red-700 border border-red-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded ${config.className}`}>
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

      // Nếu chỉ có 1 nhân viên, thử dùng single assignment API
      if (selectedStaffIds.length === 1) {
        console.log('🔄 Chỉ 1 nhân viên, thử single assignment...');
        try {
          await AdminService.assignStaffToBooking(selectedBooking.id, selectedStaffIds[0]);
          console.log('✅ Single assignment thành công');
        } catch (singleError) {
          console.log('⚠️ Single assignment thất bại, thử multiple assignment...', singleError);
          await AdminService.assignMultipleStaffToBooking(selectedBooking.id, selectedStaffIds, assignNotes);
        }
      } else {
        // Nhiều nhân viên, dùng multiple assignment
        await AdminService.assignMultipleStaffToBooking(selectedBooking.id, selectedStaffIds, assignNotes);
      }
      
      console.log('✅ API phân công thành công, đang reload data...');
      
      // Clear state trước khi reload để tránh cache
      setBookings([]);
      
      // Đợi lâu hơn để backend cập nhật xong
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force reload data từ server
      await loadData();
      
      // Đợi thêm một chút để UI update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('✅ Reload data hoàn tất');
      
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
   * Xử lý thay đổi trang
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top with smooth animation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
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
      
      // Nếu cập nhật thành 'completed', reload data để đảm bảo thông tin nhân viên được cập nhật đúng
      if (newStatus === 'completed') {
        await loadData(); // Reload toàn bộ data để đồng bộ với backend
      } else {
        // Cập nhật local state cho các trạng thái khác
        setBookings(prev => prev.map(b => 
          b.id === selectedBooking.id 
            ? { ...b, status: newStatus as AdminBooking['status'] }
            : b
        ));
      }
      
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
      // Hiển thị loading state
      const button = document.querySelector(`[data-booking-id="${bookingId}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.innerHTML = '<div class="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>';
      }

      await AdminService.updatePaymentStatus(bookingId, paymentStatus);
      
      // Cập nhật local state
      setBookings(prev => prev.map(b => 
        b.id === bookingId 
          ? { ...b, paymentStatus }
          : b
      ));
      
      // Hiển thị thông báo thành công với style đẹp hơn
      const statusText = paymentStatus === 'paid' ? 'đã thanh toán' : 
                        paymentStatus === 'refunded' ? 'đã hoàn tiền' : 
                        paymentStatus === 'pending' ? 'đang chờ thanh toán' : 'chưa thanh toán';
      
      // Tạo toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      toast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Đã cập nhật trạng thái thanh toán thành "${statusText}" thành công!
      `;
      document.body.appendChild(toast);
      
      // Xóa toast sau 3 giây
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
      
      // Hiển thị toast lỗi
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      toast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Có lỗi xảy ra khi cập nhật trạng thái thanh toán
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
  };

  /**
   * Kiểm tra xem có thể đánh dấu đã thanh toán không
   * Cho phép khi booking đã hoàn thành hoặc đang thực hiện và chưa thanh toán
   */
  const canMarkAsPaid = (booking: AdminBooking) => {
    return (booking.status === 'completed' || booking.status === 'in_progress') && 
           (booking.paymentStatus === 'unpaid' || booking.paymentStatus === 'pending');
  };

  /**
   * Kiểm tra xem có thể phân công nhân viên không
   * Không cho phép phân công cho đơn hàng đã hủy hoặc đã hoàn thành
   */
  const canAssignStaff = (booking: AdminBooking) => {
    return booking.status !== 'cancelled' && booking.status !== 'completed';
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
        <div className="flex items-center space-x-4">
          <button
            onClick={loadData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Làm mới dữ liệu"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
          <div className="text-sm text-gray-500">
            <span>Tổng: {totalBookings} đơn</span>
          </div>
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
        {/* Desktop Table View - Tối ưu hiển thị trên màn hình với khoảng cách compact */}
        <div className="hidden lg:block overflow-x-auto">
          <table id="bookings-table" className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {/* Cột mã đơn - căn trái tiêu đề theo yêu cầu */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">
                  Mã đơn
                </th>
                {/* Cột khách hàng & dịch vụ - căn trái tiêu đề theo yêu cầu */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64 whitespace-nowrap">
                  Khách hàng & Dịch vụ
                </th>
                {/* Cột thời gian - căn trái tiêu đề theo yêu cầu */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">
                  Thời gian
                </th>
                {/* Cột nhân viên - căn trái tiêu đề theo yêu cầu */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">
                  Nhân viên
                </th>
                {/* Cột trạng thái - căn trái tiêu đề theo yêu cầu */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">
                  Trạng thái
                </th>
                {/* Cột giá - căn trái tiêu đề theo yêu cầu */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">
                  Giá
                </th>
                {/* Cột thao tác - căn trái tiêu đề theo yêu cầu */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  {/* Cột 1: Mã đơn - hiển thị compact */}
                  <td className="px-2 py-3 w-24">
                    <div className="text-xs font-medium text-gray-900 truncate" title={booking.bookingCode}>
                      {booking.bookingCode}
                    </div>
                  </td>
                  
                  {/* Cột 2: Khách hàng & Dịch vụ - thông tin cô đọng với chiều rộng cố định */}
                  <td className="px-2 py-3 w-64">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate" title={booking.userName}>
                        {booking.userName}
                      </div>
                      <div className="text-xs text-gray-500 truncate" title={booking.userPhone}>
                        {booking.userPhone}
                      </div>
                      <div className="text-xs text-blue-600 truncate mt-1" title={booking.serviceName}>
                        {booking.serviceName}
                      </div>
                    </div>
                  </td>
                  
                  {/* Cột 3: Thời gian - hiển thị compact với chiều rộng tăng */}
                  <td className="px-2 py-3 w-32">
                    <div>
                      <div className="text-xs font-medium text-gray-900">
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
                  
                  {/* Cột 4: Nhân viên - thông tin nhân viên gọn gàng */}
                  <td className="px-2 py-3 w-32">
                    <div>
                      {/* Ưu tiên hiển thị assignedStaff (nhiều nhân viên), sau đó mới đến staff_id */}
                      {booking.assignedStaff && booking.assignedStaff.length > 0 ? (
                        <div>
                          {booking.assignedStaff.length === 1 ? (
                            <div className="text-xs text-gray-900 truncate" title={booking.assignedStaff[0].staffName}>
                              {booking.assignedStaff[0].staffName}
                            </div>
                          ) : (
                            <StaffTooltip staffList={booking.assignedStaff}>
                              <div className="text-xs text-gray-900 cursor-pointer flex items-center hover:text-blue-600">
                                <span>{booking.assignedStaff.length} nhân viên</span>
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </StaffTooltip>
                          )}
                        </div>
                      ) : booking.staffId && booking.staffName ? (
                        <div>
                          <div className="text-xs text-gray-900 truncate" title={booking.staffName}>
                            {booking.staffName}
                          </div>
                        </div>
                      ) : booking.staffId ? (
                        <div>
                          <div className="text-xs text-gray-500 truncate">
                            ID: {booking.staffId}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                          Chưa phân công
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Cột 5: Trạng thái - hiển thị compact các badge trạng thái */}
                  <td className="px-2 py-3 w-28">
                    <div className="space-y-1">
                      {renderBookingStatus(booking.status)}
                      {renderPaymentStatus(booking.paymentStatus)}
                    </div>
                  </td>
                  
                  {/* Cột 6: Giá - hiển thị compact */}
                  <td className="px-2 py-3 w-20">
                    <div className="text-xs font-semibold text-green-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(booking.totalPrice)}
                    </div>
                  </td>
                  
                  {/* Cột 7: Thao tác - các nút bấm hình chữ nhật nhỏ gọn dễ thao tác */}
                  <td className="px-2 py-3 w-36">
                    <div className="flex flex-wrap gap-1">
                      {/* === NÚT XEM CHI TIẾT - nút hình chữ nhật compact === */}
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailsModal(true);
                        }}
                        className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium flex items-center gap-1 transition-colors min-w-fit"
                        title="Xem chi tiết đơn hàng"
                      >
                        <EyeIcon className="h-3 w-3" />
                        <span className="hidden xl:inline">Chi tiết</span>
                      </button>
                      
                      {/* === NÚT PHÂN CÔNG NHÂN VIÊN - nút hình chữ nhật compact === */}
                      {canAssignStaff(booking) && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            // Khởi tạo danh sách nhân viên đã được phân công
                            if (booking.assignedStaff && booking.assignedStaff.length > 0) {
                              setSelectedStaffIds(booking.assignedStaff.map(staff => staff.staffId));
                            } else if (booking.staffId) {
                              setSelectedStaffIds([booking.staffId]);
                            } else {
                              setSelectedStaffIds([]);
                            }
                            setShowAssignModal(true);
                          }}
                          className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium flex items-center gap-1 transition-colors min-w-fit"
                          title="Phân công nhân viên"
                        >
                          <UserPlusIcon className="h-3 w-3" />
                          <span className="hidden xl:inline">{(booking.staffId || (booking.assignedStaff && booking.assignedStaff.length > 0)) ? 'Đổi NV' : 'Phân công'}</span>
                        </button>
                      )}

                      {/* === NÚT CẬP NHẬT TRẠNG THÁI - nút hình chữ nhật compact === */}
                      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowStatusModal(true);
                          }}
                          className="px-2 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded text-xs font-medium flex items-center gap-1 transition-colors min-w-fit"
                          title="Cập nhật trạng thái"
                        >
                          <PencilIcon className="h-3 w-3" />
                          <span className="hidden xl:inline">Trạng thái</span>
                        </button>
                      )}

                      {/* === NÚT ĐÁNH DẤU ĐÃ THANH TOÁN - nút hình chữ nhật compact với thiết kế đẹp === */}
                      {canMarkAsPaid(booking) && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(booking.id, 'paid')}
                          data-booking-id={booking.id}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-xs font-medium flex items-center gap-1 transition-all duration-200 hover:shadow-sm border border-emerald-200 min-w-fit"
                          title="Đánh dấu đã thanh toán"
                        >
                          <BanknotesIcon className="h-3 w-3" />
                          <span className="hidden xl:inline">Đã TT</span>
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
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
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
                            // Khởi tạo danh sách nhân viên đã được phân công
                            if (booking.assignedStaff && booking.assignedStaff.length > 0) {
                              setSelectedStaffIds(booking.assignedStaff.map(staff => staff.staffId));
                            } else if (booking.staffId) {
                              setSelectedStaffIds([booking.staffId]);
                            } else {
                              setSelectedStaffIds([]);
                            }
                            setShowAssignModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 px-2 py-1 hover:bg-green-50 rounded text-xs flex items-center"
                          title={(booking.staffId || (booking.assignedStaff && booking.assignedStaff.length > 0)) ? 'Đổi nhân viên' : 'Phân công nhân viên'}
                        >
                          <UserPlusIcon className="h-4 w-4 mr-1" />
                          {(booking.staffId || (booking.assignedStaff && booking.assignedStaff.length > 0)) ? 'Đổi NV' : 'Phân công'}
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
                          data-booking-id={booking.id}
                          className="text-emerald-600 hover:text-emerald-900 px-2 py-1 hover:bg-emerald-50 rounded text-xs flex items-center transition-all duration-200 border border-emerald-200 hover:border-emerald-300"
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
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
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
                          // Khởi tạo danh sách nhân viên đã được phân công
                          if (booking.assignedStaff && booking.assignedStaff.length > 0) {
                            setSelectedStaffIds(booking.assignedStaff.map(staff => staff.staffId));
                          } else if (booking.staffId) {
                            setSelectedStaffIds([booking.staffId]);
                          } else {
                            setSelectedStaffIds([]);
                          }
                          setShowAssignModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                        title={(booking.staffId || (booking.assignedStaff && booking.assignedStaff.length > 0)) ? 'Đổi nhân viên' : 'Phân công nhân viên'}
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
                        data-booking-id={booking.id}
                        className="text-emerald-600 hover:text-emerald-900 p-2 hover:bg-emerald-50 rounded transition-all duration-200 border border-emerald-200 hover:border-emerald-300"
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

        {filteredBookings.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {bookings.length === 0 ? (
                <>
                  <div className="text-lg font-medium mb-2">Không có đơn đặt lịch nào</div>
                  <div>Chưa có đơn đặt lịch nào trong hệ thống</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium mb-2">Không tìm thấy đơn đặt lịch nào</div>
                  <div>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination - Sticky Footer */}
      <div className="sticky bottom-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalBookings}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modal Phân công nhân viên */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {selectedBooking.staffId || (selectedBooking.assignedStaff && selectedBooking.assignedStaff.length > 0) 
                ? `Đổi nhân viên cho đơn ${selectedBooking.bookingCode}`
                : `Phân công nhân viên cho đơn ${selectedBooking.bookingCode}`
              }
            </h3>
            
            {/* Hiển thị nhân viên hiện tại khi đang đổi */}
            {(selectedBooking.staffId || (selectedBooking.assignedStaff && selectedBooking.assignedStaff.length > 0)) && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="text-sm font-medium text-gray-700 mb-2">Nhân viên hiện tại:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.assignedStaff && selectedBooking.assignedStaff.length > 0 ? (
                    selectedBooking.assignedStaff.map((staff, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {staff.staffName}
                      </span>
                    ))
                  ) : selectedBooking.staffName && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {selectedBooking.staffName}
                    </span>
                  )}
                </div>
              </div>
            )}
            
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
                        {s.completedBookings}/{s.totalBookings} đơn hoàn thành
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
                placeholder={
                  (selectedBooking?.staffId || (selectedBooking?.assignedStaff && selectedBooking.assignedStaff.length > 0)) 
                    ? "Ghi chú thay đổi nhân viên (tùy chọn). Ví dụ: Đổi nhân viên do yêu cầu khách hàng..."
                    : "Ví dụ: Cần 2 nhân viên cho căn hộ lớn, ưu tiên nhân viên có kinh nghiệm..."
                }
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
                {(selectedBooking?.staffId || (selectedBooking?.assignedStaff && selectedBooking.assignedStaff.length > 0)) 
                  ? `Đổi thành ${selectedStaffIds.length > 0 ? `${selectedStaffIds.length} nhân viên` : ''}`
                  : `Phân công ${selectedStaffIds.length > 0 ? `${selectedStaffIds.length} nhân viên` : ''}`
                }
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

      {/* === MODAL CHI TIẾT ĐƠN HÀNG === */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Chi tiết đơn hàng #{selectedBooking.bookingCode}</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedBooking(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Đóng modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* === THÔNG TIN ĐƠN HÀNG === */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Thông tin đơn hàng</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã đơn:</span>
                        <span className="font-medium">{selectedBooking.bookingCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dịch vụ:</span>
                        <span className="font-medium text-blue-600">{selectedBooking.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">{selectedBooking.bookingDate} - {selectedBooking.bookingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Địa chỉ:</span>
                        <span className="font-medium">{selectedBooking.customerAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá tiền:</span>
                        <span className="font-bold text-green-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(selectedBooking.totalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Trạng thái:</span>
                        {renderBookingStatus(selectedBooking.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Thanh toán:</span>
                        {renderPaymentStatus(selectedBooking.paymentStatus)}
                      </div>
                    </div>
                  </div>

                  {/* === GHI CHÚ === */}
                  {selectedBooking.notes && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Ghi chú</h4>
                      <p className="text-gray-700">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>

                {/* === THÔNG TIN KHÁCH HÀNG VÀ NHÂN VIÊN === */}
                <div className="space-y-4">
                  {/* Thông tin khách hàng */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Thông tin khách hàng</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tên:</span>
                        <span className="font-medium">{selectedBooking.userName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Điện thoại:</span>
                        <span className="font-medium">{selectedBooking.userPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedBooking.userEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin nhân viên */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Thông tin nhân viên</h4>
                    {selectedBooking.assignedStaff && selectedBooking.assignedStaff.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số nhân viên:</span>
                          <span className="font-medium">{selectedBooking.assignedStaff.length} nhân viên</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block mb-2">Danh sách nhân viên:</span>
                          <div className="space-y-1">
                            {selectedBooking.assignedStaff.map((staff, index) => (
                              <div key={index} className="flex justify-between text-sm bg-white p-2 rounded">
                                <span>{staff.staffName}</span>
                                <span className="text-gray-500">{staff.staffEmail || `ID: ${staff.staffId}`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : selectedBooking.staffId && selectedBooking.staffName ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nhân viên:</span>
                          <span className="font-medium">{selectedBooking.staffName}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-gray-500 mb-2">Chưa có nhân viên được phân công</div>
                        <button
                          onClick={() => {
                            setShowDetailsModal(false);
                            // Khởi tạo danh sách nhân viên đã được phân công
                            if (selectedBooking.assignedStaff && selectedBooking.assignedStaff.length > 0) {
                              setSelectedStaffIds(selectedBooking.assignedStaff.map(staff => staff.staffId));
                            } else if (selectedBooking.staffId) {
                              setSelectedStaffIds([selectedBooking.staffId]);
                            } else {
                              setSelectedStaffIds([]);
                            }
                            setShowAssignModal(true);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Phân công nhân viên
                        </button>
                      </div>
                    )}
                  </div>

                  {/* === CÁC HÀNH ĐỘNG NHANH === */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Hành động</h4>
                    <div className="flex flex-wrap gap-2">
                      {canAssignStaff(selectedBooking) && (
                        <button
                          onClick={() => {
                            setShowDetailsModal(false);
                            // Khởi tạo danh sách nhân viên đã được phân công
                            if (selectedBooking.assignedStaff && selectedBooking.assignedStaff.length > 0) {
                              setSelectedStaffIds(selectedBooking.assignedStaff.map(staff => staff.staffId));
                            } else if (selectedBooking.staffId) {
                              setSelectedStaffIds([selectedBooking.staffId]);
                            } else {
                              setSelectedStaffIds([]);
                            }
                            setShowAssignModal(true);
                          }}
                          className="px-3 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium flex items-center gap-1"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                          {selectedBooking.staffId || (selectedBooking.assignedStaff && selectedBooking.assignedStaff.length > 0) ? 'Đổi nhân viên' : 'Phân công nhân viên'}
                        </button>
                      )}
                      
                      {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setShowDetailsModal(false);
                            setShowStatusModal(true);
                          }}
                          className="px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded text-sm font-medium flex items-center gap-1"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Cập nhật trạng thái
                        </button>
                      )}

                      {canMarkAsPaid(selectedBooking) && (
                        <button
                          onClick={() => {
                            handleUpdatePaymentStatus(selectedBooking.id, 'paid');
                            setShowDetailsModal(false);
                          }}
                          data-booking-id={selectedBooking.id}
                          className="px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-sm font-medium flex items-center gap-1 transition-all duration-200 hover:shadow-sm border border-emerald-200"
                        >
                          <BanknotesIcon className="h-4 w-4" />
                          Đánh dấu đã thanh toán
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBookings;
