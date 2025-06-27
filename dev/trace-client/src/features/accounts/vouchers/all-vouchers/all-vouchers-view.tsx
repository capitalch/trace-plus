// import { useState } from "react";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
// import { CustomModalDialog } from "../../../../controls/components/custom-modal-dialog";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
// import { StockJournalPdf } from "../../inventory/stock-journal/stock-journal-pdf";
// import { PDFViewer } from "@react-pdf/renderer";
// import { format } from "date-fns";

export function AllVouchersView({ className, instance }: AllVouchersViewType) {
    // const [isDialogOpen, setIsDialogOpen] = useState(false);
    const {
        buCode,
        branchId,
        // context,
        // currentDateFormat,
        dbName,
        decodedDbParamsObject,
        finYearId
    } = useUtilsInfo();

    return (
        <div className="flex flex-col max-w-max">
            <CompSyncFusionGridToolbar
                minWidth="400px"
                title="Stock Journal View"
                isPdfExport={true}
                isExcelExport={true}
                isCsvExport={true}
                isLastNoOfRows={true}
                instance={instance}
            />

            <CompSyncFusionGrid
                aggregates={getAggregates()}
                buCode={buCode}
                className="mt-4"
                columns={getColumns()}
                dbName={dbName}
                dbParams={decodedDbParamsObject}
                deleteColumnWidth={40}
                editColumnWidth={40}
                height="calc(100vh - 260px)"
                instance={instance}
                minWidth="400px"
                // onDelete={handleOnDelete}
                // onEdit={handleOnEdit}
                // onPreview={handleOnPreview}
                // previewColumnWidth={40}
                sqlId={SqlIdsMap.getAllStockJournals}
                sqlArgs={{ branchId: branchId, finYearId: finYearId }}
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

}

    type AllVouchersViewType = {
        className?: string
        instance: string
    }