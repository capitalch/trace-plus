import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";
import { SuperAdminClientNewClientButtons } from "./super-admin-clients-new-client-buttons";
import { Utils } from "../../../../utils/utils";
import { SuperAdminEditNewClient } from "./super-admin-edit-new-client";
import { SuperAdminEditNewClientExtDatabase } from "./super-admin-edit-new-client-ext-database";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import _ from "lodash";
import { Messages } from "../../../../utils/messages";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { GlobalContextType } from "../../../../app/global-context";
import { useContext } from "react";
import { GlobalContext } from "../../../../App";

export function SuperAdminClients() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance = DataInstancesMap.superAdminClients //Grid
    return (
        <CompContentContainer title='Super admin clients' className="">
            <CompSyncFusionGridToolbar CustomControl={() => <SuperAdminClientNewClientButtons dataInstance={instance} />} title="Clients view" isLastNoOfRows={true} instance={instance} />
            <CompSyncFusionGrid
                className="mt-4"
                aggregates={getAggregates()}
                columns={getColumns()}
                instance={instance}
                rowHeight={40}
                sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
                sqlId={SqlIdsMap.allClients}
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
            // onPreview={handleOnPreview}
            />
        </CompContentContainer>
    )

    async function decodeExtDbParams(encodedDbParams: string) {
        const q = GraphQLQueriesMap.decodeExtDbParams(encodedDbParams)
        const qName = GraphQLQueriesMap.decodeExtDbParams.name
        try {
            const res: any = await Utils.queryGraphQL(q, qName)
            const dbParamsString = res?.data?.[qName]
            const dbParams: object = JSON.parse(dbParamsString)
            if (_.isEmpty(dbParams)) {
                throw new Error(Messages.errExtDbParamsFormatError)
            }
            return (dbParams)
        } catch (e: any) {
            Utils.showErrorMessage(e)
        }
    }

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

    async function handleOnDelete(id: string) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: 'ClientM',
            deletedIds: [id]
        })
        Utils.showConfirmDialog(doDelete) // If confirm for deletion then doDelete method is called
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
        if (props.isExternalDb) {
            const dbParams: object | undefined = await decodeExtDbParams(props?.dbParams)
            Utils.showHideModalDialogA({
                title: 'Edit client with external database',
                isOpen: true,
                element: <SuperAdminEditNewClientExtDatabase
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
                element: <SuperAdminEditNewClient
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

    function getAggregates(): SyncFusionAggregateType[] {
        return ([
            { type: 'Count', field: 'clientCode', format: 'N0', footerTemplate: clientCodeAggrTemplate }
        ])
    }

    function clientCodeAggrTemplate(props: any) {
        return (<span><b>Count: {props.Count}</b></span>)
    }
}
