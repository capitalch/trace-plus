import {
    TreeGridComponent,
    ColumnsDirective,
    ColumnDirective,
  } from "@syncfusion/ej2-react-treegrid";
  import { Inject, Page, Sort } from "@syncfusion/ej2-react-treegrid";
import { useState } from "react";

export function SyncfusionTreeGrid(){
    const [data] = useState([
        {
          TaskID: 1,
          TaskName: "Planning",
          StartDate: new Date("2023-09-01"),
          EndDate: new Date("2023-09-05"),
          Progress: 100,
          SubTasks: [
            {
              TaskID: 11,
              TaskName: "Requirement Gathering",
              StartDate: new Date("2023-09-02"),
              EndDate: new Date("2023-09-04"),
              Progress: 50,
            },
            {
              TaskID: 12,
              TaskName: "Feasibility Study",
              StartDate: new Date("2023-09-03"),
              EndDate: new Date("2023-09-05"),
              Progress: 75,
            },
          ],
        },
        {
          TaskID: 2,
          TaskName: "Development",
          StartDate: new Date("2023-09-06"),
          EndDate: new Date("2023-10-05"),
          Progress: 60,
          SubTasks: [
            {
              TaskID: 21,
              TaskName: "Design",
              StartDate: new Date("2023-09-06"),
              EndDate: new Date("2023-09-15"),
              Progress: 70,
            },
            {
              TaskID: 22,
              TaskName: "Coding",
              StartDate: new Date("2023-09-16"),
              EndDate: new Date("2023-10-05"),
              Progress: 80,
            },
          ],
        },
      ]);

      return (
        <div>
          <TreeGridComponent
            dataSource={data}
            treeColumnIndex={1} // Specifies the index of the hierarchical column
            childMapping="SubTasks" // Field that indicates child data
            allowPaging={true} // Enable paging
            allowSorting={true} // Enable sorting
            pageSettings={{ pageSize: 10 }}
            gridLines="None"
          >
            <ColumnsDirective>
              <ColumnDirective field="TaskID" headerText="Task ID" width="90" textAlign="Right" />
              <ColumnDirective field="TaskName" headerText="Task Name" width="200" />
              <ColumnDirective field="StartDate" headerText="Start Date" width="120" format="yMd" textAlign="Right" />
              <ColumnDirective field="EndDate" headerText="End Date" width="120" format="yMd" textAlign="Right" />
              <ColumnDirective field="Progress" headerText="Progress" width="120" textAlign="Right" />
            </ColumnsDirective>
            <Inject services={[Page, Sort]} />
          </TreeGridComponent>
        </div>
      );
    };


