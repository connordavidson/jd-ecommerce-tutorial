from rest_framework import serializers
from core.models import Item, Order, OrderItem, Coupon, Variation, ItemVariation, Address, Payment

from django_countries.serializer_fields import CountryField


class StringSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value


#made at https://youtu.be/Vm9Z6mm2kcU?t=1507
class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = (
            'id',
            'code',
            'amount'
        )


class ItemSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = (
            'id',
            'title',
            'price',
            'discount_price',
            'category',
            'label',
            'slug',
            'description',
            'image'
        )

    def get_category(self, obj):
        return obj.get_category_display()

    def get_label(self, obj):
        return obj.get_label_display()



#created at https://youtu.be/qJN1_2ZwqeA?t=284
class VariationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variation
        fields = (
            'id',
            'name',
            'item'
        )

#made at https://youtu.be/qJN1_2ZwqeA?t=305
#serializes all the item variations
class ItemVariationDetailSerializer(serializers.ModelSerializer):
    variation = serializers.SerializerMethodField()
    class Meta:
        model = ItemVariation
        fields = (
            'id',
            'value',
            'attachment',
            'variation'
        )

    def get_variation(self, obj):
        return VariationDetailSerializer(obj.variation).data


#created at https://youtu.be/0JOl3ckfGAM?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1369
#gets the item and quantity.. for the OrderSerializer
class OrderItemSerializer(serializers.ModelSerializer):
    #changed at https://youtu.be/qJN1_2ZwqeA?t=441
    item = serializers.SerializerMethodField()
    item_variations = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'item',
            'quantity',
            'final_price',
            'item_variations'
        )

    #fetches item object that is associated with the order item
    def get_item(self, obj):
        return ItemSerializer(obj.item).data

    def get_item_variations(self, obj):
        #used .item_variations.all() becuase it's a ManyToMany relation
        return ItemVariationDetailSerializer( obj.item_variations.all(), many=True ).data

    def get_final_price(self, obj):
        return obj.get_final_price()


#returns all the items and quantities in an order (also used for the cart)
class OrderSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    coupon = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'order_items',
            'total',
            'coupon',
        )

    def get_order_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data

    def get_total(self, obj):
        return obj.get_total()

    def get_coupon(self, obj):
        if obj.coupon is not None:
            return CouponSerializer(obj.coupon).data
        return None



#made at https://youtu.be/Zg-bzjZuRa0?t=1317
#put simply this serializes the variation options (ex. returns the photo and value for the 'sm' option of the 'size' variation )
class ItemVariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemVariation
        fields = (
            'id',
            'value',
            'attachment'
        )


#put simply: this returns all the options for a given variation
class VariationSerializer(serializers.ModelSerializer):
    #retrieves the variations of the item (sm, md, lg)
    item_variations = serializers.SerializerMethodField()

    class Meta:
        model = Variation
        fields = (
            'id',
            'name',
            'item_variations',
        )

    def get_item_variations(self, obj):
        #returns all the variation options that are linked to this specific variation (ex. returns sm, md, lg for the 'size' variation)
        return ItemVariationSerializer(obj.itemvariation_set.all(), many=True).data



#made at https://youtu.be/Zg-bzjZuRa0?t=1190
#put simply: this returns all the variations for a given item. VariationSerializer, ItemVariationSerializer, and ItemVariationSerializer, all get funneled through this to be sent to the front end
class ItemDetailSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()
    #gets the variations linked to this specific item
    variations = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = (
            'id',
            'title',
            'price',
            'discount_price',
            'category',
            'label',
            'slug',
            'description',
            'image',
            'variations'
        )

    def get_category(self, obj):
        return obj.get_category_display()

    def get_label(self, obj):
        return obj.get_label_display()

    def get_variations(self, obj):
        #gets all the variations for this specific item (ex. returns 'size', 'color', 'other_variation' for the 't-shirt' item )
        return VariationSerializer(obj.variation_set.all(), many=True).data



#created at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=930
class AddressSerializer(serializers.ModelSerializer):
    #country has to come from django_countries
    country = CountryField()

    class Meta:
        model = Address
        fields = [
            'id',
            'user',
            'street_address',
            'apartment_address',
            'country',
            'zip',
            'address_type',
            'default'
        ]


#made at https://youtu.be/cZw2Mp5ep5g?t=85
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id',
            'amount',
            'timestamp',
            
        )
