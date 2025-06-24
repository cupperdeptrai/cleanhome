import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service } from '../services/service.service';
import ServiceService from '../services/service.service';

interface ServiceContextProps {
  services: Service[];
  addService: (service: Service) => void;
  removeService: (id: string) => void;
  updateService: (service: Service) => void;
  refreshServices: () => Promise<void>;
  newServiceBanner: Service | null;
  clearBanner: () => void;
}

const ServiceContext = createContext<ServiceContextProps | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [newServiceBanner, setNewServiceBanner] = useState<Service | null>(null);

  useEffect(() => {
    refreshServices();
  }, []);
  const refreshServices = async () => {
    try {
      const data = await ServiceService.getServices();
      setServices(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách dịch vụ:', error);
      // Có thể set services về array rỗng hoặc giữ nguyên data cũ
      setServices([]);
    }
  };
  const addService = (service: Service) => {
    setServices(prev => [service, ...prev]);
    setNewServiceBanner(service);
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };  const updateService = (updatedService: Service) => {
    console.log('🔄 ServiceContext.updateService - Đang cập nhật dịch vụ:', {
      updatedService: updatedService,
      hasId: !!updatedService?.id,
      id: updatedService?.id,
      name: updatedService?.name,
      image: updatedService?.image,
      isActive: updatedService?.isActive
    });
    
    // Kiểm tra xem updatedService có hợp lệ không
    if (!updatedService || !updatedService.id) {
      console.error('❌ ServiceContext.updateService - Dịch vụ cập nhật không hợp lệ:', updatedService);
      return;
    }
    
    setServices(prev => {
      const newServices = prev.map(service => {
        if (service.id === updatedService.id) {
          console.log('✅ ServiceContext - Tìm thấy và cập nhật dịch vụ:', service.id);
          console.log('📷 ServiceContext - URL ảnh cũ:', service.image);
          console.log('📷 ServiceContext - URL ảnh mới:', updatedService.image);
          return updatedService;
        }
        return service;
      });
      
      console.log('📋 ServiceContext - Số lượng dịch vụ sau cập nhật:', newServices.length);
      return newServices;
    });
  };

  const clearBanner = () => setNewServiceBanner(null);

  return (
    <ServiceContext.Provider value={{ 
      services, 
      addService, 
      removeService, 
      updateService, 
      refreshServices, 
      newServiceBanner, 
      clearBanner 
    }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServiceContext = () => {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useServiceContext must be used within ServiceProvider');
  return ctx;
};
