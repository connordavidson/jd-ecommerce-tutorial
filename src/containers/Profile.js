import React from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
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
    Button,

  } from 'semantic-ui-react';

import {
    addressListURL,
    addressCreateURL,
    countryListURL,
    userIDURL,
    addressUpdateURL,
    addressDeleteURL,

  } from '../constants';

import {authAxios} from '../utils';

//made around https://youtu.be/QDKHL83tpSE?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=499
const UPDATE_FORM = 'UPDATE_FORM';
const CREATE_FORM = 'CREATE_FORM';

//created at https://youtu.be/QDKHL83tpSE?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=213
class AddressForm extends React.Component {
  state = {
    error: null,
    loading: false,
    //sets the initial properties for the formdata
    formData: {
      address_type: '',
      apartment_address: '',
      country: '',
      default: false,
      id: '',
      street_address: '',
      user: '',
      zip: '',

     },
    saving: false,
    success: false,
    userID: null

  }

  componentDidMount(){
    const {address, formType, } = this.props;
    if(formType === UPDATE_FORM){
      //makes at anonymous callback at https://youtu.be/QDKHL83tpSE?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=883
      this.setState({ formData: address}, () => {
        console.log(this.state);
      })
    }
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


  //this basically just decides if it is going to create a new address or if it is going to update the address that is already in the db
  handleSubmit =(e) => {
    this.setState({ saving: true })
    e.preventDefault();
    const {formType} = this.props;
    console.log(formType);
    if (formType === UPDATE_FORM) {
      console.log('handleUpdateAddress');
      this.handleUpdateAddress();
    } else {
      console.log('handleCreateAddress');
      this.handleCreateAddress();
    }
  }


  handleCreateAddress = () => {
    const {userID, activeItem} = this.props;
    const { formData, } = this.state;
    //added this at https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=2175
    authAxios
    .post(addressCreateURL, {
      ...formData,
      user: userID,
      //we need B or S becuase that's what we have set for the options for address_type in our models (see core.models.py for more info )
      address_type: activeItem === 'billingAddress' ? 'B' : 'S'
    })
    .then(res => {
      this.setState({
        saving: false,
        success: true,
        formData: {default: false}
      });
      this.props.callback();
    })
    .catch(err => {
      this.setState({ error: err});
    })
  }

  //created at https://youtu.be/QDKHL83tpSE?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=630
  handleUpdateAddress = () => {
    const {userID, activeItem} = this.props;
    const {formData } = this.state;

    authAxios
    .put(addressUpdateURL(formData.id), {
      ...formData,
      user: userID,
      //we need B or S becuase that's what we have set for the options for address_type in our models (see core.models.py for more info )
      address_type: activeItem === 'billingAddress' ? 'B' : 'S'
    })
    .then(res => {
      this.setState({
        saving: false,
        success: true,
        formData: {default: false}
      });
      this.props.callback();
    })
    .catch(err => {
      this.setState({ error: err});
    })
  }



  render() {
    const { countries, } = this.props;
    const { error, success, saving, formData, } = this.state;

    return (
      <Form onSubmit={this.handleSubmit} success={success} error={error}>

        <Form.Input
          required
          name='street_address'
          placeholder='Street Address'
          onChange={this.handleChange}
          value={formData.street_address}
        />

        <Form.Input
          name='apartment_address'
          placeholder='Apartment Address'
          onChange={this.handleChange}
          value={formData.apartment_address}
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
            value={formData.country}
          />

        </Form.Field>


        <Form.Input
          required
          name='zip'
          placeholder='Zip code'
          onChange={this.handleChange}
          value={formData.zip}
        />

        <Form.Checkbox
          name='default'
          label='Default address?'
          onChange={this.handleToggleDefault}
          checked={formData.default}
        />

        {success &&
          <Message
            success
            header='Success'
            content="You're address was saved"
          />
        }
        {error && (
          <Message
            error
            header='There was an error'
            content={ JSON.stringify(error) }
          />
        )}

        <Form.Button disabled={saving} loading={saving} primary>Save</Form.Button>

      </Form>
    )
  }
}








//made this file around https://youtu.be/c54wYYIXZ-A?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=245
class Profile extends React.Component {

  state = {
    activeItem: 'billingAddress',
    addresses: [],
    userID: null,
    countries: [],
    selectedAddress: null,

  }

  componentDidMount() {
    this.handleFetchAddresses();
    this.handleFetchCountries();
    this.handleFetchUserID();

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

  //made at https://youtu.be/QDKHL83tpSE?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1486
  handleDeleteAddress = (addressID) => {
    authAxios
    .delete( addressDeleteURL(addressID) )
    .then(res => {
      this.handleCallback();
    })
    .catch(err => {
      this.setState({ error: err });
    })
  }


  //made at https://youtu.be/QDKHL83tpSE?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=732
  handleSelectAddress = (address) => {
    this.setState({selectedAddress: address});

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

  //made at https://youtu.be/QDKHL83tpSE?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1370
  handleCallback = () => {
    this.handleFetchAddresses();
    this.setState({ selectedAddress: null});

  }


  render(){

    const {
        activeItem,
        error,
        loading,
        addresses,
        countries,
        selectedAddress,
        userID,

      } = this.state;

    const {isAuthenticated} = this.props;
    //made at https://youtu.be/QDKHL83tpSE?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1645
    //checks that the user is authenticated before displaying the page
    if(!isAuthenticated){
      return <Redirect to='/login'/>
    }

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

              <Menu.Item
                name='Payment history'
                active={activeItem === 'paymentHistory'}
                onClick={ () => this.handleItemClick('paymentHistory') }
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

                    <Card.Content extra>
                        <Button basic color='yellow' onClick={ () => this.handleSelectAddress(a) }>
                          Update
                        </Button>
                        <Button basic color='red' onClick={ () => this.handleDeleteAddress(a.id) }>
                          Delete
                        </Button>
                    </Card.Content>

                  </Card>
                )
              })}

            </Card.Group>

            {
              //removes the double divider when there is no address
              addresses.length > 0 ?  <Divider /> : null
            }

            { selectedAddress === null ?

                <AddressForm
                  activeItem={activeItem}
                  countries={countries}
                  formType={CREATE_FORM}
                  userID={userID}
                  callback={this.handleCallback}
                />

              : null
            }

            {selectedAddress && (
              <AddressForm
                activeItem={activeItem}
                userID={userID}
                countries={countries}
                address={selectedAddress}
                formType={UPDATE_FORM}
                callback={this.handleCallback}
              />
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}


//made at https://youtu.be/QDKHL83tpSE?list=PLLRM7ROnmA9Hp8j_1NRCK6pNVFfSf4G7a&t=1615
const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.token !== null
  }
}


export default connect(mapStateToProps)(Profile);
