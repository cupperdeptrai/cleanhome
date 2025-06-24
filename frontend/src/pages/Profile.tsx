import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import AvatarUpload from '../components/UI/AvatarUpload';
import { Activity } from '../types';

// Dữ liệu hoạt động mẫu
const mockActivities: Activity[] = [
  {
    id: '1',
    userId: '1',
    type: 'booking',
    description: 'Đặt lịch dịch vụ Vệ sinh nhà ở cơ bản',
    createdAt: '2023-07-10T08:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'booking',
    description: 'Đặt lịch dịch vụ Vệ sinh điều hòa',
    createdAt: '2023-07-15T10:15:00Z'
  },
  {
    id: '3',
    userId: '1',
    type: 'profile_update',
    description: 'Cập nhật thông tin địa chỉ',
    createdAt: '2023-07-20T14:45:00Z'
  },
  {
    id: '4',
    userId: '1',
    type: 'password_change',
    description: 'Thay đổi mật khẩu',
    createdAt: '2023-07-25T09:20:00Z'
  },
  {
    id: '5',
    userId: '1',
    type: 'booking',
    description: 'Đặt lịch dịch vụ Phun khử khuẩn',
    createdAt: '2023-07-30T14:45:00Z'
  }
];

const Profile = () => {
  const { user, updateUser } = useAuth(); // Thêm updateUser từ context
  const navigate = useNavigate();
  const { section = 'personal' } = useParams<{ section?: string }>();
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
  }>({});
  
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Kiểm tra người dùng đã đăng nhập chưa
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=profile');
      return;
    }
    
    // Cập nhật state từ thông tin người dùng
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
    
    // Giả lập API call để lấy hoạt động của người dùng
    setActivities(mockActivities);
  }, [user, navigate]);

  // Xử lý upload avatar - cải thiện để không reload trang
  const handleAvatarChange = async (file: File) => {
    try {
      setIsUploadingAvatar(true);
      setFormErrors({}); // Xóa lỗi cũ
      
      console.log('🔄 Bắt đầu upload avatar cho user:', user?.id);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${user?.id}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const responseData = await response.json();
      console.log('📥 Phản hồi upload avatar:', responseData);
      
      if (response.ok) {
        setSuccessMessage('✅ Cập nhật ảnh đại diện thành công!');
        
        // Cập nhật avatar trong context để hiển thị ngay lập tức
        updateUser({ avatar: responseData.data.avatar_url });
        
        // Xóa thông báo sau 3 giây mà không reload trang
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        console.log('✅ Avatar đã được cập nhật thành công');
      } else {
        console.error('❌ Lỗi upload avatar:', responseData);
        setFormErrors({ name: responseData.error || 'Lỗi khi tải lên ảnh đại diện' });
      }
    } catch (error) {
      console.error('❌ Exception khi upload avatar:', error);
      setFormErrors({ name: 'Lỗi kết nối khi tải lên ảnh đại diện. Vui lòng thử lại.' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };
   // Xử lý cập nhật thông tin cá nhân
  const handleUpdateProfile = async () => {
    // Kiểm tra validation form
    const errors: {
      name?: string;
      phone?: string;
      address?: string;
    } = {};
    
    // Validate họ tên
    if (!name.trim()) {
      errors.name = 'Vui lòng nhập họ tên';
    }
    
    // Validate số điện thoại
    if (!phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^0[3-9]\d{8}$/.test(phone.replace(/\s+/g, ''))) {
      errors.phone = 'Số điện thoại phải có định dạng 10 chữ số bắt đầu bằng 0 (ví dụ: 0912345678)';
    }
    
    // Validate địa chỉ
    if (!address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ';
    }
    
    // Hiển thị lỗi nếu có
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Xóa lỗi cũ
    setFormErrors({});
    
    try {
      console.log('🔄 Bắt đầu cập nhật thông tin user:', user?.id);
      
      // Gọi API cập nhật thông tin người dùng
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim()
        })
      });

      const responseData = await response.json();
      console.log('📥 Phản hồi cập nhật thông tin:', responseData);

      if (response.ok) {
        setSuccessMessage('✅ Cập nhật thông tin thành công!');
        
        // Cập nhật thông tin trong context để hiển thị ngay lập tức
        updateUser({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim()
        });
        
        // Xóa thông báo thành công sau 3 giây
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        console.log('✅ Thông tin đã được cập nhật thành công');
      } else {
        console.error('❌ Lỗi cập nhật thông tin:', responseData);
        setFormErrors({ name: responseData.error || 'Lỗi khi cập nhật thông tin' });
      }
    } catch (error) {
      console.error('❌ Exception khi cập nhật thông tin:', error);
      setFormErrors({ name: 'Lỗi kết nối khi cập nhật thông tin. Vui lòng thử lại.' });
    }
  };
  
  // Format ngày tháng với múi giờ Việt Nam
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    }).format(date);
  };
  
  // Hiển thị icon cho loại hoạt động
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'profile_update':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'password_change':
        return (
          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        );
      case 'login':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };
  
  return (
    <>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Thông tin tài khoản</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card className="p-4">
                <nav className="space-y-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/profile');
                    }}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      section === 'personal'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Thông tin cá nhân
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // Chuyển thẳng đến trang Security thay vì profile/security
                      navigate('/security');
                    }}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      section === 'security'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Bảo mật
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/profile/activity');
                    }}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      section === 'activity'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Hoạt động
                  </a>
                </nav>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-3">
              {/* Thông báo thành công */}
              {successMessage && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Thông tin cá nhân */}
              {section === 'personal' && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
                  
                  <div className="space-y-6">
                    {/* Upload Avatar Component */}
                    <div className="flex justify-center">
                      <AvatarUpload
                        currentAvatar={user?.avatar}
                        onAvatarChange={handleAvatarChange}
                        isLoading={isUploadingAvatar}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Input
                          label="Họ tên"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          error={formErrors.name}
                          fullwidth
                        />
                      </div>
                      
                      <div>
                        <Input
                          label="Email"
                          type="email"
                          value={email}
                          disabled
                          fullwidth
                        />
                        <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
                      </div>
                      
                      <div>
                        <Input
                          label="Số điện thoại"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          error={formErrors.phone}
                          fullwidth
                        />
                      </div>
                      
                      <div>
                        <Input
                          label="Địa chỉ"
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          error={formErrors.address}
                          fullwidth
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleUpdateProfile}>
                        Lưu thay đổi
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Bảo mật */}
              {section === 'security' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="text-center py-8">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Cài đặt bảo mật</h3>
                      <p className="text-gray-500 mb-6">
                        Đi đến trang bảo mật để quản lý mật khẩu và các cài đặt bảo mật khác
                      </p>
                      <Button 
                        onClick={() => navigate('/security')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Mở trang bảo mật
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
              
              {/* Hoạt động */}
              {section === 'activity' && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
                  
                  <div className="space-y-6">
                    {activities.length > 0 ? (
                      <div className="flow-root">
                        <ul className="-mb-8">
                          {activities.map((activity, index) => (
                            <li key={activity.id}>
                              <div className="relative pb-8">
                                {index !== activities.length - 1 && (
                                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                )}
                                <div className="relative flex space-x-3">
                                  <div>{getActivityIcon(activity.type)}</div>
                                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                      <p className="text-sm text-gray-500">{activity.description}</p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                      {formatDate(activity.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-500">Không có hoạt động nào gần đây.</p>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
