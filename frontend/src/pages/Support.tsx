import React from 'react';
// import MainLayout from '../components/Layout/MainLayout';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';

/**
 * Trang Hỗ Trợ - Hiển thị thông tin hỗ trợ và các câu hỏi thường gặp
 * @returns Trang hỗ trợ với các phần FAQ và thông tin liên hệ
 */
const Support = () => {
  // Danh sách các câu hỏi thường gặp
  const faqs = [
    {
      question: 'Làm thế nào để đặt lịch dịch vụ?',
      answer: 'Bạn có thể đặt lịch dịch vụ bằng cách đăng nhập vào tài khoản, chọn dịch vụ mong muốn từ trang Dịch vụ, sau đó nhấn nút "Đặt lịch" và điền thông tin cần thiết.'
    },
    {
      question: 'Tôi có thể hủy hoặc thay đổi lịch đã đặt không?',
      answer: 'Có, bạn có thể hủy hoặc thay đổi lịch đã đặt ít nhất 24 giờ trước thời gian đã hẹn. Vui lòng truy cập trang "Đơn hàng" và chọn đơn hàng cần thay đổi.'
    },
    {
      question: 'Các phương thức thanh toán được chấp nhận?',
      answer: 'Chúng tôi chấp nhận thanh toán bằng tiền mặt, chuyển khoản ngân hàng, và các ví điện tử phổ biến như MoMo, ZaloPay, VNPay.'
    },
    {
      question: 'Làm thế nào để tôi biết nhân viên đã đến?',
      answer: 'Bạn sẽ nhận được thông báo qua ứng dụng và tin nhắn SMS khi nhân viên đang trên đường đến và khi họ đã đến nơi.'
    },
    {
      question: 'Tôi có cần cung cấp dụng cụ vệ sinh không?',
      answer: 'Không, nhân viên của chúng tôi sẽ mang theo tất cả các dụng cụ và hóa chất vệ sinh cần thiết. Bạn chỉ cần đảm bảo họ có thể tiếp cận các khu vực cần vệ sinh.'
    },
    {
      question: 'Dịch vụ của bạn có bảo hành không?',
      answer: 'Có, tất cả các dịch vụ của chúng tôi đều được bảo hành trong vòng 48 giờ. Nếu bạn không hài lòng, chúng tôi sẽ cử nhân viên đến làm lại miễn phí.'
    }
  ];

  return (
    <>
      {/* Banner hỗ trợ */}
      <div className="bg-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Trung tâm hỗ trợ
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-blue-100 sm:text-xl md:mt-5 md:max-w-3xl">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Tìm câu trả lời nhanh chóng hoặc liên hệ với đội ngũ hỗ trợ của chúng tôi.
          </p>
        </div>
      </div>

      {/* Phần tìm kiếm */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bạn cần giúp đỡ về vấn đề gì?</h2>
          <div className="flex">
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi hoặc từ khóa..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Phần câu hỏi thường gặp */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Câu hỏi thường gặp</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Phần liên hệ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h2>
              <p className="text-gray-600 mb-6">
                Không tìm thấy câu trả lời bạn đang tìm kiếm? Vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Điện thoại</p>
                    <p className="text-sm text-gray-600">+84 123 456 789</p>
                    <p className="text-sm text-gray-600">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@cleanhome.vn</p>
                    <p className="text-sm text-gray-600">Phản hồi trong vòng 24 giờ</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Địa chỉ</p>
                    <p className="text-sm text-gray-600">123 Đường ABC, Quận 1</p>
                    <p className="text-sm text-gray-600">TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 bg-gray-50 p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gửi tin nhắn cho chúng tôi</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                  <input type="text" id="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Chủ đề</label>
                  <input type="text" id="subject" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Tin nhắn</label>
                  <textarea id="message" rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div>
                  <Button type="submit" className="w-full">Gửi tin nhắn</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Phần hướng dẫn sử dụng */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Hướng dẫn sử dụng dịch vụ</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4 flex justify-center">
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">1. Đăng ký và đặt lịch</h3>
                <p className="text-gray-600 text-center">
                  Đăng ký tài khoản, chọn dịch vụ phù hợp và đặt lịch theo thời gian bạn mong muốn.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4 flex justify-center">
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">2. Xác nhận và thanh toán</h3>
                <p className="text-gray-600 text-center">
                  Nhận xác nhận đặt lịch và lựa chọn phương thức thanh toán phù hợp với bạn.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 mb-4 flex justify-center">
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">3. Nhận dịch vụ</h3>
                <p className="text-gray-600 text-center">
                  Nhân viên sẽ đến đúng hẹn và thực hiện dịch vụ theo yêu cầu của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Bạn vẫn còn thắc mắc?</span>
            <span className="block text-blue-200">Liên hệ trực tiếp với chúng tôi ngay.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/booking">
                <Button size="lg">Đặt lịch ngay</Button>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a href="tel:+84123456789">
                <Button variant="outline" size="lg" className="bg-white">Gọi ngay</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;
