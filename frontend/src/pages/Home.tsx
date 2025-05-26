import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
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
      
      {/* <section className="bg-blue-600 text-white rounded-lg p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Dịch vụ vệ sinh nhà cửa chuyên nghiệp</h1>
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
      </section> */}

      {/* Services Section */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Dịch vụ của chúng tôi</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp đa dạng các dịch vụ vệ sinh chuyên nghiệp, 
            đáp ứng mọi nhu cầu từ nhà ở đến văn phòng công ty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Vệ sinh nhà ở',
              description: 'Dịch vụ vệ sinh toàn diện cho căn hộ, nhà phố với các gói linh hoạt theo nhu cầu.',
              icon: '🏠'
            },
            {
              title: 'Vệ sinh văn phòng',
              description: 'Giải pháp vệ sinh chuyên nghiệp cho văn phòng, công ty với lịch trình linh hoạt.',
              icon: '🏢'
            },
            {
              title: 'Vệ sinh sau xây dựng',
              description: 'Dọn dẹp, vệ sinh chuyên sâu sau khi hoàn thành xây dựng hoặc sửa chữa.',
              icon: '🏗️'
            },
            {
              title: 'Giặt thảm, sofa',
              description: 'Làm sạch chuyên sâu cho thảm, ghế sofa, nệm bằng công nghệ hiện đại.',
              icon: '🛋️'
            },
            {
              title: 'Vệ sinh kính',
              description: 'Làm sạch kính cửa sổ, kính mặt tiền cao tầng với thiết bị chuyên dụng.',
              icon: '🪟'
            },
            {
              title: 'Diệt khuẩn, khử mùi',
              description: 'Dịch vụ diệt khuẩn, khử mùi chuyên nghiệp bằng công nghệ phun sương.',
              icon: '🧪'
            }
          ].map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <Link to="/services" className="text-blue-600 hover:text-blue-800 font-medium">
                Tìm hiểu thêm →
              </Link>
            </div>
          ))}
        </div>
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
