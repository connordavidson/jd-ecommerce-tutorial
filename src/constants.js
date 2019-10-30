

//made this file at https://youtu.be/RG_Y7lIDXPM?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=925

//the point of this file is to hold the URLs to the api endpoints in the backend.. need to match the api/urls.py file


//had to change around some of the cosntants becuase he does it weird in the videos


// const localhost = 'http://127.0.0.1:8000';
// const apiURL = '/api';
export const endpoint = 'http://127.0.0.1:8000/api';




export const productListURL = 'http://127.0.0.1:8000/api/products/';

//made at https://youtu.be/Zg-bzjZuRa0?t=239
//takes in id and returns the url endpoint
export const productDetailURL = id => `http://127.0.0.1:8000/api/products/${id}/`;

export const addToCartURL = 'http://127.0.0.1:8000/api/add-to-cart/';

export const orderSummaryURL = 'http://127.0.0.1:8000/api/order-summary/';

//made at https://youtu.be/z7Kq6bHxEcI?t=1055
export const checkoutURL = 'http://127.0.0.1:8000/api/checkout/';

//added at https://youtu.be/Vm9Z6mm2kcU?t=1157
export const addCouponURL = 'http://127.0.0.1:8000/api/add-coupon/';
