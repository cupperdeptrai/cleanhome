import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Staff, StaffSchedule } from '../../types';

/**
 * Trang Quản lý Nhân viên - Hiển thị danh sách nhân viên và cho phép quản lý
 * @returns Trang quản lý nhân viên
 */
const StaffManagement: React.FC = () => {
  // Dữ liệu mẫu cho danh sách nhân viên
  const [staffList, setStaffList] = useState<Staff[]>([
    {
      id: '2',
      name: 'Nguyễn Văn X',
      email: 'staff1@example.com',
      role: 'staff',
      phone: '0901234567',
      address: 'Quận 1, TP. HCM',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      skills: ['Vệ sinh nhà cửa', 'Vệ sinh văn phòng', 'Vệ sinh điều hòa'],
      rating: 4.8,
      completedJobs: 156,
      isAvailable: true,
      schedule: [
        {
          date: '2023-06-15',
          timeSlots: [
            { start: '09:00', end: '11:00', bookingId: 'BK-1234' },
            { start: '14:00', end: '16:00', bookingId: 'BK-1240' }
          ]
        }
      ]
    },
    {
      id: '5',
      name: 'Trần Thị Y',
      email: 'staff2@example.com',
      role: 'staff',
      phone: '0912345678',
      address: 'Quận 2, TP. HCM',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      skills: ['Vệ sinh nhà cửa', 'Vệ sinh tủ lạnh', 'Phun khử khuẩn'],
      rating: 4.5,
      completedJobs: 98,
      isAvailable: true,
      schedule: [
        {
          date: '2023-06-14',
          timeSlots: [
            { start: '14:00', end: '16:00', bookingId: 'BK-1235' }
          ]
        }
      ]
    },
    {
      id: '7',
      name: 'Lê Văn Z',
      email: 'staff3@example.com',
      role: 'staff',
      phone: '0923456789',
      address: 'Quận 7, TP. HCM',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      skills: ['Vệ sinh văn phòng', 'Vệ sinh điều hòa'],
      rating: 4.2,
      completedJobs: 75,
      isAvailable: false,
      schedule: [
        {
          date: '2023-06-14',
          timeSlots: [
            { start: '16:30', end: '18:30', bookingId: 'BK-1236' }
          ]
        }
      ]
    },
    {
      id: '10',
      name: 'Phạm Thị W',
      email: 'staff4@example.com',
      role: 'staff',
      phone: '0934567890',
      address: 'Quận 3, TP. HCM',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      skills: ['Vệ sinh nhà cửa', 'Vệ sinh văn phòng'],
      rating: 4.7,
      completedJobs: 120,
      isAvailable: true,
      schedule: []
    },
    {
      id: '11',
      name: 'Hoàng Văn V',
      email: 'staff5@example.com',
      role: 'staff',
      phone: '0945678901',
      address: 'Quận 5, TP. HCM',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      skills: ['Vệ sinh điều hòa', 'Vệ sinh tủ lạnh', 'Phun khử khuẩn'],
      rating: 4.3,
      completedJobs: 85,
      isAvailable: true,
      schedule: []
    }
  ]);

  // State cho modal thêm/sửa nhân viên
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Danh sách các kỹ năng
  const allSkills = ['Vệ sinh nhà cửa', 'Vệ sinh văn phòng', 'Vệ sinh điều hòa', 'Vệ sinh tủ lạnh', 'Phun khử khuẩn'];

  // Mở modal thêm nhân viên mới
  const handleAddStaff = () => {
    setCurrentStaff({
      id: '',
      name: '',
      email: '',
      role: 'staff',
      phone: '',
      address: '',
      avatar: '',
      skills: [],
      rating: 0,
      completedJobs: 0,
      isAvailable: true,
      schedule: []
    });
    setIsModalOpen(true);
  };

  // Mở modal sửa nhân viên
  const handleEditStaff = (staff: Staff) => {
    setCurrentStaff(staff);
    setIsModalOpen(true);
  };

  // Xử lý xóa nhân viên
  const handleDeleteStaff = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
      setStaffList(staffList.filter(staff => staff.id !== id));
    }
  };

  // Xử lý thay đổi trạng thái nhân viên
  const handleToggleStatus = (id: string) => {
    setStaffList(staffList.map(staff => 
      staff.id === id ? { ...staff, isAvailable: !staff.isAvailable } : staff
    ));
  };

  // Mở modal lịch làm việc
  const handleViewSchedule = (staffId: string) => {
    setSelectedStaffId(staffId);
    setIsScheduleModalOpen(true);
  };

  // Lọc nhân viên theo tìm kiếm và kỹ năng
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          staff.phone.includes(searchTerm);
    const matchesSkill = skillFilter === 'all' || staff.skills.includes(skillFilter);
    return matchesSearch && matchesSkill;
  });

  // Lấy lịch làm việc của nhân viên được chọn
  const getStaffSchedule = (staffId: string, date: string): StaffSchedule | undefined => {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return undefined;
    return staff.schedule.find(s => s.date === date);
  };

  // Thêm slot thời gian mới vào lịch làm việc
  const handleAddTimeSlot = (staffId: string, date: string, start: string, end: string) => {
    setStaffList(staffList.map(staff => {
      if (staff.id !== staffId) return staff;
      
      const scheduleIndex = staff.schedule.findIndex(s => s.date === date);
      if (scheduleIndex === -1) {
        // Nếu chưa có lịch cho ngày này, thêm mới
        return {
          ...staff,
          schedule: [
            ...staff.schedule,
            {
              date,
              timeSlots: [{ start, end, bookingId: undefined }]
            }
          ]
        };
      } else {
        // Nếu đã có lịch cho ngày này, thêm slot mới
        const newSchedule = [...staff.schedule];
        newSchedule[scheduleIndex] = {
          ...newSchedule[scheduleIndex],
          timeSlots: [...newSchedule[scheduleIndex].timeSlots, { start, end, bookingId: undefined }]
        };
        return { ...staff, schedule: newSchedule };
      }
    }));
  };

  // Xóa slot thời gian khỏi lịch làm việc
  const handleRemoveTimeSlot = (staffId: string, date: string, index: number) => {
    setStaffList(staffList.map(staff => {
      if (staff.id !== staffId) return staff;
      
      const scheduleIndex = staff.schedule.findIndex(s => s.date === date);
      if (scheduleIndex === -1) return staff;
      
      const newSchedule = [...staff.schedule];
      const newTimeSlots = [...newSchedule[scheduleIndex].timeSlots];
      newTimeSlots.splice(index, 1);
      
      if (newTimeSlots.length === 0) {
        // Nếu không còn slot nào, xóa lịch của ngày này
        newSchedule.splice(scheduleIndex, 1);
      } else {
        newSchedule[scheduleIndex] = {
          ...newSchedule[scheduleIndex],
          timeSlots: newTimeSlots
        };
      }
      
      return { ...staff, schedule: newSchedule };
    }));
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý nhân viên</h1>
          <button
            onClick={handleAddStaff}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm nhân viên mới
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
                  placeholder="Tìm kiếm nhân viên theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              >
                <option value="all">Tất cả kỹ năng</option>
                {allSkills.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách nhân viên */}
        <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kỹ năng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hiệu suất
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
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={staff.avatar} alt={staff.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                          <div className="text-sm text-gray-500">{staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staff.phone}</div>
                      <div className="text-sm text-gray-500">{staff.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {staff.skills.map((skill) => (
                          <span key={skill} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <svg
                              key={rating}
                              className={`h-5 w-5 ${
                                rating < Math.floor(staff.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-1 text-sm text-gray-500">{staff.rating.toFixed(1)}</span>
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                          {staff.completedJobs} công việc hoàn thành
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        staff.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {staff.isAvailable ? 'Đang làm việc' : 'Tạm nghỉ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewSchedule(staff.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Lịch làm việc
                      </button>
                      <button
                        onClick={() => handleEditStaff(staff)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(staff.id)}
                        className={`${
                          staff.isAvailable ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        } mr-3`}
                      >
                        {staff.isAvailable ? 'Tạm nghỉ' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
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
          {filteredStaff.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              Không tìm thấy nhân viên nào phù hợp với tìm kiếm của bạn.
            </div>
          )}
        </div>
      </div>

      {/* Modal thêm/sửa nhân viên */}
      {isModalOpen && currentStaff && (
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
                      {currentStaff.id ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Họ tên
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentStaff.name}
                          onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentStaff.email}
                          onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          id="phone"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentStaff.phone}
                          onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Địa chỉ
                        </label>
                        <input
                          type="text"
                          id="address"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentStaff.address}
                          onChange={(e) => setCurrentStaff({ ...currentStaff, address: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                          URL ảnh đại diện
                        </label>
                        <input
                          type="text"
                          id="avatar"
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={currentStaff.avatar}
                          onChange={(e) => setCurrentStaff({ ...currentStaff, avatar: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Kỹ năng
                        </label>
                        <div className="mt-2 space-y-2">
                          {allSkills.map((skill) => (
                            <div key={skill} className="flex items-center">
                              <input
                                id={`skill-${skill}`}
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={currentStaff.skills.includes(skill)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCurrentStaff({
                                      ...currentStaff,
                                      skills: [...currentStaff.skills, skill]
                                    });
                                  } else {
                                    setCurrentStaff({
                                      ...currentStaff,
                                      skills: currentStaff.skills.filter(s => s !== skill)
                                    });
                                  }
                                }}
                              />
                              <label htmlFor={`skill-${skill}`} className="ml-2 block text-sm text-gray-900">
                                {skill}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="isAvailable"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={currentStaff.isAvailable}
                          onChange={(e) => setCurrentStaff({ ...currentStaff, isAvailable: e.target.checked })}
                        />
                        <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                          Nhân viên đang làm việc
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
                    // Xử lý lưu nhân viên
                    if (currentStaff.id) {
                      // Cập nhật nhân viên hiện có
                      setStaffList(staffList.map(staff => 
                        staff.id === currentStaff.id ? currentStaff : staff
                      ));
                    } else {
                      // Thêm nhân viên mới
                      const newStaff = {
                        ...currentStaff,
                        id: Date.now().toString(),
                        rating: 0,
                        completedJobs: 0,
                        schedule: []
                      };
                      setStaffList([...staffList, newStaff]);
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

      {/* Modal lịch làm việc */}
      {isScheduleModalOpen && selectedStaffId && (
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
                      Lịch làm việc - {staffList.find(s => s.id === selectedStaffId)?.name}
                    </h3>
                    <div className="mt-4">
                      <div className="flex items-center space-x-4">
                        <input
                          type="date"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Lịch làm việc ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</h4>
                        
                        {/* Danh sách các slot thời gian */}
                        <div className="mt-2 space-y-2">
                          {getStaffSchedule(selectedStaffId, selectedDate)?.timeSlots.map((slot, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div>
                                <span className="text-sm font-medium">{slot.start} - {slot.end}</span>
                                {slot.bookingId && (
                                  <span className="ml-2 text-xs text-blue-600">
                                    (Đơn hàng: {slot.bookingId})
                                  </span>
                                )}
                              </div>
                              {!slot.bookingId && (
                                <button
                                  onClick={() => handleRemoveTimeSlot(selectedStaffId, selectedDate, index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}

                          {(!getStaffSchedule(selectedStaffId, selectedDate) || getStaffSchedule(selectedStaffId, selectedDate)?.timeSlots.length === 0) && (
                            <div className="text-sm text-gray-500 italic">
                              Không có lịch làm việc cho ngày này.
                            </div>
                          )}
                        </div>

                        {/* Form thêm slot thời gian mới */}
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-900">Thêm khung giờ làm việc</h4>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <label htmlFor="startTime" className="block text-xs font-medium text-gray-700">
                                Giờ bắt đầu
                              </label>
                              <input
                                type="time"
                                id="startTime"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              />
                            </div>
                            <div>
                              <label htmlFor="endTime" className="block text-xs font-medium text-gray-700">
                                Giờ kết thúc
                              </label>
                              <input
                                type="time"
                                id="endTime"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                            onClick={() => {
                              const startTime = (document.getElementById('startTime') as HTMLInputElement).value;
                              const endTime = (document.getElementById('endTime') as HTMLInputElement).value;
                              if (startTime && endTime) {
                                handleAddTimeSlot(selectedStaffId, selectedDate, startTime, endTime);
                                (document.getElementById('startTime') as HTMLInputElement).value = '';
                                (document.getElementById('endTime') as HTMLInputElement).value = '';
                              }
                            }}
                          >
                            Thêm khung giờ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffManagement;
