import React from "react";
import { Route } from "react-router-dom";
import Hoc from "./hoc/hoc";

import Login from "./containers/Login";
import Signup from "./containers/Signup";
import HomepageLayout from "./containers/Home";

//new
import ProductList from './containers/ProductList';
import OrderSummary from './containers/OrderSummary';

const BaseRouter = () => (
  <Hoc>

    <Route exact path="/products" component={ProductList} />
    <Route exact path="/order-summary" component={OrderSummary} />



    <Route path="/login" component={Login} />
    <Route path="/signup" component={Signup} />
    <Route exact path="/" component={HomepageLayout} />

  </Hoc>
);

export default BaseRouter;
