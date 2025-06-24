# VNPay Integration - CleanHome

## Tổng quan

VNPay là một trong những cổng thanh toán hàng đầu tại Việt Nam, hỗ trợ thanh toán qua thẻ ngân hàng, ví điện tử và các phương thức thanh toán khác.

## Cấu hình

### Environment Variables

```bash
# VNPay Configuration
VNPAY_TMN_CODE=DEMOMCP0  # Merchant Code (sandbox)
VNPAY_HASH_SECRET=RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ  # Hash Secret (sandbox)
VNPAY_RETURN_URL=http://localhost:5173/payment/return
VNPAY_NOTIFY_URL=http://localhost:5000/api/payments/vnpay/notify
```

### Production Settings

Để sử dụng VNPay production:
1. Đăng ký tài khoản merchant tại [VNPay](https://vnpay.vn)
2. Lấy TMN Code và Hash Secret từ VNPay
3. Cập nhật URLs trong `app/utils/vnpay.py` từ sandbox sang production
4. Cập nhật environment variables

## API Endpoints

### 1. Tạo thanh toán VNPay

```http
POST /api/payments/vnpay/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "booking_id": "uuid-of-booking",
  "bank_code": "NCB"  // Optional
}
```

**Response Success:**
```json
{
  "status": "success",
  "message": "VNPay payment URL created successfully",
  "data": {
    "payment_id": "uuid-of-payment",
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "amount": 100000,
    "order_id": "uuid-of-payment"
  }
}
```

### 2. Xử lý kết quả thanh toán (Return URL)

```http
GET /api/payments/vnpay/return?vnp_Amount=10000000&vnp_BankCode=NCB&...
```

**Response:**
```json
{
  "status": "success",
  "message": "Thanh toán thành công",
  "data": {
    "payment_id": "uuid",
    "order_id": "uuid", 
    "response_code": "00",
    "transaction_no": "14123456",
    "amount": 100000
  }
}
```

### 3. Webhook thông báo (IPN)

```http
POST /api/payments/vnpay/notify
Content-Type: application/x-www-form-urlencoded

vnp_Amount=10000000&vnp_BankCode=NCB&...
```

## Mã ngân hàng hỗ trợ

| Mã | Ngân hàng |
|---|---|
| VIETCOMBANK | Ngân hàng TMCP Ngoại Thương Việt Nam |
| VIETINBANK | Ngân hàng TMCP Công Thương Việt Nam |
| BIDV | Ngân hàng TMCP Đầu tư và Phát triển Việt Nam |
| AGRIBANK | Ngân hàng Nông nghiệp và Phát triển Nông thôn VN |
| TECHCOMBANK | Ngân hàng TMCP Kỹ thương Việt Nam |
| MB | Ngân hàng TMCP Quân đội |
| ACB | Ngân hàng TMCP Á Châu |
| VPBANK | Ngân hàng TMCP Việt Nam Thịnh vượng |
| ... | [Xem đầy đủ trong test_vnpay.py] |

## Response Codes

| Mã | Ý nghĩa |
|---|---|
| 00 | Giao dịch thành công |
| 24 | Khách hàng hủy giao dịch |
| 51 | Tài khoản không đủ số dư |
| 65 | Vượt quá hạn mức giao dịch |
| 75 | Ngân hàng đang bảo trì |
| 99 | Lỗi khác |

## Flow thanh toán

1. **User chọn thanh toán VNPay** → Frontend gọi API `POST /api/payments/vnpay/create`
2. **Backend tạo payment record** và trả về VNPay URL
3. **Frontend redirect user** đến VNPay URL
4. **User thanh toán** trên trang VNPay
5. **VNPay redirect về** Return URL với kết quả
6. **VNPay gửi IPN** đến Notify URL để confirm
7. **Frontend hiển thị** kết quả thanh toán

## Database Schema

```sql
-- Thêm vào bảng payments
ALTER TABLE payments ADD COLUMN vnpay_transaction_no VARCHAR(50);
ALTER TABLE payments ADD COLUMN vnpay_response_code VARCHAR(10);
ALTER TABLE payments ADD COLUMN vnpay_bank_code VARCHAR(20);

-- Cập nhật enum
ALTER TYPE payment_method_enum ADD VALUE 'vnpay';
ALTER TYPE payment_status_enum ADD VALUE 'processing';
```

## Testing

```bash
# Chạy test VNPay
cd backend
python test_vnpay.py

# Migration database
flask db upgrade

# Test với curl
curl -X POST http://localhost:5000/api/payments/vnpay/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{"booking_id": "uuid-here"}'
```

## Security Notes

1. **Hash Secret** phải được bảo mật tuyệt đối
2. **Validate signature** cho mọi response từ VNPay
3. **Check order status** trước khi cập nhật payment
4. **Log tất cả transactions** để audit
5. **Timeout handling** cho các requests tới VNPay

## Frontend Integration

```javascript
// Tạo thanh toán VNPay
const createVNPayPayment = async (bookingId, bankCode) => {
  const response = await fetch('/api/payments/vnpay/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      booking_id: bookingId,
      bank_code: bankCode
    })
  });
  
  const data = await response.json();
  if (data.status === 'success') {
    // Redirect đến VNPay
    window.location.href = data.data.payment_url;
  }
};

// Xử lý return từ VNPay
const handleVNPayReturn = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const responseCode = urlParams.get('vnp_ResponseCode');
  
  if (responseCode === '00') {
    // Thanh toán thành công
    showSuccessMessage('Thanh toán thành công!');
  } else {
    // Thanh toán thất bại
    showErrorMessage('Thanh toán thất bại!');
  }
};
```

## Troubleshooting

### 1. Invalid signature error
- Kiểm tra Hash Secret
- Đảm bảo query string được sort đúng
- Kiểm tra encoding của parameters

### 2. Order not found
- Kiểm tra order_id mapping với payment_id
- Đảm bảo payment record được tạo trước khi redirect

### 3. Amount mismatch
- VNPay yêu cầu amount * 100 (đơn vị: xu)
- Kiểm tra conversion khi tạo và validate

### 4. Sandbox vs Production
- Đảm bảo đúng URLs và credentials
- Test trên sandbox trước khi deploy production
