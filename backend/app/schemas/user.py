from flask_marshmallow import Marshmallow
from ..models.user import User
from ..utils.validators import validate_email_format, validate_phone_format, validate_user_role, validate_user_status
from marshmallow import fields, validates, ValidationError

ma = Marshmallow()

class UserSchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model User"""
    class Meta:
        model = User
        load_instance = True
        include_fk = True
        fields = (
            'id', 'name', 'email', 'phone', 'address', 'avatar',
            'role', 'status', 'created_at', 'updated_at'
        )

    # Định dạng các trường
    id = fields.UUID(dump_only=True)
    email = fields.Email(required=True)
    phone = fields.String(allow_none=True)
    role = fields.String(required=True)
    status = fields.String(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @validates('email')
    def validate_email(self, value):
        is_valid, error = validate_email_format(value)
        if not is_valid:
            raise ValidationError(error)

    @validates('phone')
    def validate_phone(self, value):
        if value:
            is_valid, error = validate_phone_format(value)
            if not is_valid:
                raise ValidationError(error)

    @validates('role')
    def validate_role(self, value):
        is_valid, error = validate_user_role(value)
        if not is_valid:
            raise ValidationError(error)

    @validates('status')
    def validate_status(self, value):
        is_valid, error = validate_user_status(value)
        if not is_valid:
            raise ValidationError(error)