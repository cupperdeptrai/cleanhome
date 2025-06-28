import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import AdminService, { AdminUser } from '../../services/admin.service';
import { formatDateTime } from '../../utils/dateTime';

/**
 * Component quản lý người dùng cho Admin
 */
const AdminUsers: React.FC = () => {
  // State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Sort state
  const [sortField, setSortField] = useState<string>('joinedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Loading dữ liệu khi component mount
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Tải danh sách người dùng
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const usersData = await AdminService.getUsers();
      setUsers(usersData);

    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };
  /**
   * Lọc và sắp xếp danh sách người dùng
   */
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    })    .sort((a, b) => {
      let aValue: string | number | null = a[sortField as keyof AdminUser];
      let bValue: string | number | null = b[sortField as keyof AdminUser];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      // Convert to string for comparison if needed
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;
      
      return sortDirection === 'desc' ? comparison * -1 : comparison;
    });

  /**
   * Xử lý sắp xếp khi click vào header cột
   */
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
   * Hiển thị role với style đẹp hơn
   */
  const renderRole = (role: string) => {
    const roleConfig = {
      customer: { label: 'Khách hàng', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      staff: { label: 'Nhân viên', className: 'bg-green-50 text-green-700 border-green-200' },
      admin: { label: 'Quản trị viên', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.customer;
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  /**
   * Hiển thị trạng thái với style đẹp hơn
   */
  const renderStatus = (status: string) => {
    const statusConfig = {
      active: { label: 'Hoạt động', className: 'bg-green-50 text-green-700 border-green-200' },
      inactive: { label: 'Không hoạt động', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      locked: { label: 'Bị khóa', className: 'bg-red-50 text-red-700 border-red-200' },
      pending: { label: 'Chờ kích hoạt', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  /**
   * Xử lý thay đổi trạng thái người dùng
   */
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'locked' : 'active';
      
      await AdminService.updateUserStatus(userId, newStatus);
      
      // Cập nhật local state
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, status: newStatus as AdminUser['status'] }
          : u
      ));
      
      alert(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'khóa'} tài khoản thành công!`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách người dùng...</p>
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
          onClick={loadUsers}
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
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <div className="text-sm text-gray-500">
          Tổng: {filteredUsers.length} người dùng
        </div>
      </div>

      {/* Bộ lọc và tìm kiếm người dùng */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Ô tìm kiếm theo tên, email, số điện thoại */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bộ lọc theo vai trò */}
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-label="Lọc theo vai trò"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="customer">Khách hàng</option>
              <option value="staff">Nhân viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          {/* Bộ lọc theo trạng thái */}
          <div className="relative">
            <UserPlusIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              aria-label="Lọc theo trạng thái"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="locked">Bị khóa</option>
              <option value="pending">Chờ kích hoạt</option>
            </select>
          </div>

          {/* Nút làm mới dữ liệu */}
          <button
            onClick={loadUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Bảng danh sách người dùng - thiết kế compact và dễ thao tác */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            {/* Header bảng người dùng với cột đã được điều chỉnh cho gọn gàng hơn */}
            <thead className="bg-gray-50">
              <tr>
                {/* Cột thông tin người dùng - căn trái tiêu đề theo yêu cầu */}
                <th 
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-80"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Thông tin người dùng
                    {sortField === 'name' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                {/* Cột vai trò - căn trái tiêu đề theo yêu cầu */}
                <th 
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-28"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center">
                    Vai trò
                    {sortField === 'role' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                {/* Cột trạng thái - căn trái tiêu đề theo yêu cầu */}
                <th 
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-24"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Trạng thái
                    {sortField === 'status' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                {/* Cột xác thực - căn trái tiêu đề theo yêu cầu */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Xác thực
                </th>
                {/* Cột tham gia - căn trái tiêu đề theo yêu cầu */}
                <th 
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-24"
                  onClick={() => handleSort('joinedAt')}
                >
                  <div className="flex items-center">
                    Tham gia
                    {sortField === 'joinedAt' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                {/* Cột đăng nhập - căn trái tiêu đề theo yêu cầu */}
                <th 
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-24 whitespace-nowrap"
                  onClick={() => handleSort('lastLoginAt')}
                >
                  <div className="flex items-center">
                    Đăng nhập
                    {sortField === 'lastLoginAt' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                {/* Cột hoạt động - căn trái tiêu đề theo yêu cầu */}
                <th 
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-20 whitespace-nowrap"
                  onClick={() => handleSort('totalBookings')}
                >
                  <div className="flex items-center">
                    Hoạt động
                    {sortField === 'totalBookings' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                {/* Cột thao tác - căn trái tiêu đề theo yêu cầu */}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {/* Cột thông tin người dùng - hiển thị compact với avatar và thông tin cơ bản với chiều rộng cố định */}
                  <td className="px-3 py-3 text-sm text-gray-500 w-80">
                    <div className="flex items-center">
                      {/* Avatar người dùng */}
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        {user.avatar ? (
                          <img className="h-8 w-8 rounded-full" src={user.avatar} alt="" />
                        ) : (
                          <span className="text-xs font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Thông tin cơ bản */}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                      </div>
                    </div>
                  </td>
                  
                  {/* Cột vai trò - hiển thị badge compact với chiều rộng tăng */}
                  <td className="px-2 py-3 w-28">
                    {renderRole(user.role)}
                  </td>
                  
                  {/* Cột trạng thái - hiển thị badge compact */}
                  <td className="px-2 py-3 w-24">
                    {renderStatus(user.status)}
                  </td>
                  
                  {/* Cột xác thực - thông tin email và SĐT compact */}
                  <td className="px-2 py-3 text-xs text-gray-500 w-20">
                    <div className="space-y-1">
                      {user.emailVerifiedAt ? (
                        <div className="text-green-600">✓ Email</div>
                      ) : (
                        <div className="text-gray-400">✗ Email</div>
                      )}
                      {user.phone ? (
                        user.phoneVerifiedAt ? (
                          <div className="text-green-600">✓ SĐT</div>
                        ) : (
                          <div className="text-yellow-600">⚠ SĐT</div>
                        )
                      ) : (
                        <div className="text-gray-400">✗ SĐT</div>
                      )}
                    </div>
                  </td>
                  
                  {/* Cột ngày tham gia - chỉ hiển thị ngày compact */}
                  <td className="px-2 py-3 text-xs text-gray-500 w-24">
                    {formatDateTime(user.joinedAt).split(' ')[0]}
                  </td>
                  
                  {/* Cột lần đăng nhập cuối - chỉ hiển thị ngày compact */}
                  <td className="px-2 py-3 text-xs text-gray-500 w-24">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt).split(' ')[0] : 'Chưa đăng nhập'}
                  </td>
                  
                  {/* Cột hoạt động - thống kê đơn hàng và chi tiêu compact */}
                  <td className="px-2 py-3 text-xs text-gray-500 w-20">
                    <div>
                      <div className="font-medium">{user.totalBookings} đơn</div>
                      <div className="text-green-600">{formatPrice(user.totalSpent)}</div>
                    </div>
                  </td>
                  
                  {/* Cột thao tác - các nút bấm hình chữ nhật nhỏ gọn dễ thao tác */}
                  <td className="px-2 py-3 w-28">
                    <div className="flex flex-wrap gap-1">
                      {/* === NÚT XEM CHI TIẾT NGƯỜI DÙNG - nút hình chữ nhật compact === */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailsModal(true);
                        }}
                        className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium flex items-center gap-1 transition-colors min-w-fit"
                        title="Xem chi tiết thông tin người dùng"
                      >
                        <EyeIcon className="h-3 w-3" />
                        <span className="hidden xl:inline">Chi tiết</span>
                      </button>

                      {/* === NÚT KHÓA/MỞ KHÓA TÀI KHOẢN - nút hình chữ nhật compact === */}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors min-w-fit ${
                            user.status === 'active' 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={user.status === 'active' ? 'Khóa tài khoản người dùng' : 'Kích hoạt tài khoản người dùng'}
                        >
                          {user.status === 'active' ? (
                            <>
                              <LockClosedIcon className="h-3 w-3" />
                              <span className="hidden xl:inline">Khóa</span>
                            </>
                          ) : (
                            <>
                              <LockOpenIcon className="h-3 w-3" />
                              <span className="hidden xl:inline">Mở</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Không tìm thấy người dùng */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <div className="text-lg font-medium mb-2">Không tìm thấy người dùng nào</div>
              <div>Thử điều chỉnh bộ lọc để xem thêm kết quả</div>
            </div>
          </div>
        )}
      </div>

      {/* Modal chi tiết thông tin người dùng */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Chi tiết người dùng</h3>
                {/* Nút đóng modal */}
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Đóng modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Phần avatar và thông tin cơ bản */}
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                    {selectedUser.avatar ? (
                      <img className="h-20 w-20 rounded-full" src={selectedUser.avatar} alt="" />
                    ) : (
                      <span className="text-2xl font-medium text-gray-700">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">{selectedUser.name}</h4>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex space-x-2 mt-2">
                      {renderRole(selectedUser.role)}
                      {renderStatus(selectedUser.status)}
                    </div>
                  </div>
                </div>

                {/* Phần thông tin liên hệ */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <p className="text-gray-900">{selectedUser.phone || 'Chưa cập nhật'}</p>
                    {selectedUser.phoneVerifiedAt && (
                      <p className="text-xs text-green-600">✓ Đã xác thực {formatDateTime(selectedUser.phoneVerifiedAt)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                    {selectedUser.emailVerifiedAt && (
                      <p className="text-xs text-green-600">✓ Đã xác thực {formatDateTime(selectedUser.emailVerifiedAt)}</p>
                    )}
                  </div>
                </div>

                {/* Phần địa chỉ và giới thiệu */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <p className="text-gray-900">{selectedUser.address || 'Chưa cập nhật'}</p>
                  </div>
                  {selectedUser.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu</label>
                      <p className="text-gray-900">{selectedUser.bio}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <p className="text-gray-900 font-mono text-xs">{selectedUser.id}</p>
                  </div>
                </div>

                {/* Phần thống kê hoạt động */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedUser.totalBookings}</div>
                    <div className="text-sm text-gray-600">Đơn đặt lịch</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(selectedUser.totalSpent).replace('₫', '')}₫
                    </div>
                    <div className="text-sm text-gray-600">Tổng chi tiêu</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedUser.loginCount}</div>
                    <div className="text-sm text-gray-600">Lần đăng nhập</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${selectedUser.failedLoginAttempts > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {selectedUser.failedLoginAttempts}
                    </div>
                    <div className="text-sm text-gray-600">Lần thất bại</div>
                  </div>
                </div>

                {/* Cảnh báo tài khoản bị khóa */}
                {selectedUser.lockedUntil && new Date(selectedUser.lockedUntil) > new Date() && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <LockClosedIcon className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <div className="text-red-800 font-medium">Tài khoản bị khóa</div>
                        <div className="text-red-600 text-sm">Khóa đến: {formatDateTime(selectedUser.lockedUntil)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phần thông tin thời gian */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tham gia</label>
                    <p className="text-gray-900">{formatDateTime(selectedUser.joinedAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lần đăng nhập cuối</label>
                    <p className="text-gray-900">
                      {selectedUser.lastLoginAt ? formatDateTime(selectedUser.lastLoginAt) : 'Chưa từng đăng nhập'}
                    </p>
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

export default AdminUsers;
