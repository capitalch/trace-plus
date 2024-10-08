// import { useContext } from "react";
// import { GlobalContextType } from "../../../../app/global-context";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
// import { GlobalContext } from "../../../../App";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";

export function SuperAdminRoles() {
    // const context: GlobalContextType = useContext(GlobalContext)
    const instance = DataInstancesMap.superAdminRoles //Grid
    return (<CompContentContainer title='Super Admin Roles'>
        <CompSyncFusionGridToolbar title="Roles view" isLastNoOfRows={true} instance={instance} />
        <CompSyncFusionGrid
            className="mt-4"
            aggregates={getAggregates()}
            columns={getColumns()}
            instance={instance}
            rowHeight={40}
            sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
            sqlId={SqlIdsMap.allRoles}
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
        // onPreview={handleOnPreview}
        />
    </CompContentContainer>);

    function getAggregates(): SyncFusionAggregateType[] {
        return ([
            // { type: 'Count', field: 'clientCode', format: 'N0', footerTemplate: clientCodeAggrTemplate }
        ])
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([])
    }

    async function handleOnDelete(id: string) {
        console.log(id)
    }

    async function handleOnEdit(props: any) {
        console.log(props)
    }
}

