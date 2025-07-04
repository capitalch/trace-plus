import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font
} from "@react-pdf/renderer";
import Decimal from "decimal.js";
import { format } from "date-fns";

// Font registration
Font.register({
    family: "Roboto",
    fonts: [
        { src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf" },
        { src: "https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf", fontWeight: "bold" }
    ]
});

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        paddingBottom: 60,
        fontSize: 9,
        fontFamily: "Roboto"
    },
    reportTitle: {
        fontSize: 16,
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 6
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12
    },
    leftHeader: { flexDirection: "column" },
    rightHeader: { flexDirection: "column", textAlign: "right" },
    companyName: { fontSize: 14, fontWeight: "bold" },
    companyAddress: { fontSize: 8, marginTop: 2 },
    companyInfo: { fontSize: 8 },
    tableHeader: {
        flexDirection: "row",
        borderTop: "1pt solid #000",
        borderBottom: "1pt solid #000",
        fontWeight: "bold",
        paddingVertical: 4
    },
    row: {
        flexDirection: "row",
        borderBottom: "0.5pt solid #ccc",
        paddingVertical: 2
    },
    cell: { paddingRight: 6 },
    cellDate: { width: "10%" },
    cellRef: { width: "15%" },
    cellType: { width: "10%" },
    cellAccount: { width: "20%" },
    cellInfo: { width: "25%" },
    cellAmount: {
        width: "10%",
        textAlign: "right"
    },
    summaryRow: {
        flexDirection: "row",
        fontWeight: "bold",
        marginTop: 6,
        alignItems: "center"
    },
    summaryLabel: { width: "60%" },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        fontSize: 9,
        textAlign: 'center',
        color: '#666'
    }
});

// Format amount
const formatAmount = (amount: number) =>
    new Decimal(amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Component
export const GeneralLedger1Pdf = ({
    data,
    accountName,
    fromDate,
    toDate,
    partyAddress = "",
    company = {
        name: "Your Company Name Pvt. Ltd.",
        address: "123 Business Road, Kolkata, WB 700001",
        gstin: "GSTIN: 19ABCDE1234F1Z5",
        email: "contact@yourcompany.com"
    }
}: {
    data: any[];
    accountName: string;
    fromDate: string;
    toDate: string;
    partyAddress?: string;
    company?: {
        name: string;
        address: string;
        gstin?: string;
        email?: string;
    };
}) => {
    const formattedFrom = format(new Date(fromDate), "do MMMM yyyy");
    const formattedTo = format(new Date(toDate), "do MMMM yyyy");

    const debitTotal = data.reduce((sum, row) => sum + (row.debit || 0), 0);
    const creditTotal = data.reduce((sum, row) => sum + (row.credit || 0), 0);
    const closingBalance = debitTotal - creditTotal;
    const closingLabel = closingBalance >= 0 ? "Dr" : "Cr";
    const closingAmount = `${formatAmount(Math.abs(closingBalance))} ${closingLabel}`;

    const getInfo = (row: any) => 
        [row.branchCode, row.instrNo, row.userRefNo, row.remarks, row.lineRefNo, row.lineRemarks]
            .filter(Boolean)
            .join(" | ");

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>
                {/* Title */}
                <Text style={styles.reportTitle} fixed>Ledger Account</Text>

                {/* Header */}
                <View style={styles.header} fixed>
                    <View style={styles.leftHeader}>
                        <Text style={styles.companyName}>{company.name}</Text>
                        <Text style={styles.companyAddress}>{company.address}</Text>
                        {company.gstin && <Text style={styles.companyInfo}>{company.gstin}</Text>}
                        {company.email && <Text style={styles.companyInfo}>{company.email}</Text>}
                    </View>
                    <View style={styles.rightHeader}>
                        <Text>Account: {accountName}</Text>
                        {partyAddress && <Text>{partyAddress}</Text>}
                        <Text>Period: {formattedFrom} to {formattedTo}</Text>
                    </View>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader} fixed>
                    <Text style={[styles.cell, styles.cellDate]}>Date</Text>
                    <Text style={[styles.cell, styles.cellRef]}>Reference</Text>
                    <Text style={[styles.cell, styles.cellType]}>Type</Text>
                    <Text style={[styles.cell, styles.cellAccount]}>Account</Text>
                    <Text style={[styles.cell, styles.cellInfo]}>Info</Text>
                    <Text style={[styles.cell, styles.cellAmount]}>Debit</Text>
                    <Text style={[styles.cell, styles.cellAmount]}>Credit</Text>
                </View>

                {/* Table Rows */}
                {data.map((row, idx) => (
                    <View style={styles.row} key={idx} >
                        <Text style={[styles.cell, styles.cellDate]}>{row.tranDate || ""}</Text>
                        <Text style={[styles.cell, styles.cellRef]}>{row.autoRefNo || ""}</Text>
                        <Text style={[styles.cell, styles.cellType]}>{row.tranType || ""}</Text>
                        <Text style={[styles.cell, styles.cellAccount]}>{row.otherAccounts || ""}</Text>
                        <Text style={[styles.cell, styles.cellInfo]}>{getInfo(row)}</Text>
                        <Text style={[styles.cell, styles.cellAmount]}>{row.debit ? formatAmount(row.debit) : ""}</Text>
                        <Text style={[styles.cell, styles.cellAmount]}>{row.credit ? formatAmount(row.credit) : ""}</Text>
                    </View>
                ))}

                {/* Totals */}
                <View style={[styles.summaryRow, { paddingBottom: 2, borderTop: '1pt solid #000', paddingTop: 4 }]}>
                    <Text style={[styles.cell, styles.summaryLabel]}></Text>
                    <Text style={[styles.cell, { textAlign: "right" }]}>Total Debits:</Text>
                    <Text style={[styles.cell, styles.cellAmount, { fontWeight: "bold" }]}>
                        {formatAmount(debitTotal)}
                    </Text>
                    <Text style={[styles.cell, { textAlign: "right", marginLeft: 10 }]}>Total Credits:</Text>
                    <Text style={[styles.cell, { fontWeight: "bold", paddingRight: 8 }]}>
                        {formatAmount(creditTotal)}
                    </Text>
                </View>

                {/* Closing Balance */}
                <View style={[styles.summaryRow, { justifyContent: 'flex-end', borderBottom: '1pt solid #000', paddingBottom: 4 }]}>
                    <Text style={[styles.cell, { textAlign: "right" }]}>Closing Balance:</Text>
                    <Text style={[styles.cell, styles.cellAmount, { fontWeight: "bold", width: "15%" }]}>
                        {closingAmount}
                    </Text>
                </View>

                {/* Footer */}
                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
};