import { useState, useContext, useEffect, useCallback, createContext } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Định nghĩa kiểu dữ liệu cho người dùng
 * Bao gồm thông tin cơ bản của người dùng
 */
interface User {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'staff' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
}

/**
 * Định nghĩa kiểu dữ liệu cho context
 * Cung cấp các phương thức và dữ liệu cần thiết cho việc xác thực
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Context cho việc xác thực người dùng
 * Cung cấp các phương thức và dữ liệu cần thiết cho toàn bộ ứng dụng
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateProfile: async () => {},
  loading: true,
  error: null,
});

/**
 * Hook để sử dụng Auth Context trong các component
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Interface cho props của Auth Provider
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Dữ liệu mẫu cho người dùng
 * Trong ứng dụng thực tế, dữ liệu này sẽ được lấy từ API
 */
const mockUsers: Record<string, User> = {
  'user1': { 
    id: 'user1', 
    name: 'Nguyen Van A', 
    email: 'a@example.com', 
    role: 'user',
    phone: '0901234567', 
    address: '123 Đường ABC' 
  },
  'user2': { 
    id: 'user2', 
    name: 'Tran Thi B', 
    email: 'b@example.com', 
    role: 'staff',
    phone: '0912345678', 
    address: '456 Đường XYZ' 
  },
  'admin1': { 
    id: 'admin1', 
    name: 'Admin', 
    email: 'admin@example.com', 
    role: 'admin',
    phone: '0923456789', 
    address: '789 Đường Admin' 
  },
};

/**
 * Auth Provider Component
 * Cung cấp các chức năng xác thực cho toàn bộ ứng dụng
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Giả lập tải thông tin người dùng từ localStorage khi khởi động
   * Trong ứng dụng thực tế, nên xác thực token với backend
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Hàm đăng nhập
   * @param email Email người dùng
   * @param password Mật khẩu người dùng
   * @returns Promise<boolean> Trạng thái đăng nhập
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Giả lập API call và xác thực
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Tìm người dùng dựa trên email
      const foundUser = Object.values(mockUsers).find(u => u.email === email);
      
      // Kiểm tra mật khẩu (giả lập)
      if (foundUser && password === 'password123') {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        navigate('/');
        return true;
      }
      
      setError('Email hoặc mật khẩu không đúng');
      return false;
    } catch (err) {
      setError('Lỗi khi đăng nhập');
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Hàm đăng ký
   * @param name Tên người dùng
   * @param email Email người dùng
   * @param password Mật khẩu người dùng
   * @returns Promise<boolean> Trạng thái đăng ký
   */
  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Kiểm tra email đã tồn tại chưa
      if (Object.values(mockUsers).some(u => u.email === email)) {
        setError('Email đã được sử dụng');
        return false;
      }
      
      // Tạo người dùng mới
      const newUser: User = { 
        id: `user${Date.now()}`, 
        name, 
        email, 
        role: 'user' 
      };
      
      // Trong ứng dụng thực tế, sẽ gửi thông tin đăng ký lên server
      // Ở đây chỉ mô phỏng
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      navigate('/');
      return true;
    } catch (err) {
      setError('Lỗi khi đăng ký');
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Hàm đăng xuất
   * Xóa thông tin người dùng khỏi state và localStorage
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  /**
   * Hàm cập nhật thông tin người dùng
   * @param profile Thông tin cần cập nhật
   * @returns Promise<void>
   */
  const updateProfile = useCallback(async (profile: Partial<User>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (user) {
        // Cập nhật thông tin người dùng
        const updatedUser = { ...user, ...profile };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError('Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Giá trị context cung cấp cho toàn bộ ứng dụng
   */
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
