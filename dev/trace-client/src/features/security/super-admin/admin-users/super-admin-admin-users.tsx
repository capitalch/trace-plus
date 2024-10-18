import { useContext } from "react"
import { GlobalContextType } from "../../../../app/global-context"
import { GlobalContext } from "../../../../App"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { CompContentContainer } from "../../../../controls/components/comp-content-container"
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar"
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid"
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { Utils } from "../../../../utils/utils"
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map"
import { Messages } from "../../../../utils/messages"
import { SuperAdminNewAdminUserButton } from "./super-admin-new-admin-user-button"
import { SuperAdminEditNewAdminUser } from "./super-admin-new-edit-admin-user"
// import { SuperAdminSecuredControlsNewControlButton } from "./super-admin-secured-controls-new-control-button"
// import { SuperAdminEditNewSecuredControl } from "./super-admin-edit-new-secured-control"

export function SuperAdminAdminUsers() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance = DataInstancesMap.superAdminAdminUsers //Grid

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
            instance={instance}
            rowHeight={40}
            sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
            sqlId={SqlIdsMap.allAdminUsers}
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
        />
    </CompContentContainer>);

    function getAggregates(): SyncFusionAggregateType[] {
        return ([
            { type: 'Count', field: 'clientName', format: 'N0', footerTemplate: clientNameAggrTemplate }
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

    async function handleOnDelete(id: string) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: 'UserM',
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
            title: 'Edit admin user',
            isOpen: true,
            element: <SuperAdminEditNewAdminUser
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