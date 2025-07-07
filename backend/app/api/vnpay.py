# backend/app/api/vnpay.py
"""
API tích hợp VNPay cho dự án CleanHome
Xử lý thanh toán, callback và IPN từ VNPay với support cho các thẻ test
Author: CleanHome Team
"""

import hashlib
import hmac
import urllib.parse
from datetime import datetime
from flask import Blueprint, request, redirect, current_app, jsonify
from ..models.booking import Booking
from ..models.vnpay import VnpayTransaction
from ..models.user import User
from ..utils.vnpay_utils import get_vnpay_response_message, get_user_friendly_message
from .. import db

vnpay_bp = Blueprint('vnpay', __name__, url_prefix='/api/vnpay')

def get_client_ip(request):
    """
    Lấy địa chỉ IP của client
    Ưu tiên lấy từ X-Forwarded-For nếu có (trường hợp đi qua proxy/load balancer)
    """
    if request.headers.getlist("X-Forwarded-For"):
        ip = request.headers.getlist("X-Forwarded-For")[0]
    else:
        ip = request.remote_addr
    return ip

def generate_vnpay_payment_url(booking: Booking, request_context):
    """
    Tạo URL thanh toán VNPay cho một booking cụ thể
    
    Args:
        booking (Booking): Đối tượng booking cần tạo thanh toán
        request_context: Context của request hiện tại để lấy IP và host URL
        
    Returns:
        str: URL thanh toán VNPay hoặc None nếu có lỗi
    """
    try:
        # Lấy cấu hình VNPay từ Flask config
        vnp_TmnCode = current_app.config['VNPAY_TMN_CODE']
        vnp_HashSecret = current_app.config['VNPAY_HASH_SECRET_KEY']
        vnp_Url = current_app.config['VNPAY_URL']
        vnp_ReturnUrl = current_app.config['VNPAY_RETURN_URL']
        
        # Lấy thông tin client
        vnp_IpAddr = get_client_ip(request_context) if request_context else '127.0.0.1'
        # Đảm bảo IP không bị None
        # if not vnp_IpAddr or vnp_IpAddr == 'None':
        #     vnp_IpAddr = '127.0.0.1'
        
        # Tạo mã giao dịch duy nhất
        vnp_TxnRef = f"CH{booking.booking_code}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        vnp_OrderInfo = f"Thanh toan dich vu CleanHome - Ma booking: {booking.booking_code}"
        vnp_Amount = int(booking.total_price * 100)  # VNPay yêu cầu số tiền tính bằng VND * 100
        vnp_Locale = 'vn'  # Ngôn ngữ tiếng Việt
        vnp_CurrCode = 'VND'
        vnp_CreateDate = datetime.now().strftime('%Y%m%d%H%M%S')

        # Tạo dữ liệu gửi đến VNPay
        input_data = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': vnp_TmnCode,
            'vnp_Amount': vnp_Amount,
            'vnp_CurrCode': vnp_CurrCode,
            'vnp_TxnRef': vnp_TxnRef,
            'vnp_OrderInfo': vnp_OrderInfo,
            'vnp_OrderType': 'other',  # Loại đơn hàng: dịch vụ khác
            'vnp_Locale': vnp_Locale,
            'vnp_ReturnUrl': vnp_ReturnUrl,
            'vnp_IpAddr': vnp_IpAddr,
            'vnp_CreateDate': vnp_CreateDate
        }

        # Loại bỏ các tham số có giá trị rỗng hoặc None
        input_data = {k: v for k, v in input_data.items() if v is not None and v != ''}
        
        # Sắp xếp dữ liệu theo thứ tự alphabet
        sorted_data = sorted(input_data.items())
        
        # Tạo query string theo đúng format VNPay
        query_string = '&'.join([f"{key}={urllib.parse.quote_plus(str(value))}" for key, value in sorted_data])
        
        # Tạo chữ ký bảo mật HMAC-SHA512
        secure_hash = hmac.new(vnp_HashSecret.encode('utf-8'), query_string.encode('utf-8'), hashlib.sha512).hexdigest()
        
        # Tạo URL thanh toán hoàn chỉnh
        payment_url = vnp_Url + "?" + query_string + '&vnp_SecureHash=' + secure_hash

        # Tạo bản ghi giao dịch mới trong database
        new_transaction = VnpayTransaction(
            booking_id=booking.id,
            user_id=booking.user_id,
            vnp_txnref=vnp_TxnRef,
            vnp_amount=booking.total_price,
            vnp_orderinfo=vnp_OrderInfo
        )
        db.session.add(new_transaction)
        
        current_app.logger.info(f"Tạo URL thanh toán VNPay cho booking {booking.booking_code}: {payment_url}")
        return payment_url
        
    except Exception as e:
        current_app.logger.error(f"Lỗi khi tạo URL thanh toán VNPay: {e}")
        return None

