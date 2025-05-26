import React, { useState } from 'react';
import { Tab } from '@headlessui/react';

/**
 * Interface định nghĩa cấu trúc dữ liệu cài đặt công ty
 */
interface CompanySettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
}

/**
 * Interface định nghĩa cấu trúc dữ liệu cài đặt email
 */
interface EmailSettings {
  smtpServer: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  senderName: string;
  senderEmail: string;
  enableSsl: boolean;
}

/**
 * Interface định nghĩa cấu trúc dữ liệu cài đặt thanh toán
 */
interface PaymentSettings {
  enableCash: boolean;
  enableBankTransfer: boolean;
  enableCreditCard: boolean;
  enableMomo: boolean;
  enableZaloPay: boolean;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
}

/**
 * Interface định nghĩa cấu trúc dữ liệu cài đặt chung
 */
interface GeneralSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
}

/**
 * Component AdminSettings - Quản lý cài đặt hệ thống
 * @returns Giao diện quản lý cài đặt hệ thống với các tab cài đặt khác nhau
 */
const AdminSettings: React.FC = () => {
  // State quản lý cài đặt công ty
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'CleanHome',
    logo: '/logo.png',
    address: '123 Đường ABC, Quận 1, TP. HCM',
    phone: '0123 456 789',
    email: 'info@cleanhome.com',
    website: 'www.cleanhome.com',
    taxId: '0123456789',
  });

  // State quản lý cài đặt email
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'info@cleanhome.com',
    smtpPassword: '********',
    senderName: 'CleanHome Support',
    senderEmail: 'info@cleanhome.com',
    enableSsl: true,
  });

  // State quản lý cài đặt thanh toán
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    enableCash: true,
    enableBankTransfer: true,
    enableCreditCard: false,
    enableMomo: true,
    enableZaloPay: true,
    bankName: 'Vietcombank',
    bankAccount: '1234567890',
    bankAccountName: 'CÔNG TY TNHH CLEANHOME',
  });

  // State quản lý cài đặt chung
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'VND',
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  });

  /**
   * Xử lý thay đổi cài đặt công ty
   */
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanySettings({ ...companySettings, [name]: value });
  };

  /**
   * Xử lý thay đổi cài đặt email
   */
  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEmailSettings({ ...emailSettings, [name]: newValue });
  };

  /**
   * Xử lý thay đổi cài đặt thanh toán
   */
  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setPaymentSettings({ ...paymentSettings, [name]: newValue });
  };

  /**
   * Xử lý thay đổi cài đặt chung
   */
  const handleGeneralChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGeneralSettings({ ...generalSettings, [name]: value });
  };

  /**
   * Xử lý thay đổi ngày làm việc
   */
  const handleWorkingDayChange = (day: string) => {
    const currentDays = [...generalSettings.workingDays];
    if (currentDays.includes(day)) {
      setGeneralSettings({
        ...generalSettings,
        workingDays: currentDays.filter((d) => d !== day),
      });
    } else {
      setGeneralSettings({
        ...generalSettings,
        workingDays: [...currentDays, day],
      });
    }
  };

  /**
   * Xử lý lưu cài đặt
   */
  const handleSaveSettings = (type: string) => {
    // Trong thực tế, đây sẽ là API call để lưu cài đặt
    alert(`Đã lưu cài đặt ${type} thành công!`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Cài đặt hệ thống</h2>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            Thông tin công ty
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            Cài đặt Email
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            Thanh toán
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            Cài đặt chung
          </Tab>
        </Tab.List>
        <Tab.Panels>
          {/* Tab Thông tin công ty */}
          <Tab.Panel>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên công ty
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={companySettings.name}
                  onChange={handleCompanyChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  id="logo"
                  name="logo"
                  value={companySettings.logo}
                  onChange={handleCompanyChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={companySettings.address}
                  onChange={handleCompanyChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={companySettings.phone}
                    onChange={handleCompanyChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={companySettings.email}
                    onChange={handleCompanyChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={companySettings.website}
                    onChange={handleCompanyChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={companySettings.taxId}
                    onChange={handleCompanyChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('công ty')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </Tab.Panel>

          {/* Tab Cài đặt Email */}
          <Tab.Panel>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="smtpServer"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    SMTP Server
                  </label>
                  <input
                    type="text"
                    id="smtpServer"
                    name="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={handleEmailChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    id="smtpPort"
                    name="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={handleEmailChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="smtpUsername"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    id="smtpUsername"
                    name="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={handleEmailChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="smtpPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    id="smtpPassword"
                    name="smtpPassword"
                    value={emailSettings.smtpPassword}
                    onChange={handleEmailChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="senderName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tên người gửi
                  </label>
                  <input
                    type="text"
                    id="senderName"
                    name="senderName"
                    value={emailSettings.senderName}
                    onChange={handleEmailChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="senderEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email người gửi
                  </label>
                  <input
                    type="email"
                    id="senderEmail"
                    name="senderEmail"
                    value={emailSettings.senderEmail}
                    onChange={handleEmailChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableSsl"
                    name="enableSsl"
                    checked={emailSettings.enableSsl}
                    onChange={handleEmailChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="enableSsl" className="ml-2 block text-sm text-gray-700">
                    Bật SSL/TLS
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('email')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </Tab.Panel>

          {/* Tab Thanh toán */}
          <Tab.Panel>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-md font-medium">Phương thức thanh toán</h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCash"
                      name="enableCash"
                      checked={paymentSettings.enableCash}
                      onChange={handlePaymentChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="enableCash" className="ml-2 block text-sm text-gray-700">
                      Tiền mặt
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableBankTransfer"
                      name="enableBankTransfer"
                      checked={paymentSettings.enableBankTransfer}
                      onChange={handlePaymentChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="enableBankTransfer"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Chuyển khoản ngân hàng
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCreditCard"
                      name="enableCreditCard"
                      checked={paymentSettings.enableCreditCard}
                      onChange={handlePaymentChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="enableCreditCard"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Thẻ tín dụng/ghi nợ
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableMomo"
                      name="enableMomo"
                      checked={paymentSettings.enableMomo}
                      onChange={handlePaymentChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="enableMomo" className="ml-2 block text-sm text-gray-700">
                      Ví MoMo
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableZaloPay"
                      name="enableZaloPay"
                      checked={paymentSettings.enableZaloPay}
                      onChange={handlePaymentChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="enableZaloPay" className="ml-2 block text-sm text-gray-700">
                      ZaloPay
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium mb-2">Thông tin tài khoản ngân hàng</h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="bankName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tên ngân hàng
                    </label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={paymentSettings.bankName}
                      onChange={handlePaymentChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="bankAccount"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Số tài khoản
                      </label>
                      <input
                        type="text"
                        id="bankAccount"
                        name="bankAccount"
                        value={paymentSettings.bankAccount}
                        onChange={handlePaymentChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bankAccountName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Tên chủ tài khoản
                      </label>
                      <input
                        type="text"
                        id="bankAccountName"
                        name="bankAccountName"
                        value={paymentSettings.bankAccountName}
                        onChange={handlePaymentChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('thanh toán')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </Tab.Panel>

          {/* Tab Cài đặt chung */}
          <Tab.Panel>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="timezone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Múi giờ
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={generalSettings.timezone}
                    onChange={handleGeneralChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                    <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                    <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="language"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ngôn ngữ
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={generalSettings.language}
                    onChange={handleGeneralChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dateFormat"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Định dạng ngày
                  </label>
                  <select
                    id="dateFormat"
                    name="dateFormat"
                    value={generalSettings.dateFormat}
                    onChange={handleGeneralChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="timeFormat"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Định dạng giờ
                  </label>
                  <select
                    id="timeFormat"
                    name="timeFormat"
                    value={generalSettings.timeFormat}
                    onChange={handleGeneralChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="HH:mm">24 giờ (HH:mm)</option>
                    <option value="hh:mm A">12 giờ (hh:mm AM/PM)</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị tiền tệ
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={generalSettings.currency}
                  onChange={handleGeneralChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="VND">VND (₫)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="workingHoursStart"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Giờ bắt đầu làm việc
                  </label>
                  <input
                    type="time"
                    id="workingHoursStart"
                    name="workingHoursStart"
                    value={generalSettings.workingHoursStart}
                    onChange={handleGeneralChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="workingHoursEnd"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Giờ kết thúc làm việc
                  </label>
                  <input
                    type="time"
                    id="workingHoursEnd"
                    name="workingHoursEnd"
                    value={generalSettings.workingHoursEnd}
                    onChange={handleGeneralChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày làm việc
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'Monday', label: 'Thứ 2' },
                    { id: 'Tuesday', label: 'Thứ 3' },
                    { id: 'Wednesday', label: 'Thứ 4' },
                    { id: 'Thursday', label: 'Thứ 5' },
                    { id: 'Friday', label: 'Thứ 6' },
                    { id: 'Saturday', label: 'Thứ 7' },
                    { id: 'Sunday', label: 'Chủ nhật' },
                  ].map((day) => (
                    <div key={day.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={day.id}
                        checked={generalSettings.workingDays.includes(day.id)}
                        onChange={() => handleWorkingDayChange(day.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor={day.id} className="ml-2 block text-sm text-gray-700">
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('chung')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default AdminSettings;
