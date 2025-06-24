import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Interface cho dữ liệu báo cáo xuất Excel
 */
export interface ExcelReportData {
  period: string; // Tháng/Năm
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  inProgressBookings: number;
  totalRevenue: number;
  completionRate: number;
  cancellationRate: number;
  avgRating: number;
  avgOrderValue: number;
  topServices?: string;
  customerRetentionRate?: number;
}

/**
 * Interface cho tổng kết doanh số
 */
export interface BusinessSummary {
  reportPeriod: string;
  totalData: {
    totalBookings: number;
    totalRevenue: number;
    totalCompleted: number;
    totalCancelled: number;
    avgRating: number;
    completionRate: number;
    cancellationRate: number;
    avgOrderValue: number;
  };
  periodData: ExcelReportData[];
  insights: {
    bestPeriod: string;
    worstPeriod: string;
    growthRate: number;
    trends: string[];
  };
}

/**
 * Xuất báo cáo Excel theo tháng hoặc năm
 */
export const exportBusinessReport = (
  data: BusinessSummary,
  reportType: 'monthly' | 'yearly',
  selectedPeriod: number // Năm cho monthly report, hoặc range năm cho yearly
) => {
  const workbook = XLSX.utils.book_new();
  
  // Sheet 1: Tổng quan
  const summaryData = [
    ['BÁO CÁO TỔNG KẾT DOANH SỐ', '', '', ''],
    ['Loại báo cáo:', reportType === 'monthly' ? `Theo tháng năm ${selectedPeriod}` : 'Theo năm', '', ''],
    ['Ngày xuất:', new Date().toLocaleDateString('vi-VN'), '', ''],
    ['', '', '', ''],
    ['TỔNG QUAN DOANH SỐ', '', '', ''],
    ['Chỉ số', 'Giá trị', 'Đơn vị', 'Ghi chú'],
    ['Tổng số đơn hàng', data.totalData.totalBookings, 'đơn', ''],
    ['Tổng doanh thu', data.totalData.totalRevenue, 'VNĐ', formatCurrency(data.totalData.totalRevenue)],
    ['Đơn hàng hoàn thành', data.totalData.totalCompleted, 'đơn', ''],
    ['Đơn hàng hủy', data.totalData.totalCancelled, 'đơn', ''],
    ['Tỷ lệ hoàn thành', data.totalData.completionRate, '%', `${data.totalData.completionRate.toFixed(2)}%`],
    ['Tỷ lệ hủy đơn', data.totalData.cancellationRate, '%', `${data.totalData.cancellationRate.toFixed(2)}%`],
    ['Đánh giá trung bình', data.totalData.avgRating, '/5', `${data.totalData.avgRating.toFixed(1)}/5 sao`],
    ['Giá trị đơn hàng TB', data.totalData.avgOrderValue, 'VNĐ', formatCurrency(data.totalData.avgOrderValue)],
    ['', '', '', ''],
    ['PHÂN TÍCH XU HƯỚNG', '', '', ''],
    [reportType === 'monthly' ? 'Tháng tốt nhất:' : 'Năm tốt nhất:', data.insights.bestPeriod, '', ''],
    [reportType === 'monthly' ? 'Tháng thấp nhất:' : 'Năm thấp nhất:', data.insights.worstPeriod, '', ''],
    ['Tỷ lệ tăng trưởng:', `${data.insights.growthRate.toFixed(2)}%`, '', ''],
  ];

  // Thêm các xu hướng
  data.insights.trends.forEach((trend, index) => {
    summaryData.push([`Xu hướng ${index + 1}:`, trend, '', '']);
  });

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Định dạng cột
  summarySheet['!cols'] = [
    { width: 25 },
    { width: 20 },
    { width: 15 },
    { width: 30 }
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

  // Sheet 2: Chi tiết theo từng kỳ
  const detailHeaders = [
    reportType === 'monthly' ? 'Tháng' : 'Năm',
    'Tổng đơn hàng',
    'Đơn hoàn thành', 
    'Đơn hủy',
    'Đơn đang xử lý',
    'Doanh thu (VNĐ)',
    'Tỷ lệ hoàn thành (%)',
    'Tỷ lệ hủy (%)',
    'Đánh giá TB',
    'Giá trị đơn TB (VNĐ)',
    'Dịch vụ phổ biến',
    'Tỷ lệ khách quay lại (%)'
  ];

  const detailData = [detailHeaders];
    data.periodData.forEach(item => {
    detailData.push([
      item.period,
      item.totalBookings.toString(),
      item.completedBookings.toString(),
      item.cancelledBookings.toString(),
      item.inProgressBookings.toString(),
      item.totalRevenue.toString(),
      item.completionRate.toFixed(2),
      item.cancellationRate.toFixed(2),
      item.avgRating.toFixed(1),
      item.avgOrderValue.toString(),
      item.topServices || 'N/A',
      (item.customerRetentionRate || 0).toString()
    ]);
  });

  const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
  
  // Định dạng cột cho sheet chi tiết
  detailSheet['!cols'] = [
    { width: 12 }, // Tháng/Năm
    { width: 12 }, // Tổng đơn
    { width: 12 }, // Hoàn thành
    { width: 10 }, // Hủy
    { width: 12 }, // Đang xử lý
    { width: 15 }, // Doanh thu
    { width: 15 }, // Tỷ lệ hoàn thành
    { width: 12 }, // Tỷ lệ hủy
    { width: 12 }, // Đánh giá
    { width: 15 }, // Giá trị đơn TB
    { width: 20 }, // Dịch vụ phổ biến
    { width: 18 }  // Tỷ lệ khách quay lại
  ];

  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Chi tiết dữ liệu');

  // Sheet 3: Biểu đồ dữ liệu (cho việc tạo chart trong Excel)
  const chartData = [
    ['Kỳ báo cáo', 'Doanh thu', 'Số đơn hàng', 'Tỷ lệ hoàn thành'],
    ...data.periodData.map(item => [
      item.period,
      item.totalRevenue,
      item.totalBookings,
      item.completionRate
    ])
  ];

  const chartSheet = XLSX.utils.aoa_to_sheet(chartData);
  chartSheet['!cols'] = [
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 18 }
  ];

  XLSX.utils.book_append_sheet(workbook, chartSheet, 'Dữ liệu biểu đồ');

  // Tạo tên file
  const fileName = reportType === 'monthly' 
    ? `BaoCao_DoanhSo_Thang_${selectedPeriod}_${new Date().getFullYear()}.xlsx`
    : `BaoCao_DoanhSo_Nam_${new Date().getFullYear()}.xlsx`;

  // Xuất file
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  saveAs(blob, fileName);
};

