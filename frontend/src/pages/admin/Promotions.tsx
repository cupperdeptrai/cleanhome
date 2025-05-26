import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Promotion } from '../../types';

/**
 * Trang Quản lý Khuyến mãi - Hiển thị danh sách khuyến mãi và cho phép thêm/sửa/xóa
 * @returns Trang quản lý khuyến mãi
 */
const Promotions: React.FC = () => {
  // Dữ liệu mẫu cho danh sách khuyến mãi
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      code: 'WELCOME20',
      name: 'Chào mừng khách hàng mới',
      description: 'Giảm 20% cho đơn hàng đầu tiên của khách hàng mới',
      discountType: 'percentage',
      discountValue: 20,
      startDate: '2023-06-01',
      endDate: '2023-07-31',
      isActive: true,
      minOrderValue: 300000,
      maxDiscount: 200000,
      usageLimit: 1,
      usageCount: 45
    },
    {
      id: '2',
      code: 'SUMMER50K',
      name: 'Khuyến mãi hè',
      description: 'Giảm 50.000đ cho đơn hàng từ 500.000đ',
      discountType: 'fixed',
      discountValue: 50000,
      startDate: '2023-06-15',
      endDate: '2023-08-31',
      isActive: true,
      minOrderValue: 500000,
      usageLimit: 0,
      usageCount: 78
    },
    {
      id: '3',
      code: 'CLEAN30',
      name: 'Vệ sinh tổng hợp',
      description: 'Giảm 30% cho dịch vụ vệ sinh tổng hợp',
      discountType: 'percentage',
      discountValue: 30,
      startDate: '2023-05-01',
      endDate: '2023-06-30',
      isActive: false,
      minOrderValue: 0,
      maxDiscount: 300000,
      usageLimit: 0,
      usageCount: 120
    },
    {
      id: '4',
      code: 'REFER100K',
      name: 'Giới thiệu bạn bè',
      description: 'Giảm 100.000đ khi giới thiệu bạn bè sử dụng dịch vụ',
      discountType: 'fixed',
      discountValue: 100000,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      isActive: true,
      minOrderValue: 0,
      usageLimit: 5,
      usageCount: 32
    },
    {
      id: '5',
      code: 'WEEKEND15',
      name: 'Cuối tuần vui vẻ',
      description: 'Giảm 15% cho đơn hàng đặt vào cuối tuần',
      discountType: 'percentage',
      discountValue: 15,
      startDate: '2023-06-01',
      endDate: '2023-09-30',
      isActive: true,
      minOrderValue: 200000,
      maxDiscount: 150000,
      usageLimit: 0,
      usageCount: 67
    }
  ]);

  // State cho modal thêm/sửa khuyến mãi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mở modal thêm khuyến mãi mới
  const handleAddPromotion = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setCurrentPromotion({
      id: '',
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      startDate: today,
      endDate: nextMonth.toISOString().split('T')[0],
      isActive: true,
      minOrderValue: 0,
      maxDiscount: undefined,
      usageLimit: 0,
      usageCount: 0
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa khuyến mãi
  const handleEditPromotion = (promotion: Promotion) => {
    setCurrentPromotion(promotion);
    setIsModalOpen(true);
  };

  // Xử lý xóa khuyến mãi
  const handleDeletePromotion = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này không?')) {
      setPromotions(promotions.filter(promotion => promotion.id !== id));
    }
  };

  // Xử lý thay đổi trạng thái khuyến mãi
  const handleToggleStatus = (id: string) => {
    setPromotions(promotions.map(promotion => 
      promotion.id === id ? { ...promotion, isActive: !promotion.isActive } : promotion
    ));
  };

  // Lọc khuyến mãi theo tìm kiếm và trạng thái
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && promotion.isActive) ||
                          (statusFilter === 'inactive' && !promotion.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Kiểm tra xem khuyến mãi có hết hạn chưa
  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  // Định dạng số tiền
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + 'đ';
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý khuyến mãi</h1>
          <button
            onClick={handleAddPromotion}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm khuyến mãi mới
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
                  placeholder="Tìm kiếm theo mã, tên khuyến mãi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách khuyến mãi */}
        <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã khuyến mãi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên & Mô tả
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sử dụng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {promotion.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{promotion.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {promotion.discountType === 'percentage' 
                          ? `${promotion.discountValue}%` 
                          : formatCurrency(promotion.discountValue)
                        }
                      </div>
                      {promotion.minOrderValue > 0 && (
                        <div className="text-xs text-gray-500">
                          Đơn tối thiểu: {formatCurrency(promotion.minOrderValue)}
                        </div>
                      )}
                      {promotion.maxDiscount && (
                        <div className="text-xs text-gray-500">
                          Giảm tối đa: {formatCurrency(promotion.maxDiscount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(promotion.startDate).toLocaleDateString('vi-VN')} - {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
                      </div>
                      {isExpired(promotion.endDate) && (
                        <div className="text-xs text-red-500">Đã hết hạn</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        promotion.isActive 
                          ? isExpired(promotion.endDate) 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {promotion.isActive 
                          ? isExpired(promotion.endDate) 
                            ? 'Hết hạn' 
                            : 'Đang hoạt động' 
                          : 'Tạm ngưng'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{promotion.usageCount} lượt sử dụng</div>
                      {promotion.usageLimit > 0 && (
                        <div className="text-xs">
                          Giới hạn: {promotion.usageLimit} lượt/người
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditPromotion(promotion)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(promotion.id)}
                        className={`${
                          promotion.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        } mr-3`}
                      >
                        {promotion.isActive ? 'Tạm ngưng' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => handleDeletePromotion(promotion.id)}
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
          {filteredPromotions.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              Không tìm thấy khuyến mãi nào phù hợp với tìm kiếm của bạn.
            </div>
          )}
        </div>
      </div>

      {/* Modal thêm/sửa khuyến mãi */}
      {isModalOpen && currentPromotion && (
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
                      {currentPromotion.id ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                          Mã khuyến mãi
                        </label>
                        <input
                          type="text"
                          id="code"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentPromotion.code}
                          onChange={(e) => setCurrentPromotion({ ...currentPromotion, code: e.target.value.toUpperCase() })}
                        />
                      </div>
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Tên khuyến mãi
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentPromotion.name}
                          onChange={(e) => setCurrentPromotion({ ...currentPromotion, name: e.target.value })}
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
                          value={currentPromotion.description}
                          onChange={(e) => setCurrentPromotion({ ...currentPromotion, description: e.target.value })}
                        ></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
                            Loại giảm giá
                          </label>
                          <select
                            id="discountType"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={currentPromotion.discountType}
                            onChange={(e) => setCurrentPromotion({ 
                              ...currentPromotion, 
                              discountType: e.target.value as 'percentage' | 'fixed' 
                            })}
                          >
                            <option value="percentage">Phần trăm (%)</option>
                            <option value="fixed">Số tiền cố định</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">
                            Giá trị giảm
                          </label>
                          <input
                            type="number"
                            id="discountValue"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={currentPromotion.discountValue}
                            onChange={(e) => setCurrentPromotion({ 
                              ...currentPromotion, 
                              discountValue: Number(e.target.value) 
                            })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                            Ngày bắt đầu
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={currentPromotion.startDate}
                            onChange={(e) => setCurrentPromotion({ ...currentPromotion, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                            Ngày kết thúc
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={currentPromotion.endDate}
                            onChange={(e) => setCurrentPromotion({ ...currentPromotion, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="minOrderValue" className="block text-sm font-medium text-gray-700">
                            Giá trị đơn hàng tối thiểu
                          </label>
                          <input
                            type="number"
                            id="minOrderValue"
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={currentPromotion.minOrderValue}
                            onChange={(e) => setCurrentPromotion({ 
                              ...currentPromotion, 
                              minOrderValue: Number(e.target.value) 
                            })}
                          />
                        </div>
                        {currentPromotion.discountType === 'percentage' && (
                          <div>
                            <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-700">
                              Giảm tối đa
                            </label>
                            <input
                              type="number"
                              id="maxDiscount"
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={currentPromotion.maxDiscount || ''}
                              onChange={(e) => setCurrentPromotion({ 
                                ...currentPromotion, 
                                maxDiscount: e.target.value ? Number(e.target.value) : undefined 
                              })}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">
                          Giới hạn sử dụng (mỗi người, 0 = không giới hạn)
                        </label>
                        <input
                          type="number"
                          id="usageLimit"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentPromotion.usageLimit}
                          onChange={(e) => setCurrentPromotion({ 
                            ...currentPromotion, 
                            usageLimit: Number(e.target.value) 
                          })}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          id="isActive"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={currentPromotion.isActive}
                          onChange={(e) => setCurrentPromotion({ ...currentPromotion, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                          Khuyến mãi đang hoạt động
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
                    // Xử lý lưu khuyến mãi
                    if (currentPromotion.id) {
                      // Cập nhật khuyến mãi hiện có
                      setPromotions(promotions.map(promotion => 
                        promotion.id === currentPromotion.id ? currentPromotion : promotion
                      ));
                    } else {
                      // Thêm khuyến mãi mới
                      const newPromotion = {
                        ...currentPromotion,
                        id: Date.now().toString(),
                        usageCount: 0
                      };
                      setPromotions([...promotions, newPromotion]);
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

export default Promotions;
