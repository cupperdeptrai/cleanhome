import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../../types';
import Card from './Card';
import Button from './Button';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // Format giá tiền theo định dạng tiền tệ Việt Nam
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Format thời gian thực hiện
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} giờ`;
    }
    return `${hours} giờ ${remainingMinutes} phút`;
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="h-48 overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {service.category}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-3">{service.description}</p>
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-bold text-gray-900">{formatPrice(service.price)}</div>
            <div className="text-sm text-gray-500">{formatDuration(service.duration)}</div>
          </div>
          <Link to={`/booking?service=${service.id}`}>
            <Button fullwidth>Đặt lịch ngay</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
