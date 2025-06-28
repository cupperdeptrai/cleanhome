import React, { useState } from 'react';
import { Service, UpdateServiceDTO, ServiceService } from '../../services/service.service';
import { useServiceContext } from '../../context/ServiceContext';
import { 
  PencilIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Services: React.FC = () => {
  const { services, updateService } = useServiceContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // === STATE CHO MODAL CHỈNH SỬA DỊCH VỤ ===
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<UpdateServiceDTO>({
    name: '',
    description: '',
    price: 0,
    category: '',
    duration: 0,
    isActive: true,
    image: ''
  });
  
  const categories = ['Vệ sinh nhà ở', 'Vệ sinh văn phòng', 'Vệ sinh chuyên sâu'];

  // === XỬ LÝ CHỈNH SỬA DỊCH VỤ ===
  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
      duration: service.duration,
      isActive: service.isActive,
      image: service.image || ''
    });
    setIsEditModalOpen(true);
  };

  // === XỬ LÝ CẬP NHẬT TRẠNG THÁI DỊCH VỤ ===
  const handleToggleStatus = async (service: Service) => {
    const newStatus = !service.isActive;
    const statusText = newStatus ? 'kích hoạt' : 'tạm ngừng';
    
    if (!window.confirm(`Bạn có chắc muốn ${statusText} dịch vụ "${service.name}"?`)) {
      return;
    }

    try {
      const updatedService = await ServiceService.updateService(service.id, { isActive: newStatus });
      updateService(updatedService);
      alert(`Đã ${statusText} dịch vụ "${service.name}" thành công!`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái dịch vụ:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái dịch vụ');
    }
  };

  // === XỬ LÝ LƯU CHỈNH SỬA DỊCH VỤ ===
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentService) return;

    // === VALIDATION DỮ LIỆU ===
    if (!formData.name?.trim()) {
      alert('Vui lòng nhập tên dịch vụ');
      return;
    }
    
    if (!formData.description?.trim()) {
      alert('Vui lòng nhập mô tả dịch vụ');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      alert('Vui lòng nhập giá dịch vụ hợp lệ');
      return;
    }

    try {
      const updatedService = await ServiceService.updateService(currentService.id, formData);
      updateService(updatedService);
      setIsEditModalOpen(false);
      alert('Cập nhật dịch vụ thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật dịch vụ:', error);
      alert('Có lỗi xảy ra khi cập nhật dịch vụ');
    }
  };

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
              </label>              <select
                className="block w-full px-3 py-2 text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
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

        {/* Danh sách dịch vụ - Thiết kế compact và dễ thao tác */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  {/* Cột dịch vụ & hình ảnh - căn trái tiêu đề theo yêu cầu */}
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64 whitespace-nowrap">
                    Dịch vụ
                  </th>
                  {/* Cột mô tả & danh mục - căn trái tiêu đề theo yêu cầu */}
                  <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80 whitespace-nowrap">
                    Mô tả & Danh mục
                  </th>
                  {/* Cột giá & thời gian - căn trái tiêu đề theo yêu cầu */}
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 whitespace-nowrap">
                    Giá & Thời gian
                  </th>
                  {/* Cột trạng thái - căn trái tiêu đề theo yêu cầu */}
                  <th className="hidden lg:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">
                    Trạng thái
                  </th>
                  {/* Cột thao tác - căn trái tiêu đề theo yêu cầu */}
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    {/* Cột dịch vụ - hiển thị hình ảnh và thông tin cơ bản compact với chiều rộng cố định */}
                    <td className="px-3 py-3 w-64">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 lg:h-12 lg:w-12">
                          <img
                            className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg object-cover bg-gray-100"
                            src={service.image || '/default-service.jpg'}
                            alt={service.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/default-service.jpg';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {service.id}
                          </div>
                          {/* Hiển thị danh mục trên mobile */}
                          <div className="sm:hidden text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                            {service.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Cột mô tả & danh mục - hiển thị đầy đủ không cắt bớt với 3 chấm */}
                    <td className="hidden sm:table-cell px-3 py-3 w-80">
                      <div>
                        {/* Hiển thị mô tả đầy đủ, xuống dòng thay vì cắt bớt */}
                        <div className="text-sm text-gray-900 max-w-xs lg:max-w-sm break-words">
                          {service.description}
                        </div>
                        {/* Badge danh mục với style đẹp */}
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-2 inline-block">
                          {service.category}
                        </div>
                      </div>
                    </td>
                    
                    {/* Cột giá & thời gian - hiển thị compact với chiều rộng cố định */}
                    <td className="px-3 py-3 w-36">
                      <div>
                        <div className="text-sm font-semibold text-green-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                        </div>
                        <div className="text-xs text-gray-500">{service.duration} phút</div>
                        {/* Hiển thị trạng thái trên mobile với style đẹp hơn */}
                        <div className="lg:hidden mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${
                            service.isActive 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {service.isActive ? 'Hoạt động' : 'Tạm ngừng'}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Cột trạng thái - chỉ hiển thị trên desktop với style đẹp hơn và chiều rộng cố định */}
                    <td className="hidden lg:table-cell px-3 py-3 w-28">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded border ${
                        service.isActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {service.isActive ? 'Hoạt động' : 'Tạm ngừng'}
                      </span>
                    </td>
                    
                    {/* Cột thao tác - 2 nút trên 1 hàng giống admin/staff */}
                    <td className="px-3 py-3 w-32">
                      <div className="flex justify-center gap-1">
                        {/* === NÚT CHỈNH SỬA DỊCH VỤ - nút hình chữ nhật compact === */}
                        <button 
                          onClick={() => handleEditService(service)}
                          className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Chỉnh sửa dịch vụ"
                          aria-label="Chỉnh sửa dịch vụ"
                        >
                          <PencilIcon className="h-3 w-3" />
                          <span className="sr-only">Sửa</span>
                        </button>
                        
                        {/* === NÚT TẠM NGỪNG/KÍCH HOẠT DỊCH VỤ - nút hình chữ nhật compact === */}
                        <button 
                          onClick={() => handleToggleStatus(service)}
                          className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                            service.isActive 
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={service.isActive ? 'Tạm ngừng dịch vụ' : 'Kích hoạt dịch vụ'}
                          aria-label={`${service.isActive ? 'Tạm ngừng' : 'Kích hoạt'} dịch vụ`}
                        >
                          {/* Hiển thị icon khác nhau tùy theo trạng thái */}
                          {service.isActive ? (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
                            </svg>
                          )}
                          <span className="sr-only">{service.isActive ? 'Tạm ngừng' : 'Kích hoạt'}</span>
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

      {/* === MODAL CHỈNH SỬA DỊCH VỤ === */}
      {isEditModalOpen && currentService && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Chỉnh sửa dịch vụ
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Đóng modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* === TRƯỜNG TÊN DỊCH VỤ === */}
              <div>
                <label htmlFor="service-name" className="block text-sm font-medium text-gray-700">
                  Tên dịch vụ *
                </label>
                <input
                  id="service-name"
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nhập tên dịch vụ"
                />
              </div>

              {/* === TRƯỜNG MÔ TẢ DỊCH VỤ === */}
              <div>
                <label htmlFor="service-description" className="block text-sm font-medium text-gray-700">
                  Mô tả dịch vụ *
                </label>
                <textarea
                  id="service-description"
                  required
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Nhập mô tả chi tiết về dịch vụ"
                />
              </div>

              {/* === TRƯỜNG URL HÌNH ẢNH DỊCH VỤ === */}
              <div>
                <label htmlFor="service-image" className="block text-sm font-medium text-gray-700">
                  URL Hình ảnh dịch vụ
                </label>
                <input
                  id="service-image"
                  type="url"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nhập URL hình ảnh dịch vụ (có thể để trống)
                </p>
                {formData.image && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Xem trước:</p>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="h-20 w-20 object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* === TRƯỜNG GIÁ DỊCH VỤ === */}
              <div>
                <label htmlFor="service-price" className="block text-sm font-medium text-gray-700">
                  Giá dịch vụ (VND) *
                </label>
                <input
                  id="service-price"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                  placeholder="Nhập giá dịch vụ"
                />
              </div>

              {/* === TRƯỜNG DANH MỤC DỊCH VỤ === */}
              <div>
                <label htmlFor="service-category" className="block text-sm font-medium text-gray-700">
                  Danh mục *
                </label>
                <select
                  id="service-category"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  aria-label="Chọn danh mục dịch vụ"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* === TRƯỜNG THỜI GIAN DỊCH VỤ === */}
              <div>
                <label htmlFor="service-duration" className="block text-sm font-medium text-gray-700">
                  Thời gian thực hiện (phút)
                </label>
                <input
                  id="service-duration"
                  type="number"
                  min="0"
                  step="15"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.duration || 0}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                  placeholder="Nhập thời gian thực hiện"
                />
              </div>

              {/* === TRƯỜNG TRẠNG THÁI DỊCH VỤ === */}
              <div>
                <label htmlFor="service-status" className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  id="service-status"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'active'})}
                  aria-label="Chọn trạng thái dịch vụ"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm ngừng</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                {/* === NÚT HỦY MODAL === */}
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                {/* === NÚT LƯU THAY ĐỔI === */}
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
