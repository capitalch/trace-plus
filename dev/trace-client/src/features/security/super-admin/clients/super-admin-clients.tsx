import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { SuperAdminNewClientButtons } from "./super-admin-new-client-buttons";
import { Utils } from "../../../../utils/utils";
import { SuperAdminNewEditClient } from "./super-admin-new-edit-client";
import { SuperAdminNewEditClientExtDatabase } from "./super-admin-new-edit-client-ext-database";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map";
import { Messages } from "../../../../utils/messages";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { useContext } from "react";
import { DatabaseTablesMap } from "../../../../app/maps/database-tables-map";

export function SuperAdminClients() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance = DataInstancesMap.superAdminClients //Grid
    return (
        <CompContentContainer title='Super admin clients' className="">
            <CompSyncFusionGridToolbar CustomControl={() => <SuperAdminNewClientButtons dataInstance={instance} />} title="Clients view" isLastNoOfRows={true} instance={instance} />
            <CompSyncFusionGrid
                className="mt-4"
                aggregates={getAggregates()}
                columns={getColumns()}
                height="calc(100vh - 260px)"
                instance={instance}
                sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
                sqlId={SqlIdsMap.allClients}
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
            />
        </CompContentContainer>
    )

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'id',
                headerText: 'Cl id',
                type: 'number',
                width: 25,
            },
            {
                field: 'clientCode',
                headerText: 'Client code',
                width: 100
            },
            {
                field: 'clientName',
                headerText: 'Client name',
                width: 150
            },
            {
                field: 'dbName',
                headerText: 'Database name',
                width: 150
            },
            {
                field: 'isActive',
                headerText: 'Active',
                template: isActiveTemplate,
                width: 30
            },
            {
                field: 'isExternalDb',
                headerText: 'Ext db',
                template: isExternalDbTemplate,
                width: 30
            }
        ])
    }

    async function handleOnDelete(id: string | number) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: DatabaseTablesMap.ClientM,
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
        if (props.isExternalDb) {
            const dbParams: object | undefined = await Utils.decodeExtDbParams(props?.dbParams)
            Utils.showHideModalDialogA({
                title: 'Edit client with external database',
                isOpen: true,
                element: <SuperAdminNewEditClientExtDatabase
                    clientCode={props.clientCode}
                    clientName={props.clientName}
                    dbName={props.dbName}
                    dbParams={dbParams}
                    id={props.id}
                    isActive={props.isActive}
                    dataInstance={instance}
                    isExternalDb={true}
                />
            })
        } else {
            Utils.showHideModalDialogA({
                title: "Edit client",
                isOpen: true,
                element: <SuperAdminNewEditClient
                    clientCode={props.clientCode}
                    clientName={props.clientName}
                    dbName={props.dbName}
                    id={props.id}
                    isActive={props.isActive}
                    dataInstance={instance}
                />,
            })
        }
    }

    function isActiveTemplate(props: any) {
        return (<input type="checkbox" readOnly checked={props.isActive} />)
    }

    function isExternalDbTemplate(props: any) {
        return (<input type="checkbox" readOnly checked={props.isExternalDb} />)
    }

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {columnName:'clientCode', type: 'Count', field: 'clientCode', format: 'N0', footerTemplate: clientCodeAggrTemplate }
        ])
    }

    function clientCodeAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>)
    }
}
