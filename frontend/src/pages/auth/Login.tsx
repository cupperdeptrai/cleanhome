import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra message từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlMessage = params.get('message');
    
    if (urlMessage === 'session_expired') {
      setMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    } else if (urlMessage === 'password_reset_success') {
      setMessage('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        // Kiểm tra redirect URL từ query params
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirect');
        
        if (redirectTo) {
          navigate(`/${redirectTo}`);
        } else {
          navigate('/');
        }
      } else {
        setError('Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi đăng nhập');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>
        
        {message && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
            Quên mật khẩu?
          </Link>
        </div>
        
        <div className="mt-6 border-t pt-6 text-center">
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* <div className="mt-4 text-center text-sm text-gray-600">
          <p>Tài khoản demo:</p>
          <p>Email: user@example.com / staff@example.com / admin@example.com</p>
          <p>Mật khẩu: password</p>
          <p className="mt-1 font-semibold">Token sẽ được lưu trong 30 ngày</p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
