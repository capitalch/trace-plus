import { ColumnDirective, ColumnsDirective, GridComponent } from "@syncfusion/ej2-react-grids";
import { testData } from "./test-data";

export function SyncfusionGrid() {
    return (
        <div className="bg-red-400">
            <div className="bg-slate-200">
                <div className="flex justify-between mt-4 items-center">
                    <label className="text-lg font-medium text-primary-400 ml-4">General ledger</label>
                    <label className="text-blue-500 font-medium mr-4">AccName</label>
                </div>
                <GridComponent
                    className="mt-2"
                    gridLines="Both"
                    // width={"150%"} 
                    height='calc(100vh - 280px)'
                    dataSource={testData}>
                    <ColumnsDirective>
                        <ColumnDirective field='OrderID' headerText='Order ID' width={120} textAlign="Right" />
                        <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' />
                        <ColumnDirective field='ShipCity' headerText='Ship City' width='150' />
                        <ColumnDirective field='ShipName' headerText='Ship Name'  />
                        <ColumnDirective field='ShipCountry' headerText='Ship Country' width='150' />
                    </ColumnsDirective>
                </GridComponent>
            </div>
        </div>
    )
}