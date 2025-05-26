import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Service } from '../../types';

/**
 * Trang Quản lý Dịch vụ - Hiển thị danh sách dịch vụ và cho phép thêm/sửa/xóa
 * @returns Trang quản lý dịch vụ
 */
const Services: React.FC = () => {
  // Dữ liệu mẫu cho danh sách dịch vụ
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Vệ sinh nhà cửa cơ bản',
      description: 'Dịch vụ vệ sinh nhà cửa cơ bản bao gồm quét dọn, lau chùi, vệ sinh phòng tắm và nhà bếp.',
      price: 250000,
      duration: 120,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Nhà cửa',
      isActive: true
    },
    {
      id: '2',
      name: 'Vệ sinh nhà cửa cao cấp',
      description: 'Dịch vụ vệ sinh nhà cửa cao cấp bao gồm tất cả các dịch vụ cơ bản cộng với vệ sinh sâu, đánh bóng sàn, vệ sinh rèm cửa.',
      price: 450000,
      duration: 240,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Nhà cửa',
      isActive: true
    },
    {
      id: '3',
      name: 'Vệ sinh văn phòng',
      description: 'Dịch vụ vệ sinh văn phòng chuyên nghiệp, đảm bảo môi trường làm việc sạch sẽ, thoáng mát.',
      price: 350000,
      duration: 180,
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Văn phòng',
      isActive: true
    },
    {
      id: '4',
      name: 'Vệ sinh điều hòa',
      description: 'Dịch vụ vệ sinh, bảo dưỡng điều hòa giúp máy hoạt động hiệu quả, tiết kiệm điện.',
      price: 200000,
      duration: 60,
      image: 'https://images.unsplash.com/photo-1552255349-450c59a5ec8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Thiết bị',
      isActive: true
    },
    {
      id: '5',
      name: 'Vệ sinh tủ lạnh',
      description: 'Dịch vụ vệ sinh tủ lạnh chuyên nghiệp, loại bỏ mùi hôi, vi khuẩn.',
      price: 150000,
      duration: 45,
      image: 'https://images.unsplash.com/photo-1536353284924-9220c464e262?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Thiết bị',
      isActive: false
    },
    {
      id: '6',
      name: 'Phun khử khuẩn',
      description: 'Dịch vụ phun khử khuẩn, diệt vi khuẩn, virus giúp bảo vệ sức khỏe gia đình bạn.',
      price: 300000,
      duration: 90,
      image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Đặc biệt',
      isActive: true
    }
  ]);

  // State cho modal thêm/sửa dịch vụ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Danh sách các danh mục dịch vụ
  const categories = ['Nhà cửa', 'Văn phòng', 'Thiết bị', 'Đặc biệt'];

  // Mở modal thêm dịch vụ mới
  const handleAddService = () => {
    setCurrentService({
      id: '',
      name: '',
      description: '',
      price: 0,
      duration: 0,
      image: '',
      category: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa dịch vụ
  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setIsModalOpen(true);
  };

  // Xử lý xóa dịch vụ
  const handleDeleteService = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
      setServices(services.filter(service => service.id !== id));
    }
  };

  // Xử lý thay đổi trạng thái dịch vụ
  const handleToggleStatus = (id: string) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, isActive: !service.isActive } : service
    ));
  };

  // Lọc dịch vụ theo tìm kiếm và danh mục
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý dịch vụ</h1>
          <button
            onClick={handleAddService}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm dịch vụ mới
          </button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="mt-6 bg-white shadow rounded-lg p-4">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách dịch vụ */}
        <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={service.image} alt={service.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.price.toLocaleString()}đ</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.duration} phút</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditService(service)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(service.id)}
                        className={`${
                          service.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        } mr-3`}
                      >
                        {service.isActive ? 'Tạm ngưng' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredServices.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              Không tìm thấy dịch vụ nào phù hợp với tìm kiếm của bạn.
            </div>
          )}
        </div>
      </div>

      {/* Modal thêm/sửa dịch vụ */}
      {isModalOpen && currentService && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {currentService.id ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Tên dịch vụ
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentService.name}
                          onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Mô tả
                        </label>
                        <textarea
                          id="description"
                          rows={3}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentService.description}
                          onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                        ></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Giá (VNĐ)
                          </label>
                          <input
                            type="number"
                            id="price"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={currentService.price}
                            onChange={(e) => setCurrentService({ ...currentService, price: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                            Thời gian (phút)
                          </label>
                          <input
                            type="number"
                            id="duration"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={currentService.duration}
                            onChange={(e) => setCurrentService({ ...currentService, duration: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Danh mục
                        </label>
                        <select
                          id="category"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={currentService.category}
                          onChange={(e) => setCurrentService({ ...currentService, category: e.target.value })}
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                          URL hình ảnh
                        </label>
                        <input
                          type="text"
                          id="image"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentService.image}
                          onChange={(e) => setCurrentService({ ...currentService, image: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          id="isActive"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={currentService.isActive}
                          onChange={(e) => setCurrentService({ ...currentService, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                          Dịch vụ đang hoạt động
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    // Xử lý lưu dịch vụ
                    if (currentService.id) {
                      // Cập nhật dịch vụ hiện có
                      setServices(services.map(service => 
                        service.id === currentService.id ? currentService : service
                      ));
                    } else {
                      // Thêm dịch vụ mới
                      const newService = {
                        ...currentService,
                        id: Date.now().toString()
                      };
                      setServices([...services, newService]);
                    }
                    setIsModalOpen(false);
                  }}
                >
                  Lưu
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Services;
