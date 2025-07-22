import { DataInstancesMap } from "../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../utils/utils-info-hook";
import { CompSyncFusionGridToolbar } from "./syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "./syncfusion-grid/comp-syncfusion-grid";
import { SqlIdsMap } from "../../app/maps/sql-ids-map";
import _ from "lodash";
import Decimal from "decimal.js";
import { Utils } from "../../utils/utils";

export function ProductSelectFromGrid({ onSelect }: { onSelect: (args: ProductInfoType) => void }) {
    const instance = DataInstancesMap.productSelect;
    const { branchId, buCode, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

    return (<div className="">
        <CompSyncFusionGridToolbar
            // className='mt-2 mr-6'
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
            // isLoadOnInit={false}
            minWidth="800px"
            rowSelected={onRowSelected}
            sqlId={SqlIdsMap.getAllProductsInfoForProductSelect}
            sqlArgs={{
                branchId: branchId,
                finYearId: finYearId
            }}
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
            {
                columnName: 'clos',
                type: 'Sum',
                field: 'clos',
                format: 'N0',
                footerTemplate: (props: any) => {
                    return <span>{props.Sum}</span>
                }
            },
            {
                columnName: 'info',
                customAggregate: (data: any) => customValuegAggregate(data),
                field: 'info',
                format: 'N2',
                footerTemplate: (props: any) => {
                    return (<span className="mr-3 font-semibold">Value: {props.Custom}</span>)
                },
                type: 'Custom',
            }
        ]);
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            { field: 'product', headerText: 'Product', type: 'string', width: 220, template: productTemplate },
            { field: 'label', type: 'string', width: 0, visible: false }, // to enable search
            { field: 'brandName', type: 'string', width: 0, visible: false }, // to enable search
            { field: 'catName', type: 'string', width: 0, visible: false }, // to enable search
            { field: 'info', headerText: 'Details', type: 'string', width: 240 },
            { field: 'clos', headerText: 'Stock', type: 'number', textAlign: 'Right', width: 90 },
            { field: 'age', headerText: 'Age', type: 'number', format: 'N0', width: 70, textAlign: 'Right', },
            { field: 'maxRetailPrice', headerText: 'MRP', type: 'number', textAlign: 'Right', format: 'N2', width: 100 },
            { field: 'salePriceGst', headerText: 'SP(GST)', type: 'number', textAlign: 'Right', format: 'N2', width: 100 },
            { field: 'lastPurchasePriceGst', headerText: 'Pur pr(GST)', type: 'number', textAlign: 'Right', format: 'N2', width: 110 },
            { field: 'sale', headerText: 'Sale', type: 'number', textAlign: 'Right', format: 'N0', width: 60 },
            { field: 'gstRate', headerText: 'Gst%', type: 'number', textAlign: 'Right', format: 'N2', width: 70 },
            { field: 'hsn', headerText: 'HSN', type: 'number', width: 90 },
            { field: 'saleDiscount', headerText: 'Discount', type: 'number', textAlign: 'Right', format: 'N0', width: 90 },
            { field: 'productCode', headerText: 'Pr Code', type: 'string', width: 100, textAlign: 'Right' },
            { field: 'upcCode', headerText: 'UPC', type: 'string', width: 100 },
        ]);
    }

    function customValuegAggregate(props: any) {
        const result = props.result
        if (_.isEmpty(result)) {
            return (0)
        }
        const ret: Decimal = result.reduce((sum: Decimal, current: ProductInfoType) =>
            (sum.plus((current.lastPurchasePrice * current.clos) || 0)), new Decimal(0))
        const r: number = ret.toNumber()
        return (r)
    }

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
        // return (<div>
        //     {`${props.brandName} ${props.catName} ${props.label}`}
        // </div>)
    }
}

export type ProductInfoType = {
    id: number
    age: number
    brandName: string
    clos: number
    catName: string
    gstRate: number
    hsn: number
    info: string
    label: string
    lastPurchasePrice: number
    lastPurchasePriceGst: number
    maxRetailPrice: number
    op: number
    openingPrice: number
    openingPriceGst: number
    productCode: string
    sale: number
    saleDiscount: number
    salePrice: number
    upcCode: string
}