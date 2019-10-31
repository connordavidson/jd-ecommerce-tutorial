import React, {Component} from 'react';
import {CardElement, injectStripe, Elements, StripeProvider} from 'react-stripe-elements';

import {Button, Container, Message, Item, Divider, Header, Loader, Segment, Dimmer, Icon, Label, Checkbox, Form } from 'semantic-ui-react';

import {authAxios} from '../utils';

import {checkoutURL, orderSummaryURL, addCouponURL} from '../constants';

//made this file at https://youtu.be/z7Kq6bHxEcI?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=426
//made major restructuring to this file around https://youtu.be/Vm9Z6mm2kcU?t=1856 . the idea was to only have 1 component with state object instead of 3


//made this class at https://youtu.be/Vm9Z6mm2kcU?t=1779
const OrderPreview = (props) => {

    const { data } = props;
    console.log(data);
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
                    console.log(orderItem)
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
    success: false
  }

  componentDidMount(){
    //gets the order when the component has mounted
    this.handleFetchOrder();
  }

  //comes from OrderSummary.js
  handleFetchOrder = () => {
    this.setState({loading: true});
    authAxios
      .get(orderSummaryURL)
      .then(res => {
        console.log(res.data)
        //dispatches the cartSuccess method with data
        this.setState( {data: res.data, loading: false} );

      })
      .catch(err => {
        //made this around https://youtu.be/Vm9Z6mm2kcU?t=207
        //this is what gets triggered if there is no current order
        if(err.response.status === 404){

          console.log(err.reponse);
          this.setState({
            error: "You currently do not have an order" ,
            loading: false
          });

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


  //filled out this at https://youtu.be/z7Kq6bHxEcI?t=566
  //for submitting the payment
  submit = (ev) => {
      ev.preventDefault();
      // User clicked submit
       this.setState({ loading: true});

       if(this.props.stripe){
         console.log('Stripe is loaded');
        //changed at https://youtu.be/z7Kq6bHxEcI?t=1344
         this.props.stripe.createToken()
         .then(result => {
           if(result.error){
             this.setState({ error: result.error.message, loading: false });
           } else{
             authAxios
              .post(checkoutURL, {stripeToken: result.token.id})
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
    const {data, error, loading, success} = this.state;

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

        <Header>Would you like to complete the purchase?</Header>
        <CardElement />
        <Button loading={loading}
          disabled={loading}
          primary
          onClick={this.submit}
          style={{ marginTop: '10px' }}
        >
          Purchase
        </Button>
      </div>
    );
  }
}




const InjectedForm = injectStripe(CheckoutForm);




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
