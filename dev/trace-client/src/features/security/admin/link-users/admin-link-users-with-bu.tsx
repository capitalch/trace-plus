import {
    TreeGridComponent,
    ColumnsDirective,
    ColumnDirective,
} from "@syncfusion/ej2-react-treegrid";
import { Inject, Page, Sort } from "@syncfusion/ej2-react-treegrid";
import { useState } from "react";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";

export function AdminLinkUsersWithBu() {
    const [data] = useState([
        {
            code: 'buu1',
            name: 'Business unit 1',
            users: [
                {
                    code: 'user1',
                    name: 'User 1',
                },
                {
                    code: 'user2',
                    name: 'User 2',
                },
                {
                    code: 'user3',
                    name: 'User 3',
                },
                {
                    code: 'user4',
                    name: 'User 4',
                },
            ],
        },
        {
            code: 'buu2',
            name: 'Business unit 2',
            users: [
                {
                    code: 'user3',
                    name: 'User 3',
                },
                {
                    code: 'user6',
                    name: 'User 6',
                },
                {
                    code: 'user7',
                    name: 'User 7',
                },
                {
                    code: 'user8',
                    name: 'User 8',
                },
                {
                    code: 'user9',
                    name: 'User 9',
                },
            ],
        },
        {
            code: 'buu3',
            name: 'Business unit 3',
            users: [
                {
                    code: 'user2',
                    name: 'User 2',
                },
                {
                    code: 'user6',
                    name: 'User 6',
                },
                {
                    code: 'user5',
                    name: 'User 5',
                },
                {
                    code: 'user7',
                    name: 'User 7',
                },
                {
                    code: 'user9',
                    name: 'User 9',
                },
            ],
        },
    ]);
    return (
        <CompContentContainer
            title="Link business users with business units">
            <TreeGridComponent
                dataSource={data}
                treeColumnIndex={0} // Specifies the index of the hierarchical column
                childMapping="users" // Field that indicates child data
                allowPaging={true} // Enable paging
                allowSorting={true} // Enable sorting
                pageSettings={{ pageSize: 10 }}
                gridLines="None"
            >
                <ColumnsDirective>
                    <ColumnDirective field="code" headerText="Code" width="150" />
                    <ColumnDirective field="name" headerText="Name"  />
                </ColumnsDirective>
                <Inject services={[Page, Sort]} />
            </TreeGridComponent>
        </CompContentContainer>
    )
}