
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
  Header,
  Form,
  Divider,
  Dropdown,
  Select

} from 'semantic-ui-react'
import axios from 'axios';

import {connect} from 'react-redux';


//don't really use this at all
import {productDetailURL, addToCartURL} from '../constants'
import {authAxios} from '../utils';
import {fetchCart} from '../store/actions/cart';


class ProductDetail extends React.Component {


  state = {
    loading: false,
    error: null,
    formVisible: false,
    data: [],
    formData: {}
  }

  componentDidMount() {
    this.handleFetchItem();

  }

  //switches the formVisible const in the state.. is used to drop the form to select the variations that you want
  handleToggleForm = () => {
    const {formVisible} = this.state;
    this.setState({
      formVisible: !formVisible
    })
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

  //made at https://youtu.be/qJN1_2ZwqeA?t=1386
  handleFormatData = (formData) => {
    //returns the keys of the formData array becuase that is what the backend is expecting
    //convert {color: 1, size:2} to [1,2] 
    return Object.keys(formData).map(key =>{
      return formData[key];
    })
  }



  handleAddToCart = (slug) => {

    this.setState({ loading: true });
    const {formData} = this.state;
    //filters  the data into the correct format fot the backend
    const variations = this.handleFormatData(formData);
    //authAxios makes sure that the user is signed in before adding to cart... just use axios for adding to cart while signed out
    authAxios
    .post( addToCartURL , { slug, variations } )
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



  handleChange = (e, {name, value}) => {
    //made around https://youtu.be/qJN1_2ZwqeA?t=1126
    const {formData} = this.state
    const updatedFormData = {
      //spread of the formData
      ...formData,
      //changes the name of the key to be the value (this is for passing info to the backend.. ex. changes the name "red" to 1)
      [name]: value
    }
    this.setState({ formData: updatedFormData})
    console.log(name);
    console.log(value);
  }




  render() {

      console.log("this.props: " ,this.props);



      const {data, error, formData, formVisible, loading} = this.state;
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
                {/*the product information (on the left side  of the screen)*/}
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
                            onClick={ this.handleToggleForm }
                          >
                            Add to cart
                            <Icon name='cart plus' />
                        </Button>
                      </React.Fragment>
                    )}
                  />

                  {
                    formVisible &&
                    <React.Fragment>
                      <Divider />
                      <Form>
                        {
                          //this dynamically prints out the select box and all the options
                          data.variations.map(v => {
                            const name = v.name.toLowerCase();
                            console.log("data.variations: ", data.variations);
                            return  (
                              <Form.Field key={v.id} >
                                <Select
                                  name={name}
                                  onChange={this.handleChange}
                                  options={
                                    v.item_variations.map(item=>{
                                      return {
                                        key: item.id,
                                        text: item.value,
                                        value: item.id
                                      }
                                    })}
                                  placeholder={`Choose a ${name}`}
                                  selection
                                  value={formData[name]}
                                />
                              </Form.Field>
                            )
                          })
                        }
                        <Form.Button
                          primary
                          onClick = { () => this.handleAddToCart(item.slug) }
                        >
                          Add to Cart
                        </Form.Button>
                      </Form>
                    </React.Fragment>

                  }

                </Grid.Column>




                {/*the variations of the item (on the right side of the screen)*/}
                <Grid.Column>
                  <Header as='h2'>Different Variations</Header>
                  {
                    data.variations &&
                    data.variations.map(v => {
                      return (
                        <React.Fragment key={ v.id }>
                          <Header as='h3'>{v.name}</Header>
                          <Item.Group divided >
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
