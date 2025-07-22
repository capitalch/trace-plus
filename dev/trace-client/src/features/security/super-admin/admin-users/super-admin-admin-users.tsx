import { useContext } from "react"
import { GlobalContext, GlobalContextType } from "../../../../app/global-context"
import { DataInstancesMap } from "../../../../app/maps/data-instances-map"
import { CompContentContainer } from "../../../../controls/components/comp-content-container"
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants"
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map"
import { Utils } from "../../../../utils/utils"
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map"
import { Messages } from "../../../../utils/messages"
import { SuperAdminNewAdminUserButton } from "./super-admin-new-admin-user-button"
import { SuperAdminNewEditAdminUser } from "./super-admin-new-edit-admin-user"
import { DatabaseTablesMap } from "../../../../app/maps/database-tables-map"

export function SuperAdminAdminUsers() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance = DataInstancesMap.superAdminAdminUsers

    return (<CompContentContainer title='Admin users'>
        <CompSyncFusionGridToolbar
            CustomControl={() => <SuperAdminNewAdminUserButton dataInstance={instance} />}
            title="Admin users view"
            isLastNoOfRows={true}
            instance={instance} />
        <CompSyncFusionGrid
            className="mt-4"
            aggregates={getAggregates()}
            columns={getColumns()}
            hasIndexColumn={true}
            height="calc(100vh - 260px)"
            instance={instance}
            // rowHeight={40}
            sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
            sqlId={SqlIdsMap.allAdminUsers}
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
        />
    </CompContentContainer>);

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            { columnName: 'clientName', type: 'Count', field: 'clientName', format: 'N0', footerTemplate: clientNameAggrTemplate }
        ])
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'clientName',
                headerText: 'Client name',
                type: 'string',
                width: 50,
            },
            {
                field: 'uid',
                headerText: 'Uid',
                type: 'string',
                width: 40,
            },
            {
                field: 'userName',
                headerText: 'User name',
                type: 'string',
                width: 60,
            },
            {
                field: 'mobileNo',
                headerText: 'Mobile',
                type: 'string',
                width: 40,
            },
            {
                field: 'userEmail',
                headerText: 'Email',
                type: 'string',
                width: 60,
            },
            {
                field: 'descr',
                headerText: 'Description',
                type: 'string'
            },
            {
                field: 'isActive',
                headerText: 'Active',
                template: isActiveTemplate,
                type: 'boolean',
                width: 35,
            },
            {
                field: 'timestamp',
                headerText: 'Timestamp',
                type: 'datetime',
                width: 70,
                format: 'dd MMM yyyy HH:mm'
            },
        ])
    }

    async function handleOnDelete(id: string | number) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: DatabaseTablesMap.UserM,
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
            title: 'Edit admin user',
            isOpen: true,
            element: <SuperAdminNewEditAdminUser
                dataInstance={instance}
                clientId={props.clientId}
                descr={props.descr}
                id={props.id}
                isActive={props.isActive}
                mobileNo={props.mobileNo}
                userEmail={props.userEmail}
                userName={props.userName}
            />
        })
    }

    function isActiveTemplate(props: any) {
        return (<input type="checkbox" readOnly checked={props.isActive} />)
    }

    function clientNameAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>)
    }
}