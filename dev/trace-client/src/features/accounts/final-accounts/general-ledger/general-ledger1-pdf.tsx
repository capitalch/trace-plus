import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from "@react-pdf/renderer";
import { format } from "date-fns";
import Decimal from "decimal.js";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf" },
    { src: "https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf", fontWeight: "bold" }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Roboto"
  },
  header: {
    textAlign: "center",
    marginBottom: 10
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2
  },
  subtitle: {
    fontSize: 10,
    color: "#555"
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    paddingBottom: 4,
    fontWeight: "bold"
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 2,
    borderBottom: "0.5pt solid #ddd"
  },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 2,
    borderBottom: "0.5pt solid #bbb",
    backgroundColor: "#f0f0f0",
    fontStyle: "italic"
  },
  cell: {
    paddingHorizontal: 2
  },
  colDate: { width: "12%" },
  colRef: { width: "16%" },
  colParticulars: { width: "26%" },
  colDebit: { width: "12%", textAlign: "right" },
  colCredit: { width: "12%", textAlign: "right" },
  colBalance: { width: "12%", textAlign: "right" },
  colInstr: { width: "10%" }
});

const formatAmount = (amount: number = 0) =>
  new Decimal(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

type LedgerRow = {
  tranDate: string;
  autoRefNo?: string;
  otherAccounts?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  instrNo?: string;
};

type Props = {
  ledgerTitle: string;
  data: LedgerRow[];
};

export const GeneralLedger1Pdf: React.FC<Props> = ({ ledgerTitle, data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>{ledgerTitle}</Text>
          <Text style={styles.subtitle}>Ledger Report</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.colDate]}>Date</Text>
          <Text style={[styles.cell, styles.colRef]}>Ref No</Text>
          <Text style={[styles.cell, styles.colParticulars]}>Particulars</Text>
          <Text style={[styles.cell, styles.colDebit]}>Debit</Text>
          <Text style={[styles.cell, styles.colCredit]}>Credit</Text>
          <Text style={[styles.cell, styles.colBalance]}>Balance</Text>
          <Text style={[styles.cell, styles.colInstr]}>Instr</Text>
        </View>

        {/* Data Rows */}
        {data.map((row, idx) => {
          const isSummary = row.autoRefNo === "Summary";
          const RowStyle = isSummary ? styles.summaryRow : styles.tableRow;
          return (
            <View key={idx} style={RowStyle}>
              <Text style={[styles.cell, styles.colDate]}>{format(new Date(row.tranDate), "dd-MMM-yy")}</Text>
              <Text style={[styles.cell, styles.colRef]}>{row.autoRefNo || ""}</Text>
              <Text style={[styles.cell, styles.colParticulars]}>{row.otherAccounts || ""}</Text>
              <Text style={[styles.cell, styles.colDebit]}>{row.debit ? formatAmount(row.debit) : ""}</Text>
              <Text style={[styles.cell, styles.colCredit]}>{row.credit ? formatAmount(row.credit) : ""}</Text>
              <Text style={[styles.cell, styles.colBalance]}>
                {row.balance !== undefined ? formatAmount(Math.abs(row.balance)) + (row.balance >= 0 ? " Dr" : " Cr") : ""}
              </Text>
              <Text style={[styles.cell, styles.colInstr]}>{row.instrNo || ""}</Text>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};
