import {
    TreeGridComponent,
    ColumnsDirective,
    ColumnDirective,
} from "@syncfusion/ej2-react-treegrid";
import { InputSwitch } from 'primereact/inputswitch';
// import { SwitchComponent } from '@syncfusion/ej2-react-buttons';
import { Inject, Page, Sort } from "@syncfusion/ej2-react-treegrid";
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { IconLink } from "../../../../controls/icons/icon-link";
import { IconUnlink } from "../../../../controls/icons/icon-unlink";
import { useEffect, useRef, useState } from "react";
import { Utils } from "../../../../utils/utils";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { AdminLinkUsersCustomControl } from "./admin-link-users-custom-control";

export function AdminLinkUsersWithBu() {
    const instance = DataInstancesMap.adminLinkUsers

    return (
        <CompContentContainer title='Link users with business units'>
            <CompSyncFusionTreeGridToolbar
                CustomControl={() => <AdminLinkUsersCustomControl dataInstance={instance} />}
                instance={instance}
                title=''
            />
            <CompSyncfusionTreeGrid
                allowPaging={true}
                childMapping="users"
                columns={getColumns()}
                instance={instance}
                pageSize={11}
                rowHeight={40}
                sqlArgs={{ clientId: Utils.getCurrentLoginInfo().clientId || 0 }}
                sqlId={SqlIdsMap.getBuUsersLink}
                treeColumnIndex={0}
            />
        </CompContentContainer>
    )

    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'code',
                headerText: 'Code',
                type: 'string',
                width: 50
            },
            {
                field: 'name',
                headerText: 'Name',
                type: 'string',
                template: nameColumnTemplate,
                // width: 150
            }
        ])
    }

    function nameColumnTemplate(props: any) {
        return (
            <div className="flex flex-row items-center">
                <span>{props.name}</span>
                {props.hasChildRecords
                    ? <TooltipComponent content="Link an existing user with business unit">
                        <button><IconLink className="w-5 h-5 ml-2 text-blue-500"></IconLink></button>
                    </TooltipComponent>
                    : <TooltipComponent content="Unlink this user from business unit">
                        <button><IconUnlink className="w-5 h-5 ml-2 text-red-500"></IconUnlink></button>
                    </TooltipComponent>
                }
            </div>
        )
    }


    // return (
    //     <CompContentContainer
    //         title="Link users with business units">
    //         <TreeGridComponent
    //             className="mt-2"
    //             height="100%"
    //             ref={gridRef}
    //             dataSource={data}
    //             // expandStateMapping="false"
    //             // dataBound={() => gridRef?.current && gridRef.current.collapseAll()}
    //             treeColumnIndex={0}
    //             childMapping="users"
    //             allowPaging={true}
    //             allowSorting={true}
    //             allowSelection={false}
    //             // pageSettings={{ pageSize: 10 }}
    //             gridLines="Both">
    //             <ColumnsDirective>
    //                 <ColumnDirective field="code" width="150" headerTemplate={headerTemplateCode} />
    //                 <ColumnDirective field="name" template={columnTemplate} headerTemplate={headerTemplateName} />
    //             </ColumnsDirective>
    //             <Inject services={[Page, Sort,]} />
    //         </TreeGridComponent>
    //     </CompContentContainer>
    // )

    // function headerTemplateCode(props: any) {
    //     return (
    //         <TooltipComponent content='Business unit code / UID'><span className="text-sm font-bold">Code</span></TooltipComponent>
    //     )
    // }

    // function headerTemplateName(props: any) {
    //     return (
    //         <div className="flex flex-row items-center">
    //             <TooltipComponent content='Business unit / User name'><span className="text-sm font-bold">Name</span></TooltipComponent>
    //             <button className="bg-green-500 text-white text-xs px-2 py-0 h-5  rounded-md ml-6">New business unit</button>
    //             {/* <span className="flex flex-row items-center text-xs"> */}
    //             {/* <span className="ml-4">Collapse all</span> */}
    //             {/* <SwitchComponent checked={true} cssClass="ml-2 mr-2" onClick={handleSwitchOnClick} onChange={handleSwitchOnClick} /> */}
    //             {/* <span>Expand all</span> */}
    //             {/* </span> */}

    //             {/* <InputSwitch checked={false} className="ml-2" onClick={handleInputSwitchOnClick} /> */}
    // <label className="inline-flex items-center cursor-pointer">
    //     <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Toggle me</span>
    //     <input type="checkbox" value="" className="sr-only peer" onChange={handleOnChange} onClick={handleOnClick} />
    //     <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    //     <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Toggle me</span>
    // </label>
    //         </div>
    //     )
    // }

    // function handleOnChange(e: any) {
    //     e.stopPropagation()
    //     console.log(e?.target?.checked)
    // }

    // function handleOnClick(e: any) {
    //     e.stopPropagation()
    //     // e.preventDefault()
    // }


    // async function loadData() {
    //     const res: any = await Utils.queryGraphQL(
    //         GraphQLQueriesMap.genericQuery(
    //             GLOBAL_SECURITY_DATABASE_NAME,
    //             {
    //                 sqlId: SqlIdsMap.getBuUsersLink,
    //                 sqlArgs: {
    //                     clientId: Utils.getCurrentLoginInfo().clientId
    //                 }
    //             }
    //         ),
    //         GraphQLQueriesMap.genericQuery.name
    //     )
    //     // setData(res.data.genericQuery[0].jsonResult)
    //     console.log(res.data.genericQuery[0].jsonResult)
    // }

}

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