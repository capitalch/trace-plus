import { useContext } from "react";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
import {
    CompSyncFusionGrid,
    SyncFusionAggregateType,
    SyncFusionGridColumnType,
} from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { Messages } from "../../../../utils/messages";
import { AdminNewBusinessUserButton } from "./admin-new-business-user-button";
import { AdminNewEditBusinessUser } from "./admin-new-edit-business-user";
import { resetQueryHelperData } from "../../../../app/graphql/query-helper-slice";
import { AppDispatchType } from "../../../../app/store/store";
import { useDispatch } from "react-redux";

export function AdminBusinessUsers() {
    const context: GlobalContextType = useContext(GlobalContext);
    const instance = DataInstancesMap.adminBusinessUsers;
    const dispatch: AppDispatchType = useDispatch()
    
    return (
        <CompContentContainer title="Business users">
            <CompSyncFusionGridToolbar
                CustomControl={() => <AdminNewBusinessUserButton dataInstance={instance} />}
                title="Business users view"
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
                sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME,clientId:Utils.getCurrentLoginInfo().clientId || 0 }}
                sqlId={SqlIdsMap.allBusinessUsers}
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
            />
        </CompContentContainer>
    );

    function getAggregates(): SyncFusionAggregateType[] {
        return [
            { type: "Count", field: "roleName", format: "N0", footerTemplate: roleNameAggrTemplate },
        ];
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return [
            {
                field: "roleName",
                headerText: "User role",
                type: "string",
                width: 50,
            },
            {
                field: "uid",
                headerText: "Uid",
                type: "string",
                width: 40,
            },
            {
                field: "userName",
                headerText: "User name",
                type: "string",
                width: 60,
            },
            {
                field: "mobileNo",
                headerText: "Mobile",
                type: "string",
                width: 40,
            },
            {
                field: "userEmail",
                headerText: "Email",
                type: "string",
                width: 60,
            },
            {
                field: "descr",
                headerText: "Description",
                type: "string",
            },
            {
                field: "isActive",
                headerText: "Active",
                template: isActiveTemplate,
                type: "boolean",
                width: 35,
            },
            {
                field: "timestamp",
                headerText: "Timestamp",
                type: "datetime",
                width: 70,
                format: "dd MMM yyyy HH:mm",
            },
        ];
    }

    async function handleOnDelete(id: string) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: "UserM",
            deletedIds: [id],
        });
        Utils.showDeleteConfirmDialog(doDelete);
        async function doDelete() {
            try {
                await Utils.mutateGraphQL(q, GraphQLQueriesMap.genericUpdate.name);
                Utils.showSuccessAlertMessage({ message: Messages.messRecordDeleted, title: Messages.messSuccess }, () => {
                    dispatch(resetQueryHelperData({ instance: instance }))
                    context.CompSyncFusionGrid[instance].loadData();
                });
            } catch (e: any) {
                Utils.showFailureAlertMessage({ message: e?.message || "", title: "Failed" });
            }
        }
    }

    async function handleOnEdit(props: any) {
        const loadData: () => void = () => context.CompSyncFusionGrid[instance].loadData()
        Utils.showHideModalDialogA({
            title: "Edit business user",
            isOpen: true,
            element: (
                <AdminNewEditBusinessUser
                    roleId={props.roleId}
                    descr={props.descr}
                    id={props.id}
                    isActive={props.isActive}
                    mobileNo={props.mobileNo}
                    userEmail={props.userEmail}
                    userName={props.userName}
                    loadData={loadData}
                />
            ),
        });
    }

    function isActiveTemplate(props: any) {
        return <input type="checkbox" readOnly checked={props.isActive} />;
    }

    function roleNameAggrTemplate(props: any) {
        return <span className="text-xs">Count: {props.Count}</span>;
    }
}
