// frontend/src/pages/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-8 text-center">
          {/* Biểu tượng thành công */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg 
              className="h-8 w-8 text-green-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          {/* Tiêu đề thành công */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Thanh toán thành công!
          </h1>

          {/* Mô tả */}
          <p className="text-gray-600 mb-6">
            Giao dịch của bạn đã được xử lý thành công. Chúng tôi sẽ sớm liên hệ để xác nhận lịch hẹn.
          </p>

          {/* Thông tin giao dịch nếu có */}
          {searchParams.get('vnp_TxnRef') && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Thông tin giao dịch:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Mã giao dịch:</span>
                  <span className="font-mono">{searchParams.get('vnp_TxnRef')}</span>
                </div>
                {searchParams.get('vnp_TransactionNo') && (
                  <div className="flex justify-between">
                    <span>Mã VNPAY:</span>
                    <span className="font-mono">{searchParams.get('vnp_TransactionNo')}</span>
                  </div>
                )}
                {searchParams.get('vnp_PayDate') && (
                  <div className="flex justify-between">
                    <span>Thời gian:</span>
                    <span>{searchParams.get('vnp_PayDate')}</span>
                  </div>
                )}
                {searchParams.get('vnp_Amount') && (
                  <div className="flex justify-between">
                    <span>Số tiền:</span>
                    <span className="font-semibold text-green-600">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(parseInt(searchParams.get('vnp_Amount') || '0') / 100)}
                    </span>
                  </div>
                )}
                {searchParams.get('vnp_BankCode') && (
                  <div className="flex justify-between">
                    <span>Ngân hàng:</span>
                    <span>{searchParams.get('vnp_BankCode')}</span>
                  </div>
                )}
                {searchParams.get('vnp_ResponseCode') && (
                  <div className="flex justify-between">
                    <span>Kết quả:</span>
                    <span className={`font-medium ${
                      searchParams.get('vnp_ResponseCode') === '00' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {searchParams.get('vnp_ResponseCode') === '00' 
                        ? 'Thành công' 
                        : `Lỗi: ${searchParams.get('vnp_ResponseCode')}`}
                    </span>
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
              onClick={() => navigate('/bookings')}
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

export default PaymentSuccess;
