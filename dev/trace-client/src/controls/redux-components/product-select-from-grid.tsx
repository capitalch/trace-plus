import { useDispatch } from "react-redux";
import { DataInstancesMap } from "../../app/graphql/maps/data-instances-map";
import { useUtilsInfo } from "../../utils/utils-info-hook";
import { AppDispatchType } from "../../app/store/store";
import { CompSyncFusionGridToolbar } from "../components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../components/syncfusion-grid/comp-syncfusion-grid";
import { SqlIdsMap } from "../../app/graphql/maps/sql-ids-map";

export function ProductSelectFromGrid({ index, onSelect }: ProductSelectFromGridType) {
    const instance = DataInstancesMap.productSelect;
    const dispatch: AppDispatchType = useDispatch();
    const { branchId, buCode, context, currentDateFormat, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

    return (<div className="">
        <CompSyncFusionGridToolbar
            className='mt-2 mr-6'
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
            // dataSource={selectedData?.[0]?.jsonResult?.openingBalances}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            deleteColumnWidth={40}
            editColumnWidth={40}
            height='calc(100vh - 260px)'
            instance={instance}
            isLoadOnInit={true}
            minWidth="800px"
            sqlId={SqlIdsMap.getProductsOpeningBalances}
            sqlArgs={{
                branchId: branchId,
                finYearId: finYearId
            }}
        />
    </div>)

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'label',
                type: 'Count',
                field: 'label',
                format: 'N0',
                // footerTemplate: productAggrTemplate
            },
            {
                columnName: 'info',
                // customAggregate: (data: any) => customClosingAggregate(data),
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
            { field: 'index', headerText: '#', type: 'number', width: 80, textAlign: 'Right' },
            { field: 'productCode', headerText: 'Code', type: 'string', width: 80, textAlign: 'Right' },
            { field: 'catName', headerText: 'Cat', type: 'string', width: 100 },
            { field: 'brandName', headerText: 'Brand', type: 'string', width: 80 },
            { field: 'label', headerText: 'Label', type: 'string', width: 150 },
            { field: 'qty', headerText: 'Qty', type: 'number', width: 80, textAlign: 'Right' },
            { field: 'openingPrice', headerText: 'Op price', type: 'number', format: 'N2', width: 100, textAlign: 'Right' },
            { field: 'lastPurchaseDate', headerText: 'Pur dt', type: 'date', width: 90, format: currentDateFormat },
            { field: 'info', headerText: 'Details', type: 'string', width: 250 },
            { field: 'id', type: 'string', width: 0, textAlign: 'Right', isPrimaryKey: true, visible: false },
            { field: 'isActive', headerText: 'Active', type: 'boolean', width: 80, template: (props: any) => <input type='checkbox' checked={props.isActive} readOnly disabled /> }
        ]);
    }
}

type ProductSelectFromGridType = {
    index?: number
    onSelect?: (index?: number) => void
}