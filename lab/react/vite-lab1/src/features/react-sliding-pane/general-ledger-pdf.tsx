
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
export function GeneralLedgerPdf() {
  const { totalDebits, totalCredits, closingBalance } = calculateTotals(transactions);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyInfo}>
            My Company Name
            {"\n"}123 Business Street
            {"\n"}City, State, ZIP
          </Text>
          <Text style={styles.ledgerInfo}>
            Ledger Account: General Ledger
            {"\n"}Report Date: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableColNarrow}>Date</Text>
          <Text style={styles.tableColNarrow}>Ref-No</Text>
          <Text style={styles.tableColWide}>Account</Text>
          <Text style={styles.tableCol}>Debits</Text>
          <Text style={styles.tableCol}>Credits</Text>
          <Text style={styles.tableColWide}>Info</Text>
        </View>

        {/* Table Rows */}
        {transactions.map((txn, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableColNarrow}>{txn.date}</Text>
            <Text style={styles.tableColNarrow}>{txn.refNo}</Text>
            <Text style={styles.tableColWide}>{txn.account}</Text>
            <Text style={styles.tableCol}>{txn.debits.toFixed(2)}</Text>
            <Text style={styles.tableCol}>{txn.credits.toFixed(2)}</Text>
            <Text style={styles.tableColWide}>{txn.info}</Text>
          </View>
        ))}

        {/* Totals Row */}
        <View style={styles.totalsRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.tableCol}>{totalDebits.toFixed(2)}</Text>
          <Text style={styles.tableCol}>{totalCredits.toFixed(2)}</Text>
        </View>

        {/* Closing Balance */}
        <Text style={styles.closingBalance}>
          Closing Balance: {closingBalance.toFixed(2)}
        </Text>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  companyInfo: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  ledgerInfo: {
    fontSize: 12,
    textAlign: 'right',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
    paddingBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  tableCol: {
    flex: 1,
    textAlign: 'left',
    padding: 2,
  },
  tableColNarrow: {
    flex: 0.5,
    textAlign: 'left',
    padding: 2,
  },
  tableColWide: {
    flex: 2,
    textAlign: 'left',
    padding: 2,
  },
  totalsRow: {
    flexDirection: 'row',
    borderTop: '1px solid black',
    marginTop: 5,
    paddingTop: 5,
  },
  totalText: {
    flex: 3.5,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  closingBalance: {
    textAlign: 'right',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

// Mock data
const transactions = [
  { date: '2024-01-01', refNo: '1001', account: 'Cash', debits: 2000, credits: 0, info: 'Initial Deposit' },
  { date: '2024-01-02', refNo: '1002', account: 'Sales', debits: 0, credits: 500, info: 'Sold Goods' },
  { date: '2024-01-03', refNo: '1003', account: 'Expenses', debits: 300, credits: 0, info: 'Office Supplies' },
];

// Function to calculate totals
const calculateTotals = (transactions:any[]) => {
  let totalDebits = 0;
  let totalCredits = 0;
  transactions.forEach((txn) => {
    totalDebits += txn.debits;
    totalCredits += txn.credits;
  });
  return { totalDebits, totalCredits, closingBalance: totalDebits - totalCredits };
};