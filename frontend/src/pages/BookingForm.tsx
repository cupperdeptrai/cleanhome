import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import MainLayout from '../components/Layout/MainLayout';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { Service } from '../types';

// Dữ liệu dịch vụ mẫu
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Vệ sinh nhà ở cơ bản',
    description: 'Dịch vụ vệ sinh nhà ở cơ bản bao gồm quét dọn, lau chùi, vệ sinh phòng tắm và nhà bếp.',
    price: 300000,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    category: 'Vệ sinh nhà cửa',
    duration: 120,
    isActive: true
  },
  {
    id: '2',
    name: 'Vệ sinh nhà ở chuyên sâu',
    description: 'Dịch vụ vệ sinh nhà ở chuyên sâu bao gồm tất cả dịch vụ cơ bản cộng với vệ sinh kỹ các góc khó tiếp cận, vệ sinh đồ nội thất, và làm sạch cửa sổ.',
    price: 500000,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    category: 'Vệ sinh nhà cửa',
    duration: 240,
    isActive: true
  },
  {
    id: '6',
    name: 'Vệ sinh điều hòa',
    description: 'Dịch vụ vệ sinh, bảo dưỡng điều hòa tại nhà hoặc văn phòng.',
    price: 250000,
    image: 'https://images.unsplash.com/photo-1581788604067-720a7e1bb6d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    category: 'Vệ sinh thiết bị',
    duration: 90,
    isActive: true
  },
  {
    id: '7',
    name: 'Vệ sinh tủ lạnh',
    description: 'Dịch vụ vệ sinh, khử mùi tủ lạnh tại nhà.',
    price: 200000,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    category: 'Vệ sinh thiết bị',
    duration: 60,
    isActive: true
  },
  {
    id: '8',
    name: 'Phun khử khuẩn',
    description: 'Dịch vụ phun thuốc khử khuẩn, diệt vi khuẩn cho nhà ở, văn phòng.',
    price: 500000,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    category: 'Vệ sinh đặc biệt',
    duration: 120,
    isActive: true
  }
];

const BookingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const serviceIdFromUrl = queryParams.get('service');
  
  const [selectedService, setSelectedService] = useState<string>(serviceIdFromUrl || '');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [address, setAddress] = useState<string>(user?.address || '');
  const [notes, setNotes] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{
    service?: string;
    date?: string;
    time?: string;
    address?: string;
  }>({});
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  
  // Lấy thông tin dịch vụ đã chọn
  const selectedServiceDetails = mockServices.find(service => service.id === selectedService);
  
  // Tính tổng tiền
  const totalPrice = selectedServiceDetails ? selectedServiceDetails.price : 0;
  
  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };
  
  // Kiểm tra người dùng đã đăng nhập chưa
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=booking');
    }
  }, [user, navigate]);
  
  // Kiểm tra form hợp lệ
  const validateForm = () => {
    const errors: {
      service?: string;
      date?: string;
      time?: string;
      address?: string;
    } = {};
    let isValid = true;
    
    if (!selectedService) {
      errors.service = 'Vui lòng chọn dịch vụ';
      isValid = false;
    }
    
    if (!date) {
      errors.date = 'Vui lòng chọn ngày';
      isValid = false;
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Ngày không hợp lệ';
        isValid = false;
      }
    }
    
    if (!time) {
      errors.time = 'Vui lòng chọn giờ';
      isValid = false;
    }
    
    if (!address) {
      errors.address = 'Vui lòng nhập địa chỉ';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Xử lý đặt lịch
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Giả lập API call
      setTimeout(() => {
        setBookingSuccess(true);
        
        // Chuyển hướng đến trang đơn hàng sau 3 giây
        setTimeout(() => {
          navigate('/bookings');
        }, 3000);
      }, 1000);
    }
  };
  
  // Tạo danh sách các khung giờ có sẵn
  const availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];
  
  // Tạo danh sách ngày trong 14 ngày tới
  const getNextTwoWeeks = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      dates.push(nextDate.toISOString().split('T')[0]);
    }
    
    return dates;
  };
  
  const availableDates = getNextTwoWeeks();
  
  return (
    <>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Đặt lịch dịch vụ</h1>
          
          {bookingSuccess ? (
            <Card className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Đặt lịch thành công!</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Đơn đặt lịch của bạn đã được ghi nhận.
                  Chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Bạn sẽ được chuyển đến trang quản lý đơn hàng sau 3 giây.
                </p>
                <div className="mt-5">
                  <Button
                    onClick={() => navigate('/bookings')}
                  >
                    Xem đơn hàng của tôi
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn dịch vụ
                      </label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                          formErrors.service ? 'border-red-300' : ''
                        }`}
                      >
                        <option value="">-- Chọn dịch vụ --</option>
                        {mockServices.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {formatPrice(service.price)}
                          </option>
                        ))}
                      </select>
                      {formErrors.service && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.service}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chọn ngày
                        </label>
                        <select
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                            formErrors.date ? 'border-red-300' : ''
                          }`}
                        >
                          <option value="">-- Chọn ngày --</option>
                          {availableDates.map((date) => (
                            <option key={date} value={date}>
                              {new Date(date).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </option>
                          ))}
                        </select>
                        {formErrors.date && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chọn giờ
                        </label>
                        <select
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                            formErrors.time ? 'border-red-300' : ''
                          }`}
                        >
                          <option value="">-- Chọn giờ --</option>
                          {availableTimeSlots.map((timeSlot) => (
                            <option key={timeSlot} value={timeSlot}>
                              {timeSlot}
                            </option>
                          ))}
                        </select>
                        {formErrors.time && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.time}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Input
                        label="Địa chỉ"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        error={formErrors.address}
                        fullWidth
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Thông tin thêm về yêu cầu của bạn..."
                      />
                    </div>
                    
                    <div>
                      <Button type="submit" fullWidth>
                        Đặt lịch
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
              
              <div>
                <Card className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h2>
                  
                  {selectedServiceDetails ? (
                    <div>
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-900">{selectedServiceDetails.name}</h3>
                        <p className="text-sm text-gray-500">{selectedServiceDetails.description}</p>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Giá dịch vụ</span>
                          <span className="text-gray-900">{formatPrice(selectedServiceDetails.price)}</span>
                        </div>
                        
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-500">Thời gian thực hiện</span>
                          <span className="text-gray-900">
                            {selectedServiceDetails.duration >= 60
                              ? `${Math.floor(selectedServiceDetails.duration / 60)} giờ ${
                                  selectedServiceDetails.duration % 60 ? `${selectedServiceDetails.duration % 60} phút` : ''
                                }`
                              : `${selectedServiceDetails.duration} phút`}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Tổng cộng</span>
                            <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Vui lòng chọn dịch vụ để xem thông tin chi tiết.</p>
                  )}
                </Card>
                
                <div className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin liên hệ</h2>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Điện thoại:</span> 0123 456 789
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Email:</span> support@cleanhome.vn
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Giờ làm việc:</span> 8:00 - 18:00 (Thứ 2 - Chủ nhật)
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingForm;
