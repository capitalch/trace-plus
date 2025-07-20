import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import Decimal from "decimal.js";
import { TranHeaderType } from "../../../../utils/global-types-interfaces-enums";
import { format } from "date-fns";
import { VoucherTranDetailsType } from "./all-vouchers-view";

export type VoucherPdfProps = {
  branchName: string,
  currentDateFormat: string,
  tranH: TranHeaderType;
  tranD: VoucherTranDetailsType[];
};

const formatAmount = (amount: number | string | Decimal) =>
  new Decimal(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function AllVouchersPDF({
  branchName,
  currentDateFormat,
  tranH,
  tranD
}: VoucherPdfProps) {
  const unitInfo: UnitInfoType = Utils.getUnitInfo() || {};
  const dateRange: string = Utils.getCurrentFinYearFormattedDateRange();

  const debitEntries = tranD.filter((x: VoucherTranDetailsType) => x.dc === 'D');
  const creditEntries = tranD.filter((x: VoucherTranDetailsType) => x.dc === 'C');

  const debitTotal = debitEntries.reduce((sum: Decimal, item: VoucherTranDetailsType) => sum.plus(item.amount || 0), new Decimal(0));
  const creditTotal = creditEntries.reduce((sum: Decimal, item: VoucherTranDetailsType) => sum.plus(item.amount || 0), new Decimal(0));

  const amountInWords = Utils.toWordsFromAmount(debitTotal.toNumber());

  return (// half height of A4
    <Document>
      <Page size={{ width: 595.28, height: 420.945 }} style={styles.page}> 
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{unitInfo.unitName}</Text>
            <Text style={{ marginTop: 4 }}>{
              "".concat(
                "Branch: " + branchName,
                unitInfo.gstin ? " GSTIN: " + unitInfo.gstin : "",
                unitInfo.address1 ? " Address: " + unitInfo.address1 : "",
                " ",
                unitInfo.address2 || "",
                unitInfo.pin ? " Pin: " + unitInfo.pin : "",
                unitInfo.email ? " Email: " + unitInfo.email : "",
                unitInfo.webSite ? " Web: " + unitInfo.webSite : "",
                unitInfo.state ? " State: " + unitInfo.state : ""
              )
            }</Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={{ fontWeight: "bold", fontSize: 14 }}>{`Voucher type: ${tranH.tranType || ""}`}</Text>
            <Text style={{ fontWeight: "bold", marginTop: 2 }}>FY: {dateRange}</Text>
            <Text style={{ fontWeight: "bold" }}>Date: {format(tranH.tranDate, currentDateFormat)}</Text>
            <Text>Ref No: {tranH.autoRefNo}</Text>
            <Text>{"".concat(
              tranH.userRefNo ? "User Ref: " + tranH.userRefNo : '',
              tranH.remarks ? " Remarks: " + tranH.remarks : ''
            )}</Text>
          </View>
        </View>

        {/* Combined Entries Table */}
        <Text style={styles.sectionTitle}>Voucher Details</Text>
        <View style={styles.tableHeader}>
          <Text style={{ width: 20 }}>#</Text>
          <Text style={{ width: 130 }}>Account</Text>
          <Text style={{ width: 60 }}>Instr no</Text>
          <Text style={{ width: 60 }}>Ref no</Text>
          <Text style={{ width: 150 }}>Remarks</Text>
          <Text style={{ width: 70, textAlign: "right" }}>Debit</Text>
          <Text style={{ width: 70, textAlign: "right" }}>Credit</Text>
        </View>

        {tranD.map((entry: VoucherTranDetailsType, i: number) => (
          <View key={`row-${i}`}>
            <View style={styles.tableRow}>
              <Text style={{ width: 20 }}>{i + 1}</Text>
              <Text style={{ width: 130 }}>{entry.accName || ""}</Text>
              <Text style={{ width: 60 }}>{entry.instrNo}</Text>
              <Text style={{ width: 60 }}>{entry.lineRefNo}</Text>
              <Text style={{ width: 150 }}>{entry.remarks}</Text>
              <Text style={{ width: 70, textAlign: "right" }}>{entry.dc === 'D' ? formatAmount(entry.amount) : ""}</Text>
              <Text style={{ width: 70, textAlign: "right" }}>{entry.dc === 'C' ? formatAmount(entry.amount) : ""}</Text>
            </View>
            {entry.gst && (
              <View style={styles.gstRow}>
                <Text style={{ width: '100%' }}>
                  GSTIN: {entry.gst.gstin || '-'}, HSN: {entry.gst.hsn || '-'}, Rate: {entry.gst.rate || 0}%
                  , CGST: {entry.gst.cgst}, SGST: {entry.gst.sgst}, IGST: {entry.gst.igst}, Input GST: {entry.gst.isInput ? 'Yes' : 'No'}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalRow}>
          <Text style={{ width: 420, textAlign: "right" }}>Total</Text>
          <Text style={{ width: 70, textAlign: "right" }}>{formatAmount(debitTotal)}</Text>
          <Text style={{ width: 70, textAlign: "right" }}>{formatAmount(creditTotal)}</Text>
        </View>

        {/* Amount in words */}
        <Text style={{ marginTop: 5, fontSize: 9, fontStyle: "italic" }}>Amount in words: {amountInWords}</Text>

        {/* Signature */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}><Text>Authorized By</Text></View>
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
    paddingBottom: 2,
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
    marginTop: 2,
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
    marginTop: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 2,
    fontSize: 9,
    marginTop: 2,
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
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    // paddingHorizontal: 20,
  },
  signatureBox: {
    borderTop: '1pt solid #000',
    width: '30%',
    alignItems: 'center',
    paddingTop: 6,
  },
  gstRow: {
    fontSize: 8,
    marginBottom: 4,
    marginLeft: 20,
    color: '#444',
    backgroundColor: '#fafafa',
    padding: 4,
    border: '0.5pt solid #aaa',
    borderRadius: 2,
  },
});