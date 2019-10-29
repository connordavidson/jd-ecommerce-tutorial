
//file created in https://youtu.be/RG_Y7lIDXPM?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=269

import React from 'react'
import { Button, Icon, Image, Item, Label, Container, Segment, Loader, Dimmer, Message } from 'semantic-ui-react'
import axios from 'axios';

import {connect} from 'react-redux';



//don't really use this at all
import {productListURL, addToCartURL} from '../constants'
import {authAxios} from '../utils';
import {fetchCart} from '../store/actions/cart';



//const paragraph = <Image src='/images/wireframe/short-paragraph.png' />

console.log(productListURL);
console.log(addToCartURL);



class ProductList extends React.Component {

  state = {
    loading: false,
    error: null,
    data: []
  }

  componentDidMount() {

    this.setState({ loading: true });

    axios
    .get(productListURL)
    .then(res => {
      console.log(res.data);
      this.setState({ data: res.data, loading: false });
    })
    .catch(err => {
      this.setState({ error: err, loading: false });
    });

  }



  handleAddToCart = slug => {

    this.setState({ loading: true });
    //authAxios makes sure that the user is signed in before adding to cart... just use axios for adding to cart while signed out
    authAxios
    .post( addToCartURL , {slug}  )
    .then(res => {
      console.log(res.data, addToCartURL, "add to cart succeeded");
      this.props.fetchCart();
      this.setState({ loading: false });
    })
    .catch(err => {
      this.setState({ error: err, loading: false });
      console.log(err , 'add-to-cart failed ');
    });

  }




  render() {

    const {data, error, loading} = this.state;

      return (

        <Container>

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

                  <Image src='/images/wireframe/short-paragraph.png' />
              </Segment>
              )
            }




            <Item.Group divided>
              {/*
                make the item.group dynamic at https://youtu.be/RG_Y7lIDXPM?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1506
                .map() function is basically the same thing as looping through the data array
              */}
              {data.map(item => {
                return (
                  <Item key ={ item.id } >
                    <Item.Image src={ item.image } />

                    <Item.Content>
                      <Item.Header as='a'>{item.title}</Item.Header>
                      <Item.Meta>
                        <span className='cinema'>{item.category}</span>
                      </Item.Meta>
                      <Item.Description>{item.description}</Item.Description>
                      <Item.Extra>

                        <Button primary floated='right' icon labelPosition='right' onClick={ () => this.handleAddToCart(item.slug) }>
                          Add to cart
                          <Icon name='cart plus' />
                        </Button>

                        {
                          item.discount_price &&
                            <Label color={
                              item.label === 'primary'
                              ? "blue"
                              : item.label === 'secondary'
                                ? "green"
                                : "olive"
                            } >
                              { item.label }
                            </Label>
                        }
                      </Item.Extra>
                    </Item.Content>
                  </Item>
                );
              })}
            </Item.Group>
        </Container>
    );
  }
}


const mapDispatchToProps = dispatch => {
  return {
    fetchCart: () => dispatch(fetchCart()),


  }
}

export default connect(null, mapDispatchToProps)(ProductList);
