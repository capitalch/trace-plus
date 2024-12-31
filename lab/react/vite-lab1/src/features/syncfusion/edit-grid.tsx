import { FocusEvent, useRef, useState } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, Edit, Inject, Toolbar } from "@syncfusion/ej2-react-grids";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import InputMask from "react-input-mask";
import { NumericFormat } from 'react-number-format'

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

    return (
        <div className="flex flex-col m-4">
            {/* react-input-mask */}
            <InputMask mask="9999999999.99" className="w-28 h-8 text-right" alwaysShowMask={false} />
            {/* react-number-format */}
            <NumericFormat className="text-right w-28 h-8" allowNegative={false}
                decimalScale={2}
                fixedDecimalScale={true} thousandsGroupStyle="thousand"
                thousandSeparator=','
                onFocus={handleOnFocus}
            />
            <GridComponent
                actionBegin={handleActionBegin}
                cellEdit={handleCellEdit}
                queryCellInfo={handleQueryCellInfo}
                dataSource={meta.current.sampleData}
                editSettings={{
                    allowEditing: true,
                    mode: "Normal"
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
                            class: 'custom-css',
                        }}
                    />
                    <ColumnDirective field="OrderID" headerText="Order ID" isPrimaryKey={true} width="120" />
                    <ColumnDirective field="CustomerName" headerText="Customer Name" width="150" allowEditing={true} />
                    <ColumnDirective field="Freight" headerText="Freight" textAlign="Right" width="120" />
                </ColumnsDirective>
                <Inject services={[Edit]} />
            </GridComponent>
        </div>
    );

    function handleOnFocus(event: FocusEvent<HTMLInputElement>): void {
        event.target.select()
    }

    function handleQueryCellInfo(args: any) {
        console.log(args)
    }

    function handleActionBegin(args: any) {
        console.log(args)
    }

    function handleCellEdit(args: any) {
        console.log(args)
        args.rowData.OrderDate = new Date()
    }
}

// const dateEditTemplate = (args: any) => {
//     return (
//         <DatePickerComponent
//             value={args.OrderDate}
//             placeholder="Select a date"
//             onChange={(e: any) => {
//                 const index: number = args.index
//                 meta.current.sampleData[index].OrderDate = e.value
//                 setRefresh({})
//             }}
//             format='dd-MM-yyyy'
//             showClearButton={true}
//         />
//     );
// };