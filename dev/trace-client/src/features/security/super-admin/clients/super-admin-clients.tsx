// import { ColumnDirective, ColumnsDirective, GridComponent } from "@syncfusion/ej2-react-grids";
// import { testData } from "../../../../test-data/test-data";
import { CompAppGridToolbar } from "../../../../controls/components/comp-app-grid-toolbar";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompGenericSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/comp-generic-syncfusion-grid";

export function SuperAdminClients() {
    return (
        <CompContentContainer title='Super admin clients' >
            <CompAppGridToolbar title="Clients view" isLastNoOfRows={true} />
            <CompGenericSyncFusionGrid
                aggregates={getAggregates()}
                columns={getColumns()}
                instance="super-admin-clients"
                sqlArgs={{ dbName: 'traceAuth' }}
                sqlId="get_all_clients"
            />
        </CompContentContainer>
    )

    function getAggregates(): SyncFusionAggregateType[] {
        return ([
            {type:'Count',  field: 'clientCode', format: 'N0', footerTemplate: clientCodeAggrTemplate }
        ])
    }

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

    function clientCodeAggrTemplate(props: any) {
        return (<span><b>Count: {props.Count}</b></span>)
    }
}

{/* <GridComponent
    className="mt-2"
    gridLines="Both"
    height='calc(100vh - 280px)'
    dataSource={testData}>
    <ColumnsDirective>
        <ColumnDirective field='OrderID' headerText='Order ID' width='120' textAlign="Right" />
        <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' />
        <ColumnDirective field='ShipCity' headerText='Ship City' width='150' />
        <ColumnDirective field='ShipName' headerText='Ship Name' width='150' />
    </ColumnsDirective>
</GridComponent> */}