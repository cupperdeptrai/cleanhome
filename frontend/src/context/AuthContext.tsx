import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AuthService from '../services/auth.service';

/**
 * Helper function để format avatar URL
 * Nếu avatar bắt đầu bằng /static thì thêm base URL
 */
const formatAvatarUrl = (avatar?: string): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('/static')) return `http://localhost:5000${avatar}`;
  return avatar;
};

/**
 * Interface cho dữ liệu người dùng
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'staff' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
}

/**
 * Interface cho Auth Context
 */
interface AuthContextType {
  user: SafeUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  updateUser: (userData: Partial<SafeUser>) => void; // Thêm method cập nhật user
}

// Tạo context với giá trị mặc định
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loading: true,
  error: null,
  updateUser: () => {} // Thêm default implementation
});

/**
 * Hook để sử dụng Auth Context
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Auth Provider Component - SỬ DỤNG API THẬT
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Kiểm tra authentication khi app khởi động
   */
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {        try {
          const userData = JSON.parse(storedUser) as SafeUser;
          // Đảm bảo avatar URL được format đúng khi khôi phục từ localStorage
          const formattedUserData = {
            ...userData,
            avatar: formatAvatarUrl(userData.avatar)
          };
          setUser(formattedUserData);
          console.log('✅ Đã khôi phục phiên đăng nhập:', formattedUserData.email);
        } catch (error) {
          console.warn('⚠️ Lỗi khi parse user data từ localStorage:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Hàm đăng nhập - GỌI API THẬT
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      console.log('🔐 Đăng nhập với email:', email);      // Gọi API thật qua AuthService
      const response = await AuthService.login({ email, password });
      
      console.log('📥 Phản hồi login:', response);      // Backend trả về access_token thay vì token
      const token = response.access_token || response.token;
      const refreshToken = response.refresh_token;
      const user = response.user;

      // Kiểm tra response - Backend có thể trả về access_token thay vì token
      if (user && token) {        // Chuyển đổi user data từ backend
        const safeUser: SafeUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'customer' | 'staff' | 'admin',
          phone: user.phone,
          address: user.address,
          avatar: formatAvatarUrl(user.avatar), // Sử dụng helper để format URL
        };
        
        // Lưu vào localStorage
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(safeUser));
        
        // Cập nhật state
        setUser(safeUser);
        
        console.log('✅ Đăng nhập thành công!', safeUser);
        return true;
      } else {
        console.warn('⚠️ Đăng nhập thất bại: Không có user hoặc token');
        console.warn('User:', user);
        console.warn('Token:', token);
        setError('Phản hồi từ server không hợp lệ');
        return false;
      }
    } catch (error: unknown) {
      console.error('❌ Lỗi đăng nhập:', error);
      
      // Xử lý lỗi từ API
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError('Email hoặc mật khẩu không đúng');
        }
      } else if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'ERR_NETWORK') {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setError('Đã xảy ra lỗi khi đăng nhập');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm đăng ký - GỌI API THẬT
   */
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      console.log('📝 Đăng ký tài khoản:', { name, email });

      // Gọi API thật qua AuthService
      const response = await AuthService.register({ name, email, password });
      
      console.log('📥 Phản hồi register:', response);

      // Kiểm tra response
      if (response.user) {
        console.log('✅ Đăng ký thành công!');
        return true;
      } else {
        setError('Đăng ký thất bại');
        return false;
      }
    } catch (error: unknown) {
      console.error('❌ Lỗi đăng ký:', error);
      
      // Xử lý lỗi từ API
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError('Đã xảy ra lỗi khi đăng ký');
        }
      } else {
        setError('Đã xảy ra lỗi khi đăng ký');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };
  /**
   * Hàm đăng xuất
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    console.log('👋 Đã đăng xuất');
  };  /**
   * Cập nhật thông tin user trong context và localStorage
   */
  const updateUser = (userData: Partial<SafeUser>) => {
    if (user) {
      // Format avatar URL nếu có cập nhật avatar
      const formattedUserData = {
        ...userData,
        ...(userData.avatar && { avatar: formatAvatarUrl(userData.avatar) })
      };
      
      const updatedUser = { ...user, ...formattedUserData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ Đã cập nhật thông tin user:', updatedUser);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    error,
    updateUser, // Thêm vào value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
