import { ColumnDirective, ColumnsDirective, GridComponent } from "@syncfusion/ej2-react-grids";
import { testData } from "./test-data";

export function SyncfusionGrid() {
    return (
        <div className="bg-red-400">
            <div className="w-[3000px] h-[10px] bg-slate-200">
                {/* <GridComponent
            className="mt-2"
            gridLines="Both"
            // width={"98%"} 
            // height='calc(100vh - 280px)'
            dataSource={testData}>
            <ColumnsDirective>
                <ColumnDirective field='OrderID' headerText='Order ID' width='120' textAlign="Right" />
                <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' />
                <ColumnDirective field='ShipCity' headerText='Ship City' width='150' />
                <ColumnDirective field='ShipName' headerText='Ship Name' width='150' />
            </ColumnsDirective>
        </GridComponent> */}
            </div>
        </div>
    )
}