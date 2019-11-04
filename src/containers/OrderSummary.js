import React from 'react';
import {
  Button,
  Container,
  Header,
  Icon,
  Label,
  Menu,
  Table,
  Message,
  Segment,
  Dimmer,
  Loader,
} from 'semantic-ui-react';

import {connect} from 'react-redux';
import { Link, Redirect} from 'react-router-dom';
import { authAxios } from '../utils';
import {
  orderSummaryURL,
  orderItemDeleteURL,
  addToCartURL,
  orderItemUpdateQuantityURL,

 } from '../constants';

class OrderSummary extends React.Component {

    state = {
      data: null,
      error: null,
      loading: false
    }

    componentDidMount(){
      this.handleFetchOrder();
    }


    handleFetchOrder = () => {
      this.setState({loading: true});
      authAxios
        .get(orderSummaryURL)
        .then(res => {
          //res.data.order_items.data
          console.log("RESPONSE (res.data ): " ,  res.data   );
          //dispatches the cartSuccess method with data
          this.setState( { data: res.data , loading: false } );
        })
        .catch(err => {
          //made this around https://youtu.be/Vm9Z6mm2kcU?t=207
          //this is what gets triggered if there is no current order
          if(err.status === 404){
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

    //created at https://youtu.be/qJN1_2ZwqeA?t=2160
    renderVariations = (orderItem) => {
      let text = '';
      //loop through all the variations of the orderItem
      orderItem.item_variations.forEach(iv => {
        //ex: color: red , size: small
        text += `${iv.variation.name}: ${iv.value} | ` ;
      })
      return text;
    }

    //made at https://youtu.be/8UEZsm4tCpY?t=675
    handleFormatData = (itemVariations) => {
      //returns the keys of the itemVariations array becuase that is what the backend is expecting
      //convert [{id: 1}, {id: 2}] to [1,2]
      return Object.keys(itemVariations).map(key =>{
        //"for every object in the array return the id"
        return itemVariations[key].id;
      })
    }

    //made at https://youtu.be/8UEZsm4tCpY?t=581
    //explanation around https://youtu.be/8UEZsm4tCpY?t=510
    handleAddToCart = (slug, itemVariations) => {
      this.setState({ loading: true });
      //filters  the data into the correct format fot the backend
      const variations = this.handleFormatData(itemVariations);
      //authAxios makes sure that the user is signed in before adding to cart... just use axios for adding to cart while signed out
      authAxios
      .post( addToCartURL , { slug, variations } )
      .then(res => {
        console.log(res.data, addToCartURL, "add to cart succeeded");
        this.handleFetchOrder();
        this.setState({ loading: false });
      })
      .catch(err => {
        this.setState({ error: err, loading: false });
        console.log(err , 'add-to-cart failed ');
      });
    }

    //made around https://youtu.be/8UEZsm4tCpY?t=815
    //needs to decrement the quantity in the cart, if quantity is 1 then it should remove the item from the cart
    handleRemoveQuantityFromCart = (slug) => {
      //filled in this function at https://youtu.be/8UEZsm4tCpY?t=1210
      authAxios
      .post( orderItemUpdateQuantityURL, { slug } )
      .then(res => {
        //callback
        this.handleFetchOrder();
      })
      .catch(err => {
          this.setState( {error: err} );
      });
    }

    //made at https://youtu.be/8UEZsm4tCpY?t=150
    handleRemoveItem = (itemID) => {
      authAxios
      .delete( orderItemDeleteURL(itemID) )
      .then(res => {
        //callback
        this.handleFetchOrder();
      })
      .catch(err => {
          this.setState( {error: err} );
      });
    }


    render(){

      const {data, error, loading} = this.state;
      //redirects the user if they aren't authenticated (if their login times out)
      const {isAuthenticated} = this.props ;
      if(!isAuthenticated){
        return <Redirect to='/login' />;
        console.log("you were redirected becuase you were not authenticated");
      }

      console.log("data: ", data);

      return(
        <Container>
          <Header as='h3'>Order Summary</Header>

          {
            error &&
            <Message
              error
              header="There was an error"
              content={JSON.stringify(error)}
            />
          }

          {
            loading &&
            <Segment>
              <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
              </Dimmer>
            </Segment>
          }

          {
            data

            &&

            <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Item #</Table.HeaderCell>
                <Table.HeaderCell>Item name</Table.HeaderCell>
                <Table.HeaderCell>Item price</Table.HeaderCell>
                <Table.HeaderCell>Item quantity</Table.HeaderCell>
                <Table.HeaderCell>Total item price</Table.HeaderCell>

              </Table.Row>
            </Table.Header>


            <Table.Body>

              { data.order_items.map( (orderItem, i) => {

                  return (
                    <Table.Row key={orderItem.id}>
                      <Table.Cell>{i + 1}</Table.Cell>
                      <Table.Cell>{orderItem.item.title} - | {this.renderVariations(orderItem)}</Table.Cell>
                      <Table.Cell>${orderItem.item.price}</Table.Cell>
                      <Table.Cell textAlign='center'>

                        <Icon
                          name='minus'
                          style={{float: 'left', cursor: 'pointer'}}
                          onClick={ () =>
                            this.handleRemoveQuantityFromCart(orderItem.item.slug)}
                        />
                        {orderItem.quantity}
                        <Icon
                          name='plus'
                          style={{float: 'right', cursor: 'pointer'}}
                          onClick={ () =>
                            this.handleAddToCart(
                              orderItem.item.slug,
                              orderItem.item_variations
                            )}
                        />
                      </Table.Cell>
                      <Table.Cell>

                        {
                        orderItem.item.discount_price &&
                          (
                          <Label color="green" ribbon>ON DISCOUNT</Label>
                          )
                        }
                        ${orderItem.final_price}

                        <Icon
                          name='trash'
                          color='red'
                          style={{float: 'right', cursor: 'pointer'}}
                          onClick={ () => this.handleRemoveItem(orderItem.id) }
                        />
                      </Table.Cell>
                    </Table.Row>
                  )
              }) }

              <Table.Row>
                <Table.Cell />
                <Table.Cell />
                <Table.Cell />
                <Table.Cell colSpan='2' textAlign='center'>
                  Total: ${data.total}
                </Table.Cell>
              </Table.Row>

            </Table.Body>



            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='5' textAlign='right'>
                  <Link to='/checkout'>
                    <Button color='yellow' >
                      Checkout
                    </Button>
                  </Link>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>

          </Table>

        }
        </Container>
      )
    }
}

//made at https://youtu.be/8UEZsm4tCpY?t=900
const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.token !== null
  }
}


export default connect(mapStateToProps)(OrderSummary);
