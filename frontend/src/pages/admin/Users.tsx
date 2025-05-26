import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

/**
 * Interface định nghĩa cấu trúc dữ liệu người dùng
 */
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
  status: 'active' | 'locked';
  createdAt: string;
}

/**
 * Component AdminUsers - Quản lý người dùng trong hệ thống
 * @returns Giao diện quản lý người dùng với các chức năng CRUD
 */
const AdminUsers: React.FC = () => {
  // State quản lý danh sách người dùng
  const [users, setUsers] = useState<User[]>([]);
  // State quản lý người dùng đang được chỉnh sửa
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // State quản lý trạng thái hiển thị modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State quản lý bộ lọc
  const [filter, setFilter] = useState({
    role: 'all',
    status: 'all',
    search: '',
  });

  // Dữ liệu mẫu cho người dùng
  useEffect(() => {
    // Trong thực tế, đây sẽ là API call
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        role: 'customer',
        status: 'active',
        createdAt: '2023-01-15',
      },
      {
        id: 2,
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0912345678',
        role: 'customer',
        status: 'active',
        createdAt: '2023-02-20',
      },
      {
        id: 3,
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0923456789',
        role: 'staff',
        status: 'active',
        createdAt: '2023-03-10',
      },
      {
        id: 4,
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0934567890',
        role: 'staff',
        status: 'locked',
        createdAt: '2023-04-05',
      },
      {
        id: 5,
        name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        phone: '0945678901',
        role: 'admin',
        status: 'active',
        createdAt: '2023-05-15',
      },
    ];
    setUsers(mockUsers);
  }, []);

  /**
   * Lọc danh sách người dùng theo các tiêu chí
   */
  const filteredUsers = users.filter((user) => {
    const roleMatch = filter.role === 'all' || user.role === filter.role;
    const statusMatch = filter.status === 'all' || user.status === filter.status;
    const searchMatch =
      user.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.search.toLowerCase()) ||
      user.phone.includes(filter.search);
    return roleMatch && statusMatch && searchMatch;
  });

  /**
   * Mở modal để thêm người dùng mới
   */
  const handleAddUser = () => {
    setEditingUser({
      id: 0,
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  /**
   * Mở modal để chỉnh sửa thông tin người dùng
   */
  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  /**
   * Xử lý lưu thông tin người dùng (thêm mới hoặc cập nhật)
   */
  const handleSaveUser = () => {
    if (!editingUser) return;

    if (editingUser.id === 0) {
      // Thêm mới người dùng
      const newUser = {
        ...editingUser,
        id: users.length + 1,
      };
      setUsers([...users, newUser]);
    } else {
      // Cập nhật thông tin người dùng
      setUsers(users.map((user) => (user.id === editingUser.id ? editingUser : user)));
    }

    setIsModalOpen(false);
    setEditingUser(null);
  };

  /**
   * Xử lý xóa người dùng
   */
  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  /**
   * Xử lý khóa/mở khóa tài khoản người dùng
   */
  const handleToggleUserStatus = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'locked' : 'active' }
          : user
      )
    );
  };

  /**
   * Xử lý thay đổi thông tin người dùng trong form
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Thêm người dùng
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Vai trò
          </label>
          <select
            id="role-filter"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="customer">Khách hàng</option>
            <option value="staff">Nhân viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            id="status-filter"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>
        </div>
        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm
          </label>
          <input
            id="search-filter"
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Tìm theo tên, email, số điện thoại"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
        </div>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'staff'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.role === 'admin'
                      ? 'Quản trị viên'
                      : user.role === 'staff'
                      ? 'Nhân viên'
                      : 'Khách hàng'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleToggleUserStatus(user.id)}
                    className={`${
                      user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    } mr-3`}
                  >
                    {user.status === 'active' ? (
                      <LockClosedIcon className="h-5 w-5" />
                    ) : (
                      <LockOpenIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa người dùng */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingUser.id === 0 ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editingUser.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editingUser.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={editingUser.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  id="role"
                  name="role"
                  value={editingUser.role}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="customer">Khách hàng</option>
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={editingUser.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="active">Hoạt động</option>
                  <option value="locked">Đã khóa</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
