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
   * Hiển thị role
   */
  const renderRole = (role: string) => {
    const roleConfig = {
      customer: { label: 'Khách hàng', className: 'bg-blue-100 text-blue-800' },
      staff: { label: 'Nhân viên', className: 'bg-green-100 text-green-800' },
      admin: { label: 'Quản trị viên', className: 'bg-purple-100 text-purple-800' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.customer;
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  /**
   * Hiển thị trạng thái
   */
  const renderStatus = (status: string) => {
    const statusConfig = {
      active: { label: 'Hoạt động', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Không hoạt động', className: 'bg-gray-100 text-gray-800' },
      locked: { label: 'Bị khóa', className: 'bg-red-100 text-red-800' },
      pending: { label: 'Chờ kích hoạt', className: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
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

          {/* Role Filter */}
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

          {/* Status Filter */}
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

          {/* Refresh Button */}
          <button
            onClick={loadUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">            <thead className="bg-gray-50">              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xác thực
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('joinedAt')}
                >
                  <div className="flex items-center">
                    Ngày tham gia
                    {sortField === 'joinedAt' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastLoginAt')}
                >
                  <div className="flex items-center">
                    Lần đăng nhập cuối
                    {sortField === 'lastLoginAt' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {user.avatar ? (
                          <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                        {user.emailVerifiedAt && (
                          <div className="text-xs text-green-600">✓ Email đã xác thực</div>
                        )}
                        {user.phoneVerifiedAt && (
                          <div className="text-xs text-green-600">✓ SĐT đã xác thực</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderRole(user.role)}
                  </td>                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatus(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      {user.emailVerifiedAt ? (
                        <div className="flex items-center text-green-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs">Email</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs">Email</span>
                        </div>
                      )}
                      {user.phone ? (
                        user.phoneVerifiedAt ? (
                          <div className="flex items-center text-green-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs">SĐT</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs">SĐT</span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs">SĐT</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(user.joinedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Chưa từng đăng nhập'}
                  </td>                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{user.totalBookings} đơn đặt lịch</div>
                      <div className="text-green-600 font-medium">{formatPrice(user.totalSpent)}</div>
                      <div className="text-xs text-gray-500">{user.loginCount} lần đăng nhập</div>
                      {user.failedLoginAttempts > 0 && (
                        <div className="text-xs text-red-500">{user.failedLoginAttempts} lần thất bại</div>
                      )}
                      {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                        <div className="text-xs text-red-600">Khóa đến {formatDateTime(user.lockedUntil)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">                      {/* View Details */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                        aria-label="Xem chi tiết người dùng"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>

                      {/* Toggle Status */}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          className={`${
                            user.status === 'active' 
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                          aria-label={user.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                        >
                          {user.status === 'active' ? (
                            <LockClosedIcon className="h-4 w-4" />
                          ) : (
                            <LockOpenIcon className="h-4 w-4" />
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <div className="text-lg font-medium mb-2">Không tìm thấy người dùng nào</div>
              <div>Thử điều chỉnh bộ lọc để xem thêm kết quả</div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Chi tiết người dùng */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Chi tiết người dùng</h3>                <button
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
                {/* Avatar và thông tin cơ bản */}
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
                </div>                {/* Thông tin liên hệ */}
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

                {/* Địa chỉ và Bio */}
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
                </div>                {/* Thống kê hoạt động */}
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

                {/* Thông tin thời gian */}
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
