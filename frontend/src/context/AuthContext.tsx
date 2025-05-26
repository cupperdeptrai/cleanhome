import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

/**
 * Định nghĩa kiểu dữ liệu cho người dùng
 * Bao gồm thông tin cơ bản và mật khẩu đã hash
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'staff' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
  hashedPassword: string;
}

/**
 * Interface cho dữ liệu người dùng an toàn (không chứa hashedPassword)
 * Dùng để lưu trong localStorage và trả về cho frontend
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'staff' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
}

/**
 * Định nghĩa kiểu dữ liệu cho Auth Context
 * Bao gồm các phương thức và dữ liệu cần thiết cho việc xác thực
 */
interface AuthContextType {
  user: SafeUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  updateProfile: (data: Partial<SafeUser>) => Promise<boolean>;
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
  requestPasswordReset: async () => false,
  resetPassword: async () => false,
  updateProfile: async () => false,
});

/**
 * Hook để sử dụng Auth Context trong các component
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Hàm mô phỏng hash mật khẩu (thay thế bcrypt)
 * Lưu ý: Đây chỉ là mô phỏng, không an toàn cho môi trường thực tế
 */
const mockHashPassword = (password: string): string => {
  // Đây chỉ là mô phỏng, không phải hash thực sự
  return `hashed_${password}_${Date.now()}`;
};

/**
 * Hàm mô phỏng so sánh mật khẩu (thay thế bcrypt.compare)
 * Lưu ý: Đây chỉ là mô phỏng, không an toàn cho môi trường thực tế
 */
const mockComparePassword = (password: string, hashedPassword: string): boolean => {
  // Kiểm tra xem hashedPassword có bắt đầu bằng 'hashed_' không
  if (hashedPassword.startsWith('hashed_')) {
    // Trong ứng dụng demo, mọi người dùng có thể đăng nhập với mật khẩu "password"
    // hoặc có thể đăng nhập với mật khẩu thật nếu nó trùng khớp
    return password === "password" || hashedPassword.includes(`hashed_${password}_`);
  }
  return false;
};

/**
 * Hàm mô phỏng tạo JWT token với thời hạn 30 ngày
 * Lưu ý: Đây chỉ là mô phỏng, không an toàn cho môi trường thực tế
 */
const mockGenerateToken = (payload: Record<string, unknown>): string => {
  // Sử dụng JWT_SECRET để tăng tính xác thực (mô phỏng)
  // Thêm thông tin về thời hạn token (30 ngày)
  const expiresIn = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 ngày tính bằng milliseconds
  const tokenPayload = {
    ...payload,
    exp: expiresIn
  };
  
  // Đây chỉ là mô phỏng, không phải JWT thực sự
  // Trong ứng dụng thực tế, JWT_SECRET sẽ được dùng để ký token
  return `mock_token_${JWT_SECRET}_${JSON.stringify(tokenPayload)}_${Date.now()}`;
};

/**
 * Hàm mô phỏng xác thực JWT token
 * Lưu ý: Đây chỉ là mô phỏng, không an toàn cho môi trường thực tế
 */
const mockVerifyToken = (token: string): Record<string, unknown> | null => {
  // Đây chỉ là mô phỏng, không phải xác thực JWT thực sự
  try {
    // Kiểm tra xem token có chứa JWT_SECRET không (mô phỏng việc xác thực token)
    if (!token.includes(JWT_SECRET)) {
      throw new Error('Invalid token signature');
    }
    
    // Trích xuất phần payload từ token giả
    const parts = token.split('_');
    if (parts.length >= 3) {
      const payload = JSON.parse(parts[2]) as Record<string, unknown>;
      
      // Kiểm tra thời hạn token
      if (payload.exp && typeof payload.exp === 'number' && payload.exp > Date.now()) {
        return payload;
      } else {
        console.log('Token hết hạn');
        return null;
      }
    }
    throw new Error('Invalid token format');
  } catch {
    throw new Error('Invalid token');
  }
};

/**
 * Danh sách người dùng mẫu với mật khẩu đã được hash
 * Trong ứng dụng thực tế, dữ liệu này sẽ được lưu trong cơ sở dữ liệu
 */
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Người Dùng',
    email: 'user@example.com',
    role: 'user',
    phone: '0901234567',
    address: 'Quận 1, TP. HCM',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    // Mật khẩu thực tế là "password"
    hashedPassword: 'hashed_password_123'
  },
  {
    id: '2',
    name: 'Nhân Viên',
    email: 'staff@example.com',
    role: 'staff',
    phone: '0912345678',
    address: 'Quận 2, TP. HCM',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    hashedPassword: 'hashed_password_123'
  },
  {
    id: '3',
    name: 'Quản Trị Viên',
    email: 'admin@example.com',
    role: 'admin',
    phone: '0923456789',
    address: 'Quận 3, TP. HCM',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    hashedPassword: 'hashed_password_123'
  }
];

// Secret key cho JWT - trong ứng dụng thực tế nên đặt trong biến môi trường
const JWT_SECRET = 'cleanhome-secret-key';

