// import Decimal from "decimal.js";
// import _ from 'lodash';
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { ProductInfoType } from "../../../../../controls/components/product-select-from-grid";
import { Utils } from "../../../../../utils/utils";

export function PurchaseProductSelectFromGrid({ onSelect }: { onSelect: (args: ProductInfoType) => void }) {
    const instance = DataInstancesMap.purchaseProductSelect;
    const { branchId, buCode, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

    return (<div className="">
        <CompSyncFusionGridToolbar
            minWidth="500px"
            title='All Active Products'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            instance={instance}
        />
        <CompSyncFusionGrid
            aggregates={getAggregates()}
            buCode={buCode}
            className="mt-4"
            columns={getColumns()}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            height='calc(100vh - 280px)'
            instance={instance}
            minWidth="800px"
            rowSelected={onRowSelected}
            sqlId={SqlIdsMap.getProductsForPurchase}
            sqlArgs={{
                branchId: branchId,
                finYearId: finYearId
            }}
            searchFields={['product', 'label', 'brandName', 'catName', 'info', 'hsn', 'productCode', 'upcCode']}
        />
    </div>)

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'product',
                type: 'Count',
                field: '',
                format: 'N0',
                footerTemplate: (props: any) => <span>Count: {props.Count}</span>
            },
        ]);
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            { field: 'productCode', headerText: 'Pr Code', type: 'string', width: 100, textAlign: 'Right' },
            { field: 'product', headerText: 'Product', type: 'string', width: 220, template: productTemplate },
            { field: 'label', type: 'string', width: 0, visible: false }, // to enable search
            { field: 'brandName', type: 'string', width: 0, visible: false }, // to enable search
            { field: 'catName', type: 'string', width: 0, visible: false }, // to enable search
            { field: 'info', headerText: 'Details', type: 'string', width: 240 },
            // { field: 'clos', headerText: 'Stock', type: 'number', textAlign: 'Right', width: 90 },
            // { field: 'age', headerText: 'Age', type: 'number', format: 'N0', width: 70, textAlign: 'Right', },
            // { field: 'maxRetailPrice', headerText: 'MRP', type: 'number', textAlign: 'Right', format: 'N2', width: 100 },
            // { field: 'salePriceGst', headerText: 'SP(GST)', type: 'number', textAlign: 'Right', format: 'N2', width: 100 },
            // { field: 'lastPurchasePriceGst', headerText: 'Pur pr(GST)', type: 'number', textAlign: 'Right', format: 'N2', width: 110 },
            // { field: 'sale', headerText: 'Sale', type: 'number', textAlign: 'Right', format: 'N0', width: 60 },
            { field: 'gstRate', headerText: 'Gst%', type: 'number', textAlign: 'Right', format: 'N2', width: 70 },
            { field: 'hsn', headerText: 'HSN', type: 'number', width: 90 },
            // { field: 'saleDiscount', headerText: 'Discount', type: 'number', textAlign: 'Right', format: 'N0', width: 90 },            
            { field: 'upcCode', headerText: 'UPC', type: 'string', width: 100 },
        ]);
    }

    // function customValuegAggregate(props: any) {
    //     const result = props.result
    //     if (_.isEmpty(result)) {
    //         return (0)
    //     }
    //     const ret: Decimal = result.reduce((sum: Decimal, current: ProductInfoType) =>
    //         (sum.plus((current.lastPurchasePrice * current.clos) || 0)), new Decimal(0))
    //     const r: number = ret.toNumber()
    //     return (r)
    // }

    function onRowSelected(args: any) {
        if (onSelect) {
            onSelect(args?.data)
            Utils.showHideModalDialogA({
                isOpen: false
            })
        }
    }

    function productTemplate(props: ProductInfoType) {
        return (''.concat(props.brandName, ' ', props.catName, ' ', props.label))
    }
}