@vnpay_bp.route('/create_payment_url', methods=['POST'])
def create_payment_url():
    """
    API tạo URL thanh toán VNPay cho một booking đã có
    Method: POST
    Body: {"booking_id": "uuid"}
    """
    try:
        data = request.get_json()
        booking_id = data.get('booking_id')
        
        if not booking_id:
            return jsonify({
                'status': 'error', 
                'message': 'Thiếu thông tin booking_id'
            }), 400

        # Tìm booking theo ID
        booking = Booking.query.get_or_404(booking_id)

        # Kiểm tra trạng thái thanh toán hiện tại
        if booking.payment_status == 'paid':
            return jsonify({
                'status': 'error', 
                'message': 'Đơn hàng này đã được thanh toán thành công'
            }), 400

        # Cho phép thử lại thanh toán nếu trạng thái là 'unpaid' hoặc 'failed'
        if booking.payment_status not in ['unpaid', 'failed']:
            return jsonify({
                'status': 'error', 
                'message': f'Không thể thanh toán cho đơn hàng có trạng thái: {booking.payment_status}'
            }), 400

        # Cập nhật trạng thái thanh toán về 'pending' khi bắt đầu thanh toán mới
        booking.payment_status = 'pending'
        booking.payment_method = 'vnpay'
        
        # Tạo URL thanh toán VNPay
        payment_url = generate_vnpay_payment_url(booking, request)

        if payment_url:
            db.session.commit()  # Commit cả booking và transaction
            return jsonify({
                'status': 'success',
                'payment_url': payment_url,
                'message': 'Tạo URL thanh toán thành công'
            })
        else:
            db.session.rollback()
            # Trả lại trạng thái cũ nếu tạo URL thất bại
            booking.payment_status = 'unpaid'
            return jsonify({
                'status': 'error', 
                'message': 'Lỗi khi tạo URL thanh toán VNPay'
            }), 500
            
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi trong API create_payment_url: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Lỗi hệ thống, vui lòng thử lại sau'
        }), 500

