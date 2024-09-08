import { MapDataInstances } from "../../../../app/graphql/maps/map-data-instances";
import { MapSqlIds } from "../../../../app/graphql/maps/map-sql-ids";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";
import { SuperAdminClientNewClientButtons } from "./super-admin-clients-new-client-buttons";
import { Utils } from "../../../../utils/utils";
import { SuperAdminEditNewClient } from "./super-admin-edit-new-client";

export function SuperAdminClients() {
    const instance = MapDataInstances.superAdminClients //Grid
    return (
        <CompContentContainer title='Super admin clients' className="">
            <CompSyncFusionGridToolbar CustomControl={() => <SuperAdminClientNewClientButtons dataInstance={instance} />} title="Clients view" isLastNoOfRows={true} instance={instance} />
            <CompSyncFusionGrid
                className="mt-4"
                aggregates={getAggregates()}
                columns={getColumns()}
                instance={instance}
                rowHeight={40}
                sqlArgs={{ dbName: 'traceAuth' }}
                sqlId={MapSqlIds.allClients}
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
            // onPreview={handleOnPreview}
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

    function handleOnDelete(id: string) {
        console.log('Delete clicked:', id)
    }

    function handleOnEdit(props: any) {
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


// function handleOnPreview(props: any) {
//     console.log('Preview clicked: ', props)
// }