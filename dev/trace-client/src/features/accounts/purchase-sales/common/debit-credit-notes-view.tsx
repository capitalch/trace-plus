import { RootStateType } from "../../../../app/store";
import { useCallback, useEffect, useState } from "react";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { format } from "date-fns";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import clsx from "clsx";
import { RowDataBoundEventArgs } from "@syncfusion/ej2-react-grids";
import { Messages } from "../../../../utils/messages";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { DebitCreditNoteEditDataType } from "../../../../utils/global-types-interfaces-enums";
import { generateDebitCreditNotePDF } from "./debit-credit-note-jspdf";
import { DebitCreditNoteFormDataType } from "../debit-notes/debit-notes";
import { useDebitNotesPermissions } from "../../../../utils/permissions/permissions-hooks";
import { useCreditNotesPermissions } from "../../../../utils/permissions/permissions-hooks";
import { useDebitNotesContextOptional } from "../debit-notes/debit-notes-context";
import { useCreditNotesContextOptional } from "../credit-notes/credit-notes-context";

export function DebitCreditNotesView({ className, tranTypeId, instance }: { className?: string; tranTypeId: number; instance: string }) {
    // ✅ Determine which permissions to use based on tranTypeId
    const isDebitNote = tranTypeId === Utils.getTranTypeId('DebitNote')
    const debitPermissions = useDebitNotesPermissions()
    const creditPermissions = useCreditNotesPermissions()

    const { canEdit, canDelete, canPreview, canExport } = isDebitNote
        ? debitPermissions
        : creditPermissions

    const [rowsData, setRowsData] = useState<any[]>([]);
    const {
        currentDateFormat,
        buCode,
        branchId,
        branchName,
        branchAddress,
        branchGstin,
        dbName,
        // defaultGstRate,
        decodedDbParamsObject,
        finYearId,
    } = useUtilsInfo();

    // Use appropriate context based on note type
    const debitNotesContext = useDebitNotesContextOptional();
    const creditNotesContext = useCreditNotesContextOptional();
    const populateFormFromId = isDebitNote
        ? debitNotesContext?.populateFormFromId
        : creditNotesContext?.populateFormFromId;

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
                    tranTypeId: tranTypeId,
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
    }, [decodedDbParamsObject, dbName, instance, tranTypeId]);

    useEffect(() => {
        loadData();
    }, [loadData, finYearId, buCode, branchId]);

    return (
        <div className={clsx("flex flex-col w-full", className)}>
            <CompSyncFusionGridToolbar
                className="mr-4"
                minWidth="600px"
                title={`Debit/Credit Notes View`}
                isPdfExport={canExport}
                isExcelExport={canExport}
                isCsvExport={canExport}
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
                height="calc(100vh - 300px)"
                instance={instance}
                isSmallerFont={true}
                loadData={loadData}
                minWidth="400px"
                {...(canEdit && { onEdit: handleOnEdit })}
                {...(canDelete && { onDelete: handleOnDelete })}
                {...(canPreview && { onPreview: handleOnPreview })}
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
                    <span className="text-right text-xs">Cnt: {props.Count}</span>
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
        populateFormFromId?.(data.id)
    }

    async function handleOnPreview(data: DebitCreditNoteFormDataType) {
        const editData: any = await getDebitCreditNoteDetailsOnId(data.id)
        const dcEditData: DebitCreditNoteEditDataType = editData?.[0]?.jsonResult
        generateDebitCreditNotePDF({
            noteData: dcEditData,
            branchId: branchId,
            branchName: branchName || '',
            branchAddress: branchAddress,
            branchGstin: branchGstin,
            currentDateFormat: currentDateFormat,
            tranTypeId: tranTypeId
        })
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