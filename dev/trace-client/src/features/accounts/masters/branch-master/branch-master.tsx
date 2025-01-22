import { useContext } from "react";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store/store";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { EditNewBranchType } from "./edit-new-branch";
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { SlidingPaneEnum, SlidingPaneMap } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map";

export function BranchMaster() {
    const context: GlobalContextType = useContext(GlobalContext);
    const instance = DataInstancesMap.branchMaster; // Grid instance for Business Units
    const dispatch: AppDispatchType = useDispatch()
    const { buCode, dbName, decodedDbParamsObject, } = useUtilsInfo()

    return (<CompAccountsContainer >
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            // CustomControl={() => <BankReconCustomControls instance={instance} meta={meta} />}
            minWidth="1000px"
            title='Branches'
            isPdfExport={true}
            isExcelExport={true}
            isCsvExport={true}
            isLastNoOfRows={false}
            instance={instance}
        />

        <CompSyncFusionGrid
            // aggregates={getAggregates()}
            buCode={buCode}
            className="mr-6 mt-4"
            columns={getColumns()}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            hasIndexColumn={true}
            height="calc(100vh - 220px)"
            instance={instance}
            isLoadOnInit={true}
            minWidth="1400px"
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
            sqlId={SqlIdsMap.getAllBranches}
        />
    </CompAccountsContainer>)

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'branchName',
                headerText: 'Branch name',
                type: 'string',
                width: 200,
            },
            {
                field: 'branchCode',
                headerText: 'Branch code',
                type: 'string',
                width: 80,
            },
            {
                field: 'remarks',
                headerText: 'Remarks',
                type: 'string',
                // width: 40,
            },
        ])
    }

    async function handleOnDelete(id: string) {
        Utils.showDeleteConfirmDialog(doDelete)
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.BranchM,
                    deletedIds: [id],
                })
                Utils.showSaveMessage()
                const loadData = context.CompSyncFusionGrid[instance].loadData
                if (loadData) {
                    loadData()
                }
            } catch (e: any) {
                console.log(e)
            }
        }
    }

    async function handleOnEdit(args: EditNewBranchType) {
        const props: EditNewBranchType = SlidingPaneMap[SlidingPaneEnum.branchMaster].props
        props.id = args.id
        props.branchCode = args.branchCode
        props.branchName = args.branchName
        props.remarks = args.branchName
        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.branchMaster,
            title: 'Edit branch',
            width: '600px'
        }))
    }
}