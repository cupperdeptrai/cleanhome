/**
 * Dữ liệu địa chỉ Việt Nam - tối ưu cho TP Hà Nội và TP.HCM
 * Sử dụng cấu trúc rút gọn để giảm kích thước file
 */

// Interface cho dữ liệu địa chỉ
export interface AddressData {
  id: string;
  name: string;
  districts?: { [key: string]: DistrictData };
  wards?: string[]; // Array của tên phường/xã (rút gọn)
}

export interface DistrictData {
  name: string;
  wards: string[]; // Chỉ lưu tên, không cần id riêng
}

/**
 * Dữ liệu địa chỉ Việt Nam
 * Cấu trúc: { [cityId]: { name, districts: { [districtId]: { name, wards: [wardNames] } } } }
 */
export const vietnamAddressData: { [key: string]: AddressData } = {  // TP Hà Nội - 12 quận, 17 huyện, 1 thị xã
  "hanoi": {
    id: "hanoi",
    name: "Hà Nội",
    districts: {
      // 12 quận nội thành
      "ba-dinh": {
        name: "Ba Đình", 
        wards: [
          "Phúc Xá", "Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Liễu Giai",
          "Nguyễn Trung Trực", "Quán Thánh", "Ngọc Hà", "Điện Biển",
          "Đội Cấn", "Ngọc Khánh", "Kim Mã", "Giảng Võ", "Thành Công"
        ]
      },
      "hoan-kiem": {
        name: "Hoàn Kiếm",
        wards: [
          "Phúc Tấn", "Đồng Xuân", "Hàng Mã", "Hàng Buồm", "Hàng Đào", 
          "Hàng Bồ", "Cửa Đông", "Lý Thái Tổ", "Hàng Bạc", "Hàng Gai",
          "Chương Dương", "Hàng Trống", "Cửa Nam", "Hàng Bông", "Tràng Tiền",
          "Trần Hưng Đạo", "Phan Chu Trinh", "Hàng Bài"
        ]
      },
      "tay-ho": {
        name: "Tây Hồ",
        wards: [
          "Phú Thượng", "Nhật Tân", "Tứ Liên", "Quảng An", "Xuân La",
          "Yên Phụ", "Bưởi", "Thụy Khuê"
        ]
      },
      "long-bien": {
        name: "Long Biên",
        wards: [
          "Thượng Thanh", "Ngọc Thụy", "Giang Biên", "Đức Giang", "Việt Hưng",
          "Gia Thụy", "Ngọc Lâm", "Phúc Lợi", "Bo Đề", "Sài Đồng",
          "Long Biên", "Thạch Bàn", "Phúc Đồng", "Cự Khối"
        ]
      },
      "cau-giay": {
        name: "Cầu Giấy",
        wards: [
          "Nghĩa Đô", "Nghĩa Tân", "Mai Dịch", "Dịch Vọng", "Dịch Vọng Hậu",
          "Quan Hoa", "Yên Hòa", "Trung Hòa", "Mậu Diệm"
        ]
      },
      "dong-da": {
        name: "Đống Đa",
        wards: [
          "Cát Linh", "Văn Miếu", "Quốc Tử Giám", "Láng Thượng", "Ô Chợ Dừa",
          "Văn Chương", "Hàng Bột", "Nam Đồng", "Trung Liệt", "Khương Thượng",
          "Láng Hạ", "Phương Liên", "Thổ Quan", "Phương Mai", "Trung Phụng",
          "Quang Trung", "Trung Tự", "Kim Liên", "Phúc Lợi", "Phúc La",
          "Thịnh Quang"
        ]
      },
      "hai-ba-trung": {
        name: "Hai Bà Trưng",
        wards: [
          "Nguyễn Du", "Bạch Đằng", "Phạm Đình Hổ", "Lê Đại Hành", "Đống Mác",
          "Phố Huế", "Ngọc Lâm", "Phúc Lợi", "Phúc Tân", "Thanh Lương",
          "Thanh Nhàn", "Cầu Dền", "Bách Khoa", "Đồng Nhân", "Vĩnh Tuy",
          "Bạch Mai", "Quỳnh Mai", "Quỳnh Lôi", "Minh Khai", "Trương Định"
        ]
      },
      "hoang-mai": {
        name: "Hoàng Mai",
        wards: [
          "Định Công", "Mai Động", "Tương Mai", "Đại Kim", "Tân Mai",
          "Hoàng Văn Thụ", "Thinh Liệt", "Trần Phú", "Hoàng Liệt",
          "Yên Sở", "Giáp Bát", "Đăng Xá", "Thanh Trì", "Vĩnh Hưng"
        ]
      },
      "thanh-xuan": {
        name: "Thanh Xuân",
        wards: [
          "Thanh Xuân Bắc", "Thanh Xuân Nam", "Thanh Xuân Trung", "Hạ Đình",
          "Khương Đình", "Khương Mai", "Nhân Chính", "Phương Liệt",
          "Thanh Xuân Đông", "Khuông Trung", "Kim Giang"
        ]
      },
      "nam-tu-liem": {
        name: "Nam Từ Liêm",
        wards: [
          "Mễ Trì", "Phú Đô", "Phương Canh", "Mỹ Đình 1", "Mỹ Đình 2",
          "Tây Mỗ", "Phúc Diễn", "Xuân Phương", "Trung Văn", "Cầu Diễn",
          "Mặt Dầu", "Danh Khôi"
        ]
      },
      "bac-tu-liem": {
        name: "Bắc Từ Liêm", 
        wards: [
          "Thượng Cát", "Liên Mạc", "Đông Ngạc", "Đức Thắng", "Thụy Phương",
          "Tây Tựu", "Xuân Đỉnh", "Minh Khai", "Cổ Nhuế 1", "Cổ Nhuế 2",
          "Phương Canh", "Xuân Tảo", "Đông Anh"
        ]
      },
      "ha-dong": {
        name: "Hà Đông",
        wards: [
          "Nguyễn Trãi", "Mộ Lao", "Hà Cầu", "Văn Quán", "Vạn Phúc",
          "Yết Kiêu", "Quang Trung", "La Khê", "Phúc La", "Phú Lãm",
          "Phú Lương", "Hành Tiến", "Kiến Hưng", "Yên Nghĩa"
        ]
      },
      
      // 17 huyện ngoại thành
      "thanh-tri": {
        name: "Thanh Trì",
        wards: [
          "Thanh Trì", "Tam Hiệp", "Thanh Liệt", "Tả Thanh Oai", "Hữu Hoà",
          "Tân Triều", "Yên Mỹ", "Vạn Phúc", "Đại áng", "Vĩnh Quỳnh",
          "Ngũ Hiệp", "Duyên Hà", "Ngọc Hồi", "Vĩnh Hưng", "Linh Đàm"
        ]
      },
      "ba-vi": {
        name: "Ba Vì",
        wards: [
          "Tây Đằng", "Ba Trại", "Cổ Đô", "Tản Hồng", "Vạn Thắng",
          "Châu Sơn", "Phú Sơn", "Minh Châu", "Vật Lại", "Chu Minh",
          "Tòng Bạt", "Cẩm Lĩnh", "Sơn Đà", "Đông Quang", "Tiên Phong",
          "Thái Hòa", "Đồng Thái", "Phú Châu", "Cam Thượng", "Tản Lĩnh",
          "Ba Vì", "Vân Hòa", "Yên Bài", "Khánh Thượng"
        ]
      },
      "dan-phuong": {
        name: "Đan Phượng",
        wards: [
          "Đan Phượng", "Đồng Tháp", "Song Phượng", "Tân Hội", "Tân Lập",
          "Phương Đình", "Trung Châu", "Tư Hiệp", "Thanh Lâm", "Hạ Mỗ",
          "Liên Mạc", "San Hô", "Phùng Xá", "An Khánh", "Tân Ước"
        ]
      },
      "gia-lam": {
        name: "Gia Lâm",
        wards: [
          "Trâu Quỳ", "Gia Lâm", "Lê Chí", "Phù Đổng", "Cát Quế",
          "Ninh Hiệp", "Kim Lan", "Kim Sơn", "Cần Kiệm", "Bát Tràng",
          "Kim Chung", "Thuận Thành", "Vĩnh Ngọc", "Dương Quang",
          "Đông Dư", "Đặng Xá", "Trung Mầu", "Lệ Chi", "Cổ Bi",
          "Nam Sơn", "Kiêu Kỵ", "An Thịnh", "Dương Hà", "Phú Thị"
        ]
      },
      "dong-anh": {
        name: "Đông Anh",
        wards: [
          "Đông Anh", "Xuân Nộn", "Thuỳ Lâm", "Bắc Hồng", "Nguyên Khê",
          "Nam Hồng", "Tiên Dương", "Vân Nội", "Uy Nỗ", "Vân Hà",
          "Cổ Loa", "Hải Bối", "Xuân Canh", "Võng La", "Tầm Xá",
          "Mai Lâm", "Kim Chung", "Liên Hà", "Việt Hùng", "Kim Nỗ",
          "Vĩnh Ngọc", "Cổ Bi", "Hồng Phong"
        ]
      },
      "thuong-tin": {
        name: "Thường Tín",
        wards: [
          "Thường Tín", "Ninh Sở", "Nhị Khê", "Duyên Thái", "Khánh Hà",
          "Hòa Bình", "Văn Bình", "Hiền Giang", "Hồng Vân", "Vân Tảo",
          "Liên Phương", "Văn Phú", "Tự Nhiên", "Tiền Phong", "Hà Hồi",
          "Thư Phú", "Nguyễn Trãi", "Tượng Lĩnh", "Chương Dương", "Tân Minh",
          "Lê Lợi", "Thắng Lợi", "Dũng Tiến", "An Tường", "Minh Cường",
          "Nghiêm Xuyên", "Tô Hiệu", "Vạn Điểm", "Thống Nhất"
        ]
      },
      "thanh-oai": {
        name: "Thanh Oai",
        wards: [
          "Kim Bài", "Thanh Cao", "Thanh Thùy", "Thanh Mai", "Thanh Văn",
          "Đỗ Động", "Kim An", "Kim Thư", "Phương Trung", "Cao Dương",
          "Bích Hòa", "Yên Sở", "Xuân Dương", "Liên Châu", "Cao Viên",
          "Tam Hưng", "Tân Ước", "Bình Minh", "Trung Hòa", "Dân Hòa",
          "Liên Hà"
        ]
      },
      "chuong-my": {
        name: "Chương Mỹ",
        wards: [
          "Chúc Sơn", "Lam Điền", "Tân Tiến", "Nam Phương Tiến", "Hợp Đồng",
          "Trung Hòa", "Tân Lập", "Thủy Xuân Tiên", "Thanh Bình", "Tam Đồng",
          "Ngọc Sơn", "Thượng Vực", "Hương Sơn", "Đông Phương Yên", "Đông Sơn",
          "Quảng Bị", "Phụng Châu", "Tiên Phương", "Đại Yên", "Tốt Động",
          "Hoàng Diệu", "Tân Phú", "Hòa Chính", "Xuân Mai", "Hồng Phong",
          "Đồng Lạc", "Đồng Phú", "Phú Nghĩa", "Trường Yên", "Thụy Hương",
          "Tân Quang Bình"
        ]
      },
      "hoai-duc": {
        name: "Hoài Đức",
        wards: [
          "Trạm Trôi", "Sài Sơn", "Phú Mãn", "An Khánh", "An Thượng",
          "Vân Canh", "Đức Thượng", "Song Phương", "Kim Chung", "Tiền Yên",
          "Vĩnh Yên", "Cát Quế", "La Phù", "Đức Giang", "Minh Khai"
        ]
      },
      "my-duc": {
        name: "Mỹ Đức",
        wards: [
          "Đại Minh", "Hồng Sơn", "Hùng Tiến", "Hợp Tiến", "Bột Xuyên",
          "An Tiến", "Phùng Xá", "An Phú", "Hương Sơn", "Đốc Tín",
          "Phú Lâm", "Tuy Lai", "Hợp Thanh", "Văn Khúc", "Đồng Tâm",
          "Thượng Lâm", "Tân Lập", "Đồng Thành", "Hợp Hòa", "Nhuận Trạch",
          "Lê Thanh", "Xuy Xá", "Phúc Lâm", "Đại Hưng", "Mỹ Đức"
        ]
      },
      "phuc-tho": {
        name: "Phúc Thọ",
        wards: [
          "Phúc Thọ", "Vân Hà", "Xuân Đình", "Sen Phú", "Tam Thuấn",
          "Tam Hiệp", "Hát Môn", "Thanh Đa", "Trạch Mỹ Lộc", "Phúc Hòa",
          "Long Xuyên", "Võng Xuyên", "Xuân Phú", "Phụng Thượng", "Tích Giang",
          "Thanh Xuân", "Thọ Lộc", "Liên Hiệp"
        ]
      },
      "thach-that": {
        name: "Thạch Thất",
        wards: [
          "Thạch Thất", "Bình Phú", "Chàng Sơn", "Cần Kiệm", "Cao Minh",
          "Đại Đồng", "Hạ Bằng", "Hương Ngải", "Liên Sơn", "Kim Quan",
          "Lại Yên", "Phùng Xá", "Tân Xã", "Thạch Hoà", "Thạch Xá",
          "Tiến Xuân", "Tống Trân", "Yên Trung", "Yên Bình", "Bình Yên",
          "Đồng Trúc"
        ]
      },
      "quoc-oai": {
        name: "Quốc Oai",
        wards: [
          "Quốc Oai", "Sài Sơn", "Ngọc Liệp", "Ngọc Mỹ", "Liệp Tuyết",
          "Thạch Thán", "Đông Xuân", "Phú Cát", "Tuyết Nghĩa", "Nghĩa Hương",
          "Cộng Hòa", "Tân Hòa", "Đức Thượng", "Phước Bình", "Yên Sở",
          "Cần Hướng", "Đông Yên", "Hòa Thạch"
        ]
      },
      "phu-xuyen": {
        name: "Phú Xuyên",
        wards: [
          "Phú Xuyên", "Phú Túc", "Phú Yên", "Phú Nghĩa", "Khai Thái",
          "Đại Thắng", "Quang Trung", "Tri Trung", "Đại Xuân", "Bạch Hạ",
          "Phúc Tiến", "Nam Tiến", "Hoàng Long", "Tri Thủy", "Văn Hoàng",
          "Hồng Minh", "Thuần Mỹ", "Trị Quặc", "Sen Chiểu", "Phượng Dực",
          "An Đà", "Quang Lãng", "Phú Lương", "Hạ Môn", "Sơn Hà"
        ]
      },
      "ung-hoa": {
        name: "Ứng Hòa",
        wards: [
          "Vân Đình", "Đại Hưng", "Kim Đường", "Hồng Quang", "Dương Quang",
          "Đồng Tiến", "Phù Lưu", "Đại Cường", "Lưu Hoàng", "Hòa Lâm",
          "Hòa Xá", "Trầm Lộng", "Minh Đức", "Hòa Nam", "Đội Bình",
          "Đông Lỗ", "Phương Tú", "Viên An", "Trung Tú", "Cao Thành",
          "Liên Bạt", "Hòa Phú", "Đông Tiến", "Thạnh Cao", "Tảo Dương Văn",
          "Hồng Phong", "Quảng Phú Cầu", "Trường Thịnh"
        ]
      },
      "me-linh": {
        name: "Mê Linh",
        wards: [
          "Chi Đông", "Đại Thịnh", "Kim Hoa", "Liên Mạc", "Quang Minh",
          "Thanh Lâm", "Tam Đồng", "Tiến Thắng", "Tráng Việt", "Vạn Yên",
          "Chu Phan", "Tiến Thịnh", "Hoàng Kim", "Liên Mạc", "Bắc Hồng",
          "Vân Du", "Hoàng Văn Thụ"
        ]
      },
      "soc-son": {
        name: "Sóc Sơn",
        wards: [
          "Sóc Sơn", "Bắc Sơn", "Minh Trí", "Hồng Kỳ", "Nam Sơn",
          "Trung Giã", "Tân Hưng", "Minh Phú", "Phù Linh", "Bắc Phú",
          "Tân Minh", "Quang Tiến", "Hiền Ninh", "Đức Hoà", "Tiên Dược",
          "Việt Long", "Xuân Giang", "Mai Đình", "Đông Xuân", "Kim Lũ",
          "Phú Cường", "Phú Minh", "Xuân Thu", "Thanh Xuân"
        ]
      },
      
      // 1 thị xã
      "son-tay": {
        name: "Sơn Tây",
        wards: [
          "Lê Lợi", "Phú Thịnh", "Ngô Quyền", "Quang Trung", "Sơn Lộc",
          "Xuân Khanh", "Đường Lâm", "Viên Sơn", "Trung Hưng", "Tam Hưng",
          "Minh Khai", "Cổ Đông", "Kim Sơn", "Sơn Đông", "Đức Thượng"
        ]
      }
    }
  },

  // TP.HCM - 24 quận/huyện
  "ho-chi-minh": {
    id: "ho-chi-minh", 
    name: "TP Hồ Chí Minh",
    districts: {
      // Các quận nội thành
      "quan-1": {
        name: "Quận 1",
        wards: [
          "Tân Định", "Đa Kao", "Bến Nghé", "Bến Thành", "Nguyễn Thái Bình",
          "Phạm Ngũ Lão", "Cầu Ông Lãnh", "Cô Giang", "Nguyễn Cư Trinh", "Cầu Kho"
        ]
      },
      "quan-3": {
        name: "Quận 3",
        wards: [
          "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
          "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
          "Phường 11", "Phường 12", "Phường 13", "Phường 14"
        ]
      },
      "quan-4": {
        name: "Quận 4",
        wards: [
          "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 6",
          "Phường 8", "Phường 9", "Phường 10", "Phường 13", "Phường 14",
          "Phường 15", "Phường 16", "Phường 18"
        ]
      },
      "quan-5": {
        name: "Quận 5",
        wards: [
          "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
          "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
          "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"
        ]
      },
      "quan-6": {
        name: "Quận 6",
        wards: [
          "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
          "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
          "Phường 11", "Phường 12", "Phường 13", "Phường 14"
        ]
      },
      "quan-7": {
        name: "Quận 7",
        wards: [
          "Tân Thuận Đông", "Tân Thuận Tây", "Tân Kiểng", "Tân Hưng",
          "Bình Thuận", "Tân Quy", "Phú Thuận", "Tân Phong", "Tân Phú",
          "Phú Mỹ"
        ]
      },
      "quan-8": {
        name: "Quận 8",
        wards: [
          "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
          "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
          "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"
        ]
      },
      "quan-10": {
        name: "Quận 10",
        wards: [
          "Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 6",
          "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11",
          "Phường 12", "Phường 13", "Phường 14", "Phường 15"
        ]
      },
      "quan-11": {
        name: "Quận 11",
        wards: [
          "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
          "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
          "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"
        ]
      },
      "quan-12": {
        name: "Quận 12",
        wards: [
          "Thạnh Xuân", "Thạnh Lộc", "Hiệp Thành", "Thới An", "Tân Chánh Hiệp",
          "An Phú Đông", "Tân Thới Hiệp", "Trung Mỹ Tây", "Tân Hưng Thuận",
          "Thới Tam Thôn", "Tam Đông", "Thới Hoà", "Đông Hưng Thuận"
        ]
      },
      "go-vap": {
        name: "Gò Vấp",
        wards: [
          "Phường 1", "Phường 3", "Phường 4", "Phường 5", "Phường 6",
          "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11",
          "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17"
        ]
      },
      "tan-binh": {
        name: "Tân Bình",
        wards: [
          "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
          "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10",
          "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"
        ]
      },
      "tan-phu": {
        name: "Tân Phú", 
        wards: [
          "Tân Sơn Nhì", "Tây Thạnh", "Sơn Kỳ", "Tân Quý", "Tân Thành",
          "Phú Thọ Hòa", "Phú Thạnh", "Phú Trung", "Hòa Thạnh", "Hiệp Tân",
          "Hòa Thạnh"
        ]
      },
      "phu-nhuan": {
        name: "Phú Nhuận",
        wards: [
          "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5",
          "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11",
          "Phường 13", "Phường 14", "Phường 15", "Phường 17"
        ]
      },
      "binh-thanh": {
        name: "Bình Thạnh",
        wards: [
          "Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6",
          "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14",
          "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22",
          "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"
        ]
      },
      // Thành phố Thủ Đức (gộp từ quận 2, 9, Thủ Đức cũ)
      "thu-duc": {
        name: "Thủ Đức",
        wards: [
          "Linh Xuân", "Bình Chiểu", "Linh Trung", "Tam Bình", "Tam Phú",
          "Hiệp Bình Phước", "Hiệp Bình Chánh", "Linh Chiểu", "Linh Tây",
          "Linh Đông", "Bình Thọ", "Trường Thọ", "Long Bình", "Long Thạnh Mỹ",
          "Tân Phú", "Hiệp Phú", "Tăng Nhơn Phú A", "Tăng Nhơn Phú B",
          "Phước Long A", "Phước Long B", "Trường Thạnh", "Long Phước",
          "Long Trường", "Phước Bình", "Phú Hữu", "Cát Lái", "Thảo Điền",
          "An Phú", "An Khánh", "Bình An", "Bình Khánh", "Bình Trưng Đông",
          "Bình Trưng Tây", "Thạnh Mỹ Lợi", "An Lợi Đông", "Thủ Thiêm"
        ]
      },
      // Các huyện ngoại thành
      "binh-chanh": {
        name: "Bình Chánh",
        wards: [
          "Tân Túc", "Bình Chánh", "Lê Minh Xuân", "Tân Nhựt", "Tân Kiên",
          "Bình Hưng", "Phạm Văn Hai", "Vĩnh Lộc A", "Vĩnh Lộc B", "Bình Lợi",
          "Lê Minh Xuân", "Tân Quý Tây", "Bình Chánh", "Quy Đức",
          "Đa Phước", "Phong Phú", "An Phú Tây"
        ]
      },
      "nha-be": {
        name: "Nhà Bè",
        wards: [
          "Nhà Bè", "Phước Kiển", "Phước Lộc", "Hiệp Phước",
          "Long Thới", "Phú Xuân", "Đông Hoà"
        ]
      },
      "can-gio": {
        name: "Cần Giờ",
        wards: [
          "Cần Thạnh", "Bình Khánh", "Tam Thôn Hiệp", "An Thới Đông",
          "Thạnh An", "Long Hòa", "Lí Nhơn"
        ]
      },
      "cu-chi": {
        name: "Củ Chi",
        wards: [
          "Củ Chi", "Phú Mỹ Hưng", "An Phú", "Trung Lập Thượng", "An Nhơn Tây",
          "Nhuận Đức", "Phạm Văn Cội", "Phú Hòa Đông", "Trung Lập Hạ",
          "Trung An", "Phước Thạnh", "Phước Hiệp", "Tân An Hội",
          "Phước Vĩnh An", "Thái Mỹ", "Tân Thạnh Tây", "Hòa Phú",
          "Tân Thạnh Đông", "Bình Mỹ", "Tân Phú Trung", "Tân Thông Hội"
        ]
      },
      "hoc-mon": {
        name: "Hóc Môn",
        wards: [
          "Hóc Môn", "Bà Điểm", "Tân Hiệp", "Tân Xuân", "Đông Thạnh",
          "Tân Thới Nhì", "Xuân Thới Sơn", "Tân Xuân", "Xuân Thới Đông",
          "Trung Chánh", "Xuân Thới Thượng", "Bà Điểm"
        ]
      }
    }
  }
};

