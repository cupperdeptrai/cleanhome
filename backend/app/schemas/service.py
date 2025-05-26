from flask_marshmallow import Marshmallow
from ..models.service import ServiceCategory, Service
from ..utils.validators import validate_service_status, validate_positive_number, validate_uuid_format
from marshmallow import fields, validates, ValidationError

ma = Marshmallow()

class ServiceCategorySchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model ServiceCategory"""
    class Meta:
        model = ServiceCategory
        load_instance = True
        include_fk = True
        fields = (
            'id', 'name', 'description', 'image', 'status',
            'created_at', 'updated_at', 'services'
        )

    id = fields.UUID(dump_only=True)
    status = fields.String(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    services = ma.Nested('ServiceSchema', many=True, exclude=('category',))

    @validates('status')
    def validate_status(self, value):
        is_valid, error = validate_service_status(value)
        if not is_valid:
            raise ValidationError(error)

class ServiceSchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model Service"""
    class Meta:
        model = Service
        load_instance = True
        include_fk = True
        fields = (
            'id', 'category_id', 'name', 'description', 'price',
            'duration', 'image', 'status', 'created_at', 'updated_at', 'category'
        )

    id = fields.UUID(dump_only=True)
    category_id = fields.UUID(required=True)
    price = fields.Float(required=True)
    duration = fields.Integer(required=True)
    status = fields.String(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    category = ma.Nested(ServiceCategorySchema, exclude=('services',))

    @validates('category_id')
    def validate_category_id(self, value):
        is_valid, error = validate_uuid_format(value, 'category_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('price')
    def validate_price(self, value):
        is_valid, error = validate_positive_number(value, 'price', include_zero=True)
        if not is_valid:
            raise ValidationError(error)

    @validates('duration')
    def validate_duration(self, value):
        is_valid, error = validate_positive_number(value, 'duration', include_zero=False)
        if not is_valid:
            raise ValidationError(error)

    @validates('status')
    def validate_status(self, value):
        is_valid, error = validate_service_status(value)
        if not is_valid:
            raise ValidationError(error)