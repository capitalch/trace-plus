import { useContext } from "react";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
// import { GlobalContext } from "../../../../App";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { SuperAdminNewRoleButton } from "./super-admin-new-role-button";
import { Utils } from "../../../../utils/utils";
import { SuperAdminNewEditRole } from "./super-admin-new-edit-role";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map";
import { Messages } from "../../../../utils/messages";
import { DatabaseTablesMap } from "../../../../app/maps/database-tables-map";

export function SuperAdminRoles() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance = DataInstancesMap.superAdminRoles //Grid
    return (<CompContentContainer title='Super admin roles'>
        <CompSyncFusionGridToolbar
            CustomControl={() => <SuperAdminNewRoleButton dataInstance={instance} />}
            title="Roles view"
            isLastNoOfRows={true}
            instance={instance} />
        <CompSyncFusionGrid
            className="mt-4"
            aggregates={getAggregates()}
            columns={getColumns()}
            hasIndexColumn={true}
            height="calc(100vh - 260px)"
            instance={instance}
            sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
            sqlId={SqlIdsMap.allRoles}
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
        />
    </CompContentContainer>);

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {columnName:'roleName', type: 'Count', field: 'roleName', format: 'N0', footerTemplate: roleNameAggrTemplate }
        ])
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'roleName',
                headerText: 'Role name',
                type: 'string',
                width: 40,
            },
            {
                field: 'descr',
                headerText: 'Description',
                type: 'string',
                // width: 80,
            },
            {
                field: 'rank',
                headerText: 'Rank',
                type: 'number',
                width: 40,
            },
        ])
    }

    async function handleOnDelete(id: string | number) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: DatabaseTablesMap.RoleM,
            deletedIds: [id]
        })
        Utils.showDeleteConfirmDialog(doDelete) // If confirm for deletion then doDelete method is called
        async function doDelete() {
            try {
                await Utils.mutateGraphQL(q, GraphQLQueriesMapNames.genericUpdate)
                Utils.showSuccessAlertMessage({ message: Messages.messRecordDeleted, title: Messages.messSuccess }, () => {
                    context.CompSyncFusionGrid[instance].loadData() // this is executed when OK button is pressed on the alert message
                })
            } catch (e: any) {
                Utils.showFailureAlertMessage({ message: e?.message || '', title: 'Failed' })
            }
        }
    }

    async function handleOnEdit(props: any) {
        Utils.showHideModalDialogA({
            title: 'Edit super admin role',
            isOpen: true,
            element: <SuperAdminNewEditRole
                dataInstance={instance}
                descr={props.descr}
                id={props.id}
                roleName={props.roleName}
            />
        })
    }

    function roleNameAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>)
    }
}

