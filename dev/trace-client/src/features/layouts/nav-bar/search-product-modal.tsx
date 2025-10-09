import _ from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataInstancesMap } from "../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../utils/utils-info-hook";
import { Utils } from "../../../utils/utils";
import { CompSyncFusionGridToolbar } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import {
    fetchProducts,
    selectProducts,
    selectIsLoading,
    selectError,
    selectLastFetched,
    selectCacheExpiry,
    isCacheValid,
    FetchProductsParamsType
} from "./search-product-slice";
import type { AppDispatchType } from "../../../app/store";

export function SearchProductModal({ onProductSelect }: SearchProductModalPropsType) {
    const instance = DataInstancesMap.searchProductModal;
    const { branchId, buCode, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

    const dispatch = useDispatch<AppDispatchType>();
    const products = useSelector(selectProducts);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const lastFetched = useSelector(selectLastFetched);
    const cacheExpiry = useSelector(selectCacheExpiry);

    useEffect(() => {
        // Fetch products if cache is invalid or empty
        // Also re-fetch when buCode changes (business unit change)
        if (!isCacheValid(lastFetched, cacheExpiry) || products.length === 0) {
            handleRefresh();
        }
    }, [branchId, finYearId, buCode]);

    function handleRefresh() {
        if (!branchId || !finYearId || !buCode || !dbName) {
            return;
        }
        const params: FetchProductsParamsType = {
            branchId,
            finYearId,
            buCode,
            dbName,
            dbParams: decodedDbParamsObject,
            instance
        };
        dispatch(fetchProducts(params));
    }

    return (<div className="relative">
        <CompSyncFusionGridToolbar
            className="mt-2"
            minWidth="400px"
            title='All Active Products'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            instance={instance}
            onRefresh={handleRefresh}
        />

        {lastFetched && (
            <div className="text-xs text-gray-500 mb-2 -mt-2">
                Last updated: {new Date(lastFetched).toLocaleString()}
            </div>
        )}

        {error && (
            <div className="mb-2 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded-md">
                Error: {error}
            </div>
        )}

        {isLoading && products.length === 0 ? (
            <div className="text-center py-8">Loading products...</div>
        ) : (
            <CompSyncFusionGrid
                aggregates={getAggregates()}
                hasCheckBoxSelection
                className="mt-4"
                columns={getColumns()}
                dataSource={products}
                height='calc(100vh - 280px)'
                instance={instance}
                minWidth="400px"
                rowSelected={onProductSelect ? onRowSelected : undefined}
                searchFields={['product', 'label', 'brandName', 'catName', 'info', 'hsn', 'productCode', 'upcCode']}
            />
        )}
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
            { field: 'lastPurchasePriceGst', headerText: 'Pur pr(GST)', type: 'number', textAlign: 'Right', format: 'N2', width: 110 },
            { field: 'salePriceGst', headerText: 'SP(GST)', type: 'number', textAlign: 'Right', format: 'N2', width: 100 },
            { field: 'calculatedSalePriceGst', headerText: 'SP Calculaed(GST)', type: 'number', textAlign: 'Right', format: 'N2', width: 150 },

            { field: 'sale', headerText: 'Sale', type: 'number', textAlign: 'Right', format: 'N0', width: 60 },
            { field: 'gstRate', headerText: 'Gst%', type: 'number', textAlign: 'Right', format: 'N2', width: 70 },
            { field: 'hsn', headerText: 'HSN', type: 'number', width: 90 },
            { field: 'saleDiscount', headerText: 'Discount', type: 'number', textAlign: 'Right', format: 'N0', width: 90 },
            { field: 'productCode', headerText: 'Pr Code', type: 'string', width: 100, textAlign: 'Right' },
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
        if (onProductSelect) {
            onProductSelect(args?.data)
            Utils.showHideModalDialogA({
                isOpen: false
            })
        }
    }

    function productTemplate(props: ProductInfoType) {
        return (''.concat(props.brandName, ' ', props.catName, ' ', props.label))
    }
}

export type SearchProductModalPropsType = {
    onProductSelect?: (product: ProductInfoType) => void
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
    productId: number // same as id. Used for compability purpose
    sale: number
    saleDiscount: number
    salePrice: number
    salePriceGst: number
    calculatedSalePriceGst: number
    upcCode: string
    product?: string  // Computed product name
}