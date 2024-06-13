import { MapDataInstances } from "../../../../app/graphql/maps/map-data-instances";
import { MapSqlIds } from "../../../../app/graphql/maps/map-sql-ids";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";

export function SuperAdminClients() {
    // CustomControl={() => <CompAppGridToolbar title="Clients view" isLastNoOfRows={true} />}
    const instance = MapDataInstances.superAdminClients
    return (
        <CompContentContainer title='Super admin clients' className="" >
            <CompSyncFusionGridToolbar CustomControl={SuperAdminClientCustomControl} title="Clients view" isLastNoOfRows={true} instance={instance} />
            <CompSyncFusionGrid
                aggregates={getAggregates()}
                columns={getColumns()}
                instance={instance}
                sqlArgs={{ dbName: 'traceAuth' }}
                sqlId={MapSqlIds.allClients}
            />
        </CompContentContainer>
    )

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'id',
                headerText: 'Client id',
                type: 'number',
                width: 30,
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

function SuperAdminClientCustomControl() {
    return (
        <div className="flex flex-wrap gap-2">
            <button className="bg-primary-400 text-white w-20 min-w-24 h-10 rounded-md hover:bg-primary-600">New client</button>
            <button className="bg-primary-400 text-white w-20 h-10 rounded-md min-w-64 hover:bg-primary-600">New client with external database</button>
        </div>
    )
}