import React, {Component} from 'react';
import {
  CardElement,
  injectStripe,
  Elements,
  StripeProvider
} from 'react-stripe-elements';

import {
    Button,
    Container,
    Message,
    Item,
    Divider,
    Header,
    Loader,
    Segment,
    Dimmer,
    Icon,
    Label,
    Checkbox,
    Form,
    Select

  } from 'semantic-ui-react';

import {
    Link,
    withRouter,

  } from 'react-router-dom';

import {authAxios} from '../utils';

import {
    checkoutURL,
    orderSummaryURL,
    addCouponURL,
    addressListURL

  } from '../constants';

//made this file at https://youtu.be/z7Kq6bHxEcI?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=426
//made major restructuring to this file around https://youtu.be/Vm9Z6mm2kcU?t=1856 . the idea was to only have 1 component with state object instead of 3


//made this class at https://youtu.be/Vm9Z6mm2kcU?t=1779
const OrderPreview = (props) => {

    const { data } = props;
    return(
      <div>
        <React.Fragment>
          {
              data &&
              //fill out this item group around https://youtu.be/Vm9Z6mm2kcU?t=577
              <React.Fragment>

                <Item.Group relaxed>
                  {/*loops through the items in the cart and displays them 1 by 1*/}
                  {data.order_items.map((orderItem, i) => {
                    return (
                      <Item key={i}>
                        <Item.Image
                          size='tiny'
                          src={`http://127.0.0.1:8000${orderItem.item.image}`}
                        />

                        <Item.Content verticalAlign='middle'>
                          <Item.Header as='a'>
                            {orderItem.quantity} x {orderItem.item.title}
                          </Item.Header>
                          <Item.Extra>
                            <Label>${orderItem.final_price}</Label>
                          </Item.Extra>
                        </Item.Content>

                      </Item>
                    );
                  })}
                </Item.Group>


                <Item.Group>
                  <Item>
                    <Item.Content>
                      <Item.Header>
                        Order Total: ${data.total}
                        {
                          data.coupon &&
                          <Label color="green" style= {{marginLeft:'10px'}}>
                            Current coupon: {data.coupon.code} for ${data.coupon.amount}
                          </Label>
                        }
                      </Item.Header>
                    </Item.Content>
                  </Item>
                </Item.Group>

            </React.Fragment>
            }
        </React.Fragment>
      </div>
  )
}







//made at https://youtu.be/Vm9Z6mm2kcU?t=1187
class CouponForm extends Component {
  state = {
    code: ''
  };

  //made at https://youtu.be/Vm9Z6mm2kcU?t=1431
  handleChange = e => {
    this.setState({
      code: e.target.value
    });
  };

  //handleAddCoupon comes from the Checkout form component.. gets passed in
  handleSubmit = (e) => {
    const { code } = this.state;
    this.props.handleAddCoupon(e, code);
    //resets the form with the code.. without this, the code stays in the textbox after page refresh
    this.setState({code: ''});
  };


  render(){
    const {code} = this.state;

    return(
      <React.Fragment>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Coupon code</label>
            <input
              placeholder='Enter a coupon..'
              value={code}
              onChange={this.handleChange}
            />
          </Form.Field>

          <Button type='submit'>Add coupon</Button>
        </Form>

      </React.Fragment>

    )
  }
}





class CheckoutForm extends Component {

  state = {
    data: null,
    loading: false,
    error: null,
    success: false,
    shippingAddresses: [],
    billingAddresses: [],
    selectedBillingAddress: '',
    selectedShippingAddress: '',

  }

  componentDidMount(){
    //gets the order when the component has mounted
    this.handleFetchOrder();
    this.handleFetchBillingAddresses();
    this.handleFetchShippingAddresses();
  }

  //made at https://youtu.be/NaJ-b0ZaSoI?t=875
  handleGetDefaultAddress = (addresses) => {
    const filteredAddresses = addresses.filter( el => el.default === true )
    if(filteredAddresses.length > 0){

      return filteredAddresses[0].id;
    }
    return '';

  }

  //created at https://youtu.be/NaJ-b0ZaSoI?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=175
  handleFetchBillingAddresses = () => {
    this.setState({loading: true});
    authAxios
      //takes B for Billing
      .get(addressListURL('B'))
      .then(res => {
        //dispatches the cartSuccess method with data
        this.setState({
          billingAddresses: res.data.map(a => {
            return {
              key: a.id,
              text: `${a.street_address}, ${a.apartment_address}, ${a.country}`,
              value: a.id
              };
            }),
          selectedBillingAddress: this.handleGetDefaultAddress(res.data) ,
          loading: false
        });
      })
      .catch(err => {
          this.setState( {error: err, loading: false} );
      });
  }


  //created at https://youtu.be/NaJ-b0ZaSoI?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=209
  handleFetchShippingAddresses = () => {
    this.setState({loading: true});
    authAxios
      //S for shipping
      .get(addressListURL('S'))
      .then(res => {
        //dispatches the cartSuccess method with data
        this.setState({
          shippingAddresses: res.data.map(a => {
            return {
              key: a.id,
              text: `${a.street_address}, ${a.apartment_address}, ${a.country}`,
              value: a.id
              };
            }),
          selectedShippingAddress: this.handleGetDefaultAddress(res.data) ,
          loading: false
        });
      })
      .catch(err => {
          this.setState( {error: err, loading: false} );
        });
  }




