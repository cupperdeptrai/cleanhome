import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">CleanHome</Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-blue-200">Trang chủ</Link>
            <Link to="/services" className="hover:text-blue-200">Dịch vụ</Link>
            <Link to="/booking" className="hover:text-blue-200">Đặt lịch</Link>
            {isAuthenticated && (
              <Link to="/bookings" className="hover:text-blue-200">Lịch đã đặt</Link>
            )}
            <Link to="/support" className="hover:text-blue-200">Hỗ trợ</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center m-3 space-x-2 focus:outline-none">
                    <span className="hidden md:inline">{user?.name}</span>
                    <img 
                      src={user?.avatar || 'https://via.placeholder.com/40'} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full"
                    />
                  </button>
                  <div className="absolute right-0 top-11 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Hồ sơ</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Quản trị</Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 rounded hover:bg-blue-700">Đăng nhập</Link>
                <Link to="/register" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
