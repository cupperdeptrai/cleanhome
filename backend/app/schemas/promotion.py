from flask_marshmallow import Marshmallow
from ..models.promotion import Promotion
from ..utils.validators import (
    validate_discount_type, validate_service_status,
    validate_positive_number, validate_promotion_dates
)
from marshmallow import fields, validates, ValidationError

ma = Marshmallow()

class PromotionSchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model Promotion"""
    class Meta:
        model = Promotion
        load_instance = True
        include_fk = True
        fields = (
            'id', 'code', 'name', 'description', 'discount_type',
            'discount_value', 'min_order_value', 'max_discount',
            'start_date', 'end_date', 'usage_limit', 'used_count',
            'status', 'created_at', 'updated_at'
        )

    id = fields.UUID(dump_only=True)
    code = fields.String(required=True)
    discount_type = fields.String(required=True)
    discount_value = fields.Float(required=True)
    min_order_value = fields.Float(required=True)
    max_discount = fields.Float(allow_none=True)
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)
    usage_limit = fields.Integer(allow_none=True)
    used_count = fields.Integer(dump_only=True)
    status = fields.String(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @validates('discount_type')
    def validate_discount_type(self, value):
        is_valid, error = validate_discount_type(value)
        if not is_valid:
            raise ValidationError(error)

    @validates('discount_value')
    def validate_discount_value(self, value):
        is_valid, error = validate_positive_number(value, 'discount_value', include_zero=False)
        if not is_valid:
            raise ValidationError(error)

    @validates('min_order_value')
    def validate_min_order_value(self, value):
        is_valid, error = validate_positive_number(value, 'min_order_value', include_zero=True)
        if not is_valid:
            raise ValidationError(error)

    @validates('max_discount')
    def validate_max_discount(self, value):
        if value is not None:
            is_valid, error = validate_positive_number(value, 'max_discount', include_zero=True)
            if not is_valid:
                raise ValidationError(error)

    @validates('usage_limit')
    def validate_usage_limit(self, value):
        if value is not None:
            is_valid, error = validate_positive_number(value, 'usage_limit', include_zero=False)
            if not is_valid:
                raise ValidationError(error)

    @validates('status')
    def validate_status(self, value):
        is_valid, error = validate_service_status(value)
        if not is_valid:
            raise ValidationError(error)

    @validates_schema
    def validate_dates(self, data, **kwargs):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        if start_date and end_date:
            is_valid, error = validate_promotion_dates(start_date, end_date)
            if not is_valid:
                raise ValidationError(error)