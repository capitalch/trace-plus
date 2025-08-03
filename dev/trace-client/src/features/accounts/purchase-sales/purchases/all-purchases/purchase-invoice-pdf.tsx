import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { SalePurchaseEditDataType } from "../../../../../utils/global-types-interfaces-enums";

export function PurchaseInvoicePDF({ currentDateFormat, previewData }: PurchasePdfType) {
    console.log(currentDateFormat, previewData)
    return (<Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Purchase Invoice</Text>

            {/* My Company Placeholder */}
            <View style={styles.section}>
                <Text>My Company Pvt Ltd</Text>
                <Text>123, Business Street</Text>
                <Text>City, State - 123456</Text>
                <Text>GSTIN: XXAAAA0000A1Z5</Text>
            </View>

            {/* Invoice Details */}
            <View style={styles.section}>
                <View style={styles.row}><Text>Invoice No:</Text><Text>TI-KL2526-600720</Text></View>
                <View style={styles.row}><Text>Auto Ref No:</Text><Text>HD/PUR/130/2025</Text></View>
                <View style={styles.row}><Text>Date:</Text><Text>30-Jul-2025</Text></View>
            </View>

            {/* Supplier Details */}
            <View style={styles.section}>
                <Text>Supplier:</Text>
                <Text>Inter Foto India Pvt Ltd</Text>
                <Text>Shantiniketan Building, 8, Camac Street</Text>
                <Text>Kolkata - 700017, WEST BENGAL</Text>
                <Text>Email: kolkata@interfotoindia.com</Text>
                <Text>Phone: 03322651101</Text>
                <Text>GSTIN: 19AAACI8655C1ZI</Text>
            </View>

            {/* Item Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>S.No</Text>
                <Text style={styles.tableCell}>Product Code</Text>
                <Text style={styles.tableCell}>Description</Text>
                <Text style={styles.tableCell}>HSN</Text>
                <Text style={styles.tableCell}>Qty</Text>
                <Text style={styles.tableCell}>Rate</Text>
                <Text style={styles.tableCell}>CGST</Text>
                <Text style={styles.tableCell}>SGST</Text>
                <Text style={styles.tableCell}>Amount</Text>
            </View>

            {/* Items */}
            <View style={styles.tableRow}>
                <Text style={styles.tableCell}>1</Text>
                <Text style={styles.tableCell}>2293</Text>
                <Text style={styles.tableCell}>AF-S NIKKOR 24-70mm F/2.8E ED VR</Text>
                <Text style={styles.tableCell}>90021100</Text>
                <Text style={styles.tableCell}>1</Text>
                <Text style={styles.tableCell}>127,455.64</Text>
                <Text style={styles.tableCell}>11,471.01</Text>
                <Text style={styles.tableCell}>11,471.01</Text>
                <Text style={styles.tableCell}>150,397.66</Text>
            </View>

            {/* Info/Serial No */}
            <Text>Info: The AF-S NIKKOR 24-70mm f/2.8E ED VR is a standard zoom lens featuring a range of Nikon technologies including VR image stabilization.</Text>
            <Text>Serial No: 2200293</Text>

            {/* Totals */}
            <View style={styles.section}>
                <View style={styles.row}><Text>Sub Total:</Text><Text>₹127,455.64</Text></View>
                <View style={styles.row}><Text>CGST:</Text><Text>₹11,471.01</Text></View>
                <View style={styles.row}><Text>SGST:</Text><Text>₹11,471.01</Text></View>
                <View style={styles.row}><Text>Total:</Text><Text>₹150,397.66</Text></View>
            </View>

            {/* Declaration & Signature */}
            <Text>Declaration: Goods once sold will not be taken back. Subject to Kolkata jurisdiction.</Text>

            <Text style={styles.signature}>Authorized Signatory</Text>
        </Page>
    </Document>)
}

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica'
    },
    section: {
        marginBottom: 10
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    tableHeader: {
        backgroundColor: '#eee',
        padding: 4,
        fontWeight: 'bold'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #ccc',
        paddingVertical: 2
    },
    tableCell: {
        flex: 1,
        paddingRight: 5
    },
    signature: {
        marginTop: 40,
        textAlign: 'right'
    }
});

type PurchasePdfType = {
    currentDateFormat: string;
    previewData: SalePurchaseEditDataType;
}