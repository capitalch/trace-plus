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
                width: 40,
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
                width: 40,
            },
            {
                field: 'mobileNo',
                headerText: 'Mobile no',
                type: 'string',
                width: 40,
            },
            {
                field: 'userEmail',
                headerText: 'Email',
                type: 'string',
                width: 40,
            },
            {
                field: 'remarks',
                headerText: 'Remarks',
                type: 'string',
            },
            {
                field: 'isActive',
                headerText: 'Active',
                type: 'boolean',
                width: 40,
            },
            {
                field: 'timestamp',
                headerText: 'Timestamp',
                type: 'string',
                width: 40,
            },
        ])
    }

    async function handleOnDelete(id: string) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: 'SecuredControlM',
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
            // element: <SuperAdminEditNewSecuredControl
            //     controlName={props.controlName}
            //     controlNo={props.controlNo}
            //     controlType={props.controlType}
            //     dataInstance={instance}
            //     descr={props.descr}
            //     id={props.id}
            // />
        })
    }

    function clientNameAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>)
    }
}