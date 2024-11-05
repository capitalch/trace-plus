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
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconLink } from "../../../../controls/icons/icon-link";
import { IconUnlink } from "../../../../controls/icons/icon-unlink";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";

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
                        height="calc(100vh - 308px)"
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
                        childMapping="securedControls"
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
                        sqlArgs={{}}
                        sqlId={SqlIdsMap.getRolesSecuredControlsLink}
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
        e.cancel = true
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
                template: nameColumnTemplate,
                // width: 150
            },
            {
                field: 'descr',
                headerText: 'Description',
                template: descrColumnTemplate,
                type: 'string'
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

    function nameColumnTemplate(props: any) {
        return (<div>
            <span>{props.name}</span>
            {getChildCount(props)}
        </div>)
    }

    function getChildCount(props: any) {
        return (
            <span className='text-xs text-red-500 mt-2 ml-2'> {props?.childRecords ? `(${props.childRecords.length})` : ''} </span>
        )
    }

    function descrColumnTemplate(props: any) {
        return (
            <div className="flex flex-row items-center">
                <span>{props.descr}</span>
                {getLinkOrUnlinkButton(props)}
            </div>
        )
    }

    function getLinkOrUnlinkButton(props: any) {
        let ret = null
        if (props.level === 0) {
            ret = <TooltipComponent content="Link an existing user with business unit">
                <button onClick={() => handleOnClickLink(props)}><IconLink className="w-5 h-5 ml-2 text-blue-500"></IconLink></button>
            </TooltipComponent>
        } else {
            ret = <TooltipComponent content="Unlink this user from business unit">
                <button onClick={() => handleOnClickUnLink(props)}><IconUnlink className="w-5 h-5 ml-2 text-red-500"></IconUnlink></button>
            </TooltipComponent>
        }
        return (ret)
    }

    function handleOnClickLink(props: any) {
        Utils.showHideModalDialogA({
            title: "Link user with business unit",
            isOpen: true,
            // element: <LinkUserWithBuModal buId={props.buId} instance={linkInstance} />,
        })
    }

    function handleOnClickUnLink(props: any) {
        Utils.showConfirmDialog(
            Messages.messSureUnlinkUser
            , Messages.messSureUnlinkUserBody
            , async () => {
                const traceDataObject: TraceDataObjectType = {
                    tableName: "UserBuX",
                    deletedIds: [props.id],
                };
                try {
                    const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                    const queryName: string = GraphQLQueriesMap.genericUpdate.name;
                    await Utils.mutateGraphQL(q, queryName);
                    await context.CompSyncFusionTreeGrid[linksInstance].loadData();
                    Utils.showCustomMessage(Messages.messUserUnlinkedSuccess);
                } catch (e: any) {
                    console.log(e?.message)
                }
            }
        )
    }
}

const data = [
    {
        "name": "Default accountant", "descr": "Only accountant level rights are available", "roleId": 34
        , "securedControls": [
            { "id": 50, "name": "payment-save", "roleId": 34, "securedControlId": 2 }
        ]
    }
    , {
        "name": "Default manager", "descr": "All rights available", "roleId": 26
        , "securedControls": null
    }
    , {
        "name": "Default sales person", "descr": "Sales level rights are available", "roleId": 35
        , "securedControls": [{ "id": 51, "name": "payment-edit", "roleId": 35, "securedControlId": 3 }]
    }
    , {
        "name": "Default user", "descr": "Only can view certain data", "roleId": 36
        , "securedControls": null
    }
]