@vnpay_bp.route('/vnpay_return', methods=['GET'])
def vnpay_return():
    """
    Xử lý callback khi khách hàng quay lại từ VNPay sau khi thanh toán
    VNPay sẽ redirect khách hàng về URL này kèm theo kết quả thanh toán
    """
    try:
        input_data = request.args.to_dict()
        current_app.logger.info(f"VNPay return callback nhận được: {input_data}")
        
        # Lấy chữ ký bảo mật từ VNPay
        vnp_SecureHash = input_data.pop('vnp_SecureHash', None)
        
        if not vnp_SecureHash:
            current_app.logger.error("Thiếu vnp_SecureHash trong VNPay return")
            return redirect(f"{current_app.config['CORS_ORIGINS'][0]}/payment/failure?error=missing_hash")
        
        # Sắp xếp các tham số theo thứ tự alphabet để tạo checksum
        input_data_sorted = sorted(input_data.items())
        query_string = urllib.parse.urlencode(input_data_sorted, quote_via=urllib.parse.quote)
        
        # Tạo chữ ký để so sánh với chữ ký từ VNPay
        vnp_HashSecret = current_app.config['VNPAY_HASH_SECRET_KEY']
        secure_hash = hmac.new(vnp_HashSecret.encode(), query_string.encode(), hashlib.sha512).hexdigest()
        
        # Xác thực chữ ký
        if secure_hash != vnp_SecureHash:
            current_app.logger.error(f"Chữ ký không hợp lệ. Expected: {secure_hash}, Got: {vnp_SecureHash}")
            return redirect(f"{current_app.config['CORS_ORIGINS'][0]}/payment/failure?error=invalid_signature")
        
        # Lấy thông tin giao dịch từ database
        vnp_TxnRef = request.args.get('vnp_TxnRef')
        if not vnp_TxnRef:
            current_app.logger.error("Thiếu vnp_TxnRef trong VNPay return")
            return redirect(f"{current_app.config['CORS_ORIGINS'][0]}/payment/failure?error=missing_txnref")
            
        transaction = VnpayTransaction.query.filter_by(vnp_txnref=vnp_TxnRef).first()
        
        if not transaction:
            current_app.logger.error(f"Không tìm thấy giao dịch: {vnp_TxnRef}")
            return redirect(f"{current_app.config['CORS_ORIGINS'][0]}/payment/failure?error=transaction_not_found")
        
        # Cập nhật thông tin giao dịch từ VNPay
        transaction.vnp_bankcode = request.args.get('vnp_BankCode')
        transaction.vnp_banktranno = request.args.get('vnp_BankTranNo')
        transaction.vnp_cardtype = request.args.get('vnp_CardType')
        transaction.vnp_paydate = request.args.get('vnp_PayDate')
        transaction.vnp_responsecode = request.args.get('vnp_ResponseCode')
        transaction.vnp_tmncode = request.args.get('vnp_TmnCode')
        transaction.vnp_transactionno = request.args.get('vnp_TransactionNo')
        transaction.vnp_transactionstatus = request.args.get('vnp_TransactionStatus')
        transaction.vnp_securehash = vnp_SecureHash
        
        # Kiểm tra kết quả thanh toán và xử lý theo response code
        response_code = transaction.vnp_responsecode
        transaction_status = transaction.vnp_transactionstatus
        
        # Lấy thông tin chi tiết về kết quả thanh toán
        success, message, error_type = get_vnpay_response_message(response_code, transaction_status)
        user_message = get_user_friendly_message(response_code)
        
        current_app.logger.info(f"VNPAY callback - Response Code: {response_code}, "
                               f"Transaction Status: {transaction_status}, "
                               f"Success: {success}, "
                               f"Error Type: {error_type}, "
                               f"User Message: {user_message['title']}")
        
        # Cập nhật booking dựa trên kết quả
        booking = Booking.query.get(transaction.booking_id)
        if not booking:
            current_app.logger.error(f"Không tìm thấy booking: {transaction.booking_id}")
            return redirect(f"{current_app.config['CORS_ORIGINS'][0]}/payment/failure?error=booking_not_found")
        
        if success and response_code == '00' and transaction_status == '00':
            # Thanh toán thành công
            booking.payment_status = 'paid'
            current_app.logger.info(f"Thanh toán thành công cho booking {booking.booking_code}")
            
            db.session.commit()
            
            # Redirect về trang thành công với thông tin chi tiết
            success_params = []
            success_params.append(f"booking_code={booking.booking_code}")
            success_params.append(f"vnp_TxnRef={transaction.vnp_txnref}")
            success_params.append(f"vnp_Amount={int(transaction.vnp_amount * 100)}")
            success_params.append(f"vnp_ResponseCode={response_code}")
            success_params.append(f"message={urllib.parse.quote(user_message['message'])}")
            success_params.append(f"title={urllib.parse.quote(user_message['title'])}")
            
            if transaction.vnp_transactionno:
                success_params.append(f"vnp_TransactionNo={transaction.vnp_transactionno}")
            if transaction.vnp_bankcode:
                success_params.append(f"vnp_BankCode={transaction.vnp_bankcode}")
            if transaction.vnp_paydate:
                success_params.append(f"vnp_PayDate={transaction.vnp_paydate}")
            
            success_url = f"{current_app.config['CORS_ORIGINS'][0]}/payment/success?{'&'.join(success_params)}"
            return redirect(success_url)
        else:
            # Thanh toán thất bại - cập nhật booking với thông tin chi tiết
            booking.payment_status = 'failed'
            current_app.logger.warning(f"Thanh toán thất bại cho booking {booking.booking_code}. "
                                     f"Response Code: {response_code}, Error Type: {error_type}, Message: {message}")
                
            db.session.commit()
            
            # Redirect về trang thất bại với thông tin lỗi chi tiết
            failure_params = []
            failure_params.append(f"booking_code={booking.booking_code}")
            failure_params.append(f"vnp_ResponseCode={response_code}")
            failure_params.append(f"vnp_TxnRef={transaction.vnp_txnref}")
            failure_params.append(f"error_type={error_type}")
            failure_params.append(f"message={urllib.parse.quote(user_message['message'])}")
            failure_params.append(f"title={urllib.parse.quote(user_message['title'])}")
            failure_params.append(f"action={urllib.parse.quote(user_message['action'])}")
            failure_params.append(f"color={user_message['color']}")
            
            failure_url = f"{current_app.config['CORS_ORIGINS'][0]}/payment/failure?{'&'.join(failure_params)}"
            return redirect(failure_url)
            
    except Exception as e:
        current_app.logger.error(f"Lỗi trong VNPay return handler: {str(e)}")
        db.session.rollback()
        return redirect(f"{current_app.config['CORS_ORIGINS'][0]}/payment/failure?error=system_error")

