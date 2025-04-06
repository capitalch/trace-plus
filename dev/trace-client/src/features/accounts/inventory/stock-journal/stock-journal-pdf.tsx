import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import Decimal from "decimal.js";
import { TranHeaderType } from "../shared-types";

type StockJournalPdfProps = {
  inputLineItems: any[];
  outputLineItems: any[];
  tranH: TranHeaderType
};

export function StockJournalPdf({
  inputLineItems,
  outputLineItems,
  tranH,
}: StockJournalPdfProps) {
  const unitInfo: UnitInfoType = Utils.getUnitInfo() || {};
  const dateRange: string = Utils.getCurrentFinYearFormattedDateRange();

  function getTotals(items: any[]) {
    const totalQty = items.reduce(
      (sum, item) => new Decimal(sum).plus(item.qty).toNumber(),
      0
    );
    const totalAmount = items.reduce(
      (sum, item) =>
        new Decimal(sum).plus(new Decimal(item.qty).times(item.price)).toNumber(),
      0
    );
    return { totalQty, totalAmount, totalCount: items.length };
  }

  const inputTotals = getTotals(inputLineItems);
  const outputTotals = getTotals(outputLineItems);

  return (
    <Document style={{width: "100%", height: "100%"}}>
      {/* <Page size="A4" style={{ width: "100%", height: "100%" }} > */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{unitInfo.unitName}</Text>
            <Text style={{ marginTop: 4 }}>
              {"".concat(
                unitInfo.gstin ? "GSTIN: " + unitInfo.gstin : "",
                unitInfo.address1
                  ? " Address:" + (unitInfo.address1 || "")
                  : "",
                " ",
                unitInfo.address2 || "",
                unitInfo.pin ? " Pin: " + unitInfo.pin : "",
                unitInfo.email ? " Email: " + unitInfo.email : "",
                unitInfo.landPhone ? " Ph: " + unitInfo.landPhone : "",
                unitInfo.mobileNumber ? " Mob: " + unitInfo.mobileNumber : "",
                unitInfo.webSite ? " Web: " + unitInfo.webSite : "",
                unitInfo.state ? " State: " + unitInfo.state : ""
              )}
            </Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={{ fontWeight: "bold", fontSize: 14 }}>
              Stock Journal
            </Text>
            <Text style={{ fontWeight: "bold", marginTop: 4 }}>
              FY: {dateRange}
            </Text>
            <Text>Date: {tranH.tranDate}</Text>
            <Text>Ref No: {tranH.autoRefNo}</Text>
            <Text>User Ref No: {tranH.userRefNo}</Text>
            <Text>Remarks: {tranH.remarks}</Text>
          </View>
        </View>

        {/* Input Section */}
        <Text style={styles.sectionTitle}>Input Items</Text>
        <View style={styles.tableHeader}>
          <Text style={{ width: 30 }}>#</Text>
          <Text style={{ width: 80 }}>Pr Code</Text>
          <Text style={{ width: 150 }}>Pr Details</Text>
          <Text style={{ width: 50, textAlign: "right" }}>Qty</Text>
          <Text style={{ width: 70, textAlign: "right" }}>Price</Text>
          <Text style={{ width: 80, textAlign: "right" }}>Amount</Text>
          <Text style={styles.serialNumbers}>Sr No</Text>
          <Text style={{ width: 80 }}>Ref No</Text>
          <Text style={{ width: 120 }}>Remarks</Text>
        </View>
        {inputLineItems.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={{ width: 30 }}>{index + 1}</Text>
            <Text style={{ width: 80 }}>{item.productCode}</Text>
            <Text style={{ width: 150 }}>{item.productDetails}</Text>
            <Text style={{ width: 50, textAlign: "right" }}>{item.qty}</Text>
            <Text style={{ width: 70, textAlign: "right" }}>{new Decimal(item.price).toFixed(2)}</Text>
            <Text style={{ width: 80, textAlign: "right" }}>{new Decimal(item.qty).times(item.price).toFixed(2)}</Text>
            <Text style={styles.serialNumbers}>{item.serialNumbers}</Text>
            <Text style={{ width: 80 }}>{item.lineRefNo}</Text>
            <Text style={{ width: 120 }}>{item.lineRemarks}</Text>
          </View>
        ))}
        <View style={styles.totalsRow}>
          <Text style={{ width: 260, fontWeight: "bold" }}>Total</Text>
          <Text style={{ width: 50, textAlign: "right", fontWeight: "bold" }}>{new Decimal(inputTotals.totalQty).toFixed(2)}</Text>
          <Text style={{ width: 70 }} />
          <Text style={{ width: 80, textAlign: "right", fontWeight: "bold" }}>{new Decimal(inputTotals.totalAmount).toFixed(2)}</Text>
          <Text style={{ width: 240, textAlign: "right", fontWeight: "bold" }}>
            Total Items: {inputTotals.totalCount}
          </Text>
        </View>

        {/* Output Section */}
        <Text style={styles.sectionTitle}>Output Items</Text>
        <View style={styles.tableHeader}>
          <Text style={{ width: 30 }}>#</Text>
          <Text style={{ width: 80 }}>Pr Code</Text>
          <Text style={{ width: 150 }}>Pr Details</Text>
          <Text style={{ width: 50, textAlign: "right" }}>Qty</Text>
          <Text style={{ width: 70, textAlign: "right" }}>Price</Text>
          <Text style={{ width: 80, textAlign: "right" }}>Amount</Text>
          <Text style={styles.serialNumbers}>Sr No</Text>
          <Text style={{ width: 80 }}>Ref No</Text>
          <Text style={{ width: 120 }}>Remarks</Text>
        </View>
        {outputLineItems.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={{ width: 30 }}>{index + 1}</Text>
            <Text style={{ width: 80 }}>{item.productCode}</Text>
            <Text style={{ width: 150 }}>{item.productDetails}</Text>
            <Text style={{ width: 50, textAlign: "right" }}>{item.qty}</Text>
            <Text style={{ width: 70, textAlign: "right" }}>{new Decimal(item.price).toFixed(2)}</Text>
            <Text style={{ width: 80, textAlign: "right" }}>{new Decimal(item.qty).times(item.price).toFixed(2)}</Text>
            <Text style={styles.serialNumbers}>{item.serialNumbers}</Text>
            <Text style={{ width: 80 }}>{item.lineRefNo}</Text>
            <Text style={{ width: 120 }}>{item.lineRemarks}</Text>
          </View>
        ))}
        <View style={styles.totalsRow}>
          <Text style={{ width: 260, fontWeight: "bold" }}>Total</Text>
          <Text style={{ width: 50, textAlign: "right", fontWeight: "bold" }}>{new Decimal(outputTotals.totalQty).toFixed(2)}</Text>
          <Text style={{ width: 70 }} />
          <Text style={{ width: 80, textAlign: "right", fontWeight: "bold" }}>{new Decimal(outputTotals.totalAmount).toFixed(2)}</Text>
          <Text style={{ width: 240, textAlign: "right", fontWeight: "bold" }}>
            Total Items: {outputTotals.totalCount}
          </Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
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
  pageNumber: {
    position: "absolute",
    fontSize: 8,
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
  totalsRow: {
    flexDirection: "row",
    borderTop: "1px solid black",
    marginTop: 5,
    paddingTop: 5,
  },
  serialNumbers: {
    marginLeft: 4,
    width: 116,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    flexWrap: "wrap",
  },
});
