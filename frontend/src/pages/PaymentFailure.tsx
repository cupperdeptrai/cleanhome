// frontend/src/pages/PaymentFailure.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const PaymentFailure: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Đếm ngược và tự động chuyển hướng
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/bookings');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Lấy thông tin lỗi từ VNPAY response codes
  const getErrorMessage = (responseCode: string | null) => {
    const errorCodes: { [key: string]: string } = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };

    return errorCodes[responseCode || ''] || 'Giao dịch không thành công. Vui lòng thử lại sau.';
  };

  const responseCode = searchParams.get('vnp_ResponseCode');
  const errorMessage = getErrorMessage(responseCode);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-8 text-center">
          {/* Biểu tượng thất bại */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg 
              className="h-8 w-8 text-red-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>

          {/* Tiêu đề thất bại */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Thanh toán không thành công
          </h1>

          {/* Mô tả lỗi */}
          <div className="text-gray-600 mb-6">
            <p className="mb-2">Giao dịch của bạn không thể được xử lý.</p>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {errorMessage}
            </p>
          </div>

          {/* Thông tin giao dịch nếu có */}
          {searchParams.get('vnp_TxnRef') && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Thông tin giao dịch:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Mã giao dịch:</span>
                  <span className="font-mono">{searchParams.get('vnp_TxnRef')}</span>
                </div>
                {responseCode && (
                  <div className="flex justify-between">
                    <span>Mã lỗi:</span>
                    <span className="font-mono text-red-600">{responseCode}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Đếm ngược */}
          <p className="text-sm text-gray-500 mb-6">
            Bạn sẽ được chuyển đến trang quản lý đơn hàng sau {countdown} giây.
          </p>

          {/* Nút hành động */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/booking')}
              className="w-full"
            >
              Thử lại thanh toán
            </Button>
            
            <Button 
              onClick={() => navigate('/bookings')}
              variant="outline"
              className="w-full"
            >
              Xem đơn hàng của tôi
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Về trang chủ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailure;
