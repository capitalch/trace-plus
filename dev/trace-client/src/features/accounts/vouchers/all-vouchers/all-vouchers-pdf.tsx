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
  creditEntries: VoucherTranDetailsType[];
  debitEntries: VoucherTranDetailsType[];
};

export function AllVouchersPDF({
  branchName,
  tranH,
  currentDateFormat,
  creditEntries,
  debitEntries
}: VoucherPdfProps) {
  const unitInfo: UnitInfoType = Utils.getUnitInfo() || {};
  const dateRange: string = Utils.getCurrentFinYearFormattedDateRange();

  const debitTotal = debitEntries.reduce((sum, item) => sum.plus(item.amount || 0), new Decimal(0));
  const creditTotal = creditEntries.reduce((sum, item) => sum.plus(item.amount || 0), new Decimal(0));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
                unitInfo.landPhone ? " Ph: " + unitInfo.landPhone : "",
                unitInfo.mobileNumber ? " Mob: " + unitInfo.mobileNumber : "",
                unitInfo.webSite ? " Web: " + unitInfo.webSite : "",
                unitInfo.state ? " State: " + unitInfo.state : ""
              )
            }</Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={{ fontWeight: "bold", fontSize: 14 }}>{`Voucher type: ${tranH.tranType || ""}`}</Text>
            <Text style={{ fontWeight: "bold", marginTop: 4 }}>FY: {dateRange}</Text>
            <Text style={{ fontWeight: "bold" }}>Date: {format(tranH.tranDate, currentDateFormat)}</Text>
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
        {debitEntries.map((entry, i) => (
          <View key={`d-${i}`}>
            <View style={styles.tableRow}>
              <Text style={{ width: 20 }}>{i + 1}</Text>
              <Text style={{ width: 140, fontWeight: 'bold' }}>{entry.accName || ""}</Text>
              <Text style={{ width: 70 }}>{entry.instrNo}</Text>
              <Text style={{ width: 70 }}>{entry.lineRefNo}</Text>
              <Text style={{ width: 150 }}>{entry.remarks}</Text>
              <Text style={{ width: 70, textAlign: "right" }}>{new Decimal(entry.amount).toFixed(2)}</Text>
            </View>
            {entry.gst && (
              <View style={styles.gstRow}>
                <Text style={{ width: '100%' }}>
                  GSTIN: {entry.gst.gstin || '-'}, HSN: {entry.gst.hsn || '-'}, Rate: {entry.gst.rate || 0}%
                  , CGST: {entry.gst.cgst}, SGST: {entry.gst.sgst}, IGST: {entry.gst.igst}
                </Text>
              </View>
            )}
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={{ width: 300 }}>Total Debits</Text>
          <Text style={{ width: 70, textAlign: "right" }}>{debitTotal.toFixed(2)}</Text>
        </View>

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
        {creditEntries.map((entry, i) => (
          <View key={`c-${i}`}>
            <View style={styles.tableRow}>
              <Text style={{ width: 20 }}>{i + 1}</Text>
              <Text style={{ width: 140, fontWeight: 'bold' }}>{entry.accName || ""}</Text>
              <Text style={{ width: 70 }}>{entry.instrNo}</Text>
              <Text style={{ width: 70 }}>{entry.lineRefNo}</Text>
              <Text style={{ width: 150 }}>{entry.remarks}</Text>
              <Text style={{ width: 70, textAlign: "right" }}>{new Decimal(entry.amount).toFixed(2)}</Text>
            </View>
            {entry.gst && (
              <View style={styles.gstRow}>
                <Text style={{ width: '100%' }}>
                  GSTIN: {entry.gst.gstin || '-'}, HSN: {entry.gst.hsn || '-'}, Rate: {entry.gst.rate || 0}%
                  , CGST: {entry.gst.cgst}, SGST: {entry.gst.sgst}, IGST: {entry.gst.igst}
                </Text>
              </View>
            )}
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={{ width: 300 }}>Total Credits</Text>
          <Text style={{ width: 70, textAlign: "right" }}>{creditTotal.toFixed(2)}</Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}><Text>Prepared By</Text></View>
          <View style={styles.signatureBox}><Text>Checked By</Text></View>
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
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingHorizontal: 20,
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
    backgroundColor: '#f2f2f2',
    padding: 4,
    border: '0.5pt solid #aaa',
    borderRadius: 2,
  },
});


// import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
// import { UnitInfoType, Utils } from "../../../../utils/utils";
// import Decimal from "decimal.js";
// import { TranHeaderType } from "../../../../utils/global-types-interfaces-enums";
// import { format } from "date-fns";
// import { VoucherTranDetailsType } from "./all-vouchers-view";

// export type VoucherPdfProps = {
//   branchName: string,
//   currentDateFormat: string,
//   tranH: TranHeaderType;
//   creditEntries: VoucherTranDetailsType[];
//   debitEntries: VoucherTranDetailsType[];
// };

// export function AllVouchersPDF({
//   branchName,
//   tranH,
//   currentDateFormat,
//   creditEntries,
//   debitEntries
// }: VoucherPdfProps) {
//   const unitInfo: UnitInfoType = Utils.getUnitInfo() || {};
//   const dateRange: string = Utils.getCurrentFinYearFormattedDateRange();

//   const debitTotal = debitEntries.reduce((sum, item) => sum.plus(item.amount || 0), new Decimal(0));
//   const creditTotal = creditEntries.reduce((sum, item) => sum.plus(item.amount || 0), new Decimal(0));

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* Header */}
//         <View style={styles.header} fixed>
//           <View style={styles.companyInfo}>
//             <Text style={styles.companyName}>{unitInfo.unitName}</Text>
//             <Text style={{ marginTop: 4 }}>{
//               "".concat(
//                 "Branch: " + branchName,
//                 unitInfo.gstin ? " GSTIN: " + unitInfo.gstin : "",
//                 unitInfo.address1 ? " Address: " + unitInfo.address1 : "",
//                 " ",
//                 unitInfo.address2 || "",
//                 unitInfo.pin ? " Pin: " + unitInfo.pin : "",
//                 unitInfo.email ? " Email: " + unitInfo.email : "",
//                 unitInfo.landPhone ? " Ph: " + unitInfo.landPhone : "",
//                 unitInfo.mobileNumber ? " Mob: " + unitInfo.mobileNumber : "",
//                 unitInfo.webSite ? " Web: " + unitInfo.webSite : "",
//                 unitInfo.state ? " State: " + unitInfo.state : ""
//               )
//             }</Text>
//           </View>
//           <View style={styles.transactionInfo}>
//             <Text style={{ fontWeight: "bold", fontSize: 14 }}>{`Voucher type: ${tranH.tranType || ""}`}</Text>
//             <Text style={{ fontWeight: "bold", marginTop: 4 }}>FY: {dateRange}</Text>
//             <Text style={{ fontWeight: "bold" }}>Date: {format(tranH.tranDate, currentDateFormat)}</Text>
//             <Text>Ref No: {tranH.autoRefNo}</Text>
//             <Text>User ref: {tranH.userRefNo}</Text>
//             <Text>Remarks: {tranH.remarks}</Text>
//           </View>
//         </View>

//         {/* Debit Section */}
//         <Text style={styles.sectionTitle}>Debits</Text>
//         <View style={styles.tableHeader}>
//           <Text style={{ width: 20 }}>#</Text>
//           <Text style={{ width: 140 }}>Account</Text>
//           <Text style={{ width: 70 }}>Instr no</Text>
//           <Text style={{ width: 70 }}>Ref no</Text>
//           <Text style={{ width: 150 }}>Remarks</Text>
//           <Text style={{ width: 70, textAlign: "right" }}>Amount</Text>
//         </View>
//         {debitEntries.map((entry, i) => (
//           <View key={`d-${i}`}>
//             <View style={styles.tableRow}>
//               <Text style={{ width: 20 }}>{i + 1}</Text>
//               <Text style={{ width: 140, fontWeight: 'bold' }}>{entry.accName || ""}</Text>
//               <Text style={{ width: 70 }}>{entry.instrNo}</Text>
//               <Text style={{ width: 70 }}>{entry.lineRefNo}</Text>
//               <Text style={{ width: 150 }}>{entry.remarks}</Text>
//               <Text style={{ width: 70, textAlign: "right" }}>{new Decimal(entry.amount).toFixed(2)}</Text>
//             </View>
//             {entry.gst && (
//               <View style={styles.gstRow}>
//                 <Text style={{ width: '100%' }}>
//                   GSTIN: {entry.gst.gstin || '-'}, HSN: {entry.gst.hsn || '-'}, Rate: {entry.gst.rate || 0}%
//                   , CGST: {entry.gst.cgst}, SGST: {entry.gst.sgst}, IGST: {entry.gst.igst}
//                 </Text>
//               </View>
//             )}
//           </View>
//         ))}
//         <View style={styles.totalRow}>
//           <Text style={{ width: 300 }}>Total Debits</Text>
//           <Text style={{ width: 70, textAlign: "right" }}>{debitTotal.toFixed(2)}</Text>
//         </View>

//         {/* Credit Section */}
//         <Text style={styles.sectionTitle}>Credits</Text>
//         <View style={styles.tableHeader}>
//           <Text style={{ width: 20 }}>#</Text>
//           <Text style={{ width: 140 }}>Account</Text>
//           <Text style={{ width: 70 }}>Instr no</Text>
//           <Text style={{ width: 70 }}>Ref no</Text>
//           <Text style={{ width: 150 }}>Remarks</Text>
//           <Text style={{ width: 70, textAlign: "right" }}>Amount</Text>
//         </View>
//         {creditEntries.map((entry, i) => (
//           <View key={`c-${i}`}>
//             <View style={styles.tableRow}>
//               <Text style={{ width: 20 }}>{i + 1}</Text>
//               <Text style={{ width: 140, fontWeight: 'bold' }}>{entry.accName || ""}</Text>
//               <Text style={{ width: 70 }}>{entry.instrNo}</Text>
//               <Text style={{ width: 70 }}>{entry.lineRefNo}</Text>
//               <Text style={{ width: 150 }}>{entry.remarks}</Text>
//               <Text style={{ width: 70, textAlign: "right" }}>{new Decimal(entry.amount).toFixed(2)}</Text>
//             </View>
//             {entry.gst && (
//               <View style={styles.gstRow}>
//                 <Text style={{ width: '100%' }}>
//                   GSTIN: {entry.gst.gstin || '-'}, HSN: {entry.gst.hsn || '-'}, Rate: {entry.gst.rate || 0}%
//                   , CGST: {entry.gst.cgst}, SGST: {entry.gst.sgst}, IGST: {entry.gst.igst}
//                 </Text>
//               </View>
//             )}
//           </View>
//         ))}
//         <View style={styles.totalRow}>
//           <Text style={{ width: 300 }}>Total Credits</Text>
//           <Text style={{ width: 70, textAlign: "right" }}>{creditTotal.toFixed(2)}</Text>
//         </View>

//         {/* Signature */}
//         <View style={styles.signatureArea}>
//           <View style={styles.signatureBox}><Text>Prepared By</Text></View>
//           <View style={styles.signatureBox}><Text>Checked By</Text></View>
//           <View style={styles.signatureBox}><Text>Authorized By</Text></View>
//         </View>

//         <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
//           fixed
//         />
//       </Page>
//     </Document>
//   );
// }

// const styles = StyleSheet.create({
//   page: {
//     padding: 20,
//     fontSize: 10,
//     fontFamily: "Helvetica",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingBottom: 10,
//     borderBottom: "1px solid black",
//   },
//   companyInfo: {
//     flexDirection: "column",
//     width: "60%",
//   },
//   companyName: {
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   transactionInfo: {
//     width: "35%",
//     flexDirection: "column",
//   },
//   sectionTitle: {
//     marginTop: 10,
//     fontSize: 11,
//     fontWeight: "bold",
//     borderBottom: "1px solid black",
//     paddingBottom: 2,
//   },
//   tableHeader: {
//     flexDirection: "row",
//     borderBottom: "1px solid black",
//     paddingVertical: 5,
//     fontWeight: "bold",
//     marginTop: 5,
//   },
//   tableRow: {
//     flexDirection: "row",
//     paddingVertical: 2,
//     fontSize: 9,
//   },
//   totalRow: {
//     flexDirection: "row",
//     borderTop: "1px solid black",
//     marginTop: 10,
//     paddingTop: 5,
//     fontWeight: "bold",
//   },
//   pageNumber: {
//     position: "absolute",
//     fontSize: 8,
//     bottom: 8,
//     left: 0,
//     right: 0,
//     textAlign: "center",
//     color: "grey",
//   },
//   signatureArea: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 40,
//     paddingHorizontal: 20,
//   },
//   signatureBox: {
//     borderTop: '1pt solid #000',
//     width: '30%',
//     alignItems: 'center',
//     paddingTop: 6,
//   },
//   gstRow: {
//     fontSize: 8,
//     marginBottom: 4,
//     marginLeft: 20,
//     color: '#444',
//   },
// });