import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { FC } from 'react';

type AccountNode = {
  accName: string;
  closing?: number;
  closing_dc?: 'D' | 'C';
  children?: AccountNode[];
};

type BalanceSheetPdfProps = {
  assets: AccountNode[];
  liabilities: AccountNode[];
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1 solid #ccc',
    paddingVertical: 2,
  },
  colAccount: {
    width: '50%',
    paddingLeft: 2,
  },
  colAmount: {
    width: '25%',
    textAlign: 'right',
    paddingRight: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  indent0: { marginLeft: 0 },
  indent1: { marginLeft: 10 },
  indent2: { marginLeft: 20 },
  bold: { fontWeight: 'bold' },
});

const renderAccount = (
  node: AccountNode,
  level: number,
  isLeft: boolean,
  keyPrefix: string
) => {
  const rows = [
    <View style={styles.row} key={`${keyPrefix}-${node.accName}`}>
      <Text style={[styles.colAccount, styles[`indent${level}`]]}>{node.accName}</Text>
      <Text style={styles.colAmount}>
        {node.closing ? node.closing.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ''}
      </Text>
    </View>,
  ];

  if (node.children && node.children.length > 0) {
    node.children.forEach((child, i) => {
      rows.push(...renderAccount(child, level + 1, isLeft, `${keyPrefix}-${i}`));
    });
  }

  return rows;
};

export const BalanceSheetPdf: FC<BalanceSheetPdfProps> = ({ assets, liabilities }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Balance Sheet</Text>

        <View style={[styles.row, { fontWeight: 'bold' }]}>
          <Text style={styles.colAccount}>Liabilities</Text>
          <Text style={styles.colAmount}>Amount</Text>
          <Text style={styles.colAccount}>Assets</Text>
          <Text style={styles.colAmount}>Amount</Text>
        </View>

        {Array.from({ length: Math.max(liabilities.length, assets.length) }).map((_, i) => (
          <View style={styles.row} key={`row-${i}`}>
            <View style={styles.colAccount}>
              {liabilities[i] && (
                <Text style={styles.indent0}>{liabilities[i].accName}</Text>
              )}
            </View>
            <Text style={styles.colAmount}>
              {liabilities[i]?.closing?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ''}
            </Text>
            <View style={styles.colAccount}>
              {assets[i] && (
                <Text style={styles.indent0}>{assets[i].accName}</Text>
              )}
            </View>
            <Text style={styles.colAmount}>
              {assets[i]?.closing?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || ''}
            </Text>
          </View>
        ))}

        {/* Details */}
        {Array.from({ length: Math.max(liabilities.length, assets.length) }).map((_, i) => (
          <View key={`details-${i}`}>
            <View>
              {liabilities[i]?.children?.map((child, idx) =>
                renderAccount(child, 1, true, `L${i}-${idx}`)
              )}
            </View>
            <View>
              {assets[i]?.children?.map((child, idx) =>
                renderAccount(child, 1, false, `A${i}-${idx}`)
              )}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};
