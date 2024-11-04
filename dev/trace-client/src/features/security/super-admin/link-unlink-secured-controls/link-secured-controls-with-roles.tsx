import { useContext } from "react";
import { GlobalContextType } from "../../../../app/global-context";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
import { GlobalContext } from "../../../../App";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
import { WidgetTooltip } from "../../../../controls/widgets/widget-tooltip";
import { Messages } from "../../../../utils/messages";
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";

export function LinkSecuredControlsWithRoles() {
    const securedControlsInstance: string = DataInstancesMap.securedControls
    const linksInstance: string = DataInstancesMap.securedControlsLinkRoles
    const context: GlobalContextType = useContext(GlobalContext);

    return (
        <div className='flex flex-col ml-8'>
            <label className="mt-6 text-xl font-semibold text-primary-400">Linking of secured controls with roles</label>
            <div className='flex gap-8 ' style={{ width: 'calc(100vw - 260px)' }}>
                <div className='flex flex-col w-min' >
                    <CompSyncFusionGridToolbar
                        className='mt-4'
                        // CustomControl={() => <WidgetTooltip title='New business user' ><AdminNewBusinessUserButton dataInstance={businessUsersInstance} className='w-10 mb-2 h-8 px-2 text-xs' /></WidgetTooltip>}
                        minWidth='300px'
                        title=''
                        isLastNoOfRows={false}
                        instance={securedControlsInstance}
                    />
                    <label className='mt-2 font-medium text-primary-300'>{Messages.messSecuredControlsDragFrom}</label>
                    <CompSyncFusionGrid
                        aggregates={getSecuredControlsAggregates()}
                        className="mt-4 "
                        columns={getSecuredControlsColumns()}
                        gridDragAndDropSettings={
                            {
                                allowRowDragAndDrop: true,
                                onRowDrop: onSecuredControlsRowDrop,
                            }}
                        // hasIndexColumn={true}
                        height="calc(100vh - 290px)"
                        instance={securedControlsInstance}
                        minWidth='600px'
                        rowHeight={40}
                        sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
                        sqlId={SqlIdsMap.allSecuredControls}
                    />
                </div>
                
                <div className='flex flex-col w-max'>
                    <CompSyncFusionTreeGridToolbar className='mt-4'
                        // CustomControl={() =>
                        //     <WidgetTooltip title='New business unit' >
                        //         <AdminNewBusinessUnitButton
                        //             dataInstance={linkInstance}
                        //             className='w-10 mb-2 h-8 px-2 text-xs'
                        //             isTreeGrid={true}
                        //         />
                        //     </WidgetTooltip>}
                        instance={linksInstance}
                        title=''
                    />
                    <label className='mt-2 font-medium text-primary-300'>{Messages.messExistingRolesWithLinksDropHere}</label>
                    <CompSyncfusionTreeGrid
                        addUniqueKeyToJson={true}
                        className="mt-2 "
                        childMapping="users"
                        columns={getLinkColumns()}
                        // gridDragAndDropSettings={{
                        // allowRowDragAndDrop: true,
                        // onRowDrop: handleRowDrop
                        // }}
                        height="calc(100vh - 290px)"
                        instance={linksInstance}
                        minWidth='700px'
                        pageSize={11}
                        rowHeight={40}
                        sqlArgs={{ clientId: Utils.getCurrentLoginInfo().clientId || 0 }}
                        sqlId={SqlIdsMap.getBuUsersLink}
                        treeColumnIndex={0}
                    />
                </div>
            </div>
        </div>)

    function getSecuredControlsAggregates(): SyncFusionAggregateType[] {
        return [{
            field: 'controlName',
            type: "Count",
            format: "N0",
            footerTemplate: securedControlsAggrTemplate
        }]
    }

    function getSecuredControlsColumns(): SyncFusionGridColumnType[] {
        return [
            {
                field: "controlName",
                headerText: "Control",
                type: "string",
                width: 180,
            },
            {
                field: "controlType",
                headerText: "Type",
                type: "string",
                width: 60,
            },
            {
                field: "descr",
                headerText: "Description",
                type: "string",
            },
        ]
    }

    function onSecuredControlsRowDrop(e: any) {
        e.cancel=true
    }

    function securedControlsAggrTemplate(props: any) {
        return <span className="text-xs">Count: {props.Count}</span>;
    }

    function getLinkColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'name',
                headerText: 'Name',
                type: 'string',
                // template: nameColumnTemplate,
                // width: 150
            },
            {
                field: 'key',
                headerText: 'Key',
                isPrimaryKey: true,
                visible: false,
                type: 'number'
            }
        ])
    }


}