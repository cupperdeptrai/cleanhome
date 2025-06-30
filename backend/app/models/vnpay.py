# backend/app/models/vnpay.py
"""
Model lưu trữ thông tin giao dịch VNPay cho dự án CleanHome
Author: CleanHome Team
"""

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

class VnpayTransaction(db.Model):
    """
    Model lưu trữ thông tin giao dịch VNPay
    Chứa tất cả thông tin giao dịch từ VNPay bao gồm request và response
    """
    __tablename__ = 'vnpay_transactions'

    # ID giao dịch trong hệ thống CleanHome
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Liên kết với booking và user
    booking_id = db.Column(UUID(as_uuid=True), db.ForeignKey('bookings.id'), nullable=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    
    # Thông tin giao dịch VNPay - Request parameters
    vnp_amount = db.Column(db.Numeric(15, 2), nullable=False, comment='Số tiền giao dịch')
    vnp_orderinfo = db.Column(db.String(255), comment='Mô tả đơn hàng')
    vnp_txnref = db.Column(db.String(255), nullable=False, unique=True, comment='Mã tham chiếu giao dịch')
    
    # Thông tin giao dịch VNPay - Response parameters
    vnp_bankcode = db.Column(db.String(50), comment='Mã ngân hàng thanh toán')
    vnp_banktranno = db.Column(db.String(255), comment='Mã giao dịch tại ngân hàng')
    vnp_cardtype = db.Column(db.String(50), comment='Loại thẻ thanh toán')
    vnp_paydate = db.Column(db.String(20), comment='Thời gian thanh toán tại VNPay')
    vnp_responsecode = db.Column(db.String(2), comment='Mã phản hồi giao dịch')
    vnp_tmncode = db.Column(db.String(20), comment='Mã merchant')
    vnp_transactionno = db.Column(db.String(255), comment='Mã giao dịch tại VNPay')
    vnp_transactionstatus = db.Column(db.String(2), comment='Trạng thái giao dịch')
    vnp_securehash = db.Column(db.String(255), comment='Chữ ký bảo mật')
    
    # Timestamps
    created_at = db.Column(db.DateTime, server_default=db.func.now(), comment='Thời gian tạo')
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), comment='Thời gian cập nhật')

    # Relationships
    booking = db.relationship('Booking', backref='vnpay_transactions', lazy=True)
    user = db.relationship('User', backref='vnpay_transactions', lazy=True)

    def __repr__(self):
        return f'<VnpayTransaction {self.vnp_txnref}>'

    @property
    def is_successful(self):
        """
        Kiểm tra giao dịch có thành công không
        Returns:
            bool: True nếu giao dịch thành công, False nếu không
        """
        return self.vnp_responsecode == '00' and self.vnp_transactionstatus == '00'

    @property
    def status_message(self):
        """
        Trả về thông báo trạng thái giao dịch bằng tiếng Việt
        Returns:
            str: Thông báo trạng thái giao dịch
        """
        if self.is_successful:
            return "Giao dịch thành công"
        elif self.vnp_responsecode == '24':
            return "Khách hàng hủy giao dịch"
        elif self.vnp_responsecode == '51':
            return "Tài khoản không đủ số dư để thực hiện giao dịch"
        elif self.vnp_responsecode == '65':
            return "Tài khoản đã vượt quá hạn mức giao dịch trong ngày"
        elif self.vnp_responsecode == '75':
            return "Ngân hàng thanh toán đang bảo trì"
        elif self.vnp_responsecode == '07':
            return "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)"
        elif self.vnp_responsecode == '09':
            return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng"
        elif self.vnp_responsecode == '10':
            return "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần"
        elif self.vnp_responsecode == '11':
            return "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch"
        elif self.vnp_responsecode == '12':
            return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa"
        elif self.vnp_responsecode == '13':
            return "Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)"
        elif self.vnp_responsecode == '79':
            return "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định"
        elif self.vnp_responsecode == '99':
            return "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)"
        else:
            return "Giao dịch không thành công"

    def to_dict(self):
        """
        Chuyển đổi thành dictionary để serialize JSON
        Returns:
            dict: Dictionary chứa thông tin giao dịch
        """
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'user_id': self.user_id,
            'vnp_Amount': float(self.vnp_amount) if self.vnp_amount else None,
            'vnp_BankCode': self.vnp_bankcode,
            'vnp_BankTranNo': self.vnp_banktranno,
            'vnp_CardType': self.vnp_cardtype,
            'vnp_OrderInfo': self.vnp_orderinfo,
            'vnp_PayDate': self.vnp_paydate,
            'vnp_ResponseCode': self.vnp_responsecode,
            'vnp_TmnCode': self.vnp_tmncode,
            'vnp_TransactionNo': self.vnp_transactionno,
            'vnp_TransactionStatus': self.vnp_transactionstatus,
            'vnp_TxnRef': self.vnp_txnref,
            'is_successful': self.is_successful,
            'status_message': self.status_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
