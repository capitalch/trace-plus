import { format } from "date-fns";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { Utils } from "../../../../../utils/utils";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";

export function SalesReturnSearchInvoice({ searchText, onSelect }: { searchText: string, onSelect: (id: number) => void }) {
    const instance = DataInstancesMap.salesInvoiceSelect;
    const { branchId, buCode, currentDateFormat, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

    return (<div className="">
        <CompSyncFusionGridToolbar
            minWidth="500px"
            title='Sales Invoices'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            instance={instance}
        />
        <CompSyncFusionGrid
            aggregates={getAggregates()}
            allowTextWrap={false}
            buCode={buCode}
            className="mt-4"
            columns={getColumns()}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            height='calc(100vh - 280px)'
            instance={instance}
            minWidth="800px"
            rowSelected={onRowSelected}
            sqlId={SqlIdsMap.getAllSalesOnSearchText}
            sqlArgs={{
                branchId: branchId,
                finYearId: finYearId,
                tranTypeId: Utils.getTranTypeId('Sales'),
                searchText: searchText || null
            }}
            searchFields={['autoRefNo', 'productDetails', 'accounts', 'amount', 'serialNumbers', 'productCodes', 'hsns', 'remarks', 'lineRemarks', 'productRemarks', 'lineRefNos', 'instruments']}
        />
    </div>)

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: "autoRefNo",
                type: "Count",
                field: "autoRefNo",
                format: "N0",
                footerTemplate: (props: any) => (
                    <span className="text-right text-xs">Cnt: {props.Count}</span>
                )
            },
        ]);
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
                width: 90,
                valueAccessor: (field: string, data: any) =>
                    format(data?.[field], currentDateFormat)
            },
            {
                field: "autoRefNo",
                headerText: "Ref No",
                type: "string",
                width: 140,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "productDetails",
                headerText: "Product Details",
                type: "string",
                width: 160,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: 'accounts',
                headerText: 'Customer',
                width: 150,
                textAlign: 'Left',
                type: 'string',
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
                field: "aggr",
                headerText: "Aggregate",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 130
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
                field: "serialNumbers",
                headerText: "Serial Numbers",
                type: "string",
                width: 160,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "productCodes",
                headerText: "Product Codes",
                type: "string",
                width: 160,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "productQty",
                headerText: "Pr Qty",
                type: "number",
                format: "N2",
                textAlign: "Right",
                width: 80
            },
            {
                field: "hsns",
                headerText: "HSN Codes",
                type: "string",
                width: 160,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "remarks",
                headerText: "Main Remarks",
                type: "string",
                width: 120,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "productRemarks",
                headerText: "Product Remarks",
                type: "string",
                width: 200,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "lineRemarks",
                headerText: "Line Remarks",
                type: "string",
                width: 120,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "lineRefNos",
                headerText: "Line Ref No",
                type: "string",
                width: 120,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "instruments",
                headerText: "Instruments",
                type: "string",
                width: 80,
                clipMode: 'EllipsisWithTooltip'
            },
        ];
    }

    function onRowSelected(args: any) {
        if (onSelect) {
            Utils.showHideModalDialogA({
                isOpen: false
            })
            onSelect(args?.data?.id)
        }
    }
}