/**
 * Utility functions để làm việc với dữ liệu địa chỉ
 */

/**
 * Lấy danh sách thành phố
 */
export const getCities = (): Array<{id: string, name: string}> => {
  return Object.keys(vietnamAddressData).map(cityId => ({
    id: cityId,
    name: vietnamAddressData[cityId].name
  }));
};

/**
 * Lấy danh sách quận/huyện theo thành phố
 */
export const getDistricts = (cityId: string): Array<{id: string, name: string}> => {
  const city = vietnamAddressData[cityId];
  if (!city || !city.districts) return [];
  
  return Object.keys(city.districts).map(districtId => ({
    id: districtId,
    name: city.districts![districtId].name
  }));
};

/**
 * Lấy danh sách phường/xã theo quận/huyện
 */
export const getWards = (cityId: string, districtId: string): Array<{id: string, name: string}> => {
  const city = vietnamAddressData[cityId];
  if (!city || !city.districts) return [];
  
  const district = city.districts[districtId];
  if (!district) return [];
  
  return district.wards.map((wardName, index) => ({
    id: `ward-${index}`, // Sinh ID tự động
    name: wardName
  }));
};

/**
 * Tạo địa chỉ đầy đủ từ các thành phần theo định dạng chuẩn Việt Nam
 * Định dạng: Số nhà + Ngách (nếu có) + Ngõ (nếu có) + Đường + Phường + Quận + Thành phố
 */
