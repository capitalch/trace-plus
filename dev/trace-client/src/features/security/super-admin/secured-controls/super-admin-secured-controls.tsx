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

export function SuperAdminSecuredControls() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance = DataInstancesMap.superAdminRoles //Grid

    return (<CompContentContainer title='Super admin secured controls'>
        <CompSyncFusionGridToolbar
            // CustomControl={() => <SuperAdminRolesNewRoleButton dataInstance={instance} />}
            title="Secured controls view"
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
            sqlId={SqlIdsMap.allSecuredControls}
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
        />
    </CompContentContainer>);

    function getAggregates(): SyncFusionAggregateType[] {
        return ([
            { type: 'Count', field: 'controlName', format: 'N0', footerTemplate: controlNameAggrTemplate }
        ])
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'controlName',
                headerText: 'Control name',
                type: 'string',
                width: 40,
            },
            {
                field: 'controlNo',
                headerText: 'Control no',
                type: 'string',
                width: 40,
            },
            {
                field: 'controlType',
                headerText: 'Control type',
                type: 'string',
                width: 40,
            },
            {
                field: 'descr',
                headerText: 'Description',
                type: 'string',
                // width: 40,
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
        // Utils.showHideModalDialogA({
        //     title: 'Edit super admin role',
        //     isOpen: true,
        //     element: <SuperAdminEditNewRole
        //         dataInstance={instance}
        //         descr={props.descr}
        //         id={props.id}
        //         roleName={props.roleName}
        //     />
        // })
    }

    function controlNameAggrTemplate(props: any) {
        return (<span><b>Count: {props.Count}</b></span>)
    }

}