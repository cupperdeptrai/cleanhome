from flask_marshmallow import Marshmallow
from ..models.booking import Payment
from ..utils.validators import (
    validate_payment_method, validate_transaction_status,
    validate_uuid_format, validate_positive_number
)
from marshmallow import fields, validates, ValidationError

ma = Marshmallow()

class PaymentSchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model Payment"""
    class Meta:
        model = Payment
        load_instance = True
        include_fk = True
        fields = (
            'id', 'booking_id', 'amount', 'payment_method', 'transaction_id',
            'status', 'payment_date', 'created_at', 'updated_at'
        )

    id = fields.UUID(dump_only=True)
    booking_id = fields.UUID(required=True)
    amount = fields.Float(required=True)
    payment_method = fields.String(required=True)
    transaction_id = fields.String(allow_none=True)
    status = fields.String(required=True)
    payment_date = fields.DateTime(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @validates('booking_id')
    def validate_booking_id(self, value):
        is_valid, error = validate_uuid_format(value, 'booking_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('amount')
    def validate_amount(self, value):
        is_valid, error = validate_positive_number(value, 'amount', include_zero=True)
        if not is_valid:
            raise ValidationError(error)

    @validates('payment_method')
    def validate_payment_method(self, value):
        is_valid, error = validate_payment_method(value)
        if not is_valid:
            raise ValidationError(error)

    @validates('status')
    def validate_status(self, value):
        is_valid, error = validate_transaction_status(value)
        if not is_valid:
            raise ValidationError(error)