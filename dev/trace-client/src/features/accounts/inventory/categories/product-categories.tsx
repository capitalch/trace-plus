// import { useDispatch } from "react-redux"
// import { AppDispatchType } from "../../../../app/store/store"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar"
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"

export function ProductCategories() {
    // const dispatch: AppDispatchType = useDispatch()
    const instance: string = DataInstancesMap.accountsMaster

    const {
        buCode
        // , context
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    return (<CompAccountsContainer>
        <CompSyncFusionTreeGridToolbar className="mt-2"
            title='Product categories'
            isLastNoOfRows={false}
            instance={instance}
            width="calc(100vw - 250px)" // This stops unnecessary flickers
        />

        <CompSyncfusionTreeGrid
            addUniqueKeyToJson={true}
            // aggregates={getAggregates()}
            buCode={buCode}
            childMapping="children"
            className="mr-6"
            dataPath="productCategories"
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            graphQlQueryFromMap={GraphQLQueriesMap.productCategories}
            isLoadOnInit={true}
            columns={getColumns()}
            height="calc(100vh - 245px)"
            instance={instance}
            minWidth='950px'
            treeColumnIndex={0}
        /> 
    </CompAccountsContainer>)

function getColumns(): SyncFusionTreeGridColumnType[] {
    return ([
        {
            field:'catName',
            headerText:'Category name',
            width: 200
        }
    ])
}
}