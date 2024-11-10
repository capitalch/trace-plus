import {
  TreeGridComponent,
  ColumnsDirective,
  ColumnDirective,
  RowDD,
} from "@syncfusion/ej2-react-treegrid";
import { Inject, Sort } from "@syncfusion/ej2-react-treegrid";
import { useRef } from "react";

export function SyncfusionTreeGrid() {

  const gridRef: any = useRef(null)
  return (
    <div className="m-2">
      <button className="my-2 px-2 bg-slate-200 py-1" onClick={handleOnClick}>Reset localstorage</button>
      <button className="ml-2 px-2 bg-slate-200 py-1" onClick={handleExpandAll}>Expand all</button>
      <TreeGridComponent
        allowSorting={true} // Enable sorting
        childMapping="users" // Field that indicates child data
        collapsed={onRowCollapsed}
        dataBound={onDataBound}
        dataSource={data1}

        enableCollapseAll={true}
        expanded={onRowExpanded}
        gridLines="Both"
        height='100%'
        ref={gridRef}
        treeColumnIndex={0} // Specifies the index of the hierarchical column
      >
        <ColumnsDirective>
          <ColumnDirective field="code" headerText="Code" width="100" />
          <ColumnDirective field="name" headerText="Name" width="200" />
          <ColumnDirective field="key" headerText="Key" width="200" visible={false} isPrimaryKey={true} />
        </ColumnsDirective>
        <Inject services={[RowDD, Sort]} />
      </TreeGridComponent>
    </div>
  );

  function handleExpandAll(){
    gridRef.current.expandAll()
  }

  function handleOnClick(){
    localStorage.setItem('expandedRows', '');
  }

  function onDataBound() {
    const expandedRows = localStorage.getItem('expandedRows') || ''
    const expandedKeys: any = expandedRows ? JSON.parse(expandedRows) || [] : [];
    expandedKeys.forEach((key: any) => {
      gridRef.current.expandByKey(key);
    });
    // gridRef.current.expandAll()
  }

  function onRowCollapsed(args: any) {
    let expandedKeys = JSON.parse(localStorage.getItem('expandedRows') || '') || [];
    expandedKeys = expandedKeys.filter((key: any) => key !== args.data.key);
    localStorage.setItem('expandedRows', JSON.stringify(expandedKeys));
  }

  function onRowExpanded(args: any) {
    const expandedRows = localStorage.getItem('expandedRows') || ''
    const expandedKeys: any = expandedRows ? JSON.parse(expandedRows) || [] : [];
    if (!expandedKeys.includes(args.data.key)) {
      expandedKeys.push(args.data.key);
      localStorage.setItem('expandedRows', JSON.stringify(expandedKeys));
    }
  }
}


const data1 = [
  {
    "key": 1,
    "code": "buu1",
    "name": "Business unit 1",
    "buId": 42,
    "users": [
      {
        "key": 11,
        "id": 22,
        "code": "user1",
        "name": "user1",
        "buId": 42,
        "userId": 62
      },
      {
        "key": 12,
        "id": 23,
        "code": "user2",
        "name": "user2",
        "buId": 42,
        "userId": 63
      },
      {
        "key": 13,
        "id": 24,
        "code": "user3",
        "name": "user3",
        "buId": 42,
        "userId": 64
      },
      {
        "key": 14,
        "id": 25,
        "code": "user4",
        "name": "user4",
        "buId": 42,
        "userId": 65
      },
      {
        "key": 15,
        "id": 42,
        "code": "capital",
        "name": "Sushant1",
        "buId": 42,
        "userId": 56
      },
      {
        "key": 16,
        "id": 43,
        "code": "user5",
        "name": "user5",
        "buId": 42,
        "userId": 66
      },
      {
        "key": 17,
        "id": 44,
        "code": "user6",
        "name": "user6",
        "buId": 42,
        "userId": 67
      },
      {
        "key": 18,
        "id": 45,
        "code": "bFJ1cq6i",
        "name": "user7",
        "buId": 42,
        "userId": 69
      }
    ]
  },
  {
    "key": 2,
    "code": "buu2",
    "name": "Business unit 2",
    "buId": 43,
    "users": [
      {
        "key": 21,
        "id": 29,
        "code": "user5",
        "name": "user5",
        "buId": 43,
        "userId": 66
      },
      {
        "key": 22,
        "id": 30,
        "code": "user6",
        "name": "user6",
        "buId": 43,
        "userId": 67
      },
      {
        "key": 23,
        "id": 31,
        "code": "user1",
        "name": "user1",
        "buId": 43,
        "userId": 62
      }
    ]
  },
  {
    "key": 3,
    "code": "buu3",
    "name": "Business unit 3",
    "buId": 44,
    // "users": [
    //   {
    //     "id": 32,
    //     "code": "user1",
    //     "name": "user1",
    //     "buId": 44,
    //     "userId": 62
    //   },
    //   {
    //     "id": 33,
    //     "code": "user2",
    //     "name": "user2",
    //     "buId": 44,
    //     "userId": 63
    //   },
    //   {
    //     "id": 34,
    //     "code": "user3",
    //     "name": "user3",
    //     "buId": 44,
    //     "userId": 64
    //   },
    //   {
    //     "id": 35,
    //     "code": "user4",
    //     "name": "user4",
    //     "buId": 44,
    //     "userId": 65
    //   },
    //   {
    //     "id": 36,
    //     "code": "user6",
    //     "name": "user6",
    //     "buId": 44,
    //     "userId": 67
    //   }
    // ]
  },
  {
    "key": 4,
    "code": "buu4",
    "name": "Business unit 4",
    "buId": 45,
    // "users": [
    //   {
    //     "id": 37,
    //     "code": "user6",
    //     "name": "user6",
    //     "buId": 45,
    //     "userId": 67
    //   },
    //   {
    //     "id": 38,
    //     "code": "user5",
    //     "name": "user5",
    //     "buId": 45,
    //     "userId": 66
    //   },
    //   {
    //     "id": 39,
    //     "code": "user4",
    //     "name": "user4",
    //     "buId": 45,
    //     "userId": 65
    //   },
    //   {
    //     "id": 40,
    //     "code": "user3",
    //     "name": "user3",
    //     "buId": 45,
    //     "userId": 64
    //   },
    //   {
    //     "id": 41,
    //     "code": "user2",
    //     "name": "user2",
    //     "buId": 45,
    //     "userId": 63
    //   }
    // ]
  },
  {
    "key": 5,
    "code": "buu5",
    "name": "Business unit 5",
    "buId": 46,
    "users": null
  },
  {
    "key": 6,
    "code": "buu6",
    "name": "busi 6",
    "buId": 54,
    "users": null
  }
]