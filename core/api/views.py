from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django_countries import countries

from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from core.models import Item, OrderItem, Order, Address, Payment, Coupon, Refund, UserProfile, Variation, ItemVariation
from .serializers import ItemSerializer, OrderSerializer, ItemDetailSerializer, AddressSerializer

import stripe



stripe.api_key = settings.STRIPE_SECRET_KEY

#created at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=2521
class UserIDView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({'userID': request.user.id }, status=HTTP_200_OK)


class ItemListView(ListAPIView):
    permission_classes = (AllowAny, )
    serializer_class = ItemSerializer
    queryset = Item.objects.all()


#created at https://youtu.be/Zg-bzjZuRa0?t=175
class ItemDetailView(RetrieveAPIView):
    permission_classes = (AllowAny, )
    serializer_class = ItemDetailSerializer
    queryset = Item.objects.all()



#created at https://youtu.be/0JOl3ckfGAM?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=290 ish
class AddToCartView(APIView):
    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        #added at https://youtu.be/qJN1_2ZwqeA?t=1470
        #if it is [] then that means there were not enough variatins in place for it to be a valid "add-to-cart" action
        variations = request.data.get('variations', [])
        print("variations: " + str(variations) )

        if slug is None:
            return Response( { "message": "Invalid request"}, status=HTTP_400_BAD_REQUEST )
        #this is what happens if there is a Slug
        item = get_object_or_404(Item, slug=slug)

        #made at https://youtu.be/qJN1_2ZwqeA?t=1600
        minimum_variation_count = Variation.objects.filter(item=item).count()
        if len(variations) < minimum_variation_count:
            return Response( { "message": "Please specify the required variations"}, status=HTTP_400_BAD_REQUEST )



        #edited around https://youtu.be/qJN1_2ZwqeA?t=1598
        #filters the order item objects by the criteria in the ()
        order_item_qs = OrderItem.objects.filter(
            item=item,
            user=request.user,
            ordered=False
        )

        #made at https://youtu.be/qJN1_2ZwqeA?t=1757
        #checks if there is already an item with those variations
        for v in variations:
            order_item_qs = order_item_qs.filter(
                item_variations__exact = v
            )

        #created at https://youtu.be/qJN1_2ZwqeA?t=1800
        #if it exists, increase the quantity by 1
        if order_item_qs.exists():
            order_item = order_item_qs.first()
            order_item.quantity += 1
            order_item.save()
        #if it doesn't exist, we're adding a new item to the cart
        else:
            order_item = OrderItem.objects.create(
                item=item,
                user=request.user,
                ordered=False
            )
            #adds the variations to the order. (the * means all and means we don't have to loop through it )
            order_item.item_variations.add(*variations)
            order_item.save()




        #make changes at https://youtu.be/qJN1_2ZwqeA?t=1900
        order_qs = Order.objects.filter(user=request.user, ordered=False)
        if order_qs.exists():
            order = order_qs[0]
            # check if the order item is in the order
            #if the order doesn't contain the item with order_item.id, add it to the cart (it filters it and then checks if there are 0 results after the filter)
            if not order.items.filter(item__id=order_item.id).exists():
                order.items.add(order_item)
            #returns responses from the framework
            return Response( status=HTTP_200_OK )

        else:
            ordered_date = timezone.now()
            order = Order.objects.create(
                user=request.user, ordered_date=ordered_date)
            order.items.add(order_item)

            #returns responses from the framework
            return Response(status=HTTP_200_OK)



#created at https://youtu.be/0JOl3ckfGAM?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1574
class OrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated, )

    def get_object(self):
        try:
            #looks in the Order table and returns all the orders where user = current user and ordered = False
            order = Order.objects.get(user=self.request.user, ordered=False)
            return order
        #if there is no order
        except ObjectDoesNotExist:
            #changed this response at https://youtu.be/Vm9Z6mm2kcU?t=149
            raise Http404("You do not have an active order")


