import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import clsx from "clsx";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import { useCallback, useEffect, useState } from "react";
import { Utils } from "../../../../utils/utils";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { RowDataBoundEventArgs } from "@syncfusion/ej2-react-grids";
import { DatabaseTablesMap } from "../../../../app/maps/database-tables-map";
import { setActiveTabIndex } from "../../../../controls/redux-components/comp-slice";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "./all-vouchers";
import { VourcherType } from "../../../../utils/global-types-interfaces-enums";
import { Messages } from "../../../../utils/messages";
import { triggerVoucherPreview } from "../voucher-slice";

export function AllVouchersView({ className, instance }: AllVouchersViewType) {
    const dispatch: AppDispatchType = useDispatch()
    const [rowsData, setRowsData] = useState<RowDataType[]>([]);

    const {
        currentDateFormat,
        buCode,
        branchId,
        dbName,
        decodedDbParamsObject,
        finYearId,
    } = useUtilsInfo();
    const {
        reset,
        watch
    } = useFormContext<VoucherFormDataType>();

    const voucherType = watch('voucherType')
    const tranTypeId = Utils.getTranTypeId(voucherType);

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
                title={`${voucherType} Vouchers View`}
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
                onCopy={handleOnCopy}
                onEdit={handleOnEdit}
                onDelete={handleOnDelete}
                onPreview={handleOnPreview}
                onRowDataBound={handleOnRowDataBound}
                previewColumnWidth={40}
                rowHeight={35}
                searchFields={['id', 'autoRefNo', 'accName', 'userRefNo', 'remarks', 'lineRefNo', 'lineRemarks', 'instrNo', 'tags', 'gstin', 'hsn']}
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
                visible: false
            },
            {
                field: "autoRefNo",
                headerText: "Ref No",
                type: "string",
                width: 140
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

    async function getVoucherDetails(id: number | undefined) {
        return (await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            instance: instance,
            sqlId: SqlIdsMap.getVoucherDetailsOnId,
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

    async function handleOnCopy(data: RowDataType) {
        try {
            const editData: any = await getVoucherDetails(data.id)
            const voucherEditData: VoucherEditDataType = editData?.[0]?.jsonResult;
            const tranHeader = voucherEditData?.tranHeader
            reset({
                id: undefined,
                // tranDate: tranHeader.tranDate,
                userRefNo: tranHeader.userRefNo,
                remarks: tranHeader.remarks,
                tranTypeId: tranHeader.tranTypeId,
                // autoRefNo: tranHeader.autoRefNo,
                voucherType: Utils.getTranTypeName(tranHeader.tranTypeId) as VourcherType,
                isGst: voucherEditData?.tranDetails.some((entry) => entry.gst?.id || ((entry?.gst?.rate || 0) > 0)),
                showGstInHeader: voucherType !== 'Contra',
                deletedIds: [],
                creditEntries: voucherEditData?.tranDetails?.filter((d: VoucherTranDetailsType) => d.dc === 'C').map((d: VoucherTranDetailsType) => ({
                    id: undefined, //d.id,
                    tranDetailsId: undefined, // d.id, // The id is replaced by some guid, so storing in tranDetailsId
                    accId: d.accId as string | null,
                    remarks: d.remarks,
                    dc: d.dc,
                    amount: d.amount,
                    tranHeaderId: d.tranHeaderId,
                    lineRefNo: d.lineRefNo,
                    instrNo: d.instrNo,
                    gst: d?.gst?.id ? {
                        id: undefined, //d.gst.id,
                        gstin: d.gst.gstin,
                        rate: d.gst.rate,
                        cgst: d.gst.cgst,
                        sgst: d.gst.sgst,
                        igst: d.gst.igst,
                        isIgst: d?.gst?.igst ? true : false,
                        hsn: d.gst.hsn
                    } : undefined
                })),
                debitEntries: voucherEditData?.tranDetails?.filter((d: VoucherTranDetailsType) => d.dc === 'D').map((d: VoucherTranDetailsType) => ({
                    id: undefined, //d.id,
                    tranDetailsId: undefined, //d.id, // The id is replaced by some guid, so storing in tranDetailsId
                    accId: d.accId as string | null,
                    remarks: d.remarks,
                    dc: d.dc,
                    amount: d.amount,
                    tranHeaderId: d.tranHeaderId,
                    lineRefNo: d.lineRefNo,
                    instrNo: d.instrNo,
                    gst: d?.gst?.id ? {
                        id: undefined, //d.gst.id,
                        gstin: d.gst.gstin,
                        rate: d.gst.rate,
                        cgst: d.gst.cgst,
                        sgst: d.gst.sgst,
                        igst: d.gst.igst,
                        isIgst: d?.gst?.igst ? true : false,
                        hsn: d.gst.hsn
                    } : undefined
                })),
            })
            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 })) // Switch to the first tab (New tab)
        } catch (e: any) {
            console.error(e);
        }
    }

    async function handleOnEdit(data: RowDataType) {
        try {
            const editData: any = await getVoucherDetails(data.id)
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
                isGst: voucherEditData?.tranDetails.some((entry) => entry.gst?.id || ((entry?.gst?.rate || 0) > 0)),
                showGstInHeader: voucherType !== 'Contra',
                deletedIds: [],
                creditEntries: voucherEditData?.tranDetails?.filter((d: VoucherTranDetailsType) => d.dc === 'C').map((d: VoucherTranDetailsType) => ({
                    id: d.id,
                    tranDetailsId: d.id, // The id is replaced by some guid, so storing in tranDetailsId
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
                })),
                debitEntries: voucherEditData?.tranDetails?.filter((d: VoucherTranDetailsType) => d.dc === 'D').map((d: VoucherTranDetailsType) => ({
                    id: d.id,
                    tranDetailsId: d.id, // The id is replaced by some guid, so storing in tranDetailsId
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
                })),
            },)
            dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 })) // Switch to the first tab (Edit tab)
        } catch (e: any) {
            console.error(e);
        }
    }

    async function handleOnPreview(data: RowDataType) {
        dispatch(triggerVoucherPreview(data.id!));
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

export type RowDataType = {
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

export type VoucherEditDataType = {
    tranHeader: {
        id?: number;
        autoRefNo: string;
        remarks: string | null;
        tranDate: string;
        tags: string | null;
        tranTypeId: number;
        userRefNo: string | null;
        branchId: number;
        finYearId: number;
    };
    tranDetails: VoucherTranDetailsType[];
}

export type VoucherTranDetailsType = {
    id?: number;
    tranDetailsId?: number;
    accId: number | null;
    accName?: string;
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