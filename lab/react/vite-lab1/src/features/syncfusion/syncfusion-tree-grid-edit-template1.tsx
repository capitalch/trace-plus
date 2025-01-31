import { TreeGridComponent, ColumnsDirective, ColumnDirective, Edit, Inject } from '@syncfusion/ej2-react-treegrid';
import { NumericFormat } from "react-number-format"
// import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
// import { NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { useEffect, useRef } from 'react';

export function SyncFusionTreeGridEditTemplate1() {
    const meta: any = useRef({
        editedValue: 0
    })
    const gridRef: any = useRef(null)
    // const inputRef: any = useRef(null)
    return (
        <div className='m-4 flex flex-col gap-2'>
            <button onClick={handleCheck} className='bg-gray-100 rounded-md px-2 w-24'>Check</button>
            <TreeGridComponent
                actionBegin={onActionBegin}
                actionComplete={onActionComplete}
                // cellSave={onCellSave}
                cellSelected={handleCellSelected}
                dataSource={data}
                rowSelected={handleRowSelected}
                treeColumnIndex={2}
                childMapping="subtasks"
                editSettings={{
                    allowEditing: true,
                    // allowEditOnSingleClick: true,
                    mode: 'Cell',
                }}
                ref={gridRef}
            >
                <ColumnsDirective>
                    {/* Regular column */}
                    <ColumnDirective field="taskID" headerText="Task ID" width="90" textAlign="Right" isPrimaryKey={true} />
                    {/* Column with custom numeric editTemplate */}
                    <ColumnDirective
                        field="duration"
                        format="N2"
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
        </div>
    );

    function editTemplate(args: any) {
        meta.current.editedValue = args[args.column.field]
        const inputRef = useRef<HTMLInputElement>(null);
        useEffect(() => {
            if (inputRef.current) {
                setTimeout(() => inputRef.current ? inputRef.current.focus() : undefined, 10)
            }
        }, [])

        return (
            <NumericFormat className="text-right w-40 border-spacing-1 border-gray-300 h-8  mr-6 rounded-md" allowNegative={false}
                decimalScale={2} getInputRef={inputRef}
                fixedDecimalScale={true} autoFocus={true}
                onFocus={handleOnFocus}
                thousandsGroupStyle="thousand"
                thousandSeparator=','
                value={args[args.column.field] || 0}
                onValueChange={(values) => {
                    meta.current.editedValue = values.value
                }}
            />
        );

        function handleOnFocus(event: any): void {
            event.target.select()
        }
    }

    function handleCellSelected(args: any) {
        if (args.column.allowEditing &&     // Check if column is editable
            gridRef.current &&
            !gridRef.current.isEdit      // Avoid edit conflicts
        ) {
            gridRef.current.startEdit(args.rowIndex, args.column.field);
        }
    }

    function handleCheck() {
        console.log(data)
    }

    function handleRowSelected(args: any) {
        console.log(args)
        const treeGrid = gridRef.current;

        // Trigger edit mode on single click
        if (args.target.closest('.e-rowcell')) {
            const index = args.rowIndex;
            const field = args.target.getAttribute('aria-colindex');
            if (treeGrid) {
                treeGrid.startEdit({
                    rowIndex: index,
                    columnName: field,
                });
            }
        }
    }

    function onActionBegin(args: any) {
        if ((args.type === 'save') && (args.column.field === 'duration')) {
            args.rowData[args.column.field] = meta.current.editedValue
        }
        if (args.requestType === 'beginEdit') {
            // Focus the editor directly (optional)
            setTimeout(() => {
              const input = args.row.querySelector('input');
              if (input) input.focus();
            }, 0);
          }
    }

    function onActionComplete(args: any) {
        console.log(args)
        // const treeGridRef = gridRef.current
        // if (args.type === 'save') {
        //     // Find the edited row index
        //     const rowIndex = treeGridRef.getSelectedRowIndexes()[0];
        //     if (rowIndex !== undefined) {
        //         // Get the edited row data
        //         const rowData = treeGridRef.getCurrentViewRecords()[rowIndex];
        //         args.data.Duration = 1000;
        //         treeGridRef.refresh();
        //         // Find the numeric textbox in the edited row
        //         const numericInput = args.row.querySelector('.e-numerictextbox');
        //         if (numericInput) {
        //             // Get the numeric value from the textbox
        //             const numericValue = numericInput.ej2_instances[0].value;
        //             // Update the row data with the new value
        //             rowData.Duration = numericValue;
        //             // Refresh the TreeGrid to reflect the changes
        //             treeGridRef.refresh();
        //         }
        //     }
        // }
    }

    // function onCellSave(args: any) {
    //     args.rowData[args.column.field] = meta.current.editedValue
    //     gridRef.current.refresh()
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