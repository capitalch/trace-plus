import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store/store";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { NewProductButton } from "./new-product-button";
import { changeAccSettings } from "../../accounts-slice";
import { SlidingPaneEnum, SlidingPaneMap } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map";
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { NewEditProductType } from "./new-edit-product";
import { useEffect } from "react";

export function ProductMaster() {
    const instance = DataInstancesMap.productMaster;
    const dispatch: AppDispatchType = useDispatch();
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo();

    useEffect(() => {
        const loadData = context?.CompSyncFusionGrid[instance]?.loadData
        if (loadData && buCode) {
            loadData()
        }
    }, [buCode])

    return (
        <CompAccountsContainer>
            <CompSyncFusionGridToolbar
                className='mt-2 mr-6'
                CustomControl={() => <NewProductButton />}
                minWidth="1450px"
                title='Product master'
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
                height="calc(100vh - 290px)"
                instance={instance}
                isLoadOnInit={false}
                minWidth="1500px"
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
                sqlId={SqlIdsMap.getAllProducts}
                sqlArgs={{
                    isActive: null
                }}
            />
        </CompAccountsContainer>
    );

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
            { field: 'maxRetailPrice', headerText: 'MRP', type: 'number', width: 110, format: 'N2', textAlign: 'Right' },
            { field: 'salePrice', headerText: 'Sal Price', type: 'number', width: 110, format: 'N2', textAlign: 'Right' },
            { field: 'salePriceGst', headerText: 'Sal Pr(GST)', type: 'number', width: 110, format: 'N2', textAlign: 'Right' },
            { field: 'dealerPrice', headerText: 'Dealer pr', type: 'number', width: 110, format: 'N2', textAlign: 'Right' },
            { field: 'purPrice', headerText: 'Sal Pr(GST)', type: 'number', width: 110, format: 'N2', textAlign: 'Right' },
            { field: 'purPriceGst', headerText: 'Pur Pr(GST)', type: 'number', width: 110, format: 'N2', textAlign: 'Right' },
            { field: 'gstRate', headerText: 'Gst(%)', type: 'number', width: 80, format: 'N2', textAlign: 'Right' },
            { field: 'unitName', headerText: 'Unit', type: 'string', width: 80 },
            { field: 'info', headerText: 'Details', type: 'string', width: 250 },
            { field: 'id', headerText: 'ID', type: 'number', width: 80, format: 'N0', textAlign: 'Right', isPrimaryKey: true, },
            { field: 'upcCode', headerText: 'UPC', type: 'string', width: 90 },
            { field: 'isActive', headerText: 'Active', type: 'boolean', width: 80, template: (props: any) => <input type='checkbox' checked={props.isActive} aria-label="isActive" readOnly /> }
        ]);
    }

    async function handleOnDelete(id: string) {
        Utils.showDeleteConfirmDialog(doDelete);
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.ProductM,
                    deletedIds: [id]
                });
                Utils.showSaveMessage();
                dispatch(changeAccSettings());
                const loadData = context.CompSyncFusionGrid[instance].loadData;
                if (loadData) await loadData();
            } catch (e: any) {
                console.log(e);
            }
        }
    }

    async function handleOnEdit(args: NewEditProductType) {
        const props = SlidingPaneMap[SlidingPaneEnum.productMaster].props;
        props.id = args.id;
        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.productMaster,
            title: 'Edit Product',
            width: '700px'
        }));
    }
}
