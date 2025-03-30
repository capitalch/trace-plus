import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import { BranchTransferJsonResultType } from "./products-branch-transfer-main/products-branch-transfer-main";
import { format } from "date-fns";
import Decimal from "decimal.js";

export function ProductsBranchTransferPdf({
  branchTransfers,
  tranH
}: BranchTransferJsonResultType) {
  const unitInfo: UnitInfoType = Utils.getUnitInfo() || {};
  const dateRange: string = Utils.getCurrentFinYearFormattedDateRange();
  // Calculate totals using Decimal.js
  const totalQty = branchTransfers.reduce(
    (sum, item) => new Decimal(sum).plus(item.qty).toNumber(),
    0
  );
  const totalAmount = branchTransfers.reduce(
    (sum, item) =>
      new Decimal(sum).plus(new Decimal(item.qty).times(item.price)).toNumber(),
    0
  );
  const totalCount = branchTransfers.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          {/* Company info */}
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
          {/* Branch Transfer info */}
          <View style={styles.transactionInfo}>
            <Text style={{ fontWeight: "bold", fontSize: 14 }}>
              Branch Transfer
            </Text>
            <Text style={{ fontWeight: "bold", marginTop: 4 }}>
              FY: {dateRange}
            </Text>
            <Text>Date: {format(tranH.tranDate, tranH.currentDateFormat)}</Text>
            <Text>Ref No: {tranH.autoRefNo}</Text>
            <Text>User Ref No: {tranH.userRefNo}</Text>
            <Text>Remarks: {tranH.remarks}</Text>
          </View>
        </View>

        {/* Table header */}
        <View style={styles.tableHeader} fixed>
          <Text style={{ width: 30 }}>#</Text>
          <Text style={{ width: 80 }}>Pr Code</Text>
          <Text style={{ width: 150 }}>Pr Details</Text>
          <Text style={{ width: 50, textAlign: "right" }}>Qty</Text>
          <Text style={{ width: 70, textAlign: "right" }}>Price</Text>
          <Text style={{ width: 80, textAlign: "right" }}>Amount</Text>
          <Text style={styles.serialNumbers}>Sr No</Text>
          <Text style={{ width: 120 }}>Remarks</Text>
        </View>
        {/* Table rows */}
        {branchTransfers.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={{ width: 30 }}>{index + 1}</Text>
            <Text style={{ width: 80 }}>{item.productCode}</Text>
            <Text style={{ width: 150 }}>{item.productDetails}</Text>
            <Text style={{ width: 50, textAlign: "right" }}>{item.qty}</Text>
            <Text style={{ width: 70, textAlign: "right" }}>
              {new Decimal(item.price).toFixed(2)}
            </Text>
            <Text style={{ width: 80, textAlign: "right" }}>
              {new Decimal(item.qty).times(item.price).toFixed(2)}
            </Text>
            <Text style={styles.serialNumbers}>{item.serialNumbers}</Text>
            <Text style={{ width: 120 }}>{item.lineRemarks}</Text>
          </View>
        ))}
        {/* Table Footer */}
        <View style={styles.totalsRow}>
          <Text style={{ width: 260, fontWeight: "bold" }}>Total</Text>
          <Text style={{ width: 50, textAlign: "right", fontWeight: "bold" }}>
            {new Decimal(totalQty).toFixed(2)}
          </Text>
          <Text style={{ width: 70, textAlign: "right" }}></Text>
          <Text style={{ width: 80, textAlign: "right", fontWeight: "bold" }}>
            {new Decimal(totalAmount).toFixed(2)}
          </Text>
          <Text style={{ width: 240, textAlign: "right", fontWeight: "bold" }}>
            Total Items: {totalCount}
          </Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

// Styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottom: "1px solid black"
  },
  companyInfo: {
    display: "flex",
    flexDirection: "column",
    width: "60%"
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold"
  },
  transactionInfo: {
    textAlign: "left",
    width: "35%",
    display: "flex",
    flexDirection: "column"
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid black",
    paddingVertical: 5,
    fontWeight: "bold",
    marginBottom: 5
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 2,
    fontSize: 9
  },
  pageNumber: {
    position: "absolute",
    fontSize: 8,
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey"
  },
  totalsRow: {
    flexDirection: "row",
    borderTop: "1px solid black",
    marginTop: 5,
    paddingTop: 5
  },
  totalText: {
    textAlign: "right",
    fontWeight: "bold"
  },
  serialNumbers: {
    marginLeft: 4,
    width: 116,
    whiteSpace: "pre-wrap", // Ensures wrapping for long words
    wordBreak: "break-word", // Breaks long words if necessary
    flexWrap: "wrap" // Ensures text wraps properly
  }
});
