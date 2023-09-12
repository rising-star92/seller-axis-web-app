/* eslint-disable jsx-a11y/alt-text */
import { Order } from '@/app/(withHeader)/orders/interface';
import { Image, StyleSheet, Text, View } from '@react-pdf/renderer';

const PackingSlipHomeDepot = ({ orderDetail }: { orderDetail: Order }) => {
  return (
    <View style={styles.wFull}>
      <View style={styles.view}>
        <View style={styles.w65}>
          <View style={styles.view}>
            <View style={styles.w60}>
              <View style={styles.view}>
                <Image
                  style={{
                    width: '70px',
                    height: '70px'
                  }}
                  src="/The_Home_Depot.png"
                />
                <View>
                  <Text style={styles.text16}>homedepot.com</Text>
                  <Text style={[styles.text9, styles.my16]}>1-800-430-3376</Text>
                  <Text style={styles.text6}>Monday - Sunday : 6 am to 2 am ET</Text>
                </View>
              </View>
              <Text style={[styles.text16, styles.my16]}>Thank you for your order!</Text>
              <View style={styles.border}>
                <Text style={styles.headerTable}>Ship To:</Text>
                <View style={styles.bodyTable}>
                  <Text style={styles.textTable}>
                    {' '}
                    {orderDetail?.verified_ship_to?.contact_name || orderDetail?.ship_to?.name}
                  </Text>
                  <Text style={styles.textTable}>
                    {' '}
                    {orderDetail?.verified_ship_to?.address_2 ||
                      orderDetail?.ship_to?.address_2 ||
                      '-'}
                  </Text>
                  <Text style={styles.textTable}>
                    {' '}
                    {orderDetail?.verified_ship_to?.city || orderDetail?.ship_to?.city}{' '}
                    {orderDetail?.verified_ship_to?.state || orderDetail?.ship_to?.state}{' '}
                    {orderDetail?.verified_ship_to?.postal_code ||
                      orderDetail?.ship_to?.postal_code}{' '}
                    {orderDetail?.verified_ship_to?.country || orderDetail?.ship_to?.country}
                  </Text>
                  <Text style={styles.textTable}>
                    ( {orderDetail?.verified_ship_to?.phone || orderDetail?.ship_to?.day_phone}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                gap: '2px',
                width: '40%'
              }}
            >
              <View style={styles.border}>
                <Text style={styles.headerTable}>Ordered By:</Text>
                <Text style={styles.textTable}>
                  {orderDetail?.verified_ship_to?.contact_name || orderDetail?.ship_to?.name}
                </Text>
              </View>
              <View style={styles.border}>
                <View style={styles.bodyTable}>
                  <Text style={styles.textTable}>
                    Customer Order #: {orderDetail?.cust_order_number}
                  </Text>
                  <Text style={styles.textTable}>Purchase Order #: {orderDetail?.po_number}</Text>
                  <Text style={styles.textTable}>Date: {orderDetail?.order_date}</Text>
                  <Text style={styles.textTable}>
                    Ship Via: {orderDetail?.shipping_service?.name} (carrier not specified){' '}
                  </Text>
                  <Text style={[styles.textTable, styles.my16]}>Address Type: - </Text>
                </View>
              </View>
              <View>
                <Text style={styles.textMessage}>Message:</Text>
                <View style={styles.border}>
                  <Text style={styles.text6}>Adolph Reyes</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Model Number</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Internet Number</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Item Description</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Qty Shipped</Text>
            </View>
            {orderDetail?.items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item?.product_alias?.sku}</Text>
                <Text style={styles.tableCell}>-</Text>
                <Text style={styles.tableCell}>{item?.description}</Text>
                <Text style={styles.tableCell}>{item?.qty_ordered}</Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            width: '35%'
          }}
        >
          <View
            style={[
              styles.border,
              {
                borderBottom: '0px'
              }
            ]}
          >
            <Text style={styles.textHead}>Return Policy Basics</Text>
            <View>
              <Text style={styles.textHeadSub}>For our complete return policy,</Text>
              <Text style={styles.textHeadSub}>visit: www.homedepot.com/returns</Text>
            </View>

            <View style={styles.contentList}>
              <View style={styles.viewList}>
                <Text style={styles.bullet}>•</Text>
                <View>
                  <Text style={styles.text6}>
                    Most merchandise must be returned within 90 days in unused,
                  </Text>
                  <Text style={styles.text6}>
                    like-new condition, unless noted in our return policy exceptions on
                  </Text>
                  <Text style={styles.text6}>homedepot.com</Text>
                </View>
              </View>
              <View style={styles.viewList}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.text6}>
                  Return all items using the original packaging, if available.
                </Text>
              </View>
              <View style={styles.viewList}>
                <Text style={styles.bullet}>•</Text>
                <View>
                  <Text style={styles.text6}>
                    Refunds will be credited back to the original form of payment
                  </Text>
                  <Text style={styles.text6}>
                    within 3-5 business days of carrier pick-up or return in store.
                  </Text>
                </View>
              </View>
              <View style={styles.viewList}>
                <Text style={styles.bullet}>•</Text>
                <View>
                  <Text style={styles.text6}>
                    Expedited shipping costs will not be paid by The Home Depot
                  </Text>
                  <Text style={styles.text6}>
                    when returning an item due to general dissatisfaction or buyer’s.
                  </Text>
                  <Text style={styles.text6}>remorse</Text>
                </View>
              </View>
              <View style={styles.viewList}>
                <Text style={styles.bullet}>•</Text>
                <View>
                  <Text style={styles.text6}>
                    Home Depot return policies apply only to items purchased from
                  </Text>
                  <Text style={styles.text6}>store or online at homedepot.com). Items</Text>
                  <Text style={styles.text6}>
                    purchased from a third-party or marketplace seller, but shipped
                  </Text>
                  <Text style={styles.text6}>
                    by The Home Depot, must be returned to the selling party in
                  </Text>
                  <Text style={styles.text6}>
                    accordance with their return policies. For more information, refer
                  </Text>
                  <Text style={styles.text6}>
                    to our return policy exceptions on homedepot.com.
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.border}>
            <Text style={styles.textHead}>3 Easy Options To Return</Text>

            <View style={styles.contentList}>
              <View style={styles.viewList}>
                <Text style={styles.textLeft}>A</Text>
                <View>
                  <Text style={styles.text6}>Take it to your nearest Home Depot Store.</Text>
                  <Text style={styles.text6}>
                    Bring your shipping confirmation email or packing slip containing
                  </Text>
                  <Text style={styles.text6}>
                    the Customer Order number and the credit card you used for the
                  </Text>
                  <Text style={styles.text6}>purchase</Text>
                </View>
              </View>
              <View style={styles.viewList}>
                <Text style={styles.textLeft}>B.</Text>
                <View>
                  <Text style={styles.text6}>
                    Visit www.homedepot.com/returns to begin the return process.
                  </Text>
                  <Text style={styles.text6}>
                    For items eligible to return online, you can start the return process
                  </Text>
                  <Text style={styles.text6}>
                    {` by selecting the "Return Items" button. If the item qualifies, you`}
                  </Text>
                  <Text style={styles.text6}>
                    will receive a shipping label by email to print and attach to your
                  </Text>
                  <Text style={styles.text6}>
                    return package. Pack the item properly and take it to your nearest{' '}
                  </Text>
                  <Text style={styles.text6}>UPS store or drop box.</Text>
                </View>
              </View>
              <View style={styles.viewList}>
                <Text style={styles.textLeft}>C</Text>
                <View>
                  <Text style={styles.text6}>TCall us at 1-800-430-3376.</Text>
                  <Text style={styles.text6}>
                    A Customer Support Associate can get your return started for{' '}
                  </Text>
                  <Text style={styles.text6}>you, or advise you on your other options. </Text>
                </View>
              </View>
              <Text style={styles.text6}>
                Original, standard shipping charges will be fully refunded for all returns
                regardless of return reason. Items must be returned completely, including all
                components, for a full refund.
              </Text>
              <View>
                <Text style={styles.textHead}>**IMPORTANT**</Text>
              </View>
              <View>
                <Text style={styles.text6}>
                  Federal law prohibits items that use flammable liquids or gas from
                </Text>
                <Text style={[styles.text6, styles.textCenter]}>
                  being returned through the mail.
                </Text>
                <Text style={styles.text6}>
                  Custom-made products, such as paint samples and custom-cut blinds,
                </Text>
                <Text style={[styles.text6, styles.textCenter]}>are not eligible for return.</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divide} />

      <View style={styles.viewBottom}>
        <View
          style={{
            width: '20%'
          }}
        >
          <Text style={[styles.text6, styles.lineHight2]}>PO # {orderDetail?.po_number}</Text>
          <Text style={[styles.text6, styles.lineHight2]}>
            Customer Order #: {orderDetail?.cust_order_number}
          </Text>
          <Text style={[styles.text6, styles.lineHight2]}>
            Customer Name:{' '}
            {orderDetail?.verified_ship_to?.contact_name || orderDetail?.ship_to?.name}
          </Text>
        </View>
        <View
          style={{
            width: '80%'
          }}
        >
          <View style={styles.center}>
            <Text style={styles.text9}>
              Return Form - <Text style={styles.text6}>Please detach and return with items</Text>
            </Text>
          </View>
          <View style={[styles.table, styles.wFull, { borderBottom: '0px' }]}>
            <View style={styles.tableRow}>
              <Text style={[styles.BottomCell, styles.BottomHeader]}>Model Number</Text>
              <Text style={[styles.BottomCell, styles.BottomHeader]}>Internet Number</Text>
              <Text style={[styles.BottomCell, styles.BottomHeader]}>Item Description</Text>
              <Text style={[styles.BottomCell, styles.BottomHeader]}>Qty Returned</Text>
              <Text style={[styles.BottomCell, styles.BottomHeader]}>Return Code</Text>
            </View>
            {orderDetail?.items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.BottomCell}>{item?.product_alias?.sku}</Text>
                <Text style={styles.BottomCell}>-</Text>
                <Text style={styles.BottomCell}>{item?.description}</Text>
                <Text style={styles.BottomCell}></Text>
                <Text style={styles.BottomCell}></Text>
              </View>
            ))}
          </View>
        </View>
        <View
          style={{
            width: '20%'
          }}
        >
          <Text style={[styles.text6, styles.textCenter, styles.lineHight2]}>
            Reason Code Options:
          </Text>
          <Text style={[styles.text6, styles.lineHight2]}>01 = Defective Merchandise</Text>
          <Text style={[styles.text6, styles.lineHight2]}>09 = Damage Merchandise</Text>
          <Text style={[styles.text6, styles.lineHight2]}>12 = Late Delivery</Text>
          <Text style={[styles.text6, styles.lineHight2]}>13 = Received Wrong Product</Text>
          <Text style={[styles.text6, styles.lineHight2]}>{`14 = Changed Mind/Didn't Like`}</Text>
          <Text style={[styles.text6, styles.lineHight2]}>15 = Ordered Wrong Product</Text>
        </View>
      </View>

      <Text style={styles.textBottom}>
        Thank you for shopping at The Home Depot and please come again soon!
      </Text>
    </View>
  );
};

