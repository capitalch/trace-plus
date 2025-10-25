import { useContext } from "react";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map";
import { Messages } from "../../../../utils/messages";
import { AdminNewRoleButton } from "./admin-new-role-button";
import { AdminNewEditRole } from "./admin-new-edit-role";
import { resetQueryHelperData } from "../../../../app/graphql/query-helper-slice";
import { AppDispatchType } from "../../../../app/store";
import { useDispatch } from "react-redux";
import { AllTables } from "../../../../app/maps/database-tables-map";

export function AdminRoles() {
    const context: GlobalContextType = useContext(GlobalContext);
    const instance = DataInstancesMap.adminRoles;
    const dispatch: AppDispatchType = useDispatch()
    return (
        <CompContentContainer title='Admin roles' CustomControl={() => <label className="text-primary-300">{Utils.getUserDetails()?.clientName}</label>}>
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
                height="calc(100vh - 260px)"
                instance={instance}
                sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME, clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId || 0 }}
                sqlId={SqlIdsMap.allAdminRoles}
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
            />
        </CompContentContainer>
    );

    function getAggregates(): SyncFusionGridAggregateType[] {
        return [
            {columnName:'roleName', type: 'Count', field: 'roleName', format: 'N0', footerTemplate: roleNameAggrTemplate }
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
                field: 'parentRoleName',
                headerText: 'Parent Role',
                type: 'string',
                width: 40,
            },
            {
                field: 'descr',
                headerText: 'Description',
                type: 'string',
            },
        ];
    }

    async function handleOnDelete(id: string | number) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: AllTables.RoleM.name,
            deletedIds: [+id],
        });
        Utils.showDeleteConfirmDialog(doDelete);

        async function doDelete() {
            try {
                await Utils.mutateGraphQL(q, GraphQLQueriesMapNames.genericUpdate);
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
                    parentId={props.parentId}
                />
            ),
        });
    }

    function roleNameAggrTemplate(props: any) {
        return <span className="text-xs">Count: {props.Count}</span>;
    }
}
