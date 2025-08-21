import { useDispatch } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { useCallback, useEffect, useState } from "react";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { useFormContext } from "react-hook-form";
import { DebitNoteFormDataType } from "./debit-notes";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { format } from "date-fns";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import clsx from "clsx";
import { RowDataBoundEventArgs } from "@syncfusion/ej2-react-grids";
import { Messages } from "../../../../utils/messages";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { DebitCreditNoteEditDataType, ExtGstTranDType, TranDType, TranHType } from "../../../../utils/global-types-interfaces-enums";
import { setActiveTabIndex } from "../../../../controls/redux-components/comp-slice";
import { generateDebitCreditNotePDF } from "./debit-credit-note-jspdf";

export function DebitNotesView({ className }: { className?: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const instance = DataInstancesMap.debitNotes
    const [rowsData, setRowsData] = useState<any[]>([]);
    const {
        currentDateFormat,
        buCode,
        branchId,
        branchName,
        dbName,
        defaultGstRate,
        decodedDbParamsObject,
        finYearId,
    } = useUtilsInfo();

    const {
        reset,
        // setValue,
    } = useFormContext<DebitNoteFormDataType>();

    const loadData = useCallback(async () => {
        try {
            const state: RootStateType = Utils.getReduxState();
            const isAllBranchesState = state.reduxComp.compSwitch[instance];
            const buCode = state.login.currentBusinessUnit?.buCode;
            const finYearId = state.login.currentFinYear?.finYearId;

            const rowsData: any[] = await Utils.doGenericQuery({
                buCode: buCode || "",
                dbName: dbName || "",
                dbParams: decodedDbParamsObject,
                instance: instance,
                sqlId: SqlIdsMap.getAllDebitCreditNotes,
                sqlArgs: {
                    branchId: isAllBranchesState
                        ? null
                        : state.login.currentBranch?.branchId,
                    finYearId: finYearId,
                    tranTypeId: 7,
                },
            });
            let currentId: number | null | undefined = null;
            let currentColor = false;

            rowsData.forEach((row: any) => {
                if (row.id !== currentId) {
                    currentId = row.id;
                    currentColor = !currentColor; // toggle color when id changes
                }
                row.bColor = currentColor;
            });
            setRowsData(rowsData);
        } catch (e: any) {
            console.error(e);
        }
    }, [decodedDbParamsObject, dbName, instance]);

    useEffect(() => {
        loadData();
    }, [loadData, finYearId, buCode, branchId]);

    return (
        <div className={clsx("flex flex-col w-full", className)}>
            <CompSyncFusionGridToolbar
                className="mr-4"
                minWidth="600px"
                title={`Purchases View`}
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
                className="mt-2"
                columns={getColumns()}
                dataSource={rowsData}
                deleteColumnWidth={40}
                editColumnWidth={40}
                hasCheckBoxSelection={true}
                height="calc(100vh - 368px)"
                instance={instance}
                isSmallerFont={true}
                loadData={loadData}
                minWidth="1400px"
                // onCopy={handleOnCopy}
                onEdit={handleOnEdit}
                onDelete={handleOnDelete}
                onPreview={handleOnPreview}
                onRowDataBound={handleOnRowDataBound}
                previewColumnWidth={40}
                rowHeight={35}
                searchFields={['autoRefNo', 'userRefNo', 'productDetails', 'accounts', 'amount', 'serialNumbers', 'productCodes', 'hsns', 'remarks', 'lineRemarks']}
            />
        </div>
    );

    function getAggregates(): SyncFusionGridAggregateType[] {
        return [
            {
                columnName: "autoRefNo",
                type: "Count",
                field: "autoRefNo",
                format: "N0",
                footerTemplate: (props: any) => (
                    <span className="text-xs text-right">Cnt: {props.Count}</span>
                )
            },
            {
                columnName: "amount",
                type: "Sum",
                field: "amount",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs">{props.Sum}</span>
                )
            },
            {
                columnName: "cgst",
                type: "Sum",
                field: "cgst",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs">{props.Sum}</span>
                )
            },
            {
                columnName: "sgst",
                type: "Sum",
                field: "sgst",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs">{props.Sum}</span>
                )
            },
            {
                columnName: "igst",
                type: "Sum",
                field: "igst",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs">{props.Sum}</span>
                )
            },
        ];
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return [
            {
                field: 'index',
                headerText: '#',
                width: 70,
                textAlign: 'Left',
                type: 'number',
            },
            {
                field: 'id',
                headerText: 'Id',
                width: 90,
                textAlign: 'Left',
                type: 'number',
                visible: false
            },
            {
                field: "tranDate",
                headerText: "Date",
                type: "string",
                width: 75,
                // Otherwise PDF export error
                valueAccessor: (field: string, data: any) =>
                    format(data?.[field], currentDateFormat)
            },
            {
                field: "autoRefNo",
                headerText: "Ref No",
                type: "string",
                width: 140
            },
            {
                field: "userRefNo",
                headerText: "User Ref No",
                type: "string",
                width: 140,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "amount",
                headerText: "Amount",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 140
            },
            {
                field: 'debitAccount',
                headerText: 'Debit Account',
                width: 150,
                textAlign: 'Left',
                type: 'string',
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: 'creditAccount',
                headerText: 'Credit Account',
                width: 150,
                textAlign: 'Left',
                type: 'string',
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: 'remarks',
                headerText: 'Common Remarks',
                width: 150,
                textAlign: 'Left',
                type: 'string',
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: 'lineRefNo',
                headerText: 'Line Ref No',
                width: 150,
                textAlign: 'Left',
                type: 'string',
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: 'lineRemarks',
                headerText: 'Line Remarks',
                width: 150,
                textAlign: 'Left',
                type: 'string',
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: 'gstin',
                headerText: 'GSTIN',
                width: 130,
                textAlign: 'Left',
                type: 'string',
                // clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "cgst",
                headerText: "CGST",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 110
            },
            {
                field: "sgst",
                headerText: "SGST",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 110
            },
            {
                field: "igst",
                headerText: "IGST",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 110
            },
            {
                field: "hsn",
                headerText: "HSN",
                type: "string",
                width: 100,
            },
        ];
    }

    async function getDebitCreditNoteDetailsOnId(id: number | undefined) {
        if (!id) {
            return
        }
        return (await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            instance: instance,
            sqlId: SqlIdsMap.getDebitCreditNoteDetailsOnId,
            sqlArgs: {
                id: id,
            },
        }))
    }

    async function handleOnDelete(id: number | string) {
        Utils.showDeleteConfirmDialog(async () => {
            try {
                if (!id) {
                    Utils.showAlertMessage("Error", Messages.errDeletingRecord)
                    return
                }
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: AllTables.TranH.name,
                    deletedIds: [id]
                })
                Utils.showSaveMessage();
                loadData(); // Reload data after deletion
            } catch (e: any) {
                console.log(e)
            }
        })
    }

    async function handleOnEdit(data: any) {
        const editData: any = await getDebitCreditNoteDetailsOnId(data.id)
        const dcEditData: DebitCreditNoteEditDataType = editData?.[0]?.jsonResult
        const tranH: TranHType = dcEditData.tranH
        const tranD: TranDType[] = dcEditData.tranD
        const extGsTranD: ExtGstTranDType = dcEditData.extGstTranD
        const debitRow: TranDType = tranD.find((item) => item.dc === "D") as TranDType
        const creditRow: TranDType = tranD.find((item) => item.dc === "C") as TranDType
        reset({
            //TranH
            id: tranH.id,
            autoRefNo: tranH.autoRefNo,
            tranDate: tranH.tranDate,
            userRefNo: tranH.userRefNo,
            remarks: tranH.remarks,
            tranTypeId: tranH.tranTypeId,

            //TranD
            debitAccId: debitRow?.accId,
            debitRefNo: debitRow?.lineRefNo,
            debitRemarks: debitRow?.remarks,
            creditAccId: creditRow?.accId,
            creditRefNo: creditRow?.lineRefNo,
            creditRemarks: creditRow?.remarks,
            amount: creditRow?.amount || 0,

            //ExtGstTranD
            isGstApplicable: Boolean(extGsTranD?.id),
            gstin: extGsTranD?.gstin,
            gstRate: extGsTranD?.rate || defaultGstRate,
            isIgst: extGsTranD?.igst ? true : false,
            cgst: extGsTranD?.cgst || 0,
            sgst: extGsTranD?.sgst || 0,
            igst: extGsTranD?.igst || 0,
            hsn: extGsTranD?.hsn || '',

            debitCreditNoteEditData: dcEditData
        })

        dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 })) // Switch to the first tab (Edit tab)
    }

    async function handleOnPreview(data: DebitNoteFormDataType) {
        console.log(data)
        const editData: any = await getDebitCreditNoteDetailsOnId(data.id)
        const dcEditData: DebitCreditNoteEditDataType = editData?.[0]?.jsonResult
        generateDebitCreditNotePDF({
            branchName: branchName || '',
            currentDateFormat: currentDateFormat,
            noteData: dcEditData,
            tranTypeId: 7
        })
        // const purchaseEditData: SalePurchaseEditDataType = editData?.[0]?.jsonResult
        // generatePurchaseInvoicePDF(purchaseEditData, branchName ?? '', currentDateFormat)
    }

    function handleOnRowDataBound(args: RowDataBoundEventArgs) {
        const rowData: any = args.data;

        if (args.row) {
            if (rowData.bColor) {
                args.row.classList.add("bg-green-50",);
            }
        }
    }
}