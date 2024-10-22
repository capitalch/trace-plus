import {
    TreeGridComponent,
    ColumnsDirective,
    ColumnDirective,
} from "@syncfusion/ej2-react-treegrid";
// import { Inject, Page, Sort } from "@syncfusion/ej2-react-treegrid";
// import { useState } from "react";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";

export function AdminLinkUsersWithBu() {
    
    return (
        <CompContentContainer
            title="Link business users with business units">
            <TreeGridComponent
                dataSource={data1}
                treeColumnIndex={0} // Specifies the index of the hierarchical column
                childMapping="users" // Field that indicates child data
                // allowPaging={true} // Enable paging
                allowSorting={true} // Enable sorting
                // pageSettings={{ pageSize: 10 }}
                gridLines="Both"
            >
                <ColumnsDirective>
                    <ColumnDirective field="code" headerText="Code" width="150" />
                    <ColumnDirective field="name" headerText="Name"  />
                </ColumnsDirective>
                {/* <Inject services={[Page, Sort]} /> */}
            </TreeGridComponent>
        </CompContentContainer>
    )
}

/*
WITH bu_users AS (
    SELECT 
        bu.id as "buId",
        bu."buCode" AS "bu_code",
        bu."buName" AS "bu_name",
        json_agg(
            json_build_object(
                'code', u."uid",
                'name', u."userName"
            )
        ) AS users
    FROM "BuM" bu
    LEFT JOIN "UserBuX" ubx ON bu."id" = ubx."buId"
    LEFT JOIN "UserM" u ON ubx."userId" = u."id"
	where u."clientId" = 51
    GROUP BY bu."id"
	order by "buCode"
)
SELECT json_agg(
    json_build_object(
        'code', bu_code,
        'name', bu_name,
        'users', COALESCE(users, '[]'::json)
    )
)
FROM bu_users;
*/

const data1 = [
    {
      "code": "buu1",
      "name": "Business unit 1",
      "users": [
        {
          "code": "user1",
          "name": "user1"
        },
        {
          "code": "user2",
          "name": "user2"
        },
        {
          "code": "user3",
          "name": "user3"
        },
        {
          "code": "user4",
          "name": "user4"
        }
      ]
    },
    {
      "code": "buu4",
      "name": "Business unit 4",
      "users": [
        {
          "code": "user6",
          "name": "user6"
        },
        {
          "code": "user5",
          "name": "user5"
        },
        {
          "code": "user4",
          "name": "user4"
        },
        {
          "code": "user3",
          "name": "user3"
        },
        {
          "code": "user2",
          "name": "user2"
        }
      ]
    },
    {
      "code": "buu2",
      "name": "Business unit 2",
      "users": [
        {
          "code": "user5",
          "name": "user5"
        },
        {
          "code": "user6",
          "name": "user6"
        },
        {
          "code": "user1",
          "name": "user1"
        }
      ]
    },
    {
      "code": "navtechnology",
      "name": "Nav Technology",
      "users": [
        {
          "code": null,
          "name": null
        }
      ]
    },
    {
      "code": "buu3",
      "name": "Business unit 3",
      "users": [
        {
          "code": "user1",
          "name": "user1"
        },
        {
          "code": "user2",
          "name": "user2"
        },
        {
          "code": "user3",
          "name": "user3"
        },
        {
          "code": "user4",
          "name": "user4"
        },
        {
          "code": "user6",
          "name": "user6"
        }
      ]
    }
  ]

// const data = [
//     {
//         code: 'buu1',
//         name: 'Business unit 1',
//         users: [
//             {
//                 code: 'user1',
//                 name: 'User 1',
//             },
//             {
//                 code: 'user2',
//                 name: 'User 2',
//             },
//             {
//                 code: 'user3',
//                 name: 'User 3',
//             },
//             {
//                 code: 'user4',
//                 name: 'User 4',
//             },
//         ],
//     },
//     {
//         code: 'buu2',
//         name: 'Business unit 2',
//         users: [
//             {
//                 code: 'user3',
//                 name: 'User 3',
//             },
//             {
//                 code: 'user6',
//                 name: 'User 6',
//             },
//             {
//                 code: 'user7',
//                 name: 'User 7',
//             },
//             {
//                 code: 'user8',
//                 name: 'User 8',
//             },
//             {
//                 code: 'user9',
//                 name: 'User 9',
//             },
//         ],
//     },
//     {
//         code: 'buu3',
//         name: 'Business unit 3',
//         users: [
//             {
//                 code: 'user2',
//                 name: 'User 2',
//             },
//             {
//                 code: 'user6',
//                 name: 'User 6',
//             },
//             {
//                 code: 'user5',
//                 name: 'User 5',
//             },
//             {
//                 code: 'user7',
//                 name: 'User 7',
//             },
//             {
//                 code: 'user9',
//                 name: 'User 9',
//             },
//         ],
//     },
// ];