import { MapDataInstances } from "../../../../app/graphql/maps/map-data-instances";
import { MapSqlIds } from "../../../../app/graphql/maps/map-sql-ids";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";

export function SuperAdminClients() {
    // CustomControl={() => <CompAppGridToolbar title="Clients view" isLastNoOfRows={true} />}
    const instance = MapDataInstances.superAdminClients
    return (
        <CompContentContainer title='Super admin clients'  >
            <CompSyncFusionGridToolbar title="Clients view" isLastNoOfRows={true} instance={instance} />
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