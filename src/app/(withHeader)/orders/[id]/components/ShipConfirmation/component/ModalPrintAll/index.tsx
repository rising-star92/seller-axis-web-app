/* eslint-disable jsx-a11y/alt-text */
import { useMemo } from 'react';
import { Document, Image, PDFViewer, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { Modal } from '@/components/ui/Modal';
import GS1 from '../ModalGS1/Gs1';
import PackingSlip from '../ModalPrintPackingSlip/PackingSlip';

import type {
  AccTypeBarcode,
  BarCode,
  DataPrint,
  DataPrintAll,
  Label,
  Order,
  OrderItemPackages,
  OrderPackage
} from '@/app/(withHeader)/orders/interface';
import { isEmptyObject } from '@/utils/utils';
import { SVGToComponent } from '../ModalPrintBarcode';

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
          orderId?: number;
          tempSsccBarcode: string;
          sscc: string;
        }[];
      }
    | undefined;
  allLabel: Label[];
  orderPackageShipped: OrderPackage[];
};

const ModalPrintAll = ({
  open,
  onClose,
  orderDetail,
  barcodeData,
  printAllGs1,
  allLabel,
  orderPackageShipped
}: ModalPrintAll) => {
  // const generatePackingSlips = useMemo(
  //   () =>
  //     orderDetail?.print_data?.map((listItem) => ({
  //       list_package: listItem?.list_package?.map((orderId) =>
  //         orderPackageShipped?.find((item) => item?.id === orderId)
  //       )
  //     })),
  //   [orderDetail?.print_data, orderPackageShipped]
  // );

  // const dataPrintAll = useMemo(() => {
  //   const groupedBarcodeData = barcodeData?.reduce((acc: AccTypeBarcode, item: BarCode) => {
  //     acc[item?.orderId] = acc[item?.orderId] || { orderId: item?.orderId, barcode: [] };
  //     acc[item?.orderId]?.barcode?.push({ ...item });
  //     return acc;
  //   }, {}) as AccTypeBarcode;

  //   const result = generatePackingSlips?.map((packingSlip, idx) => {
  //     const data_print = packingSlip?.list_package?.map((packageItem) => {
  //       const label = allLabel?.find((label) => label?.orderId === packageItem?.id);
  //       const gs1 = printAllGs1?.ssccBarcode?.find(
  //         (itemGs1) => itemGs1?.orderId === packageItem?.id
  //       );

  //       return {
  //         orderId: packageItem?.id,
  //         label: label?.data,
  //         gs1,
  //         barcode:
  //           !isEmptyObject(groupedBarcodeData) && label
  //             ? groupedBarcodeData[label?.orderId]?.barcode
  //             : null
  //       };
  //     });

  //     return {
  //       list_item: orderDetail?.print_data?.[idx]?.list_item,
  //       data_print
  //     };
  //   });

  //   return result;
  // }, [
  //   barcodeData,
  //   generatePackingSlips,
  //   orderDetail?.print_data,
  //   allLabel,
  //   printAllGs1?.ssccBarcode
  // ]) as [];

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
      barcode: groupedBarcodeData ? (groupedBarcodeData[item?.orderId] || {}).barcode : []
    }));
  }, [allLabel, barcodeData, printAllGs1?.ssccBarcode]) as [];

  return (
    <Modal width="!w-[1050px]" title="Print all" open={open} onClose={onClose}>
      <PDFViewer style={styles.viewer}>
        <Document>
          <PackingSlip orderDetail={orderDetail} />
          {dataPrintAll?.map((item: DataPrintAll) => (
            <>
              <Page size={{width: 384, height: 576}} style={styles.page}>
                <Image style={styles.image} src={item.label} />
              </Page>
              {item?.gs1?.sscc && (
                <GS1
                  orderDetail={orderDetail}
                  ssccBarcode={item?.gs1?.tempSsccBarcode as string}
                  sscc={item?.gs1?.sscc as string}
                  shipToPostBarcode={printAllGs1?.shipToPostBarcode as string}
                  forBarcode={printAllGs1?.forBarcode as string}
                  orderPackageShipped={orderPackageShipped}
                />
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
