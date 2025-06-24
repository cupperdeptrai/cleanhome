"""
Payment schemas for serialization/deserialization
Author: CleanHome Team
"""

from marshmallow import Schema, fields, validate
from app.extensions import ma

class PaymentSchema(ma.Schema):
    """Schema cho Payment model"""
    
    id = fields.Str(dump_only=True)
    booking_id = fields.Str(required=True)
    
    amount = fields.Decimal(as_string=True, required=True)
    payment_method = fields.Str(required=True, validate=validate.OneOf([
        'cash', 'bank_transfer', 'vnpay', 'momo', 'zalopay'
    ]))
    
    transaction_id = fields.Str(allow_none=True)
    vnpay_transaction_no = fields.Str(allow_none=True)
    vnpay_response_code = fields.Str(allow_none=True)
    vnpay_bank_code = fields.Str(allow_none=True)
    
    status = fields.Str(validate=validate.OneOf([
        'pending', 'processing', 'completed', 'failed', 'refunded'
    ]))
    
    payment_date = fields.DateTime(allow_none=True)
    gateway_response = fields.Str(allow_none=True)
    notes = fields.Str(allow_none=True)
    
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    class Meta:
        ordered = True


class PaymentCreateSchema(ma.Schema):
    """Schema cho tạo payment mới"""
    
    booking_id = fields.Str(required=True)
    payment_method = fields.Str(required=True, validate=validate.OneOf([
        'cash', 'bank_transfer', 'vnpay', 'momo', 'zalopay'
    ]))
    bank_code = fields.Str(allow_none=True)  # Cho VNPay
    notes = fields.Str(allow_none=True)


class VNPayCreateSchema(ma.Schema):
    """Schema cho tạo thanh toán VNPay"""
    
    booking_id = fields.Str(required=True)
    bank_code = fields.Str(allow_none=True, validate=validate.OneOf([
        'NCB', 'AGRIBANK', 'SCB', 'SACOMBANK', 'EXIMBANK', 'MSBANK', 
        'NAMABANK', 'VNMART', 'VIETINBANK', 'VIETCOMBANK', 'HDBANK',
        'DONGABANK', 'TPBANK', 'OJB', 'BIDV', 'TECHCOMBANK', 'VPBANK',
        'MBBANK', 'ACB', 'OCB', 'IVB', 'VISA', 'MASTERCARD', 'JCB'
    ]))


# Khởi tạo schemas
payment_schema = PaymentSchema()
payments_schema = PaymentSchema(many=True)
payment_create_schema = PaymentCreateSchema()
vnpay_create_schema = VNPayCreateSchema()
