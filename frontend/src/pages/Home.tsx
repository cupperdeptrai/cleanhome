import React from 'react';
import { Link } from 'react-router-dom';
import { useServiceContext } from '../context/ServiceContext';

const Home: React.FC = () => {
  const { newServiceBanner, clearBanner, services } = useServiceContext();

  // Lấy danh sách dịch vụ nổi bật (tối đa 6 dịch vụ đầu tiên)
  const featuredServices = services.filter(service => service.isActive).slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Banner dịch vụ mới */}
      {newServiceBanner && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded relative flex items-center justify-between max-w-3xl mx-auto mt-4">
          <div>
            <strong>Dịch vụ mới:</strong> <span className="font-semibold">{newServiceBanner.name}</span> đã được thêm!
            <span className="ml-2 text-gray-600">{newServiceBanner.description}</span>
          </div>
          <button onClick={clearBanner} className="ml-4 text-green-700 hover:text-green-900 font-bold text-xl" aria-label="Đóng">×</button>
        </div>
      )}
      {/* Hero Section */}

      <section className="relative text-white rounded-lg overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80"
            alt="Dịch vụ vệ sinh"/>
        </div>
        {/* Overlay Layer */}
        <div className="absolute inset-0 z-10 mix-blend-multiply opacity-60"></div>
        {/* Content Layer */}
        <div className="relative z-20 max-w-3xl mx-auto text-center p-8 md:p-12">
          <h1 className="text-gray-600 text-3xl md:text-5xl font-bold mb-6">Dịch vụ vệ sinh nhà cửa chuyên nghiệp</h1>
          <p className="text-lg md:text-xl mb-8">
            Giải pháp vệ sinh toàn diện cho ngôi nhà của bạn với đội ngũ nhân viên chuyên nghiệp, 
            trang thiết bị hiện đại và quy trình làm việc chuẩn quốc tế.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/services" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-lg">
              Xem dịch vụ
            </Link>
            <Link to="/booking" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium text-lg">
              Đặt lịch ngay
            </Link>
          </div>
        </div>
      </section>
      

      {/* Services Section */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Dịch vụ nổi bật</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp đa dạng các dịch vụ vệ sinh chuyên nghiệp, 
            đáp ứng mọi nhu cầu từ nhà ở đến văn phòng công ty.
          </p>
          <div className="mt-4 flex justify-center items-center space-x-6 text-sm text-gray-500">
            <span>🏆 {services.filter(s => s.isActive).length} dịch vụ đang hoạt động</span>
            <span>⭐ Đánh giá 4.8/5</span>
            <span>✅ Cam kết chất lượng</span>
          </div>
        </div>

        {featuredServices.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service) => (
                <div key={service.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
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
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
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
              ))}
            </div>

            {/* Nút xem tất cả nếu có nhiều dịch vụ */}
            {services.filter(service => service.isActive).length > 6 && (
              <div className="text-center mt-8">
                <Link 
                  to="/services" 
                  className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium inline-block transition-colors"
                >
                  Xem tất cả {services.filter(service => service.isActive).length} dịch vụ →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2">Đang cập nhật dịch vụ</h3>
            <p className="text-gray-600 mb-6">
              Chúng tôi đang chuẩn bị các dịch vụ tuyệt vời cho bạn. Vui lòng quay lại sau!
            </p>
            <Link 
              to="/services" 
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium inline-block"
            >
              Xem danh sách dịch vụ
            </Link>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 p-8 rounded-lg">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Quy trình làm việc</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Quy trình đơn giản, minh bạch giúp bạn dễ dàng sử dụng dịch vụ của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Đặt lịch', description: 'Chọn dịch vụ và đặt lịch trực tuyến hoặc qua điện thoại', icon: '📅' },
            { step: 2, title: 'Xác nhận', description: 'Nhân viên sẽ liên hệ xác nhận thông tin và thời gian', icon: '✅' },
            { step: 3, title: 'Thực hiện', description: 'Đội ngũ chuyên nghiệp đến và thực hiện dịch vụ', icon: '🧹' },
            { step: 4, title: 'Nghiệm thu', description: 'Kiểm tra chất lượng và thanh toán sau khi hoàn thành', icon: '👍' }
          ].map((step) => (
            <div key={step.step} className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Khách hàng nói gì về chúng tôi</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sự hài lòng của khách hàng là thước đo thành công của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Nguyễn Văn A',
              role: 'Chủ căn hộ',
              comment: 'Dịch vụ rất chuyên nghiệp, nhân viên làm việc tỉ mỉ và cẩn thận. Tôi rất hài lòng với kết quả.',
              avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            {
              name: 'Trần Thị B',
              role: 'Giám đốc công ty',
              comment: 'Đã sử dụng dịch vụ vệ sinh văn phòng định kỳ và rất hài lòng. Nhân viên chuyên nghiệp, đúng giờ.',
              avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
            },
            {
              name: 'Lê Văn C',
              role: 'Chủ nhà hàng',
              comment: 'Dịch vụ vệ sinh sau xây dựng rất tốt, giúp nhà hàng của tôi sạch sẽ và sẵn sàng đón khách.',
              avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.comment}"</p>
              <div className="mt-4 text-yellow-400">★★★★★</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Sẵn sàng để trải nghiệm dịch vụ?</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
          Đặt lịch ngay hôm nay để nhận ưu đãi đặc biệt dành cho khách hàng mới
        </p>
        <Link to="/booking" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium text-lg inline-block">
          Đặt lịch ngay
        </Link>
      </section>
    </div>
  );
};

export default Home;
