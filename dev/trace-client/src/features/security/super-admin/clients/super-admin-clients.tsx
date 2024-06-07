// import { ColumnDirective, ColumnsDirective, GridComponent } from "@syncfusion/ej2-react-grids";
// import { testData } from "../../../../test-data/test-data";
import { CompAppGridToolbar } from "../../../../controls/components/comp-app-grid-toolbar";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompGenericSyncFusionGrid, SyncFusionGridColumnType } from "../../../../controls/components/comp-generic-syncfusion-grid";

export function SuperAdminClients() {
    return (
        <CompContentContainer title='Super admin clients' >
            <CompAppGridToolbar title="Clients view" isLastNoOfRows={true} />
            <div>
                <CompGenericSyncFusionGrid
                    columns={getColumns()}
                    instance="super-admin-clients"
                    sqlArgs={{dbName: 'traceAuth' }}
                    sqlId="get_all_clients"
                />
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
            </div>
        </CompContentContainer>
    )

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'id',
                headerText: 'Id',
            },
            {
                field: 'clientCode',
                headerText: 'Client code',
            },
            {
                field: 'clientName',
                headerText: 'Client name',
            }
        ])
    }
}