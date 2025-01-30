import { TreeGridComponent, ColumnsDirective, ColumnDirective, Edit, Inject } from '@syncfusion/ej2-react-treegrid';
// import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { useRef } from 'react';

export function SyncFusionTreeGridEditTemplate() {

    const gridRef: any = useRef(null)
    return (
        <TreeGridComponent
            actionComplete={onActionComplete}
            className='m-4'
            ref={gridRef}
            dataSource={data}
            childMapping="subtasks"
            gridLines='Both'
            treeColumnIndex={1}
            editSettings={{ allowEditing: true, mode: 'Cell' }}
        >
            <ColumnsDirective>
                <ColumnDirective field="TaskID" headerText="Task ID" isPrimaryKey={true} textAlign="Right" width="90" />
                <ColumnDirective field="TaskName" headerText="Task Name" width="180" />
                <ColumnDirective
                    field="Duration"
                    headerText="Duration"
                    width="120"
                    editType="numericedit"
                    editTemplate={editTemplate}
                    format='N2'
                    textAlign="Right"
                />
            </ColumnsDirective>
            <Inject services={[Edit]} />
        </TreeGridComponent>)

    function editTemplate(props: any) {
        return (
            <NumericTextBoxComponent
                value={props.Duration} // Bind the current value of the cell
                placeholder="Enter duration"
                format='n2'
                enablePersistence={false}
                enableRtl={false}
                decimals={2} // Allow up to 2 decimal places
                showSpinButton={false}
                created={() => {
                    const numericInput: any = document.getElementById('durationNumeric');
                    if (numericInput) {
                        numericInput.addEventListener('focus', () => numericInput.select());
                    }
                }}
            />)
    }

    function onActionComplete(args: any) {
        const treeGridRef = gridRef.current
        if (args.type === 'save') {
            // Find the edited row index
            const rowIndex = treeGridRef.getSelectedRowIndexes()[0];
            if (rowIndex !== undefined) {
                // Get the edited row data
                const rowData = treeGridRef.getCurrentViewRecords()[rowIndex];
                args.data.Duration = 1000;
                treeGridRef.refresh();
                // Find the numeric textbox in the edited row
                const numericInput = args.row.querySelector('.e-numerictextbox');
                if (numericInput) {
                    // Get the numeric value from the textbox
                    const numericValue = numericInput.ej2_instances[0].value;
                    // Update the row data with the new value
                    rowData.Duration = numericValue;
                    // Refresh the TreeGrid to reflect the changes
                    treeGridRef.refresh();
                }
            }
        }
    }
}

const data = [
    {
        TaskID: 1,
        TaskName: 'Planning',
        StartDate: new Date('02/03/2017'),
        Duration: 5,
        Progress: 100,
    },
    {
        TaskID: 2,
        TaskName: 'Plan timeline',
        StartDate: new Date('02/03/2017'),
        Duration: 10,
        Progress: 80,
    },
    {
        TaskID: 3,
        TaskName: 'Plan budget',
        StartDate: new Date('02/03/2017'),
        Duration: 7,
        Progress: 60,
    },
];