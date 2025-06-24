import React from 'react';
import { Link } from 'react-router-dom';
import { useServiceContext } from '../context/ServiceContext';

const Services: React.FC = () => {
  const { services } = useServiceContext();

  // Lấy danh sách dịch vụ đang hoạt động
  const activeServices = services.filter(service => service.isActive);

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Dịch vụ của chúng tôi</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-4">
          Chúng tôi cung cấp đa dạng các dịch vụ vệ sinh chuyên nghiệp, 
          đáp ứng mọi nhu cầu từ nhà ở đến văn phòng công ty.
        </p>
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
          <span>🏆 {activeServices.length} dịch vụ đang hoạt động</span>
          <span>⭐ Đánh giá 4.8/5</span>
          <span>✅ Cam kết chất lượng</span>
        </div>
      </div>

      {/* Services Grid */}
      {activeServices.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
          {activeServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow service-card-fixed">
              <div className="p-6 h-full flex flex-col">
                <div className="mb-4">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
                <div className="mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">{service.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-green-600">{service.price.toLocaleString()}đ</span>
                  <span className="text-sm text-gray-500">⏱ {service.duration} phút</span>
                </div>
                <Link 
                  to={`/booking?service=${service.id}`} 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium inline-block text-center w-full transition-colors"
                >
                  Đặt ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold mb-2">Đang cập nhật dịch vụ</h3>
          <p className="text-gray-600 mb-6">
            Chúng tôi đang chuẩn bị các dịch vụ tuyệt vời cho bạn. Vui lòng quay lại sau!
          </p>
          <Link 
            to="/booking" 
            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium inline-block"
          >
            Liên hệ để biết thêm
          </Link>
        </div>
      )}
    </div>
  );
};

export default Services;
