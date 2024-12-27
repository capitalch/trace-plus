import { ColumnDirective, ColumnsDirective, Edit, GridComponent, Inject, Toolbar } from "@syncfusion/ej2-react-grids";
import { testData } from "./test-data";
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';

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
                    height='calc(100vh - 280px)'
                    dataSource={testData}
                    editSettings={{ allowEditing: true, mode: 'Batch' }}
                // toolbar={['edit']}
                >
                    <ColumnsDirective>
                    <ColumnDirective
                            field="Date"
                            headerText="Date"
                            width="70"
                            // editType="datepickeredit"
                            template={customDateEditor}
                        // editType="CustomEdit"
                        // edit={editParams}
                        // edit={editParams}
                        />
                        <ColumnDirective field='OrderID' headerText='Order ID' width={120} textAlign="Right" />
                        <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' />
                        <ColumnDirective field='ShipCity' headerText='Ship City' width='150' />
                        {/* <ColumnDirective field='ShipName' headerText='Ship Name' /> */}
                        <ColumnDirective field='ShipCountry' headerText='Ship Country' width='150' />
                        
                    </ColumnsDirective>
                    <Inject services={[Edit]} />
                </GridComponent>
            </div>
        </div>
    )
    function customDateEditor(args: any) {
        const handleChange = (event: any) => {
            args.Date = event.value || event.target.value || null;
        };

        const clearDate = () => {
            args.Date = null;
        };

        return (
            <div>
                {/* <input
                    type="text"
                    placeholder="Enter date"
                    value={args.Date ? new Date(args.Date).toLocaleDateString() : ''}
                    onChange={handleChange}
                    style={{ marginBottom: '5px', width:'30' }}
                /> */}
                <DatePickerComponent
                    value={args.Date}
                    // placeholder="Select date"
                    change={(e: any) => handleChange(e)}
                    // style={{ width: '100%' }}
                />
                <button onClick={clearDate} style={{ marginTop: '5px' }}>
                    Clear
                </button>
            </div>
        );
    };
}