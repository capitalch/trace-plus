import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { NewEditBrandType } from "./new-edit-brand";
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { SlidingPaneEnum, SlidingPaneMap } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map";
import { NewBrandButton } from "./new-brand-button";
import { changeAccSettings } from "../../accounts-slice";
import { Messages } from "../../../../utils/messages";
import { useEffect} from "react";

export function BrandMaster() {
    const instance = DataInstancesMap.brandMaster;
    const dispatch: AppDispatchType = useDispatch();
    const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo();

    useEffect(() => {
        const loadData = context?.CompSyncFusionGrid[instance]?.loadData;
        if (loadData && buCode) {
            loadData();
        }
    }, [buCode]);

    return (
        <CompAccountsContainer>
            <CompSyncFusionGridToolbar
                className='mt-2 mr-6'
                CustomControl={() => <NewBrandButton />}
                minWidth="600px"
                title='Brands'
                isPdfExport={true}
                isExcelExport={true}
                isCsvExport={true}
                isLastNoOfRows={false}
                instance={instance}
            />

            <CompSyncFusionGrid
                aggregates={getAggregates()}
                buCode={buCode}
                className="mr-6 mt-4"
                columns={getColumns()}
                dbName={dbName}
                dbParams={decodedDbParamsObject}
                hasIndexColumn={true}
                height="calc(100vh - 240px)"
                instance={instance}
                // isLoadOnInit={false}
                minWidth="600px"
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
                sqlId={SqlIdsMap.getAllBrands}
            />
        </CompAccountsContainer>
    );

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'brandName',
                type: 'Count',
                field: 'brandName',
                format: 'N0',
                footerTemplate: brandNameAggrTemplate
            }
        ]);
    }

    function brandNameAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>);
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'brandName',
                headerText: 'Brand Name',
                type: 'string',
                width: 200,
            },
            {
                field: 'remarks',
                headerText: 'Remarks',
                type: 'string',
            },
            {
                field: "isUsed",
                headerText: 'Used',
                type: 'boolean',
                width: 50,
                template: (props: any) => <input type="checkbox" checked={props.isUsed} readOnly title="Is used" />
            }
        ]);
    }

    async function handleOnDelete(id: string | number, isUsed: boolean | undefined) {
        if (isUsed) {
            Utils.showAlertMessage('Warning!!!', Messages.messCannotDeleteSinceUsedInProduct)
            return
        }
        Utils.showDeleteConfirmDialog(doDelete);
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.BrandM,
                    deletedIds: [id],
                });
                Utils.showSaveMessage();
                dispatch(changeAccSettings());
                const loadData = context.CompSyncFusionGrid[instance].loadData;
                if (loadData) {
                    await loadData();
                }
            } catch (e: any) {
                console.log(e);
            }
        }
    }

    async function handleOnEdit(args: NewEditBrandType) {
        const props: NewEditBrandType = SlidingPaneMap[SlidingPaneEnum.brandMaster].props;
        props.id = args.id;
        props.brandName = args.brandName;
        props.remarks = args.remarks;
        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.brandMaster,
            title: 'Edit Brand',
            width: '600px'
        }));
    }
}
