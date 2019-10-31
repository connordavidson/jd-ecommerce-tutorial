import React from 'react';
import {
  Header,
  Grid,
  Divider,
  Menu,
  Form,
  Loader,
  Message,
  Segment,
  Dimmer,
  Image,
  Select,
  Card,
  Label,

  } from 'semantic-ui-react';

  import {addressListURL, addressCreateURL, countryListURL, userIDURL} from '../constants';
  import {authAxios} from '../utils';



//made this file around https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=245
class Profile extends React.Component {

  state = {
    activeItem: 'billingAddress',
    error: null,
    loading: false,
    addresses: [],
    formData: { default: false },
    countries: [],
    saving: false,
    success: false,
    userID: null

  }

  componentDidMount() {
    this.handleFetchAddresses();
    this.handleFetchCountries();
    this.handleFetchUserID();
    console.log("ADDRESSES: ", this.state.addresses);


  }


  handleItemClick = (name)  => {
    //activeItem doesn't update before the handleFetchAddresses method gets called so it makes it act weird..
    //this uses a call back to force handleFetchAddresses to wait until the state updates
    this.setState( { activeItem: name }, () => {
      this.handleFetchAddresses();
    });
  }

  //made at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1763
  handleFormatCountries = (countries) => {
    //want to get all the object keys of the countrioes object
    const keys = Object.keys(countries);
    //makes a new multidimensional, associative array of countries
    //"for every country, return it's key (read: country code), text (read: name), and value (read: country code)"
    return keys.map(k => {
      return{
        key: k,
        text: countries[k],
        value: k
      }
    })
  }


  //made at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=2463
  handleFetchUserID = () => {
    authAxios
    .get(userIDURL)
    .then(res => {

      this.setState({ userID: res.data.userID });
    })
    .catch(err => {
      this.setState({ error: err });
    })
  }




  //made at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1660
  //gets the available options for countries from django_countries in the backend and stores them in the state
  handleFetchCountries = () => {
    authAxios
    .get(countryListURL)
    .then(res => {
      this.setState({ countries: this.handleFormatCountries(res.data) });
    })
    .catch(err => {
      this.setState({ error: err });
    })
  }




  //gets the user's addresses and stores them in the state
  handleFetchAddresses = () => {
    this.setState({loading: true});
    const {activeItem} = this.state;

    authAxios
    .get( addressListURL(activeItem === 'billingAddress' ? 'B' : 'S') )
    .then(res => {
      this.setState({ addresses: res.data , loading: false});
    })
    .catch(err => {
      this.setState({ error: err });
    })
  }

  //made at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=2090
  handleToggleDefault = () => {
    const {formData} = this.state;
    const updatedFormData = {
      ...formData,
      default: !formData.default
    };
    this.setState({
      formData: updatedFormData
    })
  }




  handleChange =(e) => {
    const {formData} = this.state;
    const updatedFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    this.setState({
      formData: updatedFormData
    })
  }


  //made at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1975
  handleSelectChange = (e, {name, value} ) => {
    const {formData} = this.state;
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    this.setState({
      formData: updatedFormData
    })
  }

  handleCreateAddress = (e) => {
    this.setState({ saving: true })
    e.preventDefault();
    const {activeItem, formData, userID} = this.state;

    //added this at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=2175
    authAxios
    .post(addressCreateURL, {
      ...formData,
      user: userID,
      //we need B or S becuase that's what we have set for the options for address_type in our models (see core.models.py for more info )
      address_type: activeItem === 'billingAddress' ? 'B' : 'S'
    })
    .then(res => {
      this.setState({ saving: false, success: true });
    })
    .catch(err => {
      this.setState({ error: err});
    })


  }



  render(){

    const { activeItem, error, loading, addresses, countries, saving, success } = this.state;


    return (
      <Grid container cols={2} divided>

        <Grid.Row columns={1} >
          <Grid.Column>

            {error && (
              <Message
                error
                header='There was an error'
                content={ JSON.stringify(error) }
              />
            )}

            {loading && (
                <Segment>
                    <Dimmer active inverted>
                      <Loader inverted>Loading</Loader>
                    </Dimmer>
                </Segment>
            )}

          </Grid.Column>
        </Grid.Row>






        <Grid.Row>
          <Grid.Column width={6}>
            <Menu pointing vertical fluid>
              <Menu.Item
                name='Billing Address'
                active={activeItem === 'billingAddress'}
                onClick={ () => this.handleItemClick('billingAddress') }
              />

              <Menu.Item
                name='Shipping Address'
                active={activeItem === 'shippingAddress'}
                onClick={ () => this.handleItemClick('shippingAddress') }
              />


            </Menu>
          </Grid.Column>

          <Grid.Column width={10}>

            <Header>
              {
                `Update your
                  ${
                    activeItem === 'billingAddress' ?
                    'billing' :
                    'shipping'
                  }
                address`
              }
            </Header>
            <Divider />
            <Card.Group>

            { //creates the cards for the saved addresses
              addresses.map(a => {
                console.log("ADDRESSES: ", this.state.addresses);
                return (

                  <Card  key={a.id} >
                    <Card.Content>
                      {
                        a.default &&
                        <Label as='a' color='blue' ribbon="right">Default Address</Label>
                      }
                      <Card.Header> {a.street_address} | {a.apartment_address} </Card.Header>
                      <Card.Meta>{a.country}</Card.Meta>
                      <Card.Description>
                        {a.zip}
                      </Card.Description>
                    </Card.Content>
                  </Card>
              )
            })}

            </Card.Group>

            {
              //removes the double divider when there is no address
              addresses.length > 0 ?
                <Divider /> :
                null
            }

            <Form onSubmit={this.handleCreateAddress} success={success}>

              <Form.Input
                required
                name='street_address'
                placeholder='Street Address'
                onChange={this.handleChange}

              />

              <Form.Input

                name='apartment_address'
                placeholder='Apartment Address'
                onChange={this.handleChange}

              />

              <Form.Field required>
                <Select
                  loading={countries.length < 1 }
                  fluid
                  clearable
                  search
                  options={ countries }
                  name='country'
                  placeholder='Country'
                  onChange={this.handleSelectChange}
                />

              </Form.Field>




              <Form.Input
                required
                name='zip'
                placeholder='Zip code'
                onChange={this.handleChange}

              />

              <Form.Checkbox

                name='default'
                label='Default address?'
                onChange={this.handleToggleDefault}

              />

              {
                success &&
                <Message
                  success
                  header='Success'
                  content="You're address was saved"
                />
              }

              <Form.Button disabled={saving} loading={saving}primary> Save </Form.Button>

            </Form>

          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}


export default Profile
