import React, { useState } from 'react';
import { Service } from '../../services/service.service';
import { useServiceContext } from '../../context/ServiceContext';

const Services: React.FC = () => {
  const { services } = useServiceContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const categories = ['Vệ sinh nhà ở', 'Vệ sinh văn phòng', 'Vệ sinh chuyên sâu'];

  // Lọc dịch vụ theo tìm kiếm và danh mục
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-full space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý dịch vụ</h1>
          <button className="w-full sm:w-auto inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 border border-transparent rounded-lg shadow-sm text-sm lg:text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm dịch vụ mới
          </button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="bg-white shadow-sm rounded-lg p-3 lg:p-4 border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm dịch vụ
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Nhập tên hoặc mô tả dịch vụ..."
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 lg:pl-10 pr-3 py-2 text-sm lg:text-base border-gray-300 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <select
                className="block w-full px-3 py-2 text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col justify-end">
              <div className="text-xs lg:text-sm text-gray-500 mb-1 lg:mb-2">
                Tổng: <span className="font-semibold text-blue-600">{filteredServices.length}</span> dịch vụ
              </div>
              <button
                onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
                className="w-full bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 text-xs lg:text-sm font-medium"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách dịch vụ */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th className="hidden sm:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả & Danh mục
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá & Thời gian
                  </th>
                  <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-12 w-12 lg:h-16 lg:w-16">
                          <img
                            className="h-12 w-12 lg:h-16 lg:w-16 rounded-lg object-cover bg-gray-100"
                            src={service.image || '/default-service.jpg'}
                            alt={service.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default-service.jpg';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm lg:text-base font-medium text-gray-900 truncate">
                            {service.name}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-500">
                            ID: {service.id}
                          </div>
                          <div className="sm:hidden text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                            {service.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="hidden sm:table-cell px-4 lg:px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 max-w-xs lg:max-w-sm">
                          {service.description.length > 60 
                            ? `${service.description.substring(0, 60)}...` 
                            : service.description
                          }
                        </div>
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                          {service.category}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <div className="text-sm lg:text-base font-semibold text-green-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                        </div>
                        <div className="text-xs lg:text-sm text-gray-500">{service.duration} phút</div>
                        <div className="lg:hidden mt-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            service.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {service.isActive ? 'Hoạt động' : 'Tạm ngừng'}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="hidden lg:table-cell px-4 lg:px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive ? 'Hoạt động' : 'Tạm ngừng'}
                      </span>
                    </td>
                    
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-xs lg:text-sm font-medium">
                          Sửa
                        </button>
                        
                        <button className={`text-xs lg:text-sm font-medium ${
                          service.isActive 
                            ? 'text-orange-600 hover:text-orange-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}>
                          {service.isActive ? 'Tạm ngừng' : 'Kích hoạt'}
                        </button>
                        
                        <button className="text-red-600 hover:text-red-900 text-xs lg:text-sm font-medium">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <div className="text-lg font-medium mb-2">Không tìm thấy dịch vụ nào</div>
                <div>Thử điều chỉnh bộ lọc để xem thêm kết quả</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
