import React from 'react';
import { Button, Container, Header, Icon, Label, Menu, Table, Message, Segment, Dimmer, Loader } from 'semantic-ui-react';

import { Link } from 'react-router-dom';
import { authAxios } from '../utils';
import { orderSummaryURL } from '../constants';

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
        text += `${iv.variation.name}: ${iv.value} ` ;
      })
      return text;
    }

    render(){

      const {data, error, loading} = this.state;
      console.log("DATA: (data)", data);

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
                      <Table.Cell>{orderItem.item.title} - {this.renderVariations(orderItem)}</Table.Cell>
                      <Table.Cell>${orderItem.item.price}</Table.Cell>
                      <Table.Cell>{orderItem.quantity}</Table.Cell>
                      <Table.Cell>

                        {
                        orderItem.item.discount_price &&
                          (
                          <Label color="green" ribbon>ON DISCOUNT</Label>
                          )
                        }
                        ${orderItem.final_price}
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

export default OrderSummary;
