import { useState, useEffect } from 'react';
import { 
  getCities, 
  getDistricts, 
  getWards, 
  formatFullAddress,
  getAddressNames
} from '../../data/vietnamAddress';

/**
 * Component chọn địa chỉ theo cấu trúc Việt Nam
 * Hỗ trợ Thành phố → Quận/Huyện → Phường/Xã + Địa chỉ chi tiết
 * 
 * Features:
 * - Tải dữ liệu từ file riêng, dễ bảo trì  
 * - Cascading dropdown (chọn thành phố → quận → phường)
 * - Nhập địa chỉ chi tiết: số nhà, ngách, ngõ, đường
 * - Validation đầy đủ thông tin
 * - Auto-format địa chỉ cuối theo định dạng chuẩn VN
 * - TypeScript support đầy đủ
 */

// Interface cho dữ liệu địa chỉ component - EXPORT để dùng ở component khác
export interface AddressValue {
  /** ID thành phố */
  city: string;
  /** ID quận/huyện */  
  district: string;
  /** ID phường/xã */
  ward: string;
  /** Số nhà (ví dụ: số 1, số 123) */
  houseNumber: string;
  /** Ngách (tùy chọn, ví dụ: ngách 6) */
  alley?: string;
  /** Ngõ (tùy chọn, ví dụ: ngõ 1) */
  lane?: string;
  /** Tên đường/phố */
  street: string;
  /** Địa chỉ cụ thể khác (tòa nhà, tầng...) */
  specificAddress?: string;
}

interface AddressSelectorProps {
  /** Giá trị địa chỉ hiện tại */
  value: AddressValue;
  /** Callback khi địa chỉ thay đổi */
  onChange: (address: AddressValue) => void;
  /** Thông báo lỗi hiển thị */
  error?: string;
  /** Có disable component không */
  disabled?: boolean;
}

/**
 * Component AddressSelector chính
 * Tối ưu với dữ liệu từ file riêng và comment tiếng Việt đầy đủ
 */
