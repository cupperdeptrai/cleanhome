from flask_marshmallow import Marshmallow
from ..models.booking import Booking, BookingItem, BookingPromotion, Payment, Review, StaffSchedule
from ..utils.validators import (
    validate_booking_status, validate_payment_status, validate_payment_method,
    validate_discount_type, validate_schedule_status, validate_transaction_status,
    validate_uuid_format, validate_positive_number, validate_date_format,
    validate_time_format, validate_rating, validate_time_range
)
from marshmallow import fields, validates, ValidationError

ma = Marshmallow()

class BookingSchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model Booking"""
    class Meta:
        model = Booking
        load_instance = True
        include_fk = True
        fields = (
            'id', 'user_id', 'service_id', 'staff_id', 'booking_date', 'booking_time',
            'status', 'total_price', 'payment_status', 'payment_method', 'notes',
            'address', 'created_at', 'updated_at', 'items', 'promotions', 'reviews',
            'service', 'staff'
        )

    id = fields.UUID(dump_only=True)
    user_id = fields.UUID(required=True)
    service_id = fields.UUID(required=True)
    staff_id = fields.UUID(allow_none=True)
    booking_date = fields.Date(required=True)
    booking_time = fields.Time(required=True)
    total_price = fields.Float(required=True)
    status = fields.String(required=True)
    payment_status = fields.String(required=True)
    payment_method = fields.String(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    items = ma.Nested('BookingItemSchema', many=True)
    promotions = ma.Nested('BookingPromotionSchema', many=True)
    reviews = ma.Nested('ReviewSchema', many=True)
    service = ma.Nested('ServiceSchema')
    staff = ma.Nested('UserSchema', allow_none=True)

    @validates('user_id')
    def validate_user_id(self, value):
        is_valid, error = validate_uuid_format(value, 'user_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('service_id')
    def validate_service_id(self, value):
        is_valid, error = validate_uuid_format(value, 'service_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('staff_id')
    def validate_staff_id(self, value):
        if value:
            is_valid, error = validate_uuid_format(value, 'staff_id')
            if not is_valid:
                raise ValidationError(error)

    @validates('booking_date')
    def validate_booking_date(self, value):
        if isinstance(value, str):
            is_valid, error = validate_date_format(value)
            if not is_valid:
                raise ValidationError(error)

    @validates('booking_time')
    def validate_booking_time(self, value):
        if isinstance(value, str):
            is_valid, error = validate_time_format(value)
            if not is_valid:
                raise ValidationError(error)

    @validates('total_price')
    def validate_total_price(self, value):
        is_valid, error = validate_positive_number(value, 'total_price', include_zero=True)
        if not is_valid:
            raise ValidationError(error)

    @validates('status')
    def validate_status(self, value):
        is_valid, error = validate_booking_status(value)
        if not is_valid:
            raise ValidationError(error)

    @validates('payment_status')
    def validate_payment_status(self, value):
        is_valid, error = validate_payment_status(value)
        if not is_valid:
            raise ValidationError(error)

    @validates('payment_method')
    def validate_payment_method(self, value):
        if value:
            is_valid, error = validate_payment_method(value)
            if not is_valid:
                raise ValidationError(error)

class BookingItemSchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model BookingItem"""
    class Meta:
        model = BookingItem
        load_instance = True
        include_fk = True
        fields = (
            'id', 'booking_id', 'service_id', 'quantity', 'price',
            'subtotal', 'created_at', 'updated_at', 'service'
        )

    id = fields.UUID(dump_only=True)
    booking_id = fields.UUID(required=True)
    service_id = fields.UUID(required=True)
    quantity = fields.Integer(required=True)
    price = fields.Float(required=True)
    subtotal = fields.Float(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    service = ma.Nested('ServiceSchema')

    @validates('booking_id')
    def validate_booking_id(self, value):
        is_valid, error = validate_uuid_format(value, 'booking_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('service_id')
    def validate_service_id(self, value):
        is_valid, error = validate_uuid_format(value, 'service_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('quantity')
    def validate_quantity(self, value):
        is_valid, error = validate_positive_number(value, 'quantity', include_zero=False)
        if not is_valid:
            raise ValidationError(error)

    @validates('price')
    def validate_price(self, value):
        is_valid, error = validate_positive_number(value, 'price', include_zero=True)
        if not is_valid:
            raise ValidationError(error)

    @validates('subtotal')
    def validate_subtotal(self, value):
        is_valid, error = validate_positive_number(value, 'subtotal', include_zero=True)
        if not is_valid:
            raise ValidationError(error)

class BookingPromotionSchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model BookingPromotion"""
    class Meta:
        model = BookingPromotion
        load_instance = True
        include_fk = True
        fields = (
            'id', 'booking_id', 'promotion_id', 'discount_amount',
            'created_at', 'promotion'
        )

    id = fields.UUID(dump_only=True)
    booking_id = fields.UUID(required=True)
    promotion_id = fields.UUID(required=True)
    discount_amount = fields.Float(required=True)
    created_at = fields.DateTime(dump_only=True)
    promotion = ma.Nested('PromotionSchema')

    @validates('booking_id')
    def validate_booking_id(self, value):
        is_valid, error = validate_uuid_format(value, 'booking_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('promotion_id')
    def validate_promotion_id(self, value):
        is_valid, error = validate_uuid_format(value, 'promotion_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('discount_amount')
    def validate_discount_amount(self, value):
        is_valid, error = validate_positive_number(value, 'discount_amount', include_zero=True)
        if not is_valid:
            raise ValidationError(error)

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

class ReviewSchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model Review"""
    class Meta:
        model = Review
        load_instance = True
        include_fk = True
        fields = (
            'id', 'booking_id', 'user_id', 'service_id', 'staff_id',
            'rating', 'comment', 'created_at', 'updated_at',
            'user', 'service', 'staff'
        )

    id = fields.UUID(dump_only=True)
    booking_id = fields.UUID(required=True)
    user_id = fields.UUID(required=True)
    service_id = fields.UUID(required=True)
    staff_id = fields.UUID(allow_none=True)
    rating = fields.Integer(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    user = ma.Nested('UserSchema')
    service = ma.Nested('ServiceSchema')
    staff = ma.Nested('UserSchema', allow_none=True)

    @validates('booking_id')
    def validate_booking_id(self, value):
        is_valid, error = validate_uuid_format(value, 'booking_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('user_id')
    def validate_user_id(self, value):
        is_valid, error = validate_uuid_format(value, 'user_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('service_id')
    def validate_service_id(self, value):
        is_valid, error = validate_uuid_format(value, 'service_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('staff_id')
    def validate_staff_id(self, value):
        if value:
            is_valid, error = validate_uuid_format(value, 'staff_id')
            if not is_valid:
                raise ValidationError(error)

    @validates('rating')
    def validate_rating(self, value):
        is_valid, error = validate_rating(value)
        if not is_valid:
            raise ValidationError(error)

class StaffScheduleSchema(ma.SQLAlchemyAutoSchema):
    """Schema cho model StaffSchedule"""
    class Meta:
        model = StaffSchedule
        load_instance = True
        include_fk = True
        fields = (
            'id', 'staff_id', 'date', 'start_time', 'end_time',
            'status', 'created_at', 'updated_at'
        )

    id = fields.UUID(dump_only=True)
    staff_id = fields.UUID(required=True)
    date = fields.Date(required=True)
    start_time = fields.Time(required=True)
    end_time = fields.Time(required=True)
    status = fields.String(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @validates('staff_id')
    def validate_staff_id(self, value):
        is_valid, error = validate_uuid_format(value, 'staff_id')
        if not is_valid:
            raise ValidationError(error)

    @validates('date')
    def validate_date(self, value):
        if isinstance(value, str):
            is_valid, error = validate_date_format(value)
            if not is_valid:
                raise ValidationError(error)

    @validates('start_time')
    def validate_start_time(self, value):
        if isinstance(value, str):
            is_valid, error = validate_time_format(value)
            if not is_valid:
                raise ValidationError(error)

    @validates('end_time')
    def validate_end_time(self, value):
        if isinstance(value, str):
            is_valid, error = validate_time_format(value)
            if not is_valid:
                raise ValidationError(error)

    @validates('status')
    def validate_status(self, value):
        is_valid, error = validate_schedule_status(value)
        if not is_valid:
            raise ValidationError(error)

    @validates_schema
    def validate_time_range(self, data, **kwargs):
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        if start_time and end_time:
            is_valid, error = validate_time_range(start_time, end_time)
            if not is_valid:
                raise ValidationError(error)