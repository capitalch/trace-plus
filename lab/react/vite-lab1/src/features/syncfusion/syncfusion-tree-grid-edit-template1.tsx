import { TreeGridComponent, ColumnsDirective, ColumnDirective, Edit, Inject } from '@syncfusion/ej2-react-treegrid';
// import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { useRef } from 'react';

export function SyncFusionTreeGridEditTemplate1() {

    const gridRef: any = useRef(null)
    return (
        <TreeGridComponent
            className='m-4'
            dataSource={data}
            treeColumnIndex={2}
            childMapping="subtasks"
            editSettings={{
                allowEditing: true,
                mode: 'Cell',
            }}
        >
            <ColumnsDirective>
                {/* Regular column */}
                <ColumnDirective field="taskID" headerText="Task ID" width="90" textAlign="Right" isPrimaryKey={true} />
                {/* Column with custom numeric editTemplate */}
                <ColumnDirective
                    field="duration"
                    headerText="Duration (Hours)"
                    width="150"
                    textAlign="Right"
                    editTemplate={editTemplate}
                />
                {/* Regular editable column */}
                <ColumnDirective field="taskName" headerText="Task Name" width="200" />
                <ColumnDirective field="startDate" headerText="Start Date" width="130" format="yMd" textAlign="Right" type="date" />
            </ColumnsDirective>
            <Inject services={[Edit]} />
        </TreeGridComponent>
    );

    function editTemplate(args: any) {
        return (
            <input
                type="number"
                step="0.01" // Allow decimal input
                defaultValue={args.value} // Set the current value in edit mode
                onChange={handleChange}
                className="e-input"
                style={{ width: '100%', textAlign: 'right' }} // Align input to the right
            />
        );

        function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
            const value = parseFloat(event.target.value) || 0; // Parse numeric input
            args.taskData[args.column.field] = value; // Update the row data
        }
    }

    // function onActionComplete(args: any) {
    //     const treeGridRef = gridRef.current
    //     if (args.type === 'save') {
    //         // Find the edited row index
    //         const rowIndex = treeGridRef.getSelectedRowIndexes()[0];
    //         if (rowIndex !== undefined) {
    //             // Get the edited row data
    //             const rowData = treeGridRef.getCurrentViewRecords()[rowIndex];
    //             args.data.Duration = 1000;
    //             treeGridRef.refresh();
    //             // Find the numeric textbox in the edited row
    //             const numericInput = args.row.querySelector('.e-numerictextbox');
    //             if (numericInput) {
    //                 // Get the numeric value from the textbox
    //                 const numericValue = numericInput.ej2_instances[0].value;
    //                 // Update the row data with the new value
    //                 rowData.Duration = numericValue;
    //                 // Refresh the TreeGrid to reflect the changes
    //                 treeGridRef.refresh();
    //             }
    //         }
    //     }
    // }
}

const data = [
    {
        taskID: 1,
        taskName: 'Planning',
        startDate: new Date('2023-01-01'),
        duration: 5,
        subtasks: [
            {
                taskID: 2,
                taskName: 'Plan timeline',
                startDate: new Date('2023-01-02'),
                duration: 3,
            },
            {
                taskID: 3,
                taskName: 'Plan budget',
                startDate: new Date('2023-01-03'),
                duration: 2,
            },
            {
                taskID: 4,
                taskName: 'Allocate resources',
                startDate: new Date('2023-01-04'),
                duration: 4,
            },
        ],
    },
    {
        taskID: 5,
        taskName: 'Design',
        startDate: new Date('2023-02-01'),
        duration: 10,
        subtasks: [
            {
                taskID: 6,
                taskName: 'Design UI',
                startDate: new Date('2023-02-02'),
                duration: 5,
            },
            {
                taskID: 7,
                taskName: 'Design database',
                startDate: new Date('2023-02-03'),
                duration: 5,
            },
        ],
    },
];