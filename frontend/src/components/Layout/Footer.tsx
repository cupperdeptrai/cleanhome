import React from 'react';
import { Link } from 'react-router-dom';


const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CleanHome</h3>
            <p className="text-gray-300">
              Dịch vụ vệ sinh nhà cửa chuyên nghiệp, uy tín hàng đầu Việt Nam.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Trang chủ</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white">Dịch vụ</Link></li>
              <li><Link to="/booking" className="text-gray-300 hover:text-white">Đặt lịch</Link></li>
              <li><Link to="/support" className="text-gray-300 hover:text-white">Hỗ trợ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-300 hover:text-white">Vệ sinh nhà ở</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white">Vệ sinh văn phòng</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white">Vệ sinh sau xây dựng</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white">Giặt thảm, sofa</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Địa chỉ: 123 Đường Nguyễn Khuyến, Quận 1, TP. HCM</li>
              <li>Địa chỉ: 123 Đường Trần Phú, Hà Đông, Hà Nội</li>
              <li>Email: info@cleanhome.vn</li>
              <li>Hotline: 1900 1234</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CleanHome. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
