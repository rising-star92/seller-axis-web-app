/* eslint-disable jsx-a11y/alt-text */
import { Document, PDFViewer, Page, Image, StyleSheet } from '@react-pdf/renderer';

import { Modal } from '@/components/ui/Modal';

const ModalPrintAllLabel = ({
  open,
  onClose,
  allLabel
}: {
  open: boolean;
  onClose: () => void;
  allLabel: string[];
}) => {
  return (
    <Modal title="All Label" open={open} onClose={onClose}>
      <PDFViewer
        style={{
          width: '100%',
          height: 500
        }}
      >
        <Document>
          {allLabel.map((item: string) => (
            <Page key={item} size="A4" style={styles.page}>
              <Image style={styles.image} src={item} />
            </Page>
          ))}
        </Document>
      </PDFViewer>
    </Modal>
  );
};

export default ModalPrintAllLabel;

const styles = StyleSheet.create({
  image: {
    paddingTop: '10%',
    width: '100%',
    height: '100%'
  },
  page: {
    backgroundColor: '#ffffff',
    color: 'white',
    width: '100%',
    height: 417
  },
  section: {
    margin: 10,
    padding: 10
  },
  viewer: {
    width: '100%',
    height: 417
  }
});
