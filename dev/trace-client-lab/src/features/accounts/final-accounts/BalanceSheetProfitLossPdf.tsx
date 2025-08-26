import React, { JSX } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from "@react-pdf/renderer";
import Decimal from "decimal.js";
import { UnitInfoType, Utils } from "../../../utils/utils";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf" },
    { src: "https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf", fontWeight: "bold" }
  ]
});

const getIndentStyle = (level: number) => ({
  marginLeft: level * 10
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 50,
    fontSize: 9,
    fontFamily: "Roboto"
  },
  header: {
    marginBottom: 12,
    textAlign: "center"
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold"
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 1
  },
  dateRange: {
    fontSize: 10,
    marginTop: 1
  },
  branch: {
    fontSize: 9,
    marginTop: 1
  },
  companyAddress: {
    fontSize: 8,
    marginTop: 1
  },
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 30,
    right: 30,
    fontSize: 9,
    textAlign: 'center',
    color: '#666'
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
    borderLeft: "1pt solid #ccc",
    borderRight: "1pt solid #ccc"
  },
  column: {
    width: "49%",
    paddingHorizontal: 4
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 1.5,
    borderBottom: "0.5pt solid #eee"
  },
  boldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    fontWeight: "bold",
    borderBottom: "0.5pt solid #ccc"
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
    borderTop: "1pt solid #000",
    fontWeight: "bold"
  },
  nameText: {
    width: "62%",
    wordBreak: "break-word"
  },
  rightAlign: {
    textAlign: "right",
    width: "38%"
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    textDecoration: 'underline'
  }
});

type AccountNode = {
  accName: string;
  accType: 'A' | 'L' | 'E' | 'I';
  closing: number;
  closing_dc: 'D' | 'C';
  children?: AccountNode[];
};

type Props = {
  assets?: AccountNode[];
  liabilities?: AccountNode[];
  income?: AccountNode[];
  expenses?: AccountNode[];
  maxNestingLevel?: number;
  showProfitAndLoss?: boolean;
  lastDateOfYear: string;
  branchName?: string;
};

const getSign = (acc: AccountNode) => {
  let sign = 1
  if (
    (acc.accType === 'L') && (acc.closing_dc === 'D')
    || (acc.accType == 'A') && (acc.closing_dc === 'C')

    || (acc.accType === 'E') && (acc.closing_dc === 'C')
    || (acc.accType == 'I') && (acc.closing_dc === 'D')
  ) {
    sign = -1
  }
  return (sign)
}

const formatAmount = (amount: number) =>
  new Decimal(amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const renderAccounts = (
  accounts: AccountNode[],
  level = 0,
  maxLevel = Infinity
): JSX.Element[] => {
  const elements: JSX.Element[] = [];

  for (const acc of accounts) {
    const hasChildren = acc.children && acc.children.length > 0;
    elements.push(
      <View
        style={level === 0 ? styles.boldRow : styles.row}
        key={`${acc.accName}-${level}`}
      >
        <Text style={[styles.nameText, getIndentStyle(level)]}>{acc.accName}</Text>
        <Text style={[styles.rightAlign, (level === 0) ? { textDecoration: 'underline' } : { textDecoration: 'none' }]}>
          {formatAmount(getSign(acc) * acc.closing)}
        </Text>

      </View>
    );

    if (hasChildren && level < maxLevel - 1) {
      elements.push(...renderAccounts(acc.children!, level + 1, maxLevel));
    }
  }

  return elements;
};

export const BalanceSheetProfitLossPdf: React.FC<Props> = ({
  assets = [],
  liabilities = [],
  income = [],
  expenses = [],
  maxNestingLevel = 3,
  showProfitAndLoss = false,
  lastDateOfYear = '',
  branchName = ''
}) => {
  const getTotal = (nodes: AccountNode[]): Decimal => {
    return nodes.reduce((sum, node) => {
      return sum.plus(getSign(node) * node.closing);
    }, new Decimal(0));
  };
  const unitInfo: UnitInfoType = Utils.getUnitInfo() || {}
  const address = `${unitInfo.address1?.trim() || ''} ${unitInfo.address2?.trim() || ''}, pin: ${unitInfo.pin}`
  const totalAssets = getTotal(assets);
  const totalLiabs = getTotal(liabilities);
  const totalIncome = getTotal(income);
  const totalExpenses = getTotal(expenses);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.companyName}>{unitInfo.unitName}</Text>
          <Text style={styles.companyAddress}>{address}</Text>
          <Text style={styles.branch}>{branchName}</Text>
          <Text style={styles.title}>{showProfitAndLoss ? "Profit and Loss Account" : "Balance Sheet"}</Text>
          <Text style={styles.dateRange}>{`As on ${lastDateOfYear}`}</Text>
        </View>

        <View style={styles.section}>
          {/* Left Column */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{showProfitAndLoss ? "Expenses" : "Liabilities"}</Text>
            {renderAccounts(showProfitAndLoss ? expenses : liabilities, 0, maxNestingLevel)}
            <View style={styles.totalRow}>
              <Text>Total</Text>
              <Text style={styles.rightAlign}>{
                formatAmount((showProfitAndLoss ? totalExpenses : totalLiabs).toNumber())
              }</Text>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{showProfitAndLoss ? "Income" : "Assets"}</Text>
            {renderAccounts(showProfitAndLoss ? income : assets, 0, maxNestingLevel)}
            <View style={styles.totalRow}>
              <Text>Total</Text>
              <Text style={styles.rightAlign}>{
                formatAmount((showProfitAndLoss ? totalIncome : totalAssets).toNumber())
              }</Text>
            </View>
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};