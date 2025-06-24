import React, { InputHTMLAttributes } from 'react';

/**
 * Component Input tùy chỉnh với các thuộc tính mở rộng
 * @param label - Nhãn của trường input
 * @param error - Thông báo lỗi (nếu có)
 * @param className - Class CSS bổ sung
 * @param fullwidth - Nếu true, input sẽ chiếm toàn bộ chiều rộng
 * @param props - Các thuộc tính HTML input khác
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  fullwidth?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '',
  fullwidth = false,
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`px-4 py-3 rounded-md border ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 ${fullwidth ? 'w-full' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
