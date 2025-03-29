import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { UnitInfoType, Utils } from "../../../../utils/utils";
import { BranchTransferJsonResultType } from "./products-branch-transfer-main/products-branch-transfer-main";
// import { useEffect } from "react";
// import { useUtilsInfo } from "../../../../utils/utils-info-hook";
// import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
// import { BranchTransferJsonResultType } from "./products-branch-transfer-main/products-branch-transfer-main";
// import { BranchTransferType } from "./products-branch-transfer-main/products-branch-transfer-main";
// import { useUtilsInfo } from "../../../../utils/utils-info-hook";

export function ProductsBranchTransferPdf({ branchTransfers, tranH }: BranchTransferJsonResultType) {

    const unitInfo: UnitInfoType = Utils.getUnitInfo() || {}
    const dateRange: string = Utils.getCurrentFinYearFormattedDateRange()
    // const {
    //     // branchId,
    //     buCode,
    //     // context,
    //     dbName,
    //     decodedDbParamsObject,
    //     // finYearId
    // } = useUtilsInfo();

    // useEffect(() => {
    //     if (id) {
    //         // loadProductOnTranHeaderId()
    //     }
    // }, [id])

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header} fixed>
                    {/* Company info */}
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{unitInfo.unitName}</Text>
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
                    {/* Branch Transfer info */}
                    <View style={styles.ledgerInfo}>
                        <Text style={{ fontWeight: 'bold', fontSize: '14' }}>Branch Transfer</Text>
                        {/* <Text style={styles.ledgerName}>{accName}</Text> */}
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

            </Page>
        </Document>
    );

    // async function loadProductOnTranHeaderId() {
    //     const res: any = await Utils.doGenericQuery({
    //         buCode: buCode || "",
    //         dbName: dbName || "",
    //         dbParams: decodedDbParamsObject || {},
    //         instance: instance,
    //         sqlArgs: {
    //             id: id
    //         },
    //         sqlId: SqlIdsMap.getBranchTransferDetailsOnTranHeaderId
    //     });
    //     const jsonResult: BranchTransferJsonResultType = res?.[0]?.jsonResult;
    //     console.log(jsonResult)
    // }
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