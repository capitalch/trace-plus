import { ColumnDirective, ColumnsDirective, GridComponent } from "@syncfusion/ej2-react-grids";
import { AppGridToolbar } from "../../../../components/controls/app-grid-toolbar";
import { ContentContainer } from "../../../../components/widgets/content-container";
import { testData } from "../../../../test-data/test-data";

export function SuperAdminClients() {
    return (
        <ContentContainer title='Super admin clients' >
            <AppGridToolbar title="Clients view" isLastNoOfRows={true} />
            <div>
                <GridComponent
                    className="mt-2"
                    gridLines="Both"
                    // width={"98%"} 
                    height='calc(100vh - 280px)'
                    dataSource={testData}>
                    <ColumnsDirective>
                        <ColumnDirective field='OrderID' headerText='Order ID' width='120' textAlign="Right" />
                        <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' />
                        <ColumnDirective field='ShipCity' headerText='Ship City' width='150' />
                        <ColumnDirective field='ShipName' headerText='Ship Name' width='150' />
                    </ColumnsDirective>
                </GridComponent>
            </div>
        </ContentContainer>
    )
}