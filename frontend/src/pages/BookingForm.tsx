import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServiceContext } from '../context/ServiceContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import AddressSelector, { AddressValue } from '../components/forms/AddressSelector';
import BookingService from '../services/booking.service';
import { formatFullAddress, getAddressNames } from '../data/vietnamAddress';
import { CreateBookingData, BookingCreationResponse } from '../types'; // Import các kiểu dữ liệu mới

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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vnpay'>('cash'); // Thêm state cho phương thức thanh toán
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
   * Hàm xử lý submit form để tạo booking
   * Validate dữ liệu, gọi API và xử lý kết quả (chuyển hướng VNPAY hoặc báo thành công)
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Kiểm tra token trước khi gửi request
      const token = localStorage.getItem('token');
      if (!token) {
        setFormErrors({ service: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
        navigate('/login?redirect=booking');
        return;
      }
      
      console.log('💳 Đang tạo booking với phương thức thanh toán:', paymentMethod);
      
      // Lấy thông tin dịch vụ đã chọn
      const selectedServiceInfo = activeServices.find(s => s.id === selectedService);
      
      // Tạo chuỗi địa chỉ từ object địa chỉ theo định dạng chuẩn
      const { cityName, districtName, wardName } = getAddressNames(
        address.city, 
        address.district, 
        address.ward
      );
      
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
      
      // Dữ liệu booking để gửi lên API, sử dụng kiểu CreateBookingData
      const bookingData: CreateBookingData = {
        service_id: selectedService,
        booking_date: date,
        booking_time: time,
        customer_address: fullAddress,
        area: 0, // Diện tích sẽ được cập nhật từ form input nếu có
        quantity: 1, // Mặc định 1 đơn vị dịch vụ
        notes: notes,
        payment_method: paymentMethod
      };
      
      console.log('🚢 Selected Service ID:', selectedService);
      console.log('🔍 Selected Service Details:', selectedServiceInfo);
      console.log('📋 Dữ liệu booking:', bookingData);
      
      // Gọi API tạo booking, kết quả có thể chứa payment_url
      const result: BookingCreationResponse = await BookingService.createBooking(bookingData);
      
      console.log('✅ Tạo booking thành công:', result);
      
      // Nếu thanh toán bằng VNPAY và có payment_url, chuyển hướng người dùng
      if (paymentMethod === 'vnpay' && result.payment_url) {
        console.log('💳 Chuyển hướng đến VNPAY...');
        window.location.href = result.payment_url;
        return; // Dừng thực thi để trình duyệt chuyển hướng
      }

      // Thanh toán tiền mặt - hoàn tất đặt lịch
      window.dispatchEvent(new CustomEvent('newBookingCreated', { 
        detail: { booking: result } 
      }));
      
      setBookingSuccess(true);
      
      setTimeout(() => {
        navigate('/bookings?refresh=true');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Lỗi khi tạo booking:', error);
      
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
                  {paymentMethod === 'cash' && ' Chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất.'}
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
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700">Chọn dịch vụ</label>
                      <select
                        id="service"
                        name="service"
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${formErrors.service ? 'border-red-500' : ''}`}
                      >
                        <option value="">-- Chọn một dịch vụ --</option>
                        {activeServices.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {formatPrice(service.price)}
                          </option>
                        ))}
                      </select>
                      {formErrors.service && <p className="mt-2 text-sm text-red-600">{formErrors.service}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Chọn ngày</label>
                        <select
                          id="date"
                          name="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${formErrors.date ? 'border-red-500' : ''}`}
                        >
                          <option value="">-- Chọn ngày --</option>
                          {availableDates.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {formErrors.date && <p className="mt-2 text-sm text-red-600">{formErrors.date}</p>}
                      </div>
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">Chọn giờ</label>
                        <select
                          id="time"
                          name="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${formErrors.time ? 'border-red-500' : ''}`}
                        >
                          <option value="">-- Chọn giờ --</option>
                          {availableTimeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                        {formErrors.time && <p className="mt-2 text-sm text-red-600">{formErrors.time}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                      <AddressSelector value={address} onChange={setAddress} />
                      {formErrors.address && <p className="mt-2 text-sm text-red-600">{formErrors.address}</p>}
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Ghi chú</label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Ví dụ: Nhà có chó nhỏ, vui lòng gọi trước khi đến."
                      ></textarea>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900">Phương thức thanh toán</h3>
                      <fieldset className="mt-4">
                        <legend className="sr-only">Payment method</legend>
                        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                          <div className="flex items-center">
                            <input
                              id="cash"
                              name="payment-method"
                              type="radio"
                              value="cash"
                              checked={paymentMethod === 'cash'}
                              onChange={() => setPaymentMethod('cash')}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
                              Thanh toán tiền mặt
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="vnpay"
                              name="payment-method"
                              type="radio"
                              value="vnpay"
                              checked={paymentMethod === 'vnpay'}
                              onChange={() => setPaymentMethod('vnpay')}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <label htmlFor="vnpay" className="ml-3 block text-sm font-medium text-gray-700">
                              Thanh toán VNPAY
                            </label>
                          </div>
                        </div>
                      </fieldset>
                    </div>

                    <div className="pt-6">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : `Đặt lịch ngay - ${formatPrice(totalPrice)}`}
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
    </>
  );
};

export default BookingForm;