@vnpay_bp.route('/vnpay_ipn', methods=['GET'])
def vnpay_ipn():
    """
    Xử lý Instant Payment Notification (IPN) từ VNPay
    VNPay sẽ gọi API này để thông báo kết quả thanh toán
    """
    try:
        input_data = request.args.to_dict()
        current_app.logger.info(f"VNPay IPN nhận được: {input_data}")
        
        vnp_SecureHash = input_data.pop('vnp_SecureHash', None)
        
        if not vnp_SecureHash:
            current_app.logger.error("Thiếu vnp_SecureHash trong VNPay IPN")
            return jsonify({'RspCode': '99', 'Message': 'Missing SecureHash'})
        
        # Sắp xếp các tham số theo thứ tự alphabet
        input_data_sorted = sorted(input_data.items())
        query_string = urllib.parse.urlencode(input_data_sorted, quote_via=urllib.parse.quote)
        
        # Tạo chữ ký để xác thực
        vnp_HashSecret = current_app.config['VNPAY_HASH_SECRET_KEY']
        secure_hash = hmac.new(vnp_HashSecret.encode(), query_string.encode(), hashlib.sha512).hexdigest()
        
        if secure_hash == vnp_SecureHash:
            vnp_TxnRef = request.args.get('vnp_TxnRef')
            transaction = VnpayTransaction.query.filter_by(vnp_txnref=vnp_TxnRef).first()
            
            if transaction:
                # Cập nhật thông tin giao dịch
                transaction.vnp_responsecode = request.args.get('vnp_ResponseCode')
                transaction.vnp_transactionstatus = request.args.get('vnp_TransactionStatus')
                transaction.vnp_bankcode = request.args.get('vnp_BankCode')
                transaction.vnp_banktranno = request.args.get('vnp_BankTranNo')
                transaction.vnp_cardtype = request.args.get('vnp_CardType')
                transaction.vnp_paydate = request.args.get('vnp_PayDate')
                transaction.vnp_transactionno = request.args.get('vnp_TransactionNo')
                
                # Cập nhật trạng thái booking nếu thanh toán thành công
                if transaction.vnp_responsecode == '00' and transaction.vnp_transactionstatus == '00':
                    booking = Booking.query.get(transaction.booking_id)
                    if booking and booking.payment_status != 'paid':
                        booking.payment_status = 'paid'
                        current_app.logger.info(f"IPN: Cập nhật booking {booking.booking_code} thành đã thanh toán")
                
                db.session.commit()
                return jsonify({'RspCode': '00', 'Message': 'Confirm Success'})
            else:
                current_app.logger.error(f"IPN: Không tìm thấy giao dịch {vnp_TxnRef}")
                return jsonify({'RspCode': '01', 'Message': 'Order not found'})
        else:
            current_app.logger.error("IPN: Chữ ký không hợp lệ")
            return jsonify({'RspCode': '97', 'Message': 'Invalid Checksum'})
            
    except Exception as e:
        current_app.logger.error(f"Lỗi trong VNPay IPN handler: {e}")
        db.session.rollback()
        return jsonify({'RspCode': '99', 'Message': 'System Error'})

@vnpay_bp.route('/transaction/<string:booking_id>', methods=['GET'])
def get_transaction_by_booking(booking_id):
    """
    API lấy thông tin giao dịch VNPay theo booking ID
    """
    try:
        transaction = VnpayTransaction.query.filter_by(booking_id=booking_id).first()
        
        if not transaction:
            return jsonify({
                'status': 'error',
                'message': 'Không tìm thấy thông tin giao dịch'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': transaction.to_dict()
        })
        
    except Exception as e:
        current_app.logger.error(f"Lỗi khi lấy thông tin giao dịch: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Lỗi hệ thống'
        }), 500

@vnpay_bp.route('/transactions/user/<string:user_id>', methods=['GET'])
def get_user_transactions(user_id):
    """
    API lấy danh sách giao dịch VNPay của người dùng
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        transactions = VnpayTransaction.query.filter_by(user_id=user_id)\
            .order_by(VnpayTransaction.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'status': 'success',
            'data': [transaction.to_dict() for transaction in transactions.items],
            'pagination': {
                'page': page,
                'pages': transactions.pages,
                'per_page': per_page,
                'total': transactions.total,
                'has_next': transactions.has_next,
                'has_prev': transactions.has_prev
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Lỗi khi lấy giao dịch của user: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Lỗi hệ thống'
        }), 500
