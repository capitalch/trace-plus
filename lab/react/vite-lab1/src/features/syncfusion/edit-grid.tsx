import { useRef, useState } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, Edit, Inject, Toolbar } from "@syncfusion/ej2-react-grids";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";

export function EditGrid() {
    const [, setRefresh] = useState({})
    const meta: any = useRef({
        sampleData: [
            { OrderID: 10248, CustomerName: "John Doe", OrderDate: new Date('2024-02-01'), Freight: 32.38 },
            { OrderID: 10249, CustomerName: "Jane Smith", OrderDate: new Date('2022-12-12'), Freight: 11.61 }
        ]
    })
    // Sample data
    // const [data, setData] = useState([
    //     { OrderID: 10248, CustomerName: "John Doe", OrderDate: new Date('2024-02-01'), Freight: 32.38 },
    //     { OrderID: 10249, CustomerName: "Jane Smith", OrderDate: new Date('2022-12-12'), Freight: 11.61 }
    // ]);

    const gridRef: any = useRef(null);
    const datePickerParams = {
        params: {
            format: "dd/MM/yyyy", // Set the date format
        },
    };
    const dateEditTemplate = (args: any) => {
        return (
            <DatePickerComponent
                value={args.OrderDate}
                placeholder="Select a date"
                onChange={(e: any) => {
                    const index: number = args.index
                    meta.current.sampleData[index].OrderDate = e.value
                    setRefresh({})
                    // const updatedData: any = {};
                    // updatedData[args.column.field] = e.value; // Update the specific field with the new value

                    // Assign the updated data back to args
                    // Object.assign(args, updatedData); // Merge updatedData into args
                }}
                format='dd-MM-yyyy'
                showClearButton={true}
            />
        );
    };
    // const editParams = { mode: "Dialog" }; // Mode: 'Normal', 'Batch', or 'Dialog'
    return (
        <div className="flex flex-col m-4">
            <button className="bg-slate-200 px-5 py-1 w-40" onClick={() => {
                console.log(meta.current.sampleData)
            }}>Check data</button>
            <GridComponent 
                queryCellInfo={handleQueryCellInfo}
                dataSource={meta.current.sampleData}
                editSettings={{
                    allowEditing: true,
                    mode: "Batch"
                }}
                gridLines="Both"
                ref={gridRef}
            >
                <ColumnsDirective>
                    <ColumnDirective allowEditing={true}
                        edit={datePickerParams}
                        editType="datepickeredit"
                        field="OrderDate"
                        format='dd/MM/yyyy'
                        type="date"
                        headerText="Order Date"
                        width="80"
                        customAttributes={{
                            class:'custom-css',
                            width: '2000px'
                        }}
                    // customAttributes={(args:any) => ({
                    //     style: { backgroundColor: args.isEdited ? '#FFDDC1' : 'transparent' },
                    //     title: args.isEdited ? 'Edited' : 'Not Edited'
                    //   })}
                    // editTemplate={dateEditTemplate}
                    />
                    <ColumnDirective field="OrderID" headerText="Order ID" isPrimaryKey={true} width="120"  />
                    <ColumnDirective field="CustomerName" headerText="Customer Name" width="150" allowEditing={true} />
                    <ColumnDirective field="Freight" headerText="Freight" textAlign="Right" width="120" />
                </ColumnsDirective>
                <Inject services={[Edit]} />
            </GridComponent>
        </div>
    );

    function handleQueryCellInfo(args:any){
        console.log(args)

    }
}