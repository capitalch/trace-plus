import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { TranType } from "./general-ledger";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import Decimal from "decimal.js";
import { BranchType } from "../../../login/login-slice";
import dayjs from "dayjs";

export function GeneralLedgerPdf({ accName, isAllBranches, transactions }: GeneralLedgerPdfType) {
    const unitInfo: UnitInfoType = Utils.getUnitInfo() || {}
    const dateRange: string = Utils.getCurrentFinYearFormattedDateRange()
    const currentBranch: BranchType | undefined = Utils.getCurrentBranch()
    const currentDateFormat: string = Utils.getCurrentDateFormat() || 'dd/MM/yyyy'
    const { totalDebits, totalCredits, closingBalance } = calculateTotals(transactions);
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header} fixed>
                    {/* Company info */}
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{unitInfo.unitName}</Text>
                        <Text>{isAllBranches ? '' : 'Branch: ' + currentBranch?.branchName}</Text>
                        <Text style={{ marginTop: 4 }}>
                            {''.concat(
                                unitInfo.gstin ? 'GSTIN: ' + unitInfo.gstin : '',
                                unitInfo.address1 ? ' Address:' + (unitInfo.address1 || '') : '',
                                ' ', (unitInfo.address2 || ''),
                                unitInfo.pin ? ' Pin: ' + unitInfo.pin : '',
                                unitInfo.email ? ' Email: ' + unitInfo.email : '',
                                unitInfo.landPhone ? ' Ph: ' + unitInfo.landPhone : '',
                                unitInfo.mobileNumber ? ' Mob: ' + unitInfo.mobileNumber : '',
                                unitInfo.webSite ? ' Web: ' + unitInfo.webSite : '',
                                unitInfo.state ? ' State: ' + unitInfo.state : ''
                            )}
                        </Text>
                    </View>
                    {/* ledger info */}
                    <View style={styles.ledgerInfo}>
                        <Text style={{ fontWeight: 'bold', fontSize: '14' }}>Ledger account</Text>
                        <Text style={styles.ledgerName}>{accName}</Text>
                        <Text style={{ fontWeight: 'bold', marginTop: 4 }}>{dateRange}</Text>
                    </View>
                </View>
                {/* Table header */}
                <View style={styles.tableHeader} fixed>
                    <Text style={{ width: 50 }}>Date</Text>
                    <Text style={{ width: 80, marginLeft: 5 }}>Ref</Text>
                    <Text style={{ width: 110 }}>Account</Text>
                    <Text style={{ width: 65, textAlign: 'right' }}>Debits</Text>
                    <Text style={{ width: 65, textAlign: 'right' }}>Credits</Text>
                    <Text style={{ width: 50, marginLeft: 15 }}>Type</Text>
                    <Text style={{ width: 115, }}>Info</Text>
                </View>
                {/* Table rows */}
                {transactions.map((tran: TranType, index: number) => (
                    <View style={styles.tableRow} key={index}>
                        <Text style={{ width: 50 }}>{dayjs(tran.tranDate).format(currentDateFormat)}</Text>
                        <Text style={{ width: 80, marginLeft: 5 }}>{tran.autoRefNo}</Text>
                        <Text style={{ width: 110 }}>{tran.otherAccounts}</Text>
                        <Text style={{ width: 65, textAlign: 'right' }}>{tran.debit ? Utils.toDecimalFormat(tran.debit) : ''}</Text>
                        <Text style={{ width: 65, textAlign: 'right' }}>{tran.credit ? Utils.toDecimalFormat(tran.credit) : ''}</Text>
                        <Text style={{ width: 50, marginLeft: 15 }}>{tran.tranType}</Text>
                        <Text style={{ width: 115, }}>{
                            ''.concat(
                                tran.branchCode || '',
                                ': ',
                                tran.userRefNo || '',
                                ' ',
                                tran.instrNo || '',
                                ' ',
                                tran.remarks || '',
                                ' ',
                                tran.lineRefNo || '',
                                ' ',
                                tran.lineRemarks || ''
                            )
                        }</Text>
                    </View>
                ))}

                {/* Totals Row */}
                <View style={styles.totalsRow}>
                    <Text style={[styles.totalText, { width: 210 }]}>Total</Text>
                    <Text style={[styles.totalText, { width: 95, marginLeft: 4 }]}>{Utils.toDecimalFormat(totalDebits)}</Text>
                    <Text style={[styles.totalText, { width: 95, textAlign: 'left', marginLeft: 20 }]}>{Utils.toDecimalFormat(totalCredits)}</Text>
                </View>

                {/* Closing Balance */}
                <Text style={styles.closingBalance}>
                    Closing Balance: {`${Utils.toDecimalFormat(Math.abs(closingBalance))} ${closingBalance < 0 ? 'Cr' : 'Dr'}`}
                </Text>

                {/* page no */}
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }: any) =>
                        `${pageNumber} / ${totalPages}`
                    }
                    fixed></Text>
            </Page>
        </Document>
    );
}

// Function to calculate totals
function calculateTotals(transactions: TranType[]): { totalDebits: number, totalCredits: number, closingBalance: number } {
    const ret: DebitCreditType = transactions.reduce(
        (sum: DebitCreditType, current: TranType) => ({
            debit: sum.debit.plus(current.debit),
            credit: sum.credit.plus(current.credit),
        }),
        {
            debit: new Decimal(0),
            credit: new Decimal(0),
        }
    );
    const totalDebits: number = ret.debit.toNumber()
    const totalCredits: number = ret.credit.toNumber()
    const closingBalance: number = ret.debit.minus(ret.credit).toNumber()
    return ({ totalDebits, totalCredits, closingBalance })
}

// Styles for the PDF document
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
        paddingBottom: 10,
        borderBottom: '1px solid black',
    },
    companyInfo: {
        display: 'flex',
        flexDirection: 'column',
        width: '60%'
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    ledgerInfo: {
        textAlign: 'right',
        width: '35%',
        display: 'flex',
        flexDirection: 'column',
    },
    ledgerName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8
    },
    tableHeader: {
        display: 'flex',
        flexDirection: 'row',
        borderBottom: '1px solid black',
        paddingVertical: 5,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 2,
        fontSize: 9
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 8,
        bottom: 8,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'grey',
    },
    totalsRow: {
        flexDirection: 'row',
        borderTop: '1px solid black',
        marginTop: 5,
        paddingTop: 5,
    },
    totalText: {
        textAlign: 'right',
        fontWeight: 'bold',
    },
    closingBalance: {
        textAlign: 'right',
        fontWeight: 'bold',
        marginTop: 10,
    },
});

type GeneralLedgerPdfType = {
    accName: string
    isAllBranches: boolean
    transactions: TranType[]
}

type DebitCreditType = {
    debit: Decimal
    credit: Decimal
}