  //comes from OrderSummary.js
  handleFetchOrder = () => {
    this.setState({loading: true});
    authAxios
      .get(orderSummaryURL)
      .then(res => {
        //dispatches the cartSuccess method with data
        this.setState( {data: res.data, loading: false} );
      })
      .catch(err => {
        //made this around https://youtu.be/Vm9Z6mm2kcU?t=207
        //this is what gets triggered if there is no current order
        if(err.response.status === 404){
          //made at https://youtu.be/NaJ-b0ZaSoI?t=1620
          //moves the user to /products if they don't have an active order. 
          this.props.history.push('/products');
        } else{
          this.setState( {error: err, loading: false} );
        }

      });
  };

  //for adding a coupon
  handleAddCoupon = (e, code) => {
    e.preventDefault();
    this.setState({ loading: true });

    authAxios.post(addCouponURL, {code})
    .then(res => {
      this.setState({ loading: false });
      this.handleFetchOrder();
    })
    .catch(err => {
      this.setState({ error: err, loading: false });
    });
  };

  //made at https://youtu.be/NaJ-b0ZaSoI?t=1035
  //for letting the user select more than just the default shipping address
  handleSelectChange = (e, { name, value }) => {
    this.setState({
      [name]: value
    });
  };


  //filled out this at https://youtu.be/z7Kq6bHxEcI?t=566
  //for submitting the payment
  submit = (ev) => {
      ev.preventDefault();
      // User clicked submit
       this.setState({ loading: true});
       if(this.props.stripe){
        //changed at https://youtu.be/z7Kq6bHxEcI?t=1344
         this.props.stripe.createToken()
         .then(result => {
           if(result.error){
             this.setState({ error: result.error.message, loading: false });
           } else{
             this.setState({ error: null });
             const {
               selectedBillingAddress,
               selectedShippingAddress,
             } = this.state;

             authAxios
              .post(checkoutURL,
                {
                  stripeToken: result.token.id,
                  selectedBillingAddress,
                  selectedShippingAddress
                })
              .then(res => {
                  this.setState({ loading: false, success: true });
              })
              .catch(err => {
                this.setState({ loading: false , error: err });
              });
            }
         });
      } else {
        console.log('Stripe is not loaded');
      }
    }

  render() {
    const {
        data,
        error,
        loading,
        success,
        billingAddresses,
        shippingAddresses,
        selectedBillingAddress,
        selectedShippingAddress,

      } = this.state;

    return (
      <div>

        {
          //if there's an error then display a message component
          error &&
          (
            <Message
              error
              header='There was some errors with your submission'
              content={ JSON.stringify(error) }
            />
          )
        }

        {
          //if loading is true then render the spinner component
          loading
          &&
          (
          <Segment>
              <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
              </Dimmer>
          </Segment>
          )
        }

        {
          success && (
          <Message positive>
            <Message.Header>Your payment was successful</Message.Header>
            <p>
              Go to your <b>profile</b> to see the order delivery status.
            </p>
          </Message>
          )
        }

        {/*displays the order preview*/}
        <OrderPreview data={data} />
        <Divider />

        {/*added handleRefresh at https://youtu.be/Vm9Z6mm2kcU?t=1788 ..... handleRefresh gets turned into handleAddCoupon at https://youtu.be/Vm9Z6mm2kcU?t=2056*/}
        <CouponForm
          handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)}
        />
        <Divider />

        {/*made at https://youtu.be/NaJ-b0ZaSoI?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=560 ish*/}
        <Header>Select a billing address [{billingAddresses.length}]</Header>
        {
          //checks if there are no shipping addresses and suggests a redirection
          billingAddresses.length > 0 ?
          <Select
            name='selectedBillingAddress'
            value={selectedBillingAddress}
            clearable
            options={billingAddresses}
            selection
            onChange={this.handleSelectChange}
          /> :
            <p>
              You nede 2 <Link to='/profile'>add an bulling ardreses</Link> plz
            </p>
        }


        <Header>Select a shipping address [{shippingAddresses.length}]</Header>
        {
          //checks if there are no billing addresses and suggests a redirection
          shippingAddresses.length > 0 ?
          //changed name to value at https://youtu.be/NaJ-b0ZaSoI?t=1160 so that you can reselect an address
          <Select
            name='selectedShippingAddress'
            value={selectedShippingAddress}
            clearable
            options={shippingAddresses}
            selection
            onChange={this.handleSelectChange}
            /> :
            <p>
              You nede 2 <Link to='/profile'>add an shipring ardreses</Link> plz
            </p>
        }
        <Divider />

        {
          //made at https://youtu.be/NaJ-b0ZaSoI?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=360
          //make ssure that the addresses are saved before displaying the payment option
          billingAddresses.length < 1 || shippingAddresses.length < 1 ?
            <p>
              You nede 2 add ardsess be4 compelteing you'r purshae
            </p>

          :
            <React.Fragment>
              <Header>Would you like to complete the purchase?</Header>
              <CardElement />
              {
                success && (
                <Message positive>
                  <Message.Header>Your payment was successful</Message.Header>
                  <p>
                    Go to your <b>profile</b> to see the order delivery status.
                  </p>
                </Message>
                )
              }

              <Button loading={loading}
                disabled={loading}
                primary
                onClick={this.submit}
                style={{ marginTop: '10px' }}
              >
                Purchase
              </Button>
            </React.Fragment>
        }

      </div>
    );
  }
}




const InjectedForm = withRouter(injectStripe(CheckoutForm));




const WrappedForm = () => (
  <Container text>
    <StripeProvider apiKey="pk_test_TYooMQauvdEDq54NiTphI7jx">
      <div >
        <h1>Complete your order</h1>
        <Elements>
          <InjectedForm/>
        </Elements>
      </div>
    </StripeProvider>
  </Container>

)

export default WrappedForm;


/*
1. adding the order items in the payment view as a summary
2. adding discount code form in checkout view
*/
