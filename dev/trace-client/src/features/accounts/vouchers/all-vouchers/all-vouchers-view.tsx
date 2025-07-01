// import { useState } from "react";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
// import { CustomModalDialog } from "../../../../controls/components/custom-modal-dialog";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import clsx from "clsx";
// import { shallowEqual, useSelector } from "react-redux";
// import { selectCompSwitchStateFn } from "../../../../controls/redux-components/comp-slice";
import { AppDispatchType, RootStateType } from "../../../../app/store/store";
import { useCallback, useEffect, useState } from "react";
import { Utils } from "../../../../utils/utils";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { RowDataBoundEventArgs } from "@syncfusion/ej2-react-grids";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
// import { useFormContext } from "react-hook-form";
// import { VoucherFormDataType } from "./all-vouchers";
// import { VourcherType } from "../../../../utils/global-types-interfaces-enums";
import { setActiveTabIndex } from "../../../../controls/redux-components/comp-slice";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "./all-vouchers";
import { VourcherType } from "../../../../utils/global-types-interfaces-enums";
// import { VoucherTranHType } from "../../../../utils/global-types-interfaces-enums";
// import { shallowEqual, useSelector } from "react-redux";
// import { selectCompSwitchStateFn } from "../../../../controls/redux-components/comp-slice";
// import { StockJournalPdf } from "../../inventory/stock-journal/stock-journal-pdf";
// import { PDFViewer } from "@react-pdf/renderer";
// import { format } from "date-fns";

