import { useDispatch } from "react-redux";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { AppDispatchType } from "../../../../app/store/store";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { SlidingPaneEnum, SlidingPaneMap } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map";

export function ProductsOpeningBalances() {
    const instance = DataInstancesMap.productsOpeningBalances;
    const dispatch: AppDispatchType = useDispatch();
    const { branchId, buCode, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

    return (<CompAccountsContainer>
        <CompSyncFusionGridToolbar
            className='mt-2 mr-6'
            minWidth="1450px"
            title='Products Opening Balances'
            isPdfExport={true}
            isExcelExport={true}
            isCsvExport={true}
            instance={instance}
        />

        <CompSyncFusionGrid
            aggregates={getAggregates()}
            allowPaging={true}
            buCode={buCode}
            className="mr-6 mt-4"
            columns={getColumns()}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            deleteColumnWidth={40}
            editColumnWidth={40}
            height="calc(100vh - 295px)"
            instance={instance}
            isLoadOnInit={true}
            minWidth="1500px"
            onEdit={handleOnEdit}
            sqlId={SqlIdsMap.getProductsOpeningBalances}
            sqlArgs={{
                branchId:branchId,
                fiYearId: finYearId
            }}
        />
    </CompAccountsContainer>)
    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'label',
                type: 'Count',
                field: 'label',
                format: 'N0',
                footerTemplate: productAggrTemplate
            }
        ]);
    }
    function productAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>);
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            { field: 'index', headerText: '#', type: 'number', width: 80 },
            { field: 'productCode', headerText: 'Code', type: 'string', width: 80 },
            { field: 'catName', headerText: 'Cat', type: 'string', width: 80 },
            { field: 'brandName', headerText: 'Brand', type: 'string', width: 80 },
            { field: 'label', headerText: 'Label', type: 'string', width: 150 },
            { field: 'hsn', headerText: 'HSN', type: 'string', width: 80 },
            { field: 'info', headerText: 'Details', type: 'string', width: 250 },
            { field: 'id', headerText: 'ID', type: 'number', width: 80, format: 'N0', textAlign: 'Right', isPrimaryKey: true, },
            { field: 'isActive', headerText: 'Active', type: 'boolean', width: 80, template: (props: any) => <input type='checkbox' checked={props.isActive} readOnly /> }
        ]);
    }

    async function handleOnEdit(args: any) {
        const props = SlidingPaneMap[SlidingPaneEnum.productMaster].props;
        props.id = args.id;
        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.productMaster,
            title: 'Product Opening Balance',
            width: '700px'
        }));
    }
}