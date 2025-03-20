import { useDispatch, useSelector } from "react-redux";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { AppDispatchType, RootStateType } from "../../../../app/store/store";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import Decimal from "decimal.js";
import { ProductOpeningBalanceEditType, setProductOpeningBalanceEdit } from "../../accounts-slice";
import { Utils } from "../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";

export function ProductsOpeningBalancesGrid() {
    const instance = DataInstancesMap.productsOpeningBalances;
    const dispatch: AppDispatchType = useDispatch();
    const { branchId, buCode, context, currentDateFormat, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();
    const selectedData: any = useSelector((state: RootStateType) => {
        const ret: any = state.queryHelper[instance]?.data
        return (ret)
    })
    return (<div className="border-2 border-amber-100 rounded-lg">
        <CompSyncFusionGridToolbar
            className='mt-2 mr-6'
            minWidth="500px"
            title='Products opening balances'
            isPdfExport={true}
            isExcelExport={true}
            isCsvExport={true}
            instance={instance}
        />

        <CompSyncFusionGrid
            aggregates={getAggregates()}
            buCode={buCode}
            className="mt-4"
            columns={getColumns()}
            dataSource={selectedData?.[0]?.jsonResult?.openingBalances}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            deleteColumnWidth={40}
            editColumnWidth={40}
            height='calc(100vh - 260px)'
            instance={instance}
            isLoadOnInit={true}
            minWidth="800px"
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
            sqlId={SqlIdsMap.getProductsOpeningBalances}
            sqlArgs={{
                branchId: branchId,
                finYearId: finYearId
            }}
        />
    </div>)

    function customClosingAggregate(data: any,) {
        const res: Decimal = (data?.result || data) // when you pdf or excel export then figures are available in data and not in data.result
            .reduce((acc: Decimal, current: any) => {
                return acc.plus(new Decimal(current['openingPrice']).times(new Decimal(current['qty']))); // Multiply and add with Decimal
            }, new Decimal(0)); // Initialize accumulator as Decimal
        return (res.toNumber()); // Get the absolute value and convert back to a number
    }

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'label',
                type: 'Count',
                field: 'label',
                format: 'N0',
                footerTemplate: productAggrTemplate
            },
            {
                columnName: 'info',
                customAggregate: (data: any) => customClosingAggregate(data),
                field: 'info',
                format: 'N2',
                footerTemplate: (props: any) => {
                    return (<span className="mr-3 font-semibold">Value: {props.Custom}</span>)
                },
                type: 'Custom',
            }
        ]);
    }
    
    function productAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>);
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

    async function handleOnDelete(id: string) {
        Utils.showDeleteConfirmDialog(doDelete);
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.ProductOpBal,
                    deletedIds: [id],
                });
                Utils.showSaveMessage();
                const loadData = context.CompSyncFusionGrid[instance].loadData;
                if (loadData) {
                    await loadData();
                }
            } catch (e: any) {
                console.log(e);
            }
        }
    }

    async function handleOnEdit(args: ProductOpeningBalanceEditType) {
        dispatch(setProductOpeningBalanceEdit({
            id: args.id,
            catId: args.catId,
            brandId: args.brandId,
            labelId: args.productId,
            qty: args.qty,
            openingPrice: args.openingPrice,
            lastPurchaseDate: args.lastPurchaseDate
        }))
    }
}