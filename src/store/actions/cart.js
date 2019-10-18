import axios from "axios";
import {
  CART_START,
  CART_SUCCESS,
  CART_FAIL,

}
from "./actionTypes";

import {authAxios} from '../../utils';
import {orderSummaryURL} from '../../constants';

export const cartStart = () => {
  return {
    type: CART_START,
  };
};


export const cartSuccess = data => {
  console.log(data);
  return {
    type: CART_SUCCESS,
    data
  };
};


export const cartFail = error => {
  return {
    type: CART_FAIL,
    error: error
  };
};


//what we call when the app is loaded. fetches whatever is in the cart at load and can be called again to update the display with the contents of the cart
export const fetchCart = () => {
  return dispatch => {
    dispatch(cartStart());

    authAxios
      .get(orderSummaryURL)
      .then(res => {
        //dispatches the cartSuccess method with data
        dispatch( cartSuccess(res.data) );
      })
      .catch(err => {
        dispatch( cartFail(err) );
      });
  };
};
