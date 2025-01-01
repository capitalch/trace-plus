import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"

export function AccountsMaster() {
    const instance: string = DataInstancesMap.accountsMaster
    const {
        // branchId
        buCode
        // , context
        , dbName
        , decodedDbParamsObject
        // , decFormatter
        // , finYearId
        // , intFormatter
    } = useUtilsInfo()

    return (<CompAccountsContainer>

        <CompSyncFusionTreeGridToolbar className="mt-2"
            // CustomControl={() => <CompSwitch instance={CompInstances.compSwitchTrialBalance} className="" leftLabel="All branches" rightLabel="" />}
            title='Accounts master'
            // isAllBranches={isAllBranches}
            isLastNoOfRows={false}
            instance={instance}
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            // aggregates={getTrialBalanceAggregates()}
            buCode={buCode}
            childMapping="children"
            className="mr-6"
            dataPath="accountsMaster"
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            graphQlQueryFromMap={GraphQLQueriesMap.accountsMaster}
            isLoadOnInit={true}
            // sqlArgs={{
            //     branchId: isAllBranches ? null : branchId || 0,
            //     finYearId: finYearId || 1900,
            // }}
            columns={getColumns()}
            height="calc(100vh - 215px)"
            instance={instance}
            minWidth='950px'
            treeColumnIndex={0}
        />

    </CompAccountsContainer>)

    function getColumns():SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'accName',
                headerText: 'Account Name',
                width: 250,
                textAlign: 'Left'
            },
            {
                field: 'accCode',
                headerText: 'Acc code',
                width: 100,
                textAlign: 'Left'
            },
        ])
    }
}