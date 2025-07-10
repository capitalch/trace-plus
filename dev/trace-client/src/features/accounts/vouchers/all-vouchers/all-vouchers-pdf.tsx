import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import Decimal from "decimal.js";
import { TranHeaderType } from "../../../../utils/global-types-interfaces-enums";
// import { TranHeaderType } from "../shared-definitions";

export type VoucherPdfProps = {
  lineItems: any[];
  tranH: TranHeaderType;
};

export function AllVouchersPDF({ lineItems, tranH }: VoucherPdfProps) {
  const unitInfo: UnitInfoType = Utils.getUnitInfo() || {};
  const dateRange: string = Utils.getCurrentFinYearFormattedDateRange();

  const debitLines = lineItems.filter((item) => item.debit > 0);
  const creditLines = lineItems.filter((item) => item.credit > 0);

  const debitTotal = debitLines.reduce(
    (sum, item) => sum.plus(item.debit || 0),
    new Decimal(0)
  );
  const creditTotal = creditLines.reduce(
    (sum, item) => sum.plus(item.credit || 0),
    new Decimal(0)
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{unitInfo.unitName}</Text>
            <Text style={{ marginTop: 4 }}>{
              "".concat(
                unitInfo.gstin ? "GSTIN: " + unitInfo.gstin : "",
                unitInfo.address1 ? " Address:" + unitInfo.address1 : "",
                " ",
                unitInfo.address2 || "",
                unitInfo.pin ? " Pin: " + unitInfo.pin : "",
                unitInfo.email ? " Email: " + unitInfo.email : "",
                unitInfo.landPhone ? " Ph: " + unitInfo.landPhone : "",
                unitInfo.mobileNumber ? " Mob: " + unitInfo.mobileNumber : "",
                unitInfo.webSite ? " Web: " + unitInfo.webSite : "",
                unitInfo.state ? " State: " + unitInfo.state : ""
              )
            }</Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={{ fontWeight: "bold", fontSize: 14 }}>{
              `Voucher type: ${tranH.tranType || ""}`
            }</Text>
            <Text style={{ fontWeight: "bold", marginTop: 4 }}>FY: {dateRange}</Text>
            <Text>Date: {tranH.tranDate}</Text>
            <Text>Ref No: {tranH.autoRefNo}</Text>
            <Text>User ref: {tranH.userRefNo}</Text>
            <Text>Remarks: {tranH.remarks}</Text>
          </View>
        </View>

        {/* Debit Section */}
        <Text style={styles.sectionTitle}>Debits</Text>
        <View style={styles.tableHeader}>
          <Text style={{ width: 20 }}>#</Text>
          <Text style={{ width: 140 }}>Account</Text>
          <Text style={{ width: 70 }}>Instr no</Text>
          <Text style={{ width: 70 }}>Ref no</Text>
          <Text style={{ width: 150 }}>Remarks</Text>
          <Text style={{ width: 70, textAlign: "right" }}>Amount</Text>
        </View>
        {debitLines.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={{ width: 20 }}>{i + 1}</Text>
            <Text style={{ width: 140 }}>{item.otherAccounts}</Text>
            <Text style={{ width: 70 }}>{item.instrNo}</Text>
            <Text style={{ width: 70 }}>{item.lineRefNo}</Text>
            <Text style={{ width: 150 }}>{item.lineRemarks}</Text>
            <Text style={{ width: 70, textAlign: "right" }}>{
              new Decimal(item.debit).toFixed(2)
            }</Text>
          </View>
        ))}

        {/* Credit Section */}
        <Text style={styles.sectionTitle}>Credits</Text>
        <View style={styles.tableHeader}>
          <Text style={{ width: 20 }}>#</Text>
          <Text style={{ width: 140 }}>Account</Text>
          <Text style={{ width: 70 }}>Instr no</Text>
          <Text style={{ width: 70 }}>Ref no</Text>
          <Text style={{ width: 150 }}>Remarks</Text>
          <Text style={{ width: 70, textAlign: "right" }}>Amount</Text>
        </View>
        {creditLines.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={{ width: 20 }}>{i + 1}</Text>
            <Text style={{ width: 140 }}>{item.otherAccounts}</Text>
            <Text style={{ width: 70 }}>{item.instrNo}</Text>
            <Text style={{ width: 70 }}>{item.lineRefNo}</Text>
            <Text style={{ width: 150 }}>{item.lineRemarks}</Text>
            <Text style={{ width: 70, textAlign: "right" }}>{
              new Decimal(item.credit).toFixed(2)
            }</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={{ width: 300 }}>Total</Text>
          <Text style={{ width: 70, textAlign: "right" }}>{debitTotal.toFixed(2)}</Text>
          <Text style={{ width: 70, textAlign: "right" }}>{creditTotal.toFixed(2)}</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottom: "1px solid black",
  },
  companyInfo: {
    flexDirection: "column",
    width: "60%",
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  transactionInfo: {
    width: "35%",
    flexDirection: "column",
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "bold",
    borderBottom: "1px solid black",
    paddingBottom: 2,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid black",
    paddingVertical: 5,
    fontWeight: "bold",
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 2,
    fontSize: 9,
  },
  totalRow: {
    flexDirection: "row",
    borderTop: "1px solid black",
    marginTop: 10,
    paddingTop: 5,
    fontWeight: "bold",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 8,
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});
