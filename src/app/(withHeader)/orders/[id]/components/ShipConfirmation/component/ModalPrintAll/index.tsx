/* eslint-disable jsx-a11y/alt-text */
import { useMemo } from 'react';
import { Document, Image, PDFViewer, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { Modal } from '@/components/ui/Modal';
import GS1 from '../ModalGS1/Gs1';
import PackingSlip from '../ModalPrintPackingSlip/PackingSlip';

import type {
  AccTypeBarcode,
  BarCode,
  DataPrintAll,
  Label,
  Order,
  OrderPackage
} from '@/app/(withHeader)/orders/interface';

type ModalPrintAll = {
  open: boolean;
  onClose: () => void;
  orderDetail: Order;
  barcodeData: BarCode[] | undefined;
  printAllGs1:
    | {
        forBarcode: string;
        shipToPostBarcode: string;
        ssccBarcode: {
          tempSsccBarcode: string;
          sscc: string;
        }[];
      }
    | undefined;
  allLabel: Label[];
  orderPackageShipped: OrderPackage[];
  isCheckGS1: boolean;
};

const ModalPrintAll = ({
  open,
  onClose,
  orderDetail,
  barcodeData,
  printAllGs1,
  allLabel,
  orderPackageShipped,
  isCheckGS1
}: ModalPrintAll) => {
  const dataPrintAll = useMemo(() => {
    const groupedBarcodeData = barcodeData?.reduce((acc: AccTypeBarcode, item: BarCode) => {
      acc[item?.orderId] = acc[item?.orderId] || { orderId: item?.orderId, barcode: [] };
      acc[item?.orderId]?.barcode?.push({ ...item });
      return acc;
    }, {}) as AccTypeBarcode;

    return allLabel?.map((item, index) => ({
      orderId: item?.orderId,
      label: item?.data,
      gs1: printAllGs1?.ssccBarcode[index],
      barcode: (groupedBarcodeData[item?.orderId] || {}).barcode || []
    }));
  }, [allLabel, barcodeData, printAllGs1?.ssccBarcode]) as [];

  return (
    <Modal title="Print all" open={open} onClose={onClose}>
      <PDFViewer style={styles.viewer}>
        <Document>
          <PackingSlip orderDetail={orderDetail} />
          {dataPrintAll?.map((item: DataPrintAll) => (
            <>
              {item?.barcode?.map(
                (itemBarcode: BarCode) =>
                  itemBarcode?.quantity &&
                  Array(itemBarcode?.quantity)
                    .fill(itemBarcode)
                    .map((ele: BarCode, index: number) => (
                      <Page key={index} size="A5" style={styles.page}>
                        <View style={styles.container}>
                          <Image src={ele?.upc} style={styles.barcodeImage} />
                          <Text style={styles.textSku}>{ele?.sku}</Text>
                        </View>
                      </Page>
                    ))
              )}
              {isCheckGS1 && (
                <GS1
                  orderDetail={orderDetail}
                  ssccBarcode={item?.gs1?.tempSsccBarcode as string}
                  sscc={item?.gs1?.sscc as string}
                  shipToPostBarcode={printAllGs1?.shipToPostBarcode as string}
                  forBarcode={printAllGs1?.forBarcode as string}
                  orderPackageShipped={orderPackageShipped}
                />
              )}
              <Page size="A4" style={styles.page}>
                <Image style={styles.image} src={item.label} />
              </Page>
            </>
          ))}
        </Document>
      </PDFViewer>
    </Modal>
  );
};

export default ModalPrintAll;

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
    width: '100%',
    height: 417
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
    marginBottom: 10,
    width: 420
  },
  image: {
    paddingTop: '10%',
    width: '100%',
    height: '100%'
  },
  textSku: {
    fontSize: 24
  }
});