/**
 * Format tiền tệ
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Tính toán insights từ dữ liệu
 */
export const calculateBusinessInsights = (
  data: ExcelReportData[]
): BusinessSummary['insights'] => {
  if (data.length === 0) {
    return {
      bestPeriod: 'N/A',
      worstPeriod: 'N/A',
      growthRate: 0,
      trends: []
    };
  }

  // Tìm kỳ tốt nhất và thấp nhất theo doanh thu
  const bestPeriod = data.reduce((best, current) => 
    current.totalRevenue > best.totalRevenue ? current : best
  );
  
  const worstPeriod = data.reduce((worst, current) => 
    current.totalRevenue < worst.totalRevenue ? current : worst
  );

  // Tính tỷ lệ tăng trưởng (so sánh kỳ đầu và kỳ cuối)
  const growthRate = data.length > 1 
    ? ((data[data.length - 1].totalRevenue - data[0].totalRevenue) / data[0].totalRevenue) * 100
    : 0;

  // Phân tích xu hướng
  const trends: string[] = [];
  
  if (growthRate > 10) {
    trends.push('Doanh thu tăng trưởng mạnh');
  } else if (growthRate > 0) {
    trends.push('Doanh thu tăng trưởng nhẹ');
  } else if (growthRate < -10) {
    trends.push('Doanh thu giảm đáng kể');
  } else {
    trends.push('Doanh thu ổn định');
  }

  const avgCompletionRate = data.reduce((sum, item) => sum + item.completionRate, 0) / data.length;
  if (avgCompletionRate > 90) {
    trends.push('Tỷ lệ hoàn thành đơn hàng rất tốt');
  } else if (avgCompletionRate > 80) {
    trends.push('Tỷ lệ hoàn thành đơn hàng tốt');
  } else {
    trends.push('Cần cải thiện tỷ lệ hoàn thành đơn hàng');
  }

  const avgRating = data.reduce((sum, item) => sum + item.avgRating, 0) / data.length;
  if (avgRating > 4.5) {
    trends.push('Chất lượng dịch vụ được đánh giá rất cao');
  } else if (avgRating > 4.0) {
    trends.push('Chất lượng dịch vụ được đánh giá tốt');
  } else {
    trends.push('Cần cải thiện chất lượng dịch vụ');
  }

  return {
    bestPeriod: bestPeriod.period,
    worstPeriod: worstPeriod.period,
    growthRate,
    trends
  };
};
