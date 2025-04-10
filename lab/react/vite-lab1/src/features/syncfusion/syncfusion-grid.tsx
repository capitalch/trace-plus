import { ColumnDirective, ColumnsDirective, Edit, Filter, FilterSettings, FilterSettingsModel, FilterType, GridComponent, Inject, Toolbar } from "@syncfusion/ej2-react-grids";
import { testData } from "./test-data";
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import { Button } from "primereact/button";
import { useRef } from "react";
import { IconBase } from "react-icons/lib";

export function SyncfusionGrid() {
    const gridRef = useRef<any>({});
    // const filterOptions: FilterSettingsModel = {
    //     type: "Menu",
    //     mode: "OnEnter",

    // };
    return (
        <div className="bg-red-400">
            <div className="bg-slate-200">
                <div className="flex justify-between mt-4 items-center">
                    <label className="text-lg font-medium text-primary-400 ml-4">General ledger</label>
                    <label className="text-blue-500 font-medium mr-4">AccName</label>
                </div>
                <GridComponent
                    // allowFiltering={true}
                    // filterSettings={filterOptions}
                    className="mt-2"
                    editSettings={{ allowDeleting: true }}
                    gridLines="Both"
                    height='calc(100vh - 280px)'
                    ref={gridRef}
                    dataSource={testData}
                // editSettings={{ allowEditing: true, mode: 'Batch' }}
                // toolbar={['edit']}
                >
                    <ColumnsDirective>
                        <ColumnDirective
                            key="R"
                            allowEditing={false}
                            field="OrderID"
                            headerText="R"
                            template={removeTemplate}
                            width={40}
                        />
                        {/* <ColumnDirective
                            field="Date"
                            headerText="Date"
                            width="70"
                            // editType="datepickeredit"
                            template={customDateEditor}
                        // editType="CustomEdit"
                        // edit={editParams}
                        // edit={editParams}
                        /> */}
                        <ColumnDirective field='OrderID' headerText='Order ID' width={120} textAlign="Right" isPrimaryKey={true} />
                        <ColumnDirective field='' headerText='#' width={150} template={(props:any) => +props.index + 1} />
                        <ColumnDirective field='CustomerID' headerText='Customer ID' width='150' />
                        <ColumnDirective field='ShipCity' headerText='Ship City' width='150' />
                        {/* <ColumnDirective field='ShipName' headerText='Ship Name' /> */}
                        <ColumnDirective field='ShipCountry' headerText='Ship Country' width='150' />

                    </ColumnsDirective>
                    <Inject services={[Edit, Filter,]} />
                </GridComponent>
            </div>
        </div>
    )

    function removeTemplate(props: any) {
        return (
            // WidgetTooltip not working here
            <Button
                tooltip="Remove"
                className="w-7 h-7 bg-slate-50 hover:bg-slate-200 "
                onClick={() => {
                    if (gridRef.current) {
                        const rowIndex = gridRef.current.getRowIndexByPrimaryKey(props.OrderID);
                        gridRef.current.selectRow(rowIndex);
                        const selectedRecords = gridRef.current?.getSelectedRecords();
                        if (selectedRecords && selectedRecords.length > 0) {
                            gridRef.current?.deleteRecord('OrderID', selectedRecords[0]);
                        } else {
                            alert('Please select a row to delete');
                        }
                    }
                }}
            >
                <IconBase className="w-5 h-5 text-red-500 ml-1" />
            </Button>
        );
    }

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