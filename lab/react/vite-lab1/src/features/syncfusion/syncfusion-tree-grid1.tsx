import { ColumnDirective, ColumnsDirective } from "@syncfusion/ej2-react-grids";
import { TreeGridComponent } from "@syncfusion/ej2-react-treegrid";
import { useRef, useState } from "react";
import { data1 } from './test-data1'

export function SyncfusionTreeGrid1() {
    const [, setRefresh] = useState({})
    const primaryKeyName: string = "id"
    const treeGridRef: any = useRef(null);
    const meta: any = useRef({
        expandedNodes: new Set()
    })
    // Sample nested data with `subtasks` array
    const data = [
        {
            TaskID: 1,
            TaskName: "Parent 1",
            subtasks: [ // <-- Child items nested under `subtasks`
                { TaskID: 2, TaskName: "Child 1" }
            ]
        },
        {
            TaskID: 3,
            TaskName: "Parent 2",
            subtasks: [
                { TaskID: 4, TaskName: "Child 2" }
            ]
        },
        {
            TaskID: 5,
            TaskName: "Parent 3",
            subtasks: [
                { TaskID: 6, TaskName: "Child 3" }
            ]
        }
    ];

    return (
        <div className="m-4 flex-col gap-2 flex">
            <button onClick={handleRefresh} className="bg-gray-200 rounded-md px-2 py-1 w-24">Refresh</button>
            <button onClick={handleReload} className="bg-gray-200 rounded-md px-2 py-1 w-24">Reload</button>
            <TreeGridComponent
                // actionComplete={handleActionComplete}
                childMapping="children" // <-- Points to nested children array
                collapsed={handleCollapsed}
                // dataBound={handleDataBound}
                created={onCreated}
                dataSource={data1}
                enableCollapseAll={true}
                expanded={handleExpanded}
                ref={treeGridRef}
                rowDataBound={onRowDataBound}
                treeColumnIndex={0}    // Column showing hierarchy (TaskName column)
            >
                <ColumnsDirective>
                    <ColumnDirective
                        field="accName"
                        headerText="Name"
                        width="100"
                    />
                    <ColumnDirective
                        field="id"
                        width="0"
                        visible={false}
                        isPrimaryKey={true} // <-- Required for row identification
                    />
                    <ColumnDirective
                        field="debit"
                        headerText="Debits"
                        width="80"
                        textAlign="Right"
                        type="number"
                        format="N2" />
                    <ColumnDirective
                        // allowEditing={true}
                        // edit={{
                        //     params:
                        //     {
                        //         decimals: 2,
                        //         format: 'N2',
                        //         showSpinButton: false,
                        //         validateDecimalOnType: true
                        //     }
                        // }}
                        // editType="numericedit"
                        field="credit"
                        headerText="Credits"
                        width="80"
                        textAlign="Right"
                        type="number"
                        format="N2" />
                    <ColumnDirective field="accLeaf" headerText="Level" width='40' />
                </ColumnsDirective>
            </TreeGridComponent>
        </div>)

    function handleCollapsed(args: any) {
        meta.current.expandedNodes.delete(args.data[primaryKeyName])
    }

    function handleExpanded(args: any) {
        meta.current.expandedNodes.add(args.data[primaryKeyName])
    }

    function handleRefresh() {
        treeGridRef.current.refresh()
    }

    function handleReload() {
        setRefresh({})
    }

    function onCreated() {
        const pKey = treeGridRef.current.getPrimaryKeyFieldNames()
        console.log(pKey)
    }

    function onRowDataBound(args: any) {
        if (meta.current.expandedNodes.has(args.data[primaryKeyName])) {
            setTimeout(() => treeGridRef.current.expandRow(args.row), 50)
        }
    }
}


// Track expanded nodes
// const handleActionComplete = (args: any) => {
// if (args.requestType === 'refresh') {
//     meta.current.expandedNodes.forEach((key: number) => {
//         setTimeout(() => treeGridRef.current.expandByKey(key), 100)
//     });
// }
// if (args.requestType === 'expand' || args.requestType === 'collapse') {
//     const key = args.rowData.TaskID;
//     setExpandedNodes((prev: any) =>
//         args.requestType === 'expand'
//             ? [...prev, key]
//             : prev.filter((id: any) => id !== key)
//     );
// }
// };

// const handleDataBound = (args: any) => {
//     if (treeGridRef.current) {
//         meta.current.expandedNodes.forEach((key: number) => {
//             // treeGridRef.current.expandRow(key); // Expand by TaskID
//             // setTimeout(()=>treeGridRef.current.expandByKey(key),50)

//         });
//     }
// };