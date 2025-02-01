import { TreeGridComponent, ColumnsDirective, ColumnDirective, Edit, Inject } from '@syncfusion/ej2-react-treegrid';
import { NumberFormatValues, NumericFormat } from "react-number-format"
import { useEffect, useRef } from 'react';
import { NumericEditTemplate } from './numeric-edit-template';

export function SyncFusionTreeGridEditTemplate1() {
    const meta = useRef<MetaType>({
        editedValue: 0
    })
    const gridRef: any = useRef(null)

    return (
        <div className='m-4 flex flex-col gap-2'>
            <button onClick={handleCheck} className='bg-gray-200 rounded-md px-2 w-24 border-l-8 text-black text-md cursor-pointer'>Check</button>
            <TreeGridComponent
                actionBegin={onActionBegin}
                dataSource={data}
                treeColumnIndex={2}
                childMapping="subtasks"
                editSettings={{
                    allowEditing: true,
                    mode: 'Cell',
                }}
                gridLines='Both'
                ref={gridRef}>
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
                        editTemplate={(args: any) => { return NumericEditTemplate(args, onValueChanged) }}
                    />
                    {/* Regular editable column */}
                    <ColumnDirective field="taskName" headerText="Task Name" width="200" />
                    <ColumnDirective field="startDate" headerText="Start Date" width="130" format="yMd" textAlign="Right" type="date" />
                </ColumnsDirective>
                <Inject services={[Edit]} />
            </TreeGridComponent>
        </div>
    );

    function onValueChanged(values: NumberFormatValues) {
        meta.current.editedValue = values.value
    }

    function editTemplate(args: any) {
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (inputRef.current) {
                setTimeout(() => inputRef.current ? inputRef.current.focus() : undefined, 10)
            }
        }, [])

        return (
            <NumericFormat
                className="text-right w-40 border-spacing-1 border-gray-300 h-8 rounded-md border-2 bg-white"
                allowNegative={false}
                autoFocus={true}
                decimalScale={2}
                fixedDecimalScale={true}
                getInputRef={inputRef}
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

    function handleCheck() {
        console.log(data)
    }

    function onActionBegin(args: any) {
        if ((args.type === 'save') && (args.column.field === 'duration')) {
            args.rowData[args.column.field] = meta.current.editedValue
        }
    }

}
type MetaType = {
    editedValue: number | string
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