export const formatFullAddress = (
  houseNumber: string,
  street: string,
  wardName: string,
  districtName: string, 
  cityName: string,
  alley?: string,
  lane?: string,
  specificAddress?: string
): string => {
  const addressParts = [];
  
  // Số nhà (bắt buộc)
  if (houseNumber) {
    addressParts.push(houseNumber);
  }
  
  // Ngách (tùy chọn)
  if (alley) {
    addressParts.push(`ngách ${alley}`);
  }
  
  // Ngõ (tùy chọn)
  if (lane) {
    addressParts.push(`ngõ ${lane}`);
  }
  
  // Tên đường/phố (bắt buộc)
  if (street) {
    addressParts.push(street);
  }
  
  // Địa chỉ cụ thể khác (tòa nhà, tầng...)
  if (specificAddress) {
    addressParts.push(specificAddress);
  }
  
  // Phường/Xã
  if (wardName) {
    addressParts.push(wardName);
  }
  
  // Quận/Huyện  
  if (districtName) {
    addressParts.push(districtName);
  }
  
  // Thành phố
  if (cityName) {
    addressParts.push(cityName);
  }
  
  return addressParts.filter(Boolean).join(', ');
};

/**
 * Tìm tên địa chỉ từ ID
 */
export const getAddressNames = (cityId: string, districtId: string, wardId: string) => {
  const city = vietnamAddressData[cityId];
  if (!city) return { cityName: '', districtName: '', wardName: '' };
  
  const district = city.districts?.[districtId];
  if (!district) return { cityName: city.name, districtName: '', wardName: '' };
  
  const wardIndex = parseInt(wardId.replace('ward-', ''));
  const wardName = district.wards[wardIndex] || '';
  
  return {
    cityName: city.name,
    districtName: district.name,
    wardName: wardName
  };
};
