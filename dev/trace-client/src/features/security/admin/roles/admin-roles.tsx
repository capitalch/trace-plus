import { useContext } from "react";
import { GlobalContextType } from "../../../../app/global-context";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
import { GlobalContext } from "../../../../App";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { Messages } from "../../../../utils/messages";
import { AdminNewRoleButton } from "./admin-new-role-button";
import { AdminNewEditRole } from "./admin-new-edit-role";
import { resetQueryHelperData } from "../../../../app/graphql/query-helper-slice";
import { AppDispatchType } from "../../../../app/store/store";
import { useDispatch } from "react-redux";

export function AdminRoles() {
    const context: GlobalContextType = useContext(GlobalContext);
    const instance = DataInstancesMap.adminRoles;
    const dispatch: AppDispatchType = useDispatch()
    return (
        <CompContentContainer title='Admin roles'>
            <CompSyncFusionGridToolbar
                CustomControl={() => <AdminNewRoleButton dataInstance={instance} />}
                title="Roles view"
                isLastNoOfRows={true}
                instance={instance}
            />
            <CompSyncFusionGrid
                className="mt-4"
                aggregates={getAggregates()}
                columns={getColumns()}
                hasIndexColumn={true}
                height="calc(100vh - 240px)"
                instance={instance}
                rowHeight={40}
                sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME, clientId: Utils.getCurrentLoginInfo().clientId || 0 }}
                sqlId={SqlIdsMap.allAdminRoles}
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
            />
        </CompContentContainer>
    );

    function getAggregates(): SyncFusionAggregateType[] {
        return [
            { type: 'Count', field: 'roleName', format: 'N0', footerTemplate: roleNameAggrTemplate }
        ];
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return [
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
            },
            {
                field: 'rank',
                headerText: 'Rank',
                type: 'number',
                width: 40,
            },
        ];
    }

    async function handleOnDelete(id: string) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: 'RoleM',
            deletedIds: [id],
        });
        Utils.showDeleteConfirmDialog(doDelete);

        async function doDelete() {
            try {
                await Utils.mutateGraphQL(q, GraphQLQueriesMap.genericUpdate.name);
                Utils.showSuccessAlertMessage(
                    { message: Messages.messRecordDeleted, title: Messages.messSuccess },
                    () => {
                        dispatch(resetQueryHelperData({ instance: instance }))
                        context.CompSyncFusionGrid[instance].loadData(); // Reloads data after deletion
                    }
                );
            } catch (e: any) {
                Utils.showFailureAlertMessage({ message: e?.message || '', title: 'Failed' });
            }
        }
    }

    async function handleOnEdit(props: any) {
        Utils.showHideModalDialogA({
            title: 'Edit admin role',
            isOpen: true,
            element: (
                <AdminNewEditRole
                    dataInstance={instance}
                    descr={props.descr}
                    id={props.id}
                    roleName={props.roleName}
                />
            ),
        });
    }

    function roleNameAggrTemplate(props: any) {
        return <span className="text-xs">Count: {props.Count}</span>;
    }
}
