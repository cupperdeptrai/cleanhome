import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { AdminService, AdminStaff } from '../../services/admin.service';
import { formatDate } from '../../utils/dateTime';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Component PaginationControls tái sử dụng từ Bookings.tsx
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
            <span className="font-medium">{totalItems}</span> nhân viên
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
 * Trang Quản lý Nhân viên - Phiên bản mới đồng bộ với schema
 */
const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30); // Mỗi trang hiển thị 30 staff (giống bookings)
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<AdminStaff | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AdminStaff | null>(null);
  // Form data cho modal thêm/sửa nhân viên
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active' as 'active' | 'inactive' | 'locked' | 'pending'
  });

  // Load dữ liệu nhân viên
  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getStaff();
      setStaffList(data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu nhân viên:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách nhân viên
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /**
   * Tính toán phân trang
   */
  const totalItems = filteredStaff.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStaffList = filteredStaff.slice(startIndex, endIndex);

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll về đầu bảng khi chuyển trang
    const tableElement = document.getElementById('staff-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /**
   * Reset về trang 1 khi filter thay đổi
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Mở modal thêm nhân viên
  const handleAddStaff = () => {
    setCurrentStaff(null);    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa nhân viên
  const handleEditStaff = (staff: AdminStaff) => {
    setCurrentStaff(staff);    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      password: '', // Không hiển thị mật khẩu hiện tại
      status: staff.status
    });
    setIsModalOpen(true);
  };
  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên nhân viên');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('Vui lòng nhập email');
      return;
    }
    
    if (!formData.phone.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }
    
    try {      if (currentStaff) {
        // Cập nhật nhân viên
        await AdminService.updateStaff(currentStaff.id, formData);
        alert('Cập nhật nhân viên thành công!');
      } else {        // Thêm nhân viên mới
        console.log('🆕 Đang tạo nhân viên mới với dữ liệu:', formData);
        const result = await AdminService.createStaff(formData);
        
        // Hiển thị thông báo thành công
        if (result.isGeneratedPassword && result.password) {
          alert(`Thêm nhân viên mới thành công!\n\nThông tin đăng nhập:\nEmail: ${formData.email}\nMật khẩu tự động: ${result.password}\n\nLưu ý: Vui lòng gửi thông tin này cho nhân viên và yêu cầu đổi mật khẩu khi đăng nhập lần đầu.`);
        } else {
          alert(`Thêm nhân viên mới thành công!\n\nEmail: ${formData.email}\nMật khẩu: Đã được thiết lập theo yêu cầu`);
        }
        
        console.log('✅ Tạo nhân viên thành công:', result);
      }
      setIsModalOpen(false);
      loadStaffData();
    } catch (error) {
      console.error('Lỗi khi lưu nhân viên:', error);
      alert('Có lỗi xảy ra khi lưu thông tin nhân viên');
    }
  };
  // Xóa nhân viên
  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhân viên "${staffName}"?\n\nLưu ý: Hành động này sẽ:\n- Xóa vĩnh viễn thông tin nhân viên\n- Cập nhật trạng thái các booking liên quan\n- Không thể hoàn tác`)) {
      try {
        await AdminService.deleteStaff(staffId);
        alert('Xóa nhân viên thành công!');
        loadStaffData();
      } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        alert('Có lỗi xảy ra khi xóa nhân viên');
      }
    }
  };  // Cập nhật trạng thái nhân viên
  const handleUpdateStatus = async (staffId: string, newStatus: AdminStaff['status'], staffName?: string) => {
    // Xác nhận trước khi thay đổi trạng thái
    const statusMessages = {
      'active': 'kích hoạt',
      'inactive': 'tạm nghỉ',
      'locked': 'khóa',
      'pending': 'đang chờ'
    };
    
    const actionText = statusMessages[newStatus] || newStatus;
    const confirmMessage = `Bạn có chắc muốn ${actionText} nhân viên "${staffName || 'này'}"?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      const updatedStaff = await AdminService.updateStaffStatus(staffId, newStatus);
      
      // Hiển thị thông báo thành công
      alert(`Đã ${actionText} nhân viên "${updatedStaff.name}" thành công!`);
      
      // Reload dữ liệu để cập nhật UI
      loadStaffData();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái nhân viên:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái nhân viên. Vui lòng thử lại!');
    }
  };

  // Xem chi tiết nhân viên
  const handleViewDetails = (staff: AdminStaff) => {
    setSelectedStaff(staff);
    setIsDetailModalOpen(true);
  };

  // Get status badge style
  const getStatusBadge = (status: AdminStaff['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'locked':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: AdminStaff['status']) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Tạm nghỉ';
      case 'locked':
        return 'Bị khóa';
      case 'pending':
        return 'Chờ duyệt';
      default:
        return status;
    }
  };

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
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhân viên</h1>
            <p className="mt-2 text-sm text-gray-700">
              Quản lý danh sách nhân viên và trạng thái làm việc
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleAddStaff}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm nhân viên
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Lọc theo trạng thái"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm nghỉ</option>
                <option value="locked">Bị khóa</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>

            <div className="text-sm text-gray-500 flex items-center">
              Tổng cộng: {totalItems} nhân viên
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table id="staff-table" className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Cột nhân viên - căn trái tiêu đề theo yêu cầu */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-1/4">
                    Nhân viên
                  </th>
                  {/* Cột liên hệ - căn trái tiêu đề theo yêu cầu */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-1/4">
                    Liên hệ
                  </th>
                  {/* Cột trạng thái - căn trái tiêu đề theo yêu cầu */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-1/6">
                    Trạng thái
                  </th>
                  {/* Cột thống kê - căn trái tiêu đề theo yêu cầu */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-1/6">
                    Thống kê
                  </th>
                  {/* Cột ngày vào làm - căn trái tiêu đề theo yêu cầu */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-1/6">
                    Ngày vào làm
                  </th>
                  {/* Cột thao tác - căn trái tiêu đề theo yêu cầu */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-auto">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStaffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {staff.avatar ? (
                            <img className="h-10 w-10 rounded-full" src={staff.avatar} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                          <div className="text-sm text-gray-500">ID: {staff.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {staff.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {staff.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(staff.status)}`}>
                        {getStatusText(staff.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>Tổng: {staff.totalBookings} đơn</div>
                      <div>Hoàn thành: {staff.completedBookings}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {formatDate(staff.hireDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">                        <button
                          onClick={() => handleViewDetails(staff)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                          aria-label="Xem chi tiết nhân viên"
                        >
                          <UserIcon className="h-4 w-4" />
                        </button>                        <button
                          onClick={() => handleEditStaff(staff)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Chỉnh sửa"
                          aria-label="Chỉnh sửa nhân viên"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(
                            staff.id, 
                            staff.status === 'active' ? 'inactive' : 'active',
                            staff.name
                          )}
                          className={`${
                            staff.status === 'active' 
                              ? 'text-orange-600 hover:text-orange-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={staff.status === 'active' ? 'Tạm nghỉ' : 'Kích hoạt'}
                          aria-label={`${staff.status === 'active' ? 'Tạm nghỉ' : 'Kích hoạt'} nhân viên`}
                        >
                          {staff.status === 'active' ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button><button
                          onClick={() => handleDeleteStaff(staff.id, staff.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                          aria-label="Xóa nhân viên"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có nhân viên</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Không tìm thấy nhân viên phù hợp với bộ lọc.'
                : 'Bắt đầu bằng cách thêm nhân viên đầu tiên.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">              <div>
                <label htmlFor="staff-name" className="block text-sm font-medium text-gray-700">
                  Tên nhân viên *
                </label>
                <input
                  id="staff-name"
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nhập tên đầy đủ"
                />
              </div>              <div>
                <label htmlFor="staff-email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="staff-email"
                  type="email"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="example@cleanhome.com"
                />
              </div>

              <div>
                <label htmlFor="staff-password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu {!currentStaff && '*'}
                </label>
                <input
                  id="staff-password"
                  type="password"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={currentStaff ? "Để trống nếu không muốn đổi" : "Để trống để tạo tự động"}
                />
                {!currentStaff && (
                  <p className="mt-1 text-sm text-gray-500">
                    Nếu để trống, hệ thống sẽ tạo mật khẩu tự động và hiển thị cho bạn
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="staff-phone" className="block text-sm font-medium text-gray-700">
                  Số điện thoại *
                </label>
                <input
                  id="staff-phone"
                  type="tel"
                  required
                  pattern="^(0|\+84)[3-9]\d{8}$"
                  title="Số điện thoại phải có định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="0xxxxxxxxx hoặc +84xxxxxxxxx"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx
                </p>
              </div>              <div>
                <label htmlFor="staff-status" className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  id="staff-status"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as AdminStaff['status']})}
                  aria-label="Trạng thái nhân viên"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm nghỉ</option>
                  <option value="locked">Bị khóa</option>
                  <option value="pending">Chờ duyệt</option>
                </select>
              </div>

              {!currentStaff && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="text-sm text-blue-700">
                    <strong>Lưu ý:</strong> Sau khi tạo nhân viên mới, hệ thống sẽ tự động:
                    <ul className="mt-2 ml-4 list-disc text-xs space-y-1">
                      <li>Tạo tài khoản đăng nhập với role 'staff'</li>
                      <li>Gửi email chào mừng và hướng dẫn đăng nhập</li>
                      <li>Thiết lập lịch làm việc mặc định</li>
                      <li>Cấp quyền truy cập hệ thống quản lý booking</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {currentStaff ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-900">Chi tiết nhân viên</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {selectedStaff.avatar ? (
                    <img className="h-16 w-16 rounded-full" src={selectedStaff.avatar} alt="" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{selectedStaff.name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedStaff.status)}`}>
                      {getStatusText(selectedStaff.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedStaff.email}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedStaff.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">Vào làm: {formatDate(selectedStaff.hireDate)}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedStaff.totalBookings}</div>
                    <div className="text-sm text-blue-600">Tổng đơn hàng</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedStaff.completedBookings}</div>
                    <div className="text-sm text-green-600">Đã hoàn thành</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">              <button
                onClick={() => handleUpdateStatus(
                  selectedStaff.id, 
                  selectedStaff.status === 'active' ? 'inactive' : 'active',
                  selectedStaff.name
                )}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  selectedStaff.status === 'active' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedStaff.status === 'active' ? 'Tạm nghỉ' : 'Kích hoạt'}
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditStaff(selectedStaff);
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination - Sticky Footer */}
      <div className="sticky bottom-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default StaffManagement;
