"""User schemas for request/response validation"""

from marshmallow import Schema, fields, validate, post_load, validates, ValidationError
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.models.user import User, UserAddress


class UserAddressSchema(SQLAlchemyAutoSchema):
    """User address schema"""
    class Meta:
        model = UserAddress
        load_instance = True
        exclude = ('user_id',)
    
    id = fields.Str(dump_only=True)
    address_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    recipient_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    phone = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    address = fields.Str(required=True, validate=validate.Length(min=5))
    district = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    city = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    postal_code = fields.Str(validate=validate.Length(max=20))
    is_default = fields.Bool(missing=False)
    latitude = fields.Float(allow_none=True)
    longitude = fields.Float(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class UserSchema(SQLAlchemyAutoSchema):
    """User schema"""
    class Meta:
        model = User
        load_instance = True
        exclude = ('password',)
    
    id = fields.Str(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    phone = fields.Str(validate=validate.Length(min=10, max=20))
    address = fields.Str()
    avatar = fields.Str()
    bio = fields.Str()
    role = fields.Str(validate=validate.OneOf(['customer', 'staff', 'admin']), missing='customer')
    status = fields.Str(validate=validate.OneOf(['active', 'inactive', 'locked', 'pending']), missing='active')
    email_verified_at = fields.DateTime(dump_only=True)
    phone_verified_at = fields.DateTime(dump_only=True)
    last_login_at = fields.DateTime(dump_only=True)
    login_count = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # Nested addresses
    addresses = fields.Nested(UserAddressSchema, many=True, dump_only=True)


class UserCreateSchema(Schema):
    """Schema for creating new users"""
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    phone = fields.Str(validate=validate.Length(min=10, max=20))
    address = fields.Str()
    role = fields.Str(validate=validate.OneOf(['customer', 'staff', 'admin']), missing='customer')


class UserUpdateSchema(Schema):
    """Schema for updating users"""
    name = fields.Str(validate=validate.Length(min=2, max=100))
    phone = fields.Str(validate=validate.Length(min=10, max=20))
    address = fields.Str()
    avatar = fields.Str()
    bio = fields.Str()
    status = fields.Str(validate=validate.OneOf(['active', 'inactive', 'locked', 'pending']))


class UserPasswordChangeSchema(Schema):
    """Schema for changing user password"""
    current_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=6))
    confirm_password = fields.Str(required=True)


class UserListResponseSchema(Schema):
    """Schema for user list response"""
    users = fields.Nested(UserSchema, many=True)
    total = fields.Int()
    page = fields.Int()
    per_page = fields.Int()
    pages = fields.Int()


# Schema instances
user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_create_schema = UserCreateSchema()
user_update_schema = UserUpdateSchema()
user_password_change_schema = UserPasswordChangeSchema()
user_address_schema = UserAddressSchema()
user_addresses_schema = UserAddressSchema(many=True)
user_list_response_schema = UserListResponseSchema()