/**
 * Interface cho props của Auth Provider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Cung cấp các chức năng xác thực cho toàn bộ ứng dụng
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Chuyển đổi từ User sang SafeUser (loại bỏ hashedPassword)
   */
  const userToSafeUser = (user: User): SafeUser => {
    // Sử dụng destructuring để loại bỏ hashedPassword khỏi object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...safeUser } = user;
    return safeUser;
  };

  /**
   * Kiểm tra xem người dùng đã đăng nhập chưa khi tải trang
   * Xác thực token JWT từ localStorage
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token
        const decoded = mockVerifyToken(token);
        
        if (decoded && typeof decoded.userId === 'string') {
          const foundUser = sampleUsers.find(u => u.id === decoded.userId);
          
          if (foundUser) {
            setUser(userToSafeUser(foundUser));
          } else {
            // Người dùng không tồn tại, xóa token
            localStorage.removeItem('token');
          }
        } else {
          // Token không hợp lệ hoặc hết hạn, xóa khỏi localStorage
          localStorage.removeItem('token');
        }
      } catch {
        // Token không hợp lệ, xóa khỏi localStorage
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Hàm đăng nhập
   * @param email Email người dùng
   * @param password Mật khẩu người dùng
   * @returns Promise<boolean> Trạng thái đăng nhập
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kiểm tra thông tin đăng nhập
      const foundUser = sampleUsers.find(u => u.email === email);
      
      // So sánh mật khẩu
      if (foundUser && mockComparePassword(password, foundUser.hashedPassword)) {
        // Tạo JWT token với thời hạn 30 ngày
        const token = mockGenerateToken(
          { userId: foundUser.id, role: foundUser.role }
        );
        
        // Lưu token vào localStorage
        localStorage.setItem('token', token);
        
        // Lưu thông tin người dùng (không bao gồm mật khẩu)
        setUser(userToSafeUser(foundUser));
        return true;
      }
      
      setError('Email hoặc mật khẩu không đúng');
      return false;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError('Đã xảy ra lỗi trong quá trình đăng nhập');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm đăng ký
   * @param name Tên người dùng
   * @param email Email người dùng
   * @param password Mật khẩu người dùng
   * @returns Promise<boolean> Trạng thái đăng ký
   */
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kiểm tra email đã tồn tại chưa
      const existingUser = sampleUsers.find(u => u.email === email);
      if (existingUser) {
        setError('Email đã được sử dụng');
        return false;
      }
      
      // Hash mật khẩu
      const hashedPassword = mockHashPassword(password);
      
      // Tạo người dùng mới
      const newUser: User = {
        id: `${sampleUsers.length + 1}`,
        name,
        email,
        role: 'user',
        hashedPassword
      };
      
      // Tạo JWT token với thời hạn 30 ngày
      const token = mockGenerateToken(
        { userId: newUser.id, role: newUser.role }
      );
      
      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      
      // Lưu thông tin người dùng (không bao gồm mật khẩu)
      setUser(userToSafeUser(newUser));
      
      // Trong ứng dụng thực tế, người dùng mới sẽ được lưu vào cơ sở dữ liệu
      sampleUsers.push(newUser);
      
      return true;
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      setError('Đã xảy ra lỗi trong quá trình đăng ký');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm đăng xuất
   * Xóa token và thông tin người dùng khỏi localStorage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  /**
   * Hàm yêu cầu đặt lại mật khẩu
   * @param email Email người dùng
   * @returns Promise<boolean> Trạng thái yêu cầu
   */
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kiểm tra email có tồn tại không
      const existingUser = sampleUsers.find(u => u.email === email);
      if (!existingUser) {
        setError('Email không tồn tại trong hệ thống');
        return false;
      }
      
      // Trong ứng dụng thực tế, sẽ gửi email với link đặt lại mật khẩu
      console.log(`Gửi email đặt lại mật khẩu đến ${email}`);
      
      return true;
    } catch (error) {
      console.error('Lỗi yêu cầu đặt lại mật khẩu:', error);
      setError('Đã xảy ra lỗi khi yêu cầu đặt lại mật khẩu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm đặt lại mật khẩu
   * @param token Token xác thực
   * @param newPassword Mật khẩu mới
   * @returns Promise<boolean> Trạng thái đặt lại
   */
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Trong ứng dụng thực tế, sẽ xác thực token và cập nhật mật khẩu trong DB
      console.log(`Đặt lại mật khẩu với token ${token} và mật khẩu mới ${newPassword.substring(0, 1)}***`);
      
      return true;
    } catch (error) {
      console.error('Lỗi đặt lại mật khẩu:', error);
      setError('Đã xảy ra lỗi khi đặt lại mật khẩu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm cập nhật thông tin người dùng
   * @param data Dữ liệu cần cập nhật
   * @returns Promise<boolean> Trạng thái cập nhật
   */
  const updateProfile = async (data: Partial<SafeUser>): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!user) {
        setError('Bạn cần đăng nhập để cập nhật thông tin');
        return false;
      }
      
      // Cập nhật thông tin người dùng
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      // Trong ứng dụng thực tế, sẽ cập nhật thông tin trong DB
      
      return true;
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      setError('Đã xảy ra lỗi khi cập nhật thông tin');
      return false;
    } finally {
      setLoading(false);
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
    requestPasswordReset,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
