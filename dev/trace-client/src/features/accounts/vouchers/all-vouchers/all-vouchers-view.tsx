// import { useState } from "react";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
// import { CustomModalDialog } from "../../../../controls/components/custom-modal-dialog";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import clsx from "clsx";
// import { shallowEqual, useSelector } from "react-redux";
// import { selectCompSwitchStateFn } from "../../../../controls/redux-components/comp-slice";
import { RootStateType } from "../../../../app/store/store";
import { useCallback, useEffect, useState } from "react";
import { Utils } from "../../../../utils/utils";
// import { shallowEqual, useSelector } from "react-redux";
// import { selectCompSwitchStateFn } from "../../../../controls/redux-components/comp-slice";
// import { StockJournalPdf } from "../../inventory/stock-journal/stock-journal-pdf";
// import { PDFViewer } from "@react-pdf/renderer";
// import { format } from "date-fns";

export function AllVouchersView({ className, instance, voucherTranTypeId }: AllVouchersViewType) {
    // const isAllBranches: boolean =
    //     useSelector(
    //         (state: RootStateType) => selectCompSwitchStateFn(state, instance),
    //         shallowEqual
    //     ) || false;

    const [rowsData, setRowsData] = useState<RowDataType[]>([]);

    const {
        buCode,
        branchId,
        dbName,
        decodedDbParamsObject,
        finYearId
    } = useUtilsInfo();

    const tranTypeId = voucherTranTypeId();

    const loadData = useCallback(async () => {
        try {
            const state: RootStateType = Utils.getReduxState();
            const isAllBranchesState = state.reduxComp.compSwitch[instance];
            const buCode = state.login.currentBusinessUnit?.buCode;
            const finYearId = state.login.currentFinYear?.finYearId;

            const rowsData: RowDataType[] = await Utils.doGenericQuery({
                buCode: buCode || "",
                dbName: dbName || "",
                dbParams: decodedDbParamsObject,
                instance: instance,
                sqlId: SqlIdsMap.getVouchers,
                sqlArgs: {
                    branchId: isAllBranchesState
                        ? null
                        : state.login.currentBranch?.branchId,
                    finYearId: finYearId,
                    tranTypeId: tranTypeId,
                },
            });
            setRowsData(rowsData);
        } catch (e: any) {
            console.log(e);
        }
    }, [decodedDbParamsObject, dbName, instance, tranTypeId]);

    useEffect(() => {
        loadData();
    }, [loadData, finYearId, buCode, branchId]);

    return (
        <div className={clsx("flex flex-col w-full", className)}>
            <CompSyncFusionGridToolbar
                className="mr-4"
                minWidth="600px"
                title="Vouchers View"
                isPdfExport={true}
                isExcelExport={true}
                isCsvExport={true}
                instance={instance}
            />

            <CompSyncFusionGrid
                aggregates={getAggregates()}
                allowPaging={true}
                allowTextWrap={false}
                pageSettings={{ pageSize: 500, pageSizes: [500, 1000, 2000, 5000, 10000] }}
                buCode={buCode}
                className="mt-2 mr-6"
                columns={getColumns()}
                dataSource={rowsData}
                hasCheckBoxSelection={true}
                height="calc(100vh - 368px)"
                indexColumnWidth={60}
                instance={instance}
                isSmallerFont={true}
                loadData={loadData}
                minWidth="1400px"
                rowHeight={35}
                searchFields={["autoRefNo, userRefNo,  remarks, lineRefNo, lineRemarks"]}
            // queryCellInfo={handleQueryCellInfo} // Text color works with queryCellInfo
            // onRowDataBound={handleOnRowDataBound}
            />

            {/* Custom modal dialog */}
            {/* <CustomModalDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Stock Journal"
                element={
                    <PDFViewer style={{ width: "100%", height: "100%" }}>
                        <StockJournalPdf
                            inputLineItems={meta.current.inpultLineItems}
                            outputLineItems={meta.current.outputLineItems}
                            tranH={meta.current.tranH}
                        />
                    </PDFViewer>
                }
            /> */}
        </div>
    );

    function getAggregates(): SyncFusionGridAggregateType[] {
        return [
            {
                columnName: "tranDate",
                type: "Count",
                field: "tranDate",
                format: "N0",
                footerTemplate: (props: any) => (
                    <span className="text-xs">Count: {props.Count}</span>
                )
            },
            {
                columnName: "debits",
                type: "Sum",
                field: "debits",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs mr-2">{props.Sum}</span>
                )
            },
            {
                columnName: "credits",
                type: "Sum",
                field: "credits",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs mr-2">{props.Sum}</span>
                )
            }
        ];
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return [
            {
                field: "tranDate",
                headerText: "Date",
                type: "date",
                width: 90,
                // template: (props: any) => format(props.tranDate, currentDateFormat)
                // format: currentDateFormat, // For PDF export only used template. format gives error is exports
            },
            {
                field: "autoRefNo",
                headerText: "Ref No",
                type: "string",
                width: 140
            },
            {
                field: "userRefNo",
                headerText: "User ref",
                type: "string",
                width: 100
            },
            {
                field: "productCode",
                headerText: "P Code",
                type: "string",
                width: 90
            },
            {
                field: "productDetails",
                headerText: "Product",
                type: "string",
                width: 150
            },
            {
                field: "credits",
                headerText: "Consumed",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "debits",
                headerText: "Produced",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "price",
                headerText: "Price",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "amount",
                textAlign: "Right",
                headerText: "Amount",
                type: "number",
                format: "N2",
                width: 120
            },
            {
                field: "serialNumbers",
                headerText: "Serial No",
                type: "string",
                width: 120
            },
            {
                field: "remarks",
                headerText: "Remarks",
                type: "string",
                width: 120
            },
            {
                field: "lineRefNo",
                headerText: "Line Ref",
                type: "string",
                width: 100
            },
            {
                field: "lineRemarks",
                headerText: "Line Remarks",
                type: "string",
                width: 100
            }
        ];
    }

    // async function loadData() {
    //     try {
    //         const state: RootStateType = Utils.getReduxState();
    //         const isAllBranchesState = state.reduxComp.compSwitch[instance];
    //         const buCode = state.login.currentBusinessUnit?.buCode;
    //         const finYearId = state.login.currentFinYear?.finYearId;

    //         const rowsData: RowDataType[] = await Utils.doGenericQuery({
    //             buCode: buCode || "",
    //             dbName: dbName || "",
    //             dbParams: decodedDbParamsObject,
    //             instance: instance,
    //             sqlId: SqlIdsMap.getVouchers,
    //             sqlArgs: {
    //                 branchId: isAllBranchesState
    //                     ? null
    //                     : state.login.currentBranch?.branchId,
    //                 finYearId: finYearId,
    //                 tranTypeId: tranTypeId,
    //             },
    //         });
    //         setRowsData(rowsData);
    //         // processRowsData(rowsData)
    //     } catch (e: any) {
    //         console.log(e);
    //     }
    // }
}

type AllVouchersViewType = {
    className?: string
    instance: string
    voucherTranTypeId: () => number
}

type RowDataType = {
    id?: number;
    tranDate: Date;
    autoRefNo: string;
    userRefNo?: string;
    credits: number;
    debits: number;
    amount: number;
    remarks?: string;
    lineRefNo?: string;
    lineRemarks?: string;
};