import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Tổng quan', icon: '📊' },
    { path: '/admin/bookings', label: 'Đơn đặt lịch', icon: '📅' },
    { path: '/admin/services', label: 'Dịch vụ', icon: '🧹' },
    { path: '/admin/staff', label: 'Nhân viên', icon: '👥' },
    { path: '/admin/users', label: 'Khách hàng', icon: '👤' },
    { path: '/admin/promotions', label: 'Khuyến mãi', icon: '🏷️' },
    { path: '/admin/reports', label: 'Báo cáo', icon: '📈' },
    { path: '/admin/settings', label: 'Cài đặt', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
      </div>

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 text-white transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700">
          <Link to="/admin" className="text-xl font-bold">CleanHome Admin</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  location.pathname === item.path
                    ? 'bg-blue-900 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-4 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 focus:outline-none"
            >
              <span className="text-2xl">☰</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <div className="relative group">
                <button className="flex items-center  space-x-2 focus:outline-none">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        // Nếu load ảnh thất bại, hiển thị icon mặc định
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium ${user?.avatar ? 'hidden' : 'flex'}`}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link to="/" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Trang chủ</Link>
                  <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Hồ sơ</Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
