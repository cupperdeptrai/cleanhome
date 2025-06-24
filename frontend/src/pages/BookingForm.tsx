import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServiceContext } from '../context/ServiceContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import PaymentMethodModal from '../components/modals/PaymentMethodModal';
import AddressSelector, { AddressValue } from '../components/forms/AddressSelector';
import BookingService from '../services/booking.service';
import { formatFullAddress, getAddressNames } from '../data/vietnamAddress';

/**
 * Component trang đặt lịch dịch vụ
 * Cho phép người dùng chọn dịch vụ, thời gian và đặt lịch với phương thức thanh toán
 */

const BookingForm = () => {
  const { user } = useAuth();
  const { services } = useServiceContext();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const serviceIdFromUrl = queryParams.get('service');
  
  // Lấy danh sách dịch vụ đang hoạt động
  const activeServices = services.filter(service => service.isActive);
  
  const [selectedService, setSelectedService] = useState<string>(serviceIdFromUrl || '');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [address, setAddress] = useState<AddressValue>({
    city: '',
    district: '',
    ward: '',
    houseNumber: '',
    alley: '',
    lane: '',
    street: '',
    specificAddress: ''
  });
  const [notes, setNotes] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{
    service?: string;
    date?: string;
    time?: string;
    address?: string;
  }>({});
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Lấy thông tin dịch vụ đã chọn
  const selectedServiceDetails = activeServices.find(service => service.id === selectedService);
  
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
    
    // Kiểm tra địa chỉ - cần có đủ thông tin
    if (!address.city || !address.district || !address.ward || !address.houseNumber || !address.street) {
      errors.address = 'Vui lòng nhập đầy đủ thông tin địa chỉ (thành phố, quận/huyện, phường/xã, số nhà, tên đường)';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  /**
   * Hàm xử lý submit form - bước đầu tiên
   * Validate dữ liệu và hiển thị modal chọn phương thức thanh toán
   */

  // Xử lý đặt lịch - bước đầu tiên: hiển thị modal thanh toán
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Hiển thị modal chọn phương thức thanh toán
      setShowPaymentModal(true);
    }
  };

  /**
   * Hàm xử lý xác nhận thanh toán và tạo booking
   * Gọi API để tạo booking mới với thông tin đã nhập
   * @param paymentMethod - Phương thức thanh toán được chọn (hiện tại chỉ hỗ trợ 'cash')
   */
  const handlePaymentConfirm = async (paymentMethod: string) => {
    try {
      setIsSubmitting(true);
      setShowPaymentModal(false);
      
      // Kiểm tra token trước khi gửi request
      const token = localStorage.getItem('token');
      if (!token) {
        setFormErrors({ service: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
        navigate('/login?redirect=booking');
        return;
      }
      
      console.log('💳 Đang tạo booking với phương thức thanh toán:', paymentMethod);
      
      // Lấy thông tin dịch vụ đã chọn để tính duration
      const selectedServiceInfo = activeServices.find(s => s.id === selectedService);
      const serviceDuration = selectedServiceInfo ? (selectedServiceInfo.duration || 120) / 60 : 2; // Chuyển từ phút sang giờ
      
      // Tạo chuỗi địa chỉ từ object địa chỉ theo định dạng chuẩn
      // Lấy tên thực tế từ ID
      const { cityName, districtName, wardName } = getAddressNames(
        address.city, 
        address.district, 
        address.ward
      );
      
      // Sử dụng hàm formatFullAddress để tạo địa chỉ chuẩn
      const fullAddress = formatFullAddress(
        address.houseNumber,
        address.street,
        wardName,
        districtName, 
        cityName,
        address.alley,
        address.lane,
        address.specificAddress
      );
      
      // Dữ liệu booking để gửi lên API
      const bookingData = {
        service_id: selectedService,
        booking_date: date,
        booking_time: time,
        duration: serviceDuration, // Sử dụng duration từ selectedService (theo giờ)
        customer_address: fullAddress, // Chuyển object thành string
        phone: user?.phone || '', // Lấy số điện thoại từ thông tin user
        notes: notes,
        payment_method: paymentMethod as 'cash'
      };
      
      console.log('� Selected Service ID:', selectedService);
      console.log('🔍 Selected Service Details:', selectedServiceInfo);
      console.log('�📋 Dữ liệu booking:', bookingData);
      
      // Gọi API tạo booking
      const result = await BookingService.createBooking(bookingData);
      
      console.log('✅ Tạo booking thành công:', result);
      
      // Emit custom event để thông báo có booking mới
      window.dispatchEvent(new CustomEvent('newBookingCreated', { 
        detail: { booking: result } 
      }));
      
      // Hiển thị thành công và chuyển hướng
      setBookingSuccess(true);
      
      // Chuyển hướng đến trang đơn hàng sau 3 giây với parameter refresh
      setTimeout(() => {
        navigate('/bookings?refresh=true');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Lỗi khi tạo booking:', error);
      
      // Xử lý lỗi token expired
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string } } };
        
        if (axiosError.response?.status === 401) {
          const errorData = axiosError.response.data;
          if (errorData?.error === 'token_expired' || errorData?.message?.includes('expired')) {
            alert('Phiên đăng nhập đã hết hạn. Bạn sẽ được chuyển đến trang đăng nhập.');
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            navigate('/login?redirect=booking&message=session_expired');
            return;
          }
        }
        
        const errorMessage = axiosError.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch';
        alert(errorMessage);
      } else {
        alert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Tạo danh sách các khung giờ có sẵn
  const availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];
  
  /**
   * Hàm tạo danh sách ngày trong 14 ngày tới
   * Sử dụng để hiển thị options trong dropdown chọn ngày
   */
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
                    onClick={() => navigate('/bookings?refresh=true')}
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
                        aria-label="Chọn dịch vụ"
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                          formErrors.service ? 'border-red-300' : ''
                        }`}
                        disabled={activeServices.length === 0}
                      >
                        <option value="">
                          {activeServices.length === 0 ? '-- Hiện tại không có dịch vụ nào --' : '-- Chọn dịch vụ --'}
                        </option>
                        {activeServices.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {formatPrice(service.price)} - {service.duration ? `${service.duration}p` : '120p'}
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
                          aria-label="Chọn ngày"
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                            formErrors.date ? 'border-red-300' : ''
                          }`}
                        >
                          <option value="">-- Chọn ngày --</option>
                          {availableDates.map((date) => {
                            // Format ngày cho hiển thị với múi giờ Việt Nam
                            const dateObj = new Date(date + 'T00:00:00');
                            const formattedDate = dateObj.toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              timeZone: 'Asia/Ho_Chi_Minh'
                            });
                            
                            return (
                              <option key={date} value={date}>
                                {formattedDate}
                              </option>
                            );
                          })}
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
                          aria-label="Chọn giờ"
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
                      <AddressSelector
                        value={address}
                        onChange={(newAddress) => setAddress(newAddress)}
                        error={formErrors.address}
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
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm "
                        placeholder="Thông tin thêm về yêu cầu của bạn..."
                      />
                    </div>
                    
                    <div>
                      <Button 
                        type="submit" 
                        fullwidth
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Đang xử lý...' : 'Đặt lịch'}
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
                            {(selectedServiceDetails.duration || 120) >= 60
                              ? `${Math.floor((selectedServiceDetails.duration || 120) / 60)} giờ ${
                                  (selectedServiceDetails.duration || 120) % 60 ? `${(selectedServiceDetails.duration || 120) % 60} phút` : ''
                                }`
                              : `${selectedServiceDetails.duration || 120} phút`}
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
      
      {/* Modal chọn phương thức thanh toán */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        totalAmount={totalPrice}
      />
    </>
  );
};

export default BookingForm;
