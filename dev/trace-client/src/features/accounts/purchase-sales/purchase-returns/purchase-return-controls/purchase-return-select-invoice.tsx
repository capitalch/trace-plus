import { format } from "date-fns";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { Utils } from "../../../../../utils/utils";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";

export function PurchaseReturnSelectInvoice({ onSelect }: { onSelect: (id: number) => void }) {
    const instance = DataInstancesMap.purchaseInvoiceSelect;
    const { branchId, buCode, currentDateFormat, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

    return (<div className="">
        <CompSyncFusionGridToolbar
            minWidth="500px"
            title='All Purchase Invoices'
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
            sqlId={SqlIdsMap.getAllPurchases}
            sqlArgs={{
                branchId: branchId,
                finYearId: finYearId,
                tranTypeId: 5,
            }}
            searchFields={['autoRefNo', 'userRefNo', 'productDetails', 'accounts', 'amount', 'serialNumbers', 'productCodes', 'hsns', 'remarks', 'lineRemarks']}
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
                field: "userRefNo",
                headerText: "Invoice No",
                type: "string",
                width: 160,
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
                headerText: 'Account',
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
                headerText: "Remarks",
                type: "string",
                width: 120,
                clipMode: 'EllipsisWithTooltip'
            },
            {
                field: "lineRemarks",
                headerText: "Line Remarks",
                type: "string",
                width: 200,
                clipMode: 'EllipsisWithTooltip'
            },
        ];
    }

    function onRowSelected(args: any) {
        if (onSelect) {
            Utils.showHideModalDialogA({
                isOpen: false
            })
            // setTimeout(() => onSelect(args?.data?.id), 100)
            onSelect(args?.data?.id)
        }
    }
}