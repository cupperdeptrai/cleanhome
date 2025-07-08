import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServiceContext } from '../context/ServiceContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import AddressSelector, { AddressValue } from '../components/forms/AddressSelector';
import BookingService from '../services/booking.service';
import PromotionService, { BestPromotionResponse } from '../services/promotion.service';
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
  
  // State cho khuyến mãi tự động
  const [bestPromotion, setBestPromotion] = useState<BestPromotionResponse['promotion']>(null);
  const [promotionLoading, setPromotionLoading] = useState<boolean>(false);
  
  // Lấy thông tin dịch vụ đã chọn
  const selectedServiceDetails = activeServices.find(service => service.id === selectedService);
  
  // Tính tổng tiền (trước giảm giá)
  const originalPrice = selectedServiceDetails ? selectedServiceDetails.price : 0;
  
  // Tính giá cuối cùng (sau giảm giá)
  const finalPrice = bestPromotion ? bestPromotion.finalAmount : originalPrice;
  const discountAmount = originalPrice - finalPrice;
  
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

  // Function tìm khuyến mãi tốt nhất cho user
  const findBestPromotion = useCallback(async () => {
    if (!user?.id || originalPrice <= 0) return;
    
    try {
      setPromotionLoading(true);
      const result = await PromotionService.getBestPromotionForUser(user.id, originalPrice);
      setBestPromotion(result.promotion);
    } catch (error) {
      console.error('Error finding best promotion:', error);
      setBestPromotion(null);
    } finally {
      setPromotionLoading(false);
    }
  }, [user?.id, originalPrice]);

  // Tự động tìm khuyến mãi tốt nhất khi giá thay đổi
  useEffect(() => {
    if (user?.id && originalPrice > 0) {
      findBestPromotion();
    }
  }, [user?.id, originalPrice, findBestPromotion]);
  
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
      // Kiểm tra ngày được chọn có hợp lệ không (từ hôm nay đến 30 ngày tiếp theo)
      const selectedDate = new Date(date);
      const today = new Date();
      const maxDate = new Date();
      
      // Set giờ về 0 để so sánh chỉ ngày
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      maxDate.setDate(today.getDate() + 30);
      maxDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Không thể chọn ngày trong quá khứ';
        isValid = false;
      } else if (selectedDate > maxDate) {
        errors.date = 'Chỉ có thể đặt lịch trong vòng 30 ngày tới';
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
  
  // Tạo danh sách các khung giờ có sẵn (từ 8:00 đến 16:00 theo quy định backend)
  const availableTimeSlots = [
    { value: '08:00', display: '8:00 AM' },
    { value: '09:00', display: '9:00 AM' },
    { value: '10:00', display: '10:00 AM' },
    { value: '11:00', display: '11:00 AM' },
    { value: '13:00', display: '1:00 PM' },
    { value: '14:00', display: '2:00 PM' },
    { value: '15:00', display: '3:00 PM' },
    { value: '16:00', display: '4:00 PM' }
  ];
  
  /**
   * Hàm tạo danh sách ngày từ hôm nay đến 30 ngày tiếp theo
   * Bao gồm cả ngày hiện tại và format đẹp để hiển thị
   */
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Thêm từ ngày hiện tại (i = 0) đến 30 ngày tiếp theo
    for (let i = 0; i <= 30; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      
      // Format ngày để hiển thị đẹp hơn
      const dateValue = nextDate.toISOString().split('T')[0];
      const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
      const dayName = dayNames[nextDate.getDay()];
      const formattedDate = `${nextDate.getDate()}/${nextDate.getMonth() + 1}/${nextDate.getFullYear()}`;
      
      let displayText = `${dayName}, ${formattedDate}`;
      if (i === 0) {
        displayText = `Hôm nay, ${formattedDate}`;
      } else if (i === 1) {
        displayText = `Ngày mai, ${formattedDate}`;
      }
      
      dates.push({
        value: dateValue,
        display: displayText
      });
    }
    
    return dates;
  };
  
  const availableDates = getAvailableDates();
  
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
                    {/* Dropdown chọn dịch vụ */}
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                        🏠 Chọn dịch vụ
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className={`mt-1 block w-full pl-4 pr-10 py-3 text-base bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          formErrors.service ? 'border-red-500 ring-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="" className="text-gray-500">-- Chọn một dịch vụ --</option>
                        {activeServices.map(service => (
                          <option key={service.id} value={service.id} className="py-2">
                            {service.name} - {formatPrice(service.price)}
                          </option>
                        ))}
                      </select>
                      {formErrors.service && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {formErrors.service}
                        </p>
                      )}
                    </div>

                    {/* Phần chọn ngày và giờ với giao diện cải thiện */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Dropdown chọn ngày */}
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                          📅 Chọn ngày thực hiện
                        </label>
                        <select
                          id="date"
                          name="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={`mt-1 block w-full pl-4 pr-10 py-3 text-base bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            formErrors.date ? 'border-red-500 ring-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="" className="text-gray-500">-- Chọn ngày --</option>
                          {availableDates.map(d => (
                            <option key={d.value} value={d.value} className="py-2">
                              {d.display}
                            </option>
                          ))}
                        </select>
                        {formErrors.date && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {formErrors.date}
                          </p>
                        )}
                      </div>

                      {/* Dropdown chọn giờ */}
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                          🕐 Chọn giờ thực hiện
                        </label>
                        <select
                          id="time"
                          name="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className={`mt-1 block w-full pl-4 pr-10 py-3 text-base bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            formErrors.time ? 'border-red-500 ring-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="" className="text-gray-500">-- Chọn giờ --</option>
                          {availableTimeSlots.map(slot => (
                            <option key={slot.value} value={slot.value} className="py-2">
                              {slot.display}
                            </option>
                          ))}
                        </select>
                        {formErrors.time && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {formErrors.time}
                          </p>
                        )}
                        
                        {/* Thông tin bổ sung về giờ làm việc */}
                        <p className="mt-2 text-xs text-gray-500">
                          💡 Giờ làm việc: 8:00 - 17:00. Chỉ nhận đặt lịch đến 16:00
                        </p>
                      </div>
                    </div>

                    {/* Phần nhập địa chỉ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📍 Địa chỉ thực hiện dịch vụ
                      </label>
                      <AddressSelector value={address} onChange={setAddress} />
                      {formErrors.address && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {formErrors.address}
                        </p>
                      )}
                    </div>

                    {/* Phần ghi chú */}
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        📝 Ghi chú thêm (tùy chọn)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full pl-4 pr-4 py-3 text-base bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Ví dụ: Nhà có chó nhỏ, vui lòng gọi trước khi đến..."
                      ></textarea>
                      <p className="mt-1 text-xs text-gray-500">
                        💡 Hãy để lại thông tin cần thiết để nhân viên chuẩn bị tốt nhất
                      </p>
                    </div>

                    {/* Phần thanh toán với thông tin bổ sung về VNPAY */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">💳 Phương thức thanh toán</h3>
                      <fieldset className="mt-4">
                        <legend className="sr-only">Payment method</legend>
                        <div className="space-y-4">
                          {/* Thanh toán tiền mặt */}
                          <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              id="cash"
                              name="payment-method"
                              type="radio"
                              value="cash"
                              checked={paymentMethod === 'cash'}
                              onChange={() => setPaymentMethod('cash')}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <label htmlFor="cash" className="ml-3 flex-1">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-700">💵 Thanh toán tiền mặt</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Thanh toán trực tiếp cho nhân viên khi hoàn thành dịch vụ</p>
                            </label>
                          </div>
                          
                          {/* Thanh toán VNPAY */}
                          <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              id="vnpay"
                              name="payment-method"
                              type="radio"
                              value="vnpay"
                              checked={paymentMethod === 'vnpay'}
                              onChange={() => setPaymentMethod('vnpay')}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <label htmlFor="vnpay" className="ml-3 flex-1">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-700">🏦 Thanh toán VNPAY</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Thanh toán trực tuyến qua các ngân hàng nội địa</p>
                            </label>
                          </div>
                        </div>
                      </fieldset>
                    </div>

                    <div className="pt-6">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : `Đặt lịch ngay - ${formatPrice(finalPrice)}`}
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
                          {/* Hiển thị giá gốc */}
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-700">Giá dịch vụ</span>
                            <span className="text-gray-900">{formatPrice(originalPrice)}</span>
                          </div>
                          
                          {/* Hiển thị khuyến mãi nếu có */}
                          {promotionLoading && (
                            <div className="flex justify-between mb-2 text-blue-600">
                              <span className="text-sm">Đang tìm khuyến mãi...</span>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                          
                          {bestPromotion && !promotionLoading && (
                            <div className="flex justify-between mb-2 text-green-600">
                              <span className="text-sm flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                {bestPromotion.name}
                              </span>
                              <span className="font-medium">-{formatPrice(discountAmount)}</span>
                            </div>
                          )}
                          
                          {/* Đường kẻ phân cách */}
                          <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-900">Tổng cộng</span>
                              <span className={`font-bold text-lg ${bestPromotion ? 'text-green-600' : 'text-gray-900'}`}>
                                {formatPrice(finalPrice)}
                              </span>
                            </div>
                            
                            {bestPromotion && (
                              <div className="text-xs text-green-600 text-right mt-1">
                                Đã áp dụng mã: {bestPromotion.code}
                              </div>
                            )}
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
                    <h2 className="text-lg font-medium text-gray-900 mb-4">📞 Thông tin liên hệ</h2>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Điện thoại:</span> 0123 456 789
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Email:</span> support@cleanhome.vn
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Giờ làm việc:</span> 8:00 - 17:00 (Thứ 2 - Chủ nhật)
                      </p>
                      
                      {/* Thông tin hỗ trợ thanh toán */}
                      <div className="border-t pt-3 mt-4">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-700">💳 Hỗ trợ thanh toán:</span>
                        </p>
                        <ul className="text-xs text-gray-400 mt-1 space-y-1">
                          <li>• Tiền mặt khi hoàn thành dịch vụ</li>
                          <li>• VNPAY - Các ngân hàng nội địa</li>
                          <li>• Hỗ trợ 24/7 cho vấn đề thanh toán</li>
                        </ul>
                      </div>
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
