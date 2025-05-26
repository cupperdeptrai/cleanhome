import React from 'react';
import { Link } from 'react-router-dom';

// Dữ liệu dịch vụ mẫu
const services = [
  {
    id: 1,
    title: 'Vệ sinh nhà ở',
    description: 'Dịch vụ vệ sinh toàn diện cho căn hộ, nhà phố với các gói linh hoạt theo nhu cầu.',
    price: 'Từ 300.000đ',
    duration: '3-5 giờ',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    features: [
      'Quét và lau sàn nhà',
      'Lau chùi bề mặt nội thất',
      'Vệ sinh nhà bếp',
      'Vệ sinh phòng tắm',
      'Hút bụi thảm, ghế sofa',
      'Lau cửa kính, gương'
    ]
  },
  {
    id: 2,
    title: 'Vệ sinh văn phòng',
    description: 'Giải pháp vệ sinh chuyên nghiệp cho văn phòng, công ty với lịch trình linh hoạt.',
    price: 'Từ 15.000đ/m²',
    duration: 'Theo diện tích',
    image: 'https://cleantouch.co.za/wp-content/uploads/2024/01/types-of-commercial-cleaning-services-1.jpg',
    features: [
      'Vệ sinh sàn văn phòng',
      'Lau chùi bàn ghế, tủ kệ',
      'Vệ sinh khu vực bếp',
      'Vệ sinh nhà vệ sinh',
      'Đổ rác và thay túi rác',
      'Lau cửa kính, vách ngăn'
    ]
  },
  {
    id: 3,
    title: 'Vệ sinh sau xây dựng',
    description: 'Dọn dẹp, vệ sinh chuyên sâu sau khi hoàn thành xây dựng hoặc sửa chữa.',
    price: 'Từ 30.000đ/m²',
    duration: 'Theo diện tích',
    image: 'https://th.bing.com/th/id/OIP.AgXNCaCTNYaa6rXbbrm0HwHaE8?w=1200&h=800&rs=1&pid=ImgDetMain',
    features: [
      'Loại bỏ vật liệu xây dựng',
      'Làm sạch bụi xây dựng',
      'Vệ sinh sàn, tường',
      'Làm sạch cửa, cửa sổ',
      'Vệ sinh thiết bị vệ sinh',
      'Làm sạch hệ thống điện, nước'
    ]
  },
  {
    id: 4,
    title: 'Giặt thảm, sofa',
    description: 'Làm sạch chuyên sâu cho thảm, ghế sofa, nệm bằng công nghệ hiện đại.',
    price: 'Từ 300.000đ',
    duration: '2-4 giờ',
    image: 'https://images.unsplash.com/photo-1493150134366-cacb0bdc03fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    features: [
      'Hút bụi chuyên sâu',
      'Xử lý vết bẩn cứng đầu',
      'Giặt bằng máy chuyên dụng',
      'Sấy khô nhanh chóng',
      'Khử mùi, diệt khuẩn',
      'Bảo vệ màu sắc, chất liệu'
    ]
  },
  {
    id: 5,
    title: 'Vệ sinh kính',
    description: 'Làm sạch kính cửa sổ, kính mặt tiền cao tầng với thiết bị chuyên dụng.',
    price: 'Từ 12.000đ/m²',
    duration: 'Theo diện tích',
    image: 'https://sendeurope.com/wp-content/uploads/2023/12/istockphoto-1399143321-612x612-1.jpg',
    features: [
      'Làm sạch kính mặt tiền',
      'Vệ sinh cửa sổ cao tầng',
      'Loại bỏ vết bẩn cứng đầu',
      'Làm sạch khung cửa',
      'Sử dụng thiết bị chuyên dụng',
      'Đảm bảo an toàn tuyệt đối'
    ]
  },
  {
    id: 6,
    title: 'Diệt khuẩn, khử mùi',
    description: 'Dịch vụ diệt khuẩn, khử mùi chuyên nghiệp bằng công nghệ phun sương.',
    price: 'Từ 10.000đ/m²',
    duration: '2-3 giờ',
    image: 'https://fl-i.thgim.com/public/incoming/oi97pj/article50107266.ece/alternates/LANDSCAPE_1200/fl10-cover-jammupng',
    features: [
      'Diệt khuẩn toàn diện',
      'Khử mùi hiệu quả',
      'Sử dụng hóa chất an toàn',
      'Phun sương công nghệ cao',
      'Phòng ngừa vi khuẩn, nấm mốc',
      'An toàn cho người và thú cưng'
    ]
  }
];

const Services: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Dịch vụ của chúng tôi</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          CleanHome cung cấp đa dạng các dịch vụ vệ sinh chuyên nghiệp, 
          đáp ứng mọi nhu cầu từ nhà ở đến văn phòng công ty.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={service.image} 
              alt={service.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <div className="flex justify-between mb-4">
                <div>
                  <span className="text-gray-500 text-sm">Giá:</span>
                  <p className="font-semibold text-blue-600">{service.price}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Thời gian:</span>
                  <p className="font-semibold">{service.duration}</p>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Dịch vụ bao gồm:</h3>
              <ul className="text-gray-600 text-sm mb-4">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start mb-1">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link 
                to="/booking" 
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đặt dịch vụ
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 p-8 rounded-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Bạn cần dịch vụ đặc biệt?</h2>
          <p className="text-gray-600">
            Chúng tôi cung cấp các gói dịch vụ tùy chỉnh theo nhu cầu của bạn.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link 
            to="/support" 
            className="px-6 py-3 bg-white text-blue-600 rounded-lg border border-blue-600 hover:bg-blue-50 text-center"
          >
            Liên hệ tư vấn
          </Link>
          <Link 
            to="/booking" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
          >
            Đặt dịch vụ ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