export default PackingSlipHomeDepot;

const styles = StyleSheet.create({
  wFull: {
    width: '100%'
  },
  view: {
    flexDirection: 'row',
    width: '100%',
    gap: '8px'
  },
  w65: {
    width: '65%'
  },
  w60: {
    width: '60%'
  },
  text16: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  headerTable: {
    borderBottom: '1px',
    backgroundColor: '#b7b7b7',
    padding: '2px',
    fontSize: '8px'
  },
  border: {
    borderWidth: '1px',
    width: '100%'
  },
  bodyTable: {
    padding: '4px'
  },
  textTable: {
    fontSize: '8px'
  },

  table: {
    width: '100%',
    marginTop: 10,
    borderWidth: '1px'
  },
  tableHeader: {
    backgroundColor: '#b7b7b7',
    fontWeight: 'bold',
    padding: '2px',
    fontSize: '6px',
    borderRight: '1px',
    borderBottom: '1px'
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableCell: {
    flex: 1,
    fontSize: '8px'
  },
  BottomHeader: {
    backgroundColor: '#b7b7b7',
    fontWeight: 'bold',
    padding: '2px',
    fontSize: '6px'
  },
  BottomCell: {
    flex: 1,
    fontSize: '6px',
    borderBottom: '1px',
    borderRight: '1px'
  },
  text6: {
    fontSize: '6px'
  },
  text9: {
    fontSize: '9px'
    // fontWeight: 'bold'
  },
  textHead: {
    fontSize: '10px',
    textAlign: 'center',
    textDecoration: 'underline'
  },
  textHeadSub: {
    fontSize: '6px',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  contentList: {
    flexDirection: 'column',
    paddingLeft: '4px'
  },
  viewList: {
    flexDirection: 'row',
    marginBottom: 2
  },
  bullet: {
    width: 2,
    height: 2,
    backgroundColor: 'black',
    borderRadius: '50%',
    marginRight: 5
  },

  textLeft: {
    marginRight: '3px',
    fontSize: '6px'
  },
  my16: {
    margin: '16px 0px'
  },
  textCenter: {
    textAlign: 'center'
  },
  divide: {
    width: '100%',
    height: '1px',
    backgroundColor: 'black',
    margin: '8px 0px',
    borderTop: '2px dashed'
  },

  viewBottom: {
    flexDirection: 'row',
    width: '100%',
    gap: '4px',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  lineHight2: {
    lineHeight: '2px'
  },
  center: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  textBottom: {
    textAlign: 'center',
    fontSize: '8px',
    marginTop: '4px'
  },

  textMessage: {
    border: '1px',
    backgroundColor: '#b7b7b7',
    padding: '1px',
    fontSize: '8px',
    width: '45px',
    borderBottom: '0px'
  }
});
