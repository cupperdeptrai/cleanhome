import React, { useState, useRef } from 'react';
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Interface định nghĩa props cho component AvatarUpload
interface AvatarUploadProps {
  currentAvatar?: string;        // URL ảnh đại diện hiện tại
  onAvatarChange: (file: File) => void;  // Callback khi user chọn file mới
  isLoading?: boolean;           // Trạng thái đang upload
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  isLoading = false
}) => {
  // State để lưu preview ảnh đã chọn
  const [preview, setPreview] = useState<string | null>(null);
  // Ref để truy cập input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi user chọn file
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra loại file phải là ảnh
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Tạo preview ảnh để hiển thị trước khi upload
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Gọi callback để xử lý upload
    onAvatarChange(file);
  };

  // Kích hoạt file picker khi click
  const handleClick = () => {
    fileInputRef.current?.click();
  };  // Ưu tiên hiển thị preview, nếu không có thì dùng avatar hiện tại  
  // Avatar từ context đã được format với full URL
  const avatarSrc = preview || currentAvatar;
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Hiển thị ảnh đại diện */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Ảnh đại diện"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircleIcon className="w-full h-full text-gray-400" />
          )}
        </div>
        
        {/* Overlay hiển thị khi đang loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        
        {/* Nút upload overlay khi hover */}
        <button
          onClick={handleClick}
          disabled={isLoading}
          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
          type="button"
          title="Thay đổi ảnh đại diện"
          aria-label="Thay đổi ảnh đại diện"
        >
          <PhotoIcon className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </button>
      </div>

      {/* Nút chọn file chính */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        type="button"
      >
        <PhotoIcon className="w-5 h-5" />
        <span>{isLoading ? 'Đang tải lên...' : 'Thay đổi ảnh đại diện'}</span>
      </button>

      {/* Input file ẩn */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Chọn file ảnh đại diện"
        title="Chọn file ảnh đại diện"
      />

      {/* Help text */}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Chọn ảnh JPG, PNG hoặc GIF. Kích thước tối đa 5MB.
      </p>
    </div>
  );
};

export default AvatarUpload;
