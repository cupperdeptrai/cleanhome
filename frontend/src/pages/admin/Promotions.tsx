import React, { useState } from 'react';
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
  const [typeFilter, setTypeFilter] = useState('all');

  // Hàm reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

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
    
    const matchesType = typeFilter === 'all' || 
                        (typeFilter === 'percentage' && promotion.discountType === 'percentage') ||
                        (typeFilter === 'fixed' && promotion.discountType === 'fixed');
    
    return matchesSearch && matchesStatus && matchesType;
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
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-full space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
            <button
              onClick={handleAddPromotion}
              className="w-full sm:w-auto inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 border border-transparent rounded-lg shadow-sm text-sm lg:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm khuyến mãi mới
            </button>
          </div>

          {/* Bộ lọc và tìm kiếm - Full Width */}
          <div className="bg-white shadow-sm rounded-lg p-3 lg:p-4 border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm khuyến mãi
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 lg:pl-10 pr-3 py-2 text-sm lg:text-base border-gray-300 rounded-md"
                    placeholder="Nhập mã hoặc tên khuyến mãi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="status-filter" className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  id="status-filter"
                  className="block w-full px-3 py-2 text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Lọc theo trạng thái khuyến mãi"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm ngưng</option>
                </select>
              </div>

              <div>
                <label htmlFor="type-filter" className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                  Loại giảm giá
                </label>
                <select
                  id="type-filter"
                  className="block w-full px-3 py-2 text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Tất cả loại</option>
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định</option>
                </select>
              </div>
              
              <div className="flex flex-col justify-end">
                <div className="text-xs lg:text-sm text-gray-500 mb-1 lg:mb-2">
                  Tổng: <span className="font-semibold text-blue-600">{filteredPromotions.length}</span> khuyến mãi
                </div>
                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 text-xs lg:text-sm font-medium"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Danh sách khuyến mãi - Thiết kế compact và dễ thao tác */}
          <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
          {/* Desktop Table View - Thiết kế compact tối ưu */}
          <div className="hidden lg:block">
            {/* Header bảng khuyến mãi được tối ưu cho gọn gàng hơn */}
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  {/* Cột mã khuyến mãi - căn trái tiêu đề theo yêu cầu */}
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">
                    Mã khuyến mãi
                  </th>
                  {/* Cột tên & chi tiết - căn trái tiêu đề theo yêu cầu */}
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80 whitespace-nowrap">
                    Tên & Chi tiết
                  </th>
                  {/* Cột thời gian & trạng thái - căn trái tiêu đề theo yêu cầu */}
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">
                    Thời gian & Trạng thái
                  </th>
                  {/* Cột sử dụng - căn trái tiêu đề theo yêu cầu */}
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">
                    Sử dụng
                  </th>
                  {/* Cột thao tác - căn trái tiêu đề theo yêu cầu */}
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    {/* Cột 1: Mã khuyến mãi - hiển thị compact với thông tin giảm giá */}
                    <td className="px-3 py-3 w-28">
                      <div>
                        <div className="text-sm font-bold text-blue-600">{promotion.code}</div>
                        <div className="text-xs text-gray-900">
                          {promotion.discountType === 'percentage' 
                            ? `${promotion.discountValue}%` 
                            : formatCurrency(promotion.discountValue)
                          }
                        </div>
                        {(promotion.minOrderValue || 0) > 0 && (
                          <div className="text-xs text-gray-500">
                            Tối thiểu: {formatCurrency(promotion.minOrderValue || 0)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Cột 2: Tên & mô tả - hiển thị compact thông tin chi tiết với chiều rộng cố định */}
                    <td className="px-3 py-3 w-80">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                        <div className="text-xs text-gray-500 overflow-hidden max-w-xs">
                          <div className="truncate">{promotion.description}</div>
                        </div>
                        {promotion.maxDiscount && (
                          <div className="text-xs text-orange-600 mt-1">
                            Giảm tối đa: {formatCurrency(promotion.maxDiscount)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Cột 3: Thời gian & trạng thái - hiển thị compact với chiều rộng tăng */}
                    <td className="px-3 py-3 w-40">
                      <div>
                        <div className="text-xs text-gray-900">
                          {new Date(promotion.startDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-900">
                          đến {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="mt-1">
                          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded border ${
                            promotion.isActive 
                              ? isExpired(promotion.endDate) 
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                                : 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {promotion.isActive 
                              ? isExpired(promotion.endDate) 
                                ? 'Hết hạn' 
                                : 'Hoạt động' 
                              : 'Tạm ngưng'
                            }
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Cột 4: Sử dụng - hiển thị compact thống kê sử dụng */}
                    <td className="px-3 py-3 w-20">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{promotion.usageCount} lượt</div>
                        {(promotion.usageLimit || 0) > 0 && (
                          <div className="text-xs text-gray-500">
                            Giới hạn: {promotion.usageLimit}/người
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Cột 5: Thao tác - các nút bấm hình chữ nhật nhỏ gọn dễ thao tác */}
                    <td className="px-3 py-3 w-32">
                      <div className="flex flex-wrap gap-1">
                        {/* === NÚT SỬA KHUYẾN MÃI - nút hình chữ nhật compact === */}
                        <button
                          onClick={() => handleEditPromotion(promotion)}
                          className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium flex items-center gap-1 transition-colors min-w-fit"
                          title="Chỉnh sửa thông tin khuyến mãi"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="hidden xl:inline">Sửa</span>
                        </button>
                        
                        {/* === NÚT KÍCH HOẠT/TẠM NGƯNG KHUYẾN MÃI - nút hình chữ nhật compact === */}
                        <button
                          onClick={() => handleToggleStatus(promotion.id)}
                          className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors min-w-fit ${
                            promotion.isActive 
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={promotion.isActive ? 'Tạm ngưng sử dụng khuyến mãi' : 'Kích hoạt khuyến mãi'}
                        >
                          {promotion.isActive ? (
                            <>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="hidden xl:inline">Ngưng</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 4h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
                              </svg>
                              <span className="hidden xl:inline">Kích hoạt</span>
                            </>
                          )}
                        </button>
                        
                        {/* === NÚT XÓA KHUYẾN MÃI - nút hình chữ nhật compact === */}
                        <button
                          onClick={() => handleDeletePromotion(promotion.id)}
                          className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium flex items-center gap-1 transition-colors min-w-fit"
                          title="Xóa khuyến mãi khỏi hệ thống"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden xl:inline">Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tablet View */}
          <div className="hidden sm:block lg:hidden">
            <div className="p-4 space-y-4">
              {filteredPromotions.map((promotion) => (
                <div key={promotion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{promotion.code}</div>
                      <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded border ${
                        promotion.isActive 
                          ? isExpired(promotion.endDate) 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                            : 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {promotion.isActive 
                          ? isExpired(promotion.endDate) 
                            ? 'Hết hạn' 
                            : 'Hoạt động' 
                          : 'Tạm ngưng'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-500">Mô tả:</div>
                      <div className="text-sm text-gray-900">{promotion.description}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Giảm giá:</div>
                      <div className="text-sm font-medium text-gray-900">
                        {promotion.discountType === 'percentage' 
                          ? `${promotion.discountValue}%` 
                          : formatCurrency(promotion.discountValue)
                        }
                      </div>
                      {(promotion.minOrderValue || 0) > 0 && (
                        <div className="text-xs text-gray-500">
                          Tối thiểu: {formatCurrency(promotion.minOrderValue || 0)}
                        </div>
                      )}
                      {promotion.maxDiscount && (
                        <div className="text-xs text-orange-600">
                          Tối đa: {formatCurrency(promotion.maxDiscount)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-500">Thời gian:</div>
                      <div className="text-sm text-gray-900">
                        {new Date(promotion.startDate).toLocaleDateString('vi-VN')} - {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Sử dụng:</div>
                      <div className="text-sm text-gray-900">
                        {promotion.usageCount} lượt
                        {(promotion.usageLimit || 0) > 0 && ` (Giới hạn: ${promotion.usageLimit}/người)`}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleEditPromotion(promotion)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggleStatus(promotion.id)}
                      className={`${
                        promotion.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      } text-sm font-medium`}
                    >
                      {promotion.isActive ? 'Tạm ngưng' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(promotion.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden">
            <div className="p-4 space-y-4">
              {filteredPromotions.map((promotion) => (
                <div key={promotion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{promotion.code}</div>
                      <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded border ${
                      promotion.isActive 
                        ? isExpired(promotion.endDate) 
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                          : 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {promotion.isActive 
                        ? isExpired(promotion.endDate) 
                          ? 'Hết hạn' 
                          : 'Hoạt động' 
                        : 'Tạm ngưng'
                      }
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-600">{promotion.description}</div>
                  </div>

                  {/* Discount Info */}
                  <div className="mb-3">
                    <div className="text-lg font-semibold text-green-600">
                      {promotion.discountType === 'percentage' 
                        ? `Giảm ${promotion.discountValue}%` 
                        : `Giảm ${formatCurrency(promotion.discountValue)}`
                      }
                    </div>
                    {(promotion.minOrderValue || 0) > 0 && (
                      <div className="text-sm text-gray-500">
                        Đơn tối thiểu: {formatCurrency(promotion.minOrderValue || 0)}
                      </div>
                    )}
                    {promotion.maxDiscount && (
                      <div className="text-sm text-orange-600">
                        Giảm tối đa: {formatCurrency(promotion.maxDiscount)}
                      </div>
                    )}
                  </div>

                  {/* Time and Usage */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">
                      Từ {new Date(promotion.startDate).toLocaleDateString('vi-VN')} đến {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Đã sử dụng: {promotion.usageCount} lượt
                      {(promotion.usageLimit || 0) > 0 && ` (Giới hạn: ${promotion.usageLimit} lượt/người)`}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEditPromotion(promotion)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium text-center"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggleStatus(promotion.id)}
                      className={`${
                        promotion.isActive 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      } px-3 py-2 rounded-md text-sm font-medium text-center`}
                    >
                      {promotion.isActive ? 'Tạm ngưng' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(promotion.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-center"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredPromotions.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              Không tìm thấy khuyến mãi nào phù hợp với tìm kiếm của bạn.
            </div>
          )}
        </div>
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
