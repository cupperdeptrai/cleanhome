import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../services/auth.service';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [shouldRedirect, setShouldRedirect] = useState(false); // Flag để điều khiển redirect
  
  const navigate = useNavigate();
  
  // Effect để xử lý đếm ngược và redirect khi đăng ký thành công
  // Tách riêng logic redirect để tránh state update conflicts
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (success && !shouldRedirect) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShouldRedirect(true); // Set flag thay vì navigate trực tiếp
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [success, shouldRedirect]);
  
  // Effect riêng để xử lý redirect khi shouldRedirect = true
  // Điều này tránh được lỗi state update trong render cycle
  useEffect(() => {
    if (shouldRedirect) {
      const redirectTimer = setTimeout(() => {
        navigate('/login');
      }, 100); // Delay nhỏ để đảm bảo render hoàn tất
      
      return () => clearTimeout(redirectTimer);
    }
  }, [shouldRedirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation cơ bản
    if (!name.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }
    
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    
    if (!/^0[3-9]\d{8}$/.test(phone.replace(/\s+/g, ''))) {
      setError('Số điện thoại phải có định dạng 10 chữ số bắt đầu bằng 0 (ví dụ: 0912345678)');
      return;
    }
    
    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    // Kiểm tra độ mạnh mật khẩu
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🚀 Đang gửi yêu cầu đăng ký với:', { 
        name: name.trim(), 
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: '***' 
      });
      
      // Sử dụng AuthService để đăng ký
      const response = await AuthService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined, // Chỉ gửi phone nếu có nhập
        password
      });
      
      console.log('📥 Phản hồi từ server:', response);
      
      // Kiểm tra response thành công
      const isSuccess = response.status === 'success' || 
                       response.message === 'User registered successfully' || 
                       response.user;
      
      if (isSuccess) {
        console.log('✅ Đăng ký thành công!');
        
        // Lưu thông tin xác thực vào localStorage nếu có
        if (response.token && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('💾 Đã lưu token và thông tin user vào localStorage');
        }
        
        // Reset form để tránh submit lại
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Hiển thị thông báo thành công và bắt đầu đếm ngược
        setSuccess('🎉 Bạn đã đăng ký thành công tài khoản!');
        setCountdown(3);
        setShouldRedirect(false); // Reset redirect flag
        
      } else {
        // Backend trả về lỗi trong response
        console.warn('⚠️ Đăng ký không thành công:', response.message);
        setError(response.message || 'Đăng ký không thành công. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('❌ Lỗi đăng ký:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server phản hồi với status code lỗi
          const responseData = err.response.data;
          console.error('Lỗi từ server:', responseData);
          
          if (responseData.message) {
            setError(responseData.message);
          } else if (responseData.details && Array.isArray(responseData.details)) {
            setError(responseData.details.join(', '));
          } else {
            setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
          }
        } else if (err.code === 'ERR_NETWORK') {
          // Lỗi kết nối mạng
          console.error('Lỗi kết nối mạng');
          setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra:' +
                   '\n- Kết nối mạng của bạn' );
        } else if (err.code === 'ECONNREFUSED') {
          // Máy chủ từ chối kết nối
          setError('Máy chủ backend không phản hồi.');
        } else {
          // Lỗi khác từ axios
          setError(`Lỗi kết nối: ${err.message}`);
        }
      } else {
        // Lỗi không phải từ axios
        setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success} Chuyển hướng sau {countdown} giây...
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Họ tên
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
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
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 0912345678"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Số điện thoại dùng để khôi phục mật khẩu khi cần thiết
            </p>
          </div>
          
          <div className="mb-4">
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
              minLength={6}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        
        <div className="mt-6 border-t pt-6 text-center">
          <p>
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