#created at https://youtu.be/z7Kq6bHxEcI?t=829
class PaymentView(APIView):

    def post(self, request, *args, **kwargs):


        order = Order.objects.get(user=self.request.user, ordered=False)

        userprofile = UserProfile.objects.get(user=self.request.user)

        token = request.data.get('stripeToken') #stripeToken comes from Checkout.js
        #added at https://youtu.be/NaJ-b0ZaSoI?t=1275
        billing_address_id = request.data.get('selectedBillingAddress')
        shipping_address_id = request.data.get('selectedShippingAddress')

        billing_address = Address.objects.get(id=billing_address_id)
        shipping_address = Address.objects.get(id=shipping_address_id)

        #explanation of this code at https://youtu.be/NaJ-b0ZaSoI?t=1360

        # if userprofile.stripe_customer_id != '' and userprofile.stripe_customer_id is not None:
        #     customer = stripe.Customer.retrieve(
        #         userprofile.stripe_customer_id)
        #     customer.sources.create(source=token)
        #
        # else:
        # customer = stripe.Customer.create(
        #     email=self.request.user.email,
        # )
        # customer.sources.create(source=token)
        # userprofile.stripe_customer_id = customer['id']
        # userprofile.one_click_purchasing = True
        # userprofile.save()

        amount = int(order.get_total() * 100)

        #READ BELOW
        #NOTE: there is some major fanagling happening in this try-catch block.
        #Stripe payment api didn't work so i just force the information into the order table
        #this doesn't matter, bc the stripe api doesn't do anything anyway. but now i know that the button can submit an order to the db
        try:
            # charge the customer because we cannot charge the token more than once
            # charge = stripe.Charge.create(
            #     amount=amount,  # cents
            #     currency="usd",
            #     customer=userprofile.stripe_customer_id
            # )

            # charge once off on the token
            # charge = stripe.Charge.create(
            #     amount=amount,  # cents
            #     currency="usd",
            #     source=token
            # )

            # create the payment
            # payment = Payment()
            # #had to butcher some of this bc i don't care to get the stripe api working
            # payment.stripe_charge_id = 'ch_iS607g3XF8DhAA3sYSqe'   # charge['id']
            # payment.user = self.request.user
            # payment.amount = order.get_total()
            # payment.save()


            # assign the payment to the order
            order_items = order.items.all()
            order_items.update(ordered=True)
            for item in order_items:
                item.save()

            order.ordered = True
            # order.payment = payment

            #made at https://youtu.be/NaJ-b0ZaSoI?t=1405
            order.billing_address = billing_address
            order.shipping_address = shipping_address

            #order.ref_code = create_ref_code()
            order.save()

            #if the order gets placed correctly
            return Response(status=HTTP_200_OK)

        except stripe.error.CardError as e:
            body = e.json_body
            err = body.get('error', {})
            return Response( {'message': f"{err.get('message')}"}, status=HTTP_400_BAD_REQUEST)

        except stripe.error.RateLimitError as e:
            # Too many requests made to the API too quickly
            messages.warning(self.request, "Rate limit error")
            return Response( { 'message': "Rate limit error"} , status=HTTP_400_BAD_REQUEST)

        except stripe.error.InvalidRequestError as e:
            # Invalid parameters were supplied to Stripe's API
            print(e)
            return Response( { 'message': "Invalid parameters" } , status=HTTP_400_BAD_REQUEST)

        except stripe.error.AuthenticationError as e:
            # Authentication with Stripe's API failed
            # (maybe you changed API keys recently)
            return Response( { 'message': "Not authenticated" } , status=HTTP_400_BAD_REQUEST)

        except stripe.error.APIConnectionError as e:
            # Network communication with Stripe failed
            return Response( { 'message': "Network error" } , status=HTTP_400_BAD_REQUEST)

        except stripe.error.StripeError as e:
            # Display a very generic error to the user, and maybe send
            # yourself an email
            return Response( { 'message': "Something went wrong. You were not charged. Please try again." } , status=HTTP_400_BAD_REQUEST)

        except Exception as e:
            # send an email to ourselves
            print(e)
            return Response( { 'message': "A serious error has occurred. We have been notified." } , status=HTTP_400_BAD_REQUEST)

        return Response( { 'message': "Invalid data" } , status=HTTP_400_BAD_REQUEST)



#added at https://youtu.be/Vm9Z6mm2kcU?t=927
#this changes the total for the order/cart in the backend.
class AddCouponView(APIView):
    def post(self, request, *args, **kwargs):
        code = request.data.get('code', None)
        if code is None:
            return Response( { 'message': "Invalid data received" } , status=HTTP_400_BAD_REQUEST)

        order = Order.objects.get(user=self.request.user, ordered=False)
        #gets the coupon or returns a 404 if it is wrong
        coupon = get_object_or_404(Coupon, code=code)
        #assigns the coupon to the order..
        order.coupon = coupon
        order.save()
        return Response(status=HTTP_200_OK)


#created at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1591
class CountryListView(APIView):
    def get(self, request, *args, **kwargs):
        return Response(countries, status=HTTP_200_OK)


#created at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=910
class AddressListView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = AddressSerializer

    def get_queryset(self):
        #made big changes to this at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=3030
        address_type = self.request.query_params.get('address_type', None)
        qs = Address.objects.all()
        if address_type is None:
            return qs
        return qs.filter(user=self.request.user, address_type=address_type)


#created at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1316
class AddressCreateView(CreateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = AddressSerializer
    queryset = Address.objects.all()
