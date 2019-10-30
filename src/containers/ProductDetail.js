
//file created in https://youtu.be/Zg-bzjZuRa0?t=109

import React from 'react';
import {withRouter} from 'react-router-dom';
import {
  Button,
  Icon,
  Image,
  Item,
  Label,
  Container,
  Segment,
  Loader,
  Dimmer,
  Message,
  Card,
  Grid,
  Header
} from 'semantic-ui-react'
import axios from 'axios';

import {connect} from 'react-redux';


//don't really use this at all
import {productDetailURL, addToCartURL} from '../constants'
import {authAxios} from '../utils';
import {fetchCart} from '../store/actions/cart';


console.log(productDetailURL);




class ProductDetail extends React.Component {



  state = {
    loading: false,
    error: null,
    data: []
  }

  componentDidMount() {
    this.handleFetchItem();

  }

  handleFetchItem = () => {
    //had to change this becuase my log was slightly different
    const productID = this.props.match.params.productID;
    this.setState({ loading: true});
    axios
      .get( productDetailURL(productID) )
      .then(res => {
        this.setState({data: res.data, loading: false});
      })
      .catch(err =>{
        this.setState({error: err, loading: false});
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

      console.log(this.props);


      const {data, error, loading} = this.state;
      const item = data;

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

            {/*made at https://youtu.be/Zg-bzjZuRa0?t=539*/}
            <Grid columns={2} divided>
              <Grid.Row>
                <Grid.Column>
                  {/*fluid makes the card take up the entire lefthand side of the grid colum.. it was smaller wihtout the fluid attribute */}
                  <Card
                    fluid
                    image={ item.image }
                    header={item.title}
                    meta= {
                      <React.Fragment>
                        {item.category}
                        {
                          item.discount_price &&
                            <Label color={
                              item.label === 'primary'
                              ? "blue"
                              : item.label === 'secondary'
                                ? "green"
                                : "olive"
                              }
                            >
                              { item.label }
                            </Label>
                        }
                      </React.Fragment>


                    }
                    description={item.description}
                    extra={(
                      <React.Fragment>

                        <Button
                            fluid
                            color="yellow"
                            floated='right'
                            icon
                            labelPosition='right'
                            onClick={ () => this.handleAddToCart(item.slug) }
                          >
                            Add to cart
                            <Icon name='cart plus' />
                        </Button>


                      </React.Fragment>
                    )}
                  />

                </Grid.Column>



                <Grid.Column>

                  <Header as='h2'>Different Variations</Header>
                  {
                    data.variations &&

                    data.variations.map(v => {
                      return (
                        <React.Fragment>

                          <Item.Group divided key={ v.id }>
                          <Header as='h3'>{v.name}</Header>

                            {
                              v.item_variations.map(iv => {
                                return (


                                    <Item key={ iv.id }>
                                      {
                                        iv.attachment &&
                                        <Item.Image
                                          size='tiny'
                                          src={`http://127.0.0.1:8000${iv.attachment}`}
                                        />
                                      }
                                      <Item.Content verticalAlign='middle'>
                                        {iv.value}
                                      </Item.Content>
                                    </Item>

                                );
                              })
                            }

                          </Item.Group>

                        </React.Fragment>


                      );
                    })

                  }

                </Grid.Column>
              </Grid.Row>

            </Grid>


        </Container>
    );
  }
}


const mapDispatchToProps = dispatch => {
  return {
    fetchCart: () => dispatch(fetchCart()),


  }
}

export default
  withRouter(
    connect(
      null,
      mapDispatchToProps
    )
    (ProductDetail)
  );
