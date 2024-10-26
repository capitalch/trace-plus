import {
  TreeGridComponent,
  ColumnsDirective,
  ColumnDirective,
  RowDD,
} from "@syncfusion/ej2-react-treegrid";
import { Inject, Page, Sort } from "@syncfusion/ej2-react-treegrid";

export function SyncfusionTreeGrid() {

  return (
    <div className="m-2">
      <TreeGridComponent
        allowRowDragAndDrop={true}
        dataSource={data1}
        treeColumnIndex={0} // Specifies the index of the hierarchical column
        childMapping="users" // Field that indicates child data
        allowPaging={true} // Enable paging
        allowSorting={true} // Enable sorting
        enableCollapseAll={true}
        height='100%'
        // pageSettings={{ pageSize: 10 }}
        gridLines="Both"
      >
        <ColumnsDirective>
          <ColumnDirective field="code" headerText="Code" width="100" />
          <ColumnDirective field="name" headerText="Name" width="200" />
        </ColumnsDirective>
        <Inject services={[Page, RowDD, Sort]} />
      </TreeGridComponent>
    </div>
  );
};


const data1 = [
  {
    "code": "buu1",
    "name": "Business unit 1",
    "buId": 42,
    "users": [
      {
        "id": 22,
        "code": "user1",
        "name": "user1",
        "buId": 42,
        "userId": 62
      },
      {
        "id": 23,
        "code": "user2",
        "name": "user2",
        "buId": 42,
        "userId": 63
      },
      {
        "id": 24,
        "code": "user3",
        "name": "user3",
        "buId": 42,
        "userId": 64
      },
      {
        "id": 25,
        "code": "user4",
        "name": "user4",
        "buId": 42,
        "userId": 65
      },
      {
        "id": 42,
        "code": "capital",
        "name": "Sushant1",
        "buId": 42,
        "userId": 56
      },
      {
        "id": 43,
        "code": "user5",
        "name": "user5",
        "buId": 42,
        "userId": 66
      },
      {
        "id": 44,
        "code": "user6",
        "name": "user6",
        "buId": 42,
        "userId": 67
      },
      {
        "id": 45,
        "code": "bFJ1cq6i",
        "name": "user7",
        "buId": 42,
        "userId": 69
      }
    ]
  },
  {
    "code": "buu2",
    "name": "Business unit 2",
    "buId": 43,
    "users": [
      {
        "id": 29,
        "code": "user5",
        "name": "user5",
        "buId": 43,
        "userId": 66
      },
      {
        "id": 30,
        "code": "user6",
        "name": "user6",
        "buId": 43,
        "userId": 67
      },
      {
        "id": 31,
        "code": "user1",
        "name": "user1",
        "buId": 43,
        "userId": 62
      }
    ]
  },
  {
    "code": "buu3",
    "name": "Business unit 3",
    "buId": 44,
    "users": [
      {
        "id": 32,
        "code": "user1",
        "name": "user1",
        "buId": 44,
        "userId": 62
      },
      {
        "id": 33,
        "code": "user2",
        "name": "user2",
        "buId": 44,
        "userId": 63
      },
      {
        "id": 34,
        "code": "user3",
        "name": "user3",
        "buId": 44,
        "userId": 64
      },
      {
        "id": 35,
        "code": "user4",
        "name": "user4",
        "buId": 44,
        "userId": 65
      },
      {
        "id": 36,
        "code": "user6",
        "name": "user6",
        "buId": 44,
        "userId": 67
      }
    ]
  },
  {
    "code": "buu4",
    "name": "Business unit 4",
    "buId": 45,
    "users": [
      {
        "id": 37,
        "code": "user6",
        "name": "user6",
        "buId": 45,
        "userId": 67
      },
      {
        "id": 38,
        "code": "user5",
        "name": "user5",
        "buId": 45,
        "userId": 66
      },
      {
        "id": 39,
        "code": "user4",
        "name": "user4",
        "buId": 45,
        "userId": 65
      },
      {
        "id": 40,
        "code": "user3",
        "name": "user3",
        "buId": 45,
        "userId": 64
      },
      {
        "id": 41,
        "code": "user2",
        "name": "user2",
        "buId": 45,
        "userId": 63
      }
    ]
  },
  {
    "code": "buu5",
    "name": "Business unit 5",
    "buId": 46,
    "users": null
  },
  {
    "code": "buu6",
    "name": "busi 6",
    "buId": 54,
    "users": null
  }
]