export function AllVouchersView({ className, instance }: AllVouchersViewType) {
    // const isAllBranches: boolean =
    //     useSelector(
    //         (state: RootStateType) => selectCompSwitchStateFn(state, instance),
    //         shallowEqual
    //     ) || false;
    const dispatch: AppDispatchType = useDispatch()
    const selectedVoucherType = useSelector((state: RootStateType) => state.vouchers.voucherType)
    const [rowsData, setRowsData] = useState<RowDataType[]>([]);

    const {
        currentDateFormat,
        buCode,
        branchId,
        dbName,
        decodedDbParamsObject,
        finYearId
    } = useUtilsInfo();

    const {
        // watch,
        // register,
        reset,
        // setValue,
        // formState: { errors },
    } = useFormContext<VoucherFormDataType>();

    const tranTypeId = Utils.getTranTypeId(selectedVoucherType);
    // const voucherType = 

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
                sqlId: SqlIdsMap.getAllVouchers,
                sqlArgs: {
                    branchId: isAllBranchesState
                        ? null
                        : state.login.currentBranch?.branchId,
                    finYearId: finYearId,
                    tranTypeId: tranTypeId,
                },
            });
            let currentId: number | null | undefined = null;
            let currentColor = false;

            rowsData.forEach((row: RowDataType) => {
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
    }, [decodedDbParamsObject, dbName, instance, tranTypeId]);

    useEffect(() => {
        loadData();
    }, [loadData, finYearId, buCode, branchId]);

    return (
        <div className={clsx("flex flex-col w-full", className)}>
            <CompSyncFusionGridToolbar
                className="mr-4"
                minWidth="600px"
                title={`${selectedVoucherType} Vouchers View`}
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
                deleteColumnWidth={40}
                editColumnWidth={40}
                hasCheckBoxSelection={true}
                height="calc(100vh - 368px)"
                instance={instance}
                isSmallerFont={true}
                loadData={loadData}
                minWidth="1400px"
                onEdit={handleOnEdit}
                onDelete={handleOnDelete}
                onPreview={handleOnPreview}
                onRowDataBound={handleOnRowDataBound}
                previewColumnWidth={40}
                rowHeight={35}
                searchFields={['id', 'autoRefNo', 'accName', 'userRefNo', 'remarks', 'lineRefNo', 'lineRemarks', 'instrNo', 'tags', 'gstin', 'hsn']}

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
                columnName: "autoRefNo",
                type: "Count",
                field: "autoRefNo",
                format: "N0",
                footerTemplate: (props: any) => (
                    <span className="text-xs text-right">Cnt: {props.Count}</span>
                )
            },
            {
                columnName: "debit",
                type: "Sum",
                field: "debit",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs">{props.Sum}</span>
                )
            },
            {
                columnName: "credit",
                type: "Sum",
                field: "credit",
                format: "N2",
                footerTemplate: (props: any) => (
                    <span className="text-xs">{props.Sum}</span>
                )
            }
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
                field: 'accName',
                headerText: 'Account',
                width: 150,
                textAlign: 'Left',
                type: 'string',
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "debit",
                headerText: "Debits",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 160
            },
            {
                field: "credit",
                headerText: "Credits",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 160
            },
            {
                field: "userRefNo",
                headerText: "User ref",
                type: "string",
                width: 100,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "remarks",
                headerText: "Remarks",
                type: "string",
                width: 120,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "lineRefNo",
                headerText: "Line Ref",
                type: "string",
                width: 100,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "lineRemarks",
                headerText: "Line Remarks",
                type: "string",
                width: 200,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: 'instrNo',
                headerText: 'Instr',
                type: 'string',
                width: 100,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: 'tags',
                headerText: 'Tags',
                type: 'string',
                width: 90,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "gstin",
                headerText: "Gstin",
                type: "string",
                width: 130
            },
            {
                field: "rate",
                headerText: "Gst Rate",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "hsn",
                headerText: "Hsn",
                type: "string",
                width: 100
            },
            {
                field: "cgst",
                headerText: "Cgst",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "sgst",
                headerText: "Sgst",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "igst",
                headerText: "Igst",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 100
            },
            {
                field: "isInput",
                headerText: "Input?",
                type: "boolean",
                width: 80,
                textAlign: "Center"
            }
        ];
    }

    async function handleOnDelete(id: string) {
        Utils.showDeleteConfirmDialog(async () => {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.TranH,
                    deletedIds: [id]
                })
                Utils.showSaveMessage();
                loadData(); // Reload data after deletion
            } catch (e: any) {
                console.log(e)
            }
        })
    }

    async function handleOnEdit(data: RowDataType) {
        console.log(`Edit row with id: ${data.id}`);
        try {
            const editData: any = await Utils.doGenericQuery({
                buCode: buCode || "",
                dbName: dbName || "",
                dbParams: decodedDbParamsObject,
                instance: instance,
                sqlId: SqlIdsMap.getVoucherDetailsOnId,
                sqlArgs: {
                    id: data.id,
                },
            });
            const voucherEditData: VoucherEditDataType = editData?.[0]?.jsonResult;
            const tranHeader = voucherEditData?.tranHeader
            reset({
                id: tranHeader.id,
                tranDate: tranHeader.tranDate,
                userRefNo: tranHeader.userRefNo,
                remarks: tranHeader.remarks,
                tranTypeId: tranHeader.tranTypeId,
                autoRefNo: tranHeader.autoRefNo,
                voucherType: Utils.getTranTypeName(tranHeader.tranTypeId) as VourcherType,
                isGst: voucherEditData?.tranDetails?.some((d: VoucherTranDetailsType) => d.gst !== null),

                creditEntries: voucherEditData?.tranDetails?.filter((d: VoucherTranDetailsType) => d.dc === 'C').map((d: VoucherTranDetailsType) => ({
                    id: d.id,
                    accId: d.accId as string | null,
                    remarks: d.remarks,
                    dc: d.dc,
                    amount: d.amount,
                    tranHeaderId: d.tranHeaderId,
                    lineRefNo: d.lineRefNo,
                    instrNo: d.instrNo,
                    gst: d?.gst?.id ? {
                        id: d.gst.id,
                        gstin: d.gst.gstin,
                        rate: d.gst.rate,
                        cgst: d.gst.cgst,
                        sgst: d.gst.sgst,
                        igst: d.gst.igst,
                        isIgst: d?.gst?.igst ? true : false,
                        hsn: d.gst.hsn
                    } : undefined
                    // gstId: d?.gst?.id,
                    // gstRate: d?.gst?.rate,
                    // hsn: d?.gst?.hsn as number | null | undefined,
                    // isIgst: d?.gst?.igst ? true : false,
                    // igst: d?.gst?.igst ?? 0,
                    // cgst: d?.gst?.cgst ?? 0,
                    // sgst: d?.gst?.sgst ?? 0,
                })),
                debitEntries: voucherEditData?.tranDetails?.filter((d: VoucherTranDetailsType) => d.dc === 'D').map((d: VoucherTranDetailsType) => ({
                    id: d.id,
                    accId: d.accId as string | null,
                    remarks: d.remarks,
                    dc: d.dc,
                    amount: d.amount,
                    tranHeaderId: d.tranHeaderId,
                    lineRefNo: d.lineRefNo,
                    instrNo: d.instrNo,
                    gst: d?.gst?.id ? {
                        id: d.gst.id,
                        gstin: d.gst.gstin,
                        rate: d.gst.rate,
                        cgst: d.gst.cgst,
                        sgst: d.gst.sgst,
                        igst: d.gst.igst,
                        isIgst: d?.gst?.igst ? true : false,
                        hsn: d.gst.hsn
                    } : undefined
                    // gstId: d?.gst?.id,
                    // gstRate: d?.gst?.rate,
                    // hsn: d?.gst?.hsn as number | null | undefined,
                    // isIgst: d?.gst?.igst ? true : false,
                    // igst: d?.gst?.igst ?? 0,
                    // cgst: d?.gst?.cgst ?? 0,
                    // sgst: d?.gst?.sgst ?? 0,
                })),
            })
            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 })) // Switch to the first tab (Edit tab)
        } catch (e: any) {
            console.error(e);
        }
    }

    function handleOnPreview(data: RowDataType) {
        console.log(`Preview row with id: ${data.id}`);
        // Here you can implement the logic to show a preview of the voucher
        // For example, you can open a modal with the voucher details
    }

    function handleOnRowDataBound(args: RowDataBoundEventArgs) {
        const rowData = args.data as RowDataType;

        if (args.row) {
            if (rowData.bColor) {
                args.row.classList.add("bg-amber-100",);
            }
        }
    }
}

type AllVouchersViewType = {
    className?: string
    instance: string
}

type RowDataType = {
    id?: number;
    index: number;
    tranDate: string;
    autoRefNo: string;
    accName: string;
    userRefNo?: string;
    credit: number;
    debit: number;
    instrNo?: string;
    tags?: string;
    remarks?: string;
    lineRefNo?: string;
    lineRemarks?: string;
    gstin?: string;
    hsn?: string;
    rate?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    isInput?: boolean;
    bColor?: boolean;
};

type VoucherEditDataType = {
    tranHeader: {
        id?: number;
        autoRefNo: string;
        remarks: string | null;
        tranDate: string;
        tags: string | null;
        tranTypeId: number;
        userRefNo: string | null;
    };
    tranDetails: VoucherTranDetailsType[];
}

type VoucherTranDetailsType = {
    id?: number
    accId: number | null;
    amount: number;
    dc: 'D' | 'C';
    instrNo: string | null;
    lineRefNo: string | null;
    remarks: string | null;
    tranHeaderId?: number;
    gst?: ExtGstTranDType | null;
}

export type ExtGstTranDType = {
    id?: number;
    gstin: string | null
    hsn: string | null;
    cgst: number;
    sgst: number;
    igst: number;
    rate: number;
    isInput: boolean;
    tranDetailsId?: number;
}
