/* eslint-disable jsx-a11y/alt-text */
import { useMemo } from 'react';
import { Document, Image, PDFViewer, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import JsBarcode from 'jsbarcode';

import { Modal } from '@/components/ui/Modal';
import PackingSlip from '../ShipConfirmation/component/ModalPrintPackingSlip/PackingSlip';
import GS1 from '../ShipConfirmation/component/ModalGS1/Gs1';

import type {
  AccTypeBarcode,
  BarCode,
  DataPrintAll,
  Label,
  Order,
  OrderPackage,
  ShipmentPackages
} from '@/app/(withHeader)/orders/interface';
import { isEmptyObject } from '@/utils/utils';
import { SVGToComponent } from '../ShipConfirmation/component/ModalPrintBarcode';

type ModalPrintAfterShip = {
  open: boolean;
  dataPrintAfterShip: {
    listItemShipped: OrderPackage[];
    orderDetail: null;
    itemsLabel: ShipmentPackages[];
  };
  allLabelAfterShip: Label[];
  orderDetail: Order;
  onClose: () => void;
};

const ModalPrintAfterShip = ({
  open,
  onClose,
  dataPrintAfterShip,
  allLabelAfterShip,
  orderDetail
}: ModalPrintAfterShip) => {
  const isCheckGs1 = useMemo(() => {
    return dataPrintAfterShip?.itemsLabel?.some((item) => item?.sscc);
  }, [dataPrintAfterShip]);

  const allBarcodeAfterShip = useMemo(() => {
    if (dataPrintAfterShip?.listItemShipped?.length > 0) {
      const combinedArray = dataPrintAfterShip?.listItemShipped?.reduce((result, currentArray) => {
        return result?.concat(
          currentArray?.order_item_packages?.map((sub: OrderPackage) => ({
            orderId: +currentArray?.id,
            quantity: sub.quantity,
            upc: sub?.retailer_purchase_order_item?.product_alias?.upc,
            sku: sub?.retailer_purchase_order_item?.product_alias?.sku
          }))
        );
      }, []);

      if (combinedArray?.length > 0) {
        const barcodeArr: BarCode[] = [];

        combinedArray?.forEach((data: BarCode) => {
          try {
            const svg = document.createElement('svg');
            JsBarcode(svg, data?.upc, { format: 'UPC' });

            const barcodeData = {
              orderId: data?.orderId,
              sku: data?.sku,
              upc: svg?.outerHTML,
              quantity: data?.quantity
            } as never;

            barcodeArr.push(barcodeData);
          } catch (error) {
            console.error(`Error processing UPC: ${data?.upc}`, error);
          }
        });

        return barcodeArr;
      }

      return [];
    }
  }, [dataPrintAfterShip]);

  const allGs1AfterShip = useMemo(() => {
    if (isCheckGs1 && dataPrintAfterShip?.listItemShipped?.length) {
      let canvas: HTMLCanvasElement;
      if (orderDetail && orderDetail?.ship_to && dataPrintAfterShip?.listItemShipped?.length > 0) {
        const dataSscc: {
          forBarcode: string;
          shipToPostBarcode: string;
          ssccBarcode: {
            tempSsccBarcode: string;
            sscc: string;
          }[];
        } = {
          shipToPostBarcode: '',
          forBarcode: '',
          ssccBarcode: []
        };

        canvas = document.createElement('canvas');
        JsBarcode(canvas, orderDetail?.ship_to?.postal_code, {
          displayValue: false
        });
        const tempShipToBarcode = canvas?.toDataURL();

        dataSscc.shipToPostBarcode = tempShipToBarcode;

        if (orderDetail?.ship_to?.partner_person_place_id) {
          JsBarcode(canvas, orderDetail?.ship_to?.partner_person_place_id, {
            displayValue: false
          });
          const tempForBarcode = canvas?.toDataURL();
          dataSscc.forBarcode = tempForBarcode;
        }

        if (dataPrintAfterShip?.itemsLabel?.length > 0) {
          if (isCheckGs1) {
            const sscc = dataPrintAfterShip.itemsLabel.map((item) => {
              const sscc = item?.sscc;

              JsBarcode(canvas, sscc, {
                displayValue: false,
                height: 200,
                ean128: true
              });
              const tempSsccBarcode = canvas?.toDataURL();
              return {
                tempSsccBarcode,
                sscc
              };
            });

            dataSscc.ssccBarcode = sscc;
          }
        }

        return dataSscc;
      }
    } else {
      return {
        forBarcode: '',
        shipToPostBarcode: '',
        ssccBarcode: []
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataPrintAfterShip?.listItemShipped, isCheckGs1]);

  const dataPrintAll = useMemo(() => {
    const groupedBarcodeData = allBarcodeAfterShip?.reduce((acc: AccTypeBarcode, item: BarCode) => {
      acc[item?.orderId] = acc[item?.orderId] || { orderId: item?.orderId, barcode: [] };
      acc[item?.orderId]?.barcode?.push({ ...item });
      return acc;
    }, {}) as AccTypeBarcode;

    return allLabelAfterShip?.map((item, index) => ({
      orderId: item?.orderId,
      label: item?.data,
      gs1: allGs1AfterShip?.ssccBarcode[index],
      barcode: !isEmptyObject(groupedBarcodeData)
        ? groupedBarcodeData[item?.orderId]?.barcode
        : null
    }));
  }, [allLabelAfterShip, allBarcodeAfterShip, allGs1AfterShip?.ssccBarcode]) as [];

  return (
    <Modal width="!w-[1050px]" title="Shipment Documents" open={open} onClose={onClose}>
      <PDFViewer style={styles.viewer}>
        <Document>
          {dataPrintAfterShip?.orderDetail && (
            <PackingSlip
              orderDetail={dataPrintAfterShip?.orderDetail}
              // itemEachPackingSlip={dataPrintAfterShip?.orderDetail?.items}
            />
          )}
          {dataPrintAll?.map((item: DataPrintAll) => (
            <>
              <Page size={{width: 384, height: 576}} style={styles.page}>
                <Image style={styles.image} src={item.label} />
              </Page>
              {isCheckGs1 && dataPrintAfterShip?.orderDetail && (
                <>
                  <GS1
                    orderDetail={dataPrintAfterShip?.orderDetail}
                    ssccBarcode={item?.gs1?.tempSsccBarcode as string}
                    sscc={item?.gs1?.sscc as string}
                    shipToPostBarcode={allGs1AfterShip?.shipToPostBarcode as string}
                    forBarcode={allGs1AfterShip?.forBarcode as string}
                    orderPackageShipped={dataPrintAfterShip?.listItemShipped}
                  />
                </>
              )}
              {item?.barcode?.map(
                (itemBarcode: BarCode) =>
                  itemBarcode?.quantity &&
                  Array(itemBarcode?.quantity)
                    .fill(itemBarcode)
                    .map((ele: BarCode, index: number) => (
                      <Page key={index} size="A6" style={styles.page}>
                        <View style={styles.container}>
                          {SVGToComponent(ele?.upc)}
                          <Text style={styles.textSku}>{ele?.sku}</Text>
                        </View>
                      </Page>
                    ))
              )}
            </>
          ))}
        </Document>
      </PDFViewer>
    </Modal>
  );
};

export default ModalPrintAfterShip;

const styles = StyleSheet.create({
  text: {
    color: 'black'
  },
  page: {
    backgroundColor: '#ffffff',
    color: 'black',
    padding: 0
  },
  section: {
    margin: 10,
    padding: 10
  },
  viewer: {
    width: 1000,
    height: 600
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    transform: 'rotate(-90deg)'
  },
  barcodeImage: {
    width: 420
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textSku: {
    fontSize: 24
  }
});
