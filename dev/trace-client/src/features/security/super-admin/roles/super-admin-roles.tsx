import { useContext } from "react";
import { GlobalContextType } from "../../../../app/global-context";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
import { GlobalContext } from "../../../../App";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { SuperAdminNewRoleButton } from "./super-admin-new-role-button";
import { Utils } from "../../../../utils/utils";
import { SuperAdminNewEditRole } from "./super-admin-new-edit-role";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { Messages } from "../../../../utils/messages";

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
            height="calc(100vh - 240px)"
            instance={instance}
            rowHeight={40}
            sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
            sqlId={SqlIdsMap.allRoles}
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
        />
    </CompContentContainer>);

    function getAggregates(): SyncFusionAggregateType[] {
        return ([
            { type: 'Count', field: 'roleName', format: 'N0', footerTemplate: roleNameAggrTemplate }
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

    async function handleOnDelete(id: string) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: 'RoleM',
            deletedIds: [id]
        })
        Utils.showDeleteConfirmDialog(doDelete) // If confirm for deletion then doDelete method is called
        async function doDelete() {
            try {
                await Utils.mutateGraphQL(q, GraphQLQueriesMap.genericUpdate.name)
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

