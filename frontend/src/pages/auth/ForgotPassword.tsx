import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface ForgotPasswordForm {
  identifier: string; // email hoặc phone
  type: 'email' | 'phone';
}

const ForgotPassword: React.FC = () => {
  const [form, setForm] = useState<ForgotPasswordForm>({
    identifier: '',
    type: 'email'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'verify' | 'reset'>('input');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: form.identifier,
          type: form.type
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          form.type === 'email' 
            ? 'Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.'
            : 'Mã xác thực đã được gửi đến số điện thoại của bạn.'
        );
        setStep('verify');
      } else {
        setError(data.message || 'Không thể gửi mã xác thực');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi mã xác thực');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: form.identifier,
          type: form.type,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Mã xác thực đúng. Vui lòng nhập mật khẩu mới.');
        setStep('reset');
      } else {
        setError(data.message || 'Mã xác thực không đúng');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi xác thực mã');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: form.identifier,
          type: form.type,
          code: verificationCode,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login?message=password_reset_success';
        }, 2000);
      } else {
        setError(data.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đặt lại mật khẩu');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateIdentifier = () => {
    if (form.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(form.identifier);
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      return phoneRegex.test(form.identifier);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/login" className="text-gray-600 hover:text-gray-800 mr-4">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">
            {step === 'input' && 'Quên mật khẩu'}
            {step === 'verify' && 'Xác thực mã'}
            {step === 'reset' && 'Đặt lại mật khẩu'}
          </h1>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Nhập email/phone */}
        {step === 'input' && (
          <form onSubmit={handleSendCode}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3">
                Chọn phương thức khôi phục:
              </label>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="email"
                    checked={form.type === 'email'}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'email' | 'phone', identifier: '' })}
                    className="mr-2"
                  />
                  <EnvelopeIcon className="h-5 w-5 mr-1" />
                  Email
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="phone"
                    checked={form.type === 'phone'}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'email' | 'phone', identifier: '' })}
                    className="mr-2"
                  />
                  <PhoneIcon className="h-5 w-5 mr-1" />
                  Số điện thoại
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="identifier" className="block text-gray-700 font-medium mb-2">
                {form.type === 'email' ? 'Nhập địa chỉ email' : 'Nhập số điện thoại'}
              </label>
              <input
                type={form.type === 'email' ? 'email' : 'tel'}
                id="identifier"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                placeholder={form.type === 'email' ? 'example@email.com' : '0123456789'}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {form.identifier && !validateIdentifier() && (
                <p className="text-red-500 text-sm mt-1">
                  {form.type === 'email' 
                    ? 'Vui lòng nhập địa chỉ email hợp lệ' 
                    : 'Vui lòng nhập số điện thoại 10 chữ số'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !form.identifier || !validateIdentifier()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </button>
          </form>
        )}

        {/* Step 2: Xác thực mã */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode}>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Mã xác thực đã được gửi đến{' '}
                <span className="font-medium">
                  {form.type === 'email' ? form.identifier : `***${form.identifier.slice(-4)}`}
                </span>
              </p>
              <label htmlFor="verificationCode" className="block text-gray-700 font-medium mb-2">
                Nhập mã xác thực (6 chữ số)
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? 'Đang xác thực...' : 'Xác thực mã'}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Quay lại thay đổi email/số điện thoại
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Đặt lại mật khẩu */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-sm mt-1">Mật khẩu xác nhận không khớp</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 text-sm">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