const AddressSelector = ({ 
  value, 
  onChange, 
  error, 
  disabled = false
}: AddressSelectorProps) => {
  
  // ========== STATE MANAGEMENT ==========
  
  /** State local cho các giá trị đã chọn */
  const [selectedCity, setSelectedCity] = useState(value.city);
  const [selectedDistrict, setSelectedDistrict] = useState(value.district);
  const [selectedWard, setSelectedWard] = useState(value.ward);
  const [houseNumber, setHouseNumber] = useState(value.houseNumber || '');
  const [alley, setAlley] = useState(value.alley || '');
  const [lane, setLane] = useState(value.lane || '');
  const [street, setStreet] = useState(value.street || '');
  const [specificAddress, setSpecificAddress] = useState(value.specificAddress || '');

  /** State cho dữ liệu dropdown options - tải từ file vietnamAddress.ts */
  const [cities] = useState(() => getCities()); // Tải 1 lần khi component mount
  const [districts, setDistricts] = useState<Array<{id: string, name: string}>>([]);
  const [wards, setWards] = useState<Array<{id: string, name: string}>>([]);

  // ========== EFFECT HANDLERS ==========
  
  /**
   * Effect: Đồng bộ state local với props value
   * Chạy khi value prop thay đổi từ bên ngoài component
   */
  useEffect(() => {
    setSelectedCity(value.city);
    setSelectedDistrict(value.district);
    setSelectedWard(value.ward);
    setHouseNumber(value.houseNumber || '');
    setAlley(value.alley || '');
    setLane(value.lane || '');
    setStreet(value.street || '');
    setSpecificAddress(value.specificAddress || '');
  }, [value]);

  /**
   * Effect: Tải danh sách quận/huyện khi thành phố thay đổi
   * Sử dụng cascading logic - reset các cấp dưới khi cấp trên thay đổi
   */
  useEffect(() => {
    if (selectedCity) {
      const districtOptions = getDistricts(selectedCity);
      setDistricts(districtOptions);
      
      // Reset quận/huyện và phường/xã nếu thành phố thay đổi và không hợp lệ
      if (selectedDistrict && !districtOptions.find(d => d.id === selectedDistrict)) {
        setSelectedDistrict('');
        setSelectedWard('');
        setWards([]);
      }
    } else {
      // Nếu không có thành phố, xóa tất cả options cấp dưới
      setDistricts([]);
      setWards([]);
    }
  }, [selectedCity, selectedDistrict]);

  /**
   * Effect: Tải danh sách phường/xã khi quận/huyện thay đổi
   */
  useEffect(() => {
    if (selectedCity && selectedDistrict) {
      const wardOptions = getWards(selectedCity, selectedDistrict);
      setWards(wardOptions);
      
      // Reset phường/xã nếu quận thay đổi và không hợp lệ
      if (selectedWard && !wardOptions.find(w => w.id === selectedWard)) {
        setSelectedWard('');
      }
    } else {
      setWards([]);
    }
  }, [selectedCity, selectedDistrict, selectedWard]);

  // ========== EVENT HANDLERS ==========

  /**
   * Tạo object AddressValue mới với các giá trị hiện tại
   */
  const createNewAddress = (overrides: Partial<AddressValue> = {}): AddressValue => {
    return {
      city: selectedCity,
      district: selectedDistrict,
      ward: selectedWard,
      houseNumber,
      alley: alley || undefined,
      lane: lane || undefined,
      street,
      specificAddress: specificAddress || undefined,
      ...overrides
    };
  };

  /**
   * Xử lý khi thay đổi thành phố
   * Reset tất cả cấp dưới và gọi onChange callback
   */
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedDistrict('');
    setSelectedWard('');
    
    const newAddress = createNewAddress({
      city: cityId,
      district: '',
      ward: ''
    });
    
    onChange(newAddress);
  };

  /**
   * Xử lý khi thay đổi quận/huyện
   * Reset phường/xã và gọi onChange callback
   */
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedWard('');
    
    const newAddress = createNewAddress({
      district: districtId,
      ward: ''
    });
    
    onChange(newAddress);
  };

  /**
   * Xử lý khi thay đổi phường/xã
   */
  const handleWardChange = (wardId: string) => {
    setSelectedWard(wardId);
    
    const newAddress = createNewAddress({
      ward: wardId
    });
    
    onChange(newAddress);
  };

  /**
   * Xử lý khi thay đổi số nhà
   */
  const handleHouseNumberChange = (value: string) => {
    setHouseNumber(value);
    
    const newAddress = createNewAddress({
      houseNumber: value
    });
    
    onChange(newAddress);
  };

  /**
   * Xử lý khi thay đổi ngách
   */
  const handleAlleyChange = (value: string) => {
    setAlley(value);
    
    const newAddress = createNewAddress({
      alley: value || undefined
    });
    
    onChange(newAddress);
  };

  /**
   * Xử lý khi thay đổi ngõ
   */
  const handleLaneChange = (value: string) => {
    setLane(value);
    
    const newAddress = createNewAddress({
      lane: value || undefined
    });
    
    onChange(newAddress);
  };

  /**
   * Xử lý khi thay đổi tên đường
   */
  const handleStreetChange = (value: string) => {
    setStreet(value);
    
    const newAddress = createNewAddress({
      street: value
    });
    
    onChange(newAddress);
  };

  /**
   * Xử lý khi thay đổi địa chỉ cụ thể
   */
  const handleSpecificAddressChange = (value: string) => {
    setSpecificAddress(value);
    
    const newAddress = createNewAddress({
      specificAddress: value || undefined
    });
    
    onChange(newAddress);
  };

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Tạo preview địa chỉ đầy đủ cho user xem trước
   * Chỉ hiển thị khi đã chọn đủ thành phố, quận, phường
   */
  const getAddressPreview = (): string => {
    if (!selectedCity || !selectedDistrict || !selectedWard || !houseNumber || !street) {
      return '';
    }
    
    // Lấy tên đầy đủ từ ID
    const { cityName, districtName, wardName } = getAddressNames(
      selectedCity, 
      selectedDistrict, 
      selectedWard
    );
    
    // Format thành chuỗi địa chỉ hoàn chỉnh
    return formatFullAddress(
      houseNumber,
      street,
      wardName, 
      districtName, 
      cityName,
      alley || undefined,
      lane || undefined,
      specificAddress || undefined
    );
  };

  // ========== RENDER ==========

  return (
    <div className="space-y-4">
      {/* Tiêu đề section địa chỉ */}
      <div className="text-sm font-medium text-gray-700 mb-2">
        📍 Thông tin địa chỉ *
      </div>

      {/* Grid layout cho các trường địa chỉ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dropdown chọn thành phố/tỉnh */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thành phố/Tỉnh *
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={disabled}
            aria-label="Chọn thành phố"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Chọn thành phố/tỉnh --</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown chọn quận/huyện */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quận/Huyện *
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={disabled || !selectedCity}
            aria-label="Chọn quận/huyện"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Chọn quận/huyện --</option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown chọn phường/xã */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phường/Xã *
          </label>
          <select
            value={selectedWard}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={disabled || !selectedDistrict}
            aria-label="Chọn phường/xã"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">-- Chọn phường/xã --</option>
            {wards.map(ward => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thông tin địa chỉ chi tiết */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">
          🏠 Địa chỉ chi tiết *
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Số nhà */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Số nhà *
            </label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => handleHouseNumberChange(e.target.value)}
              placeholder="VD: 123, số 1"
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Ngách (tùy chọn) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Ngách (tùy chọn)
            </label>
            <input
              type="text"
              value={alley}
              onChange={(e) => handleAlleyChange(e.target.value)}
              placeholder="VD: 6, 12"
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Ngõ (tùy chọn) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Ngõ (tùy chọn)
            </label>
            <input
              type="text"
              value={lane}
              onChange={(e) => handleLaneChange(e.target.value)}
              placeholder="VD: 1, 25"
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Tên đường */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên đường/phố *
          </label>
          <input
            type="text"
            value={street}
            onChange={(e) => handleStreetChange(e.target.value)}
            placeholder="VD: Đường Nguyễn Văn Cừ, Phố Hàng Mã"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Địa chỉ cụ thể khác */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thông tin bổ sung (tùy chọn)
          </label>
          <input
            type="text"
            value={specificAddress}
            onChange={(e) => handleSpecificAddressChange(e.target.value)}
            placeholder="VD: Chung cư ABC, Tầng 5, Tòa nhà XYZ"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <div className="text-xs text-gray-500 mt-1">
            💡 Thông tin bổ sung như tên chung cư, tòa nhà, tầng lầu...
          </div>
        </div>
      </div>

      {/* Preview địa chỉ đầy đủ - hiển thị khi đã chọn đủ thông tin */}
      {getAddressPreview() && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="text-sm font-medium text-blue-800 mb-1">
            📍 Địa chỉ đầy đủ:
          </div>
          <div className="text-sm text-blue-700 font-medium">
            {getAddressPreview()}
          </div>
        </div>
      )}

      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <div className="text-sm text-red-600 font-medium">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
