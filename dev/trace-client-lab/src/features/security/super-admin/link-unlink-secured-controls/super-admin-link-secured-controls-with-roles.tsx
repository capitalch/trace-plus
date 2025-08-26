import { useContext, useEffect } from "react";
import _ from 'lodash'
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map"
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { Messages } from "../../../../utils/messages";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconLink } from "../../../../controls/icons/icon-link";
import { IconUnlink } from "../../../../controls/icons/icon-unlink";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/maps/graphql-queries-map";
import { IconControls } from "../../../../controls/icons/icon-controls";
import { SuperAdminLinkSecuredControlWithRoleModal } from "./super-admin-link-secured-control-with-role-modal";
import { AllTables } from "../../../../app/maps/database-tables-map";

export function SuperAdminLinkSecuredControlsWithRoles() {
    const securedControlsInstance: string = DataInstancesMap.securedControls
    const linksInstance: string = DataInstancesMap.securedControlsLinkRoles
    const context: GlobalContextType = useContext(GlobalContext);

    useEffect(()=>{
        const loadDataLinks = context.CompSyncFusionTreeGrid[linksInstance].loadData
        if(loadDataLinks){
            loadDataLinks()
        }
    },[])

    return (
        <div className='flex flex-col ml-8'>
            <label className="mt-6 text-xl font-semibold text-primary-400">Linking of secured controls with roles</label>
            <div className='flex gap-8 ' style={{ width: 'calc(100vw - 260px)' }}>
                <div className='flex flex-col w-min' >
                    <CompSyncFusionGridToolbar
                        className='mt-4'
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
                                selectionType: 'Multiple',
                                targetId: linksInstance
                            }}
                        hasCheckBoxSelection={true}
                        height="calc(100vh - 273px)"
                        instance={securedControlsInstance}
                        minWidth='600px'
                        rowHeight={40}
                        sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME }}
                        sqlId={SqlIdsMap.allSecuredControls}
                    />
                </div>

                <div className='flex flex-col w-max'>
                    <CompSyncFusionTreeGridToolbar className='mt-4'
                        instance={linksInstance}
                        title=''
                    />
                    <label className='mt-2 font-medium text-primary-300'>{Messages.messExistingRolesWithLinksDropHere}</label>
                    <CompSyncfusionTreeGrid
                        addUniqueKeyToJson={true}
                        className="mt-2 "
                        childMapping="securedControls"
                        columns={getLinkColumns()}
                        height="calc(100vh - 273px)"
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

    function getSecuredControlsAggregates(): SyncFusionGridAggregateType[] {
        return [{
            columnName: 'controlName',
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

    function onSecuredControlsRowDrop(args: any) {
        args.cancel = true
        const targetGridRef = context.CompSyncFusionTreeGrid[linksInstance].gridRef
        const sourceGridRef = context.CompSyncFusionGrid[securedControlsInstance].gridRef
        if (targetGridRef.current?.id === securedControlsInstance) {
            return
        }

        // If dropped in empty area of target grid then return
        const targetRow = args?.target.closest('tr');
        if (!targetRow) {
            Utils.showFailureAlertMessage({ title: 'Failure', message: Messages.messNotAllowed })
            return
        }

        const rolesLinkViewRecords = targetGridRef.current.getCurrentViewRecords();
        const targetIndex = args.dropIndex;

        const targetRowData = rolesLinkViewRecords[targetIndex];
        setExpandedKeys()
        if (_.isEmpty(targetRowData)) {
            return
        }
        const idsToExclude: string[] = getIdsToExclude() || []
        const sourceIds: string[] = args.data?.map((x: any) => x.id) || []
        proceedToLink()

        function getIdsToExclude() {
            let ctrls: any[] = []
            if (targetRowData?.level === 0) { //dropped on role
                ctrls = targetRowData?.securedControls || []
            } else if (targetRowData?.level === 1) { //dropped on secured control
                const parentIndex = targetRowData?.parentItem?.index
                const parentRowData = rolesLinkViewRecords[parentIndex]
                ctrls = parentRowData?.securedControls || []
            }
            const ids: string[] = ctrls.map((ctrl: any) => ctrl.securedControlId)
            return (ids)
        }

        async function proceedToLink() {
            const roleId = targetRowData.roleId
            const xData: any[] = sourceIds
                .filter((id: string) => !idsToExclude.includes(id))
                .map(x => ({
                    securedControlId: x,
                    roleId: roleId
                }))
            const traceDataObject: TraceDataObjectType = {
                tableName: AllTables.RoleSecuredControlX.name,
                xData
            };

            try {
                if (_.isEmpty(xData)) {
                    Utils.showAlertMessage('Oops!', Messages.messNothingToDo)
                    return
                }
                const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                const queryName: string = GraphQLQueriesMapNames.genericUpdate;
                await Utils.mutateGraphQL(q, queryName);
                context.CompSyncFusionTreeGrid[linksInstance].loadData();
                Utils.showSaveMessage();
                if (sourceGridRef) {
                    sourceGridRef.current.clearSelection() /// clear selection of source grid
                }
            } catch (e: any) {
                console.log(e);
            }
        }

        function setExpandedKeys() {
            // Only expand the key where items are dropped
            const expandedKeys: Set<number> = new Set()
            if (targetRowData.level === 0) {
                expandedKeys.add(targetRowData.pkey)
            }
            if (targetRowData.level === 1) {
                const parentItem = targetRowData.parentItem
                expandedKeys.add(parentItem.pkey)
            }
            context.CompSyncFusionTreeGrid[linksInstance].expandedKeys = expandedKeys
        }

    }

    function securedControlsAggrTemplate(props: any) {
        return <span className="text-xs">Count: {props.Count}</span>;
    }

    function getLinkColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'name',
                headerText: 'Name (Role / Secured control)',
                type: 'string',
                template: nameColumnTemplate,
            },
            {
                field: 'descr',
                headerText: 'Description',
                template: descrColumnTemplate,
                type: 'string'
            },
        ])
    }

    function nameColumnTemplate(props: any) {
        return (<div className="flex items-center">
            {(props.level === 1) && <IconControls className="text-sky-400" />}
            <span className="ml-2">{props.name}</span>
            {getChildCount(props)}
        </div>)
    }

    function getChildCount(props: any) {
        return (
            <span className='mt-2 ml-2 text-xs text-red-500'> {props?.childRecords ? `(${props.childRecords.length})` : ''} </span>
        )
    }

    function descrColumnTemplate(props: any) {
        return (
            <div className="flex flex-row items-center">
                <span>{props.descr}</span>
                {getLinkOrUnlinkButton(props)}
                {getUnlinkAllButton(props)}
            </div>
        )
    }

    function getLinkOrUnlinkButton(props: any) {
        let ret = null
        if (props.level === 0) {
            ret = <TooltipComponent content={Messages.messLinkSecuredControl}>
                <button onClick={() => handleOnClickLink(props)}><IconLink className="w-5 h-5 ml-2 text-blue-500"></IconLink></button>
            </TooltipComponent>
        } else {
            ret = <TooltipComponent content={Messages.messUnlinkSecuredControl}>
                <button onClick={() => handleOnClickUnlink(props)}><IconUnlink className="w-5 h-5 ml-2 text-red-500"></IconUnlink></button>
            </TooltipComponent>
        }
        return (ret)
    }

    function getUnlinkAllButton(props: any) {
        let ret = <></>
        const isVisible: boolean = (props?.securedControls?.length || 0) > 0
        if ((props.level === 0) && isVisible) {
            ret = <TooltipComponent content={Messages.messUnlinkAllSecuredControl}>
                <button onClick={() => handleOnClickUnlinkAll(props)}>
                    <IconUnlink className="w-5 h-5 ml-2 text-red-500"></IconUnlink></button>
            </TooltipComponent>
        }
        return (ret)
    }

    function handleOnClickLink(props: any) {
        Utils.showHideModalDialogA({
            title: "Link a secured control with role",
            isOpen: true,
            element: <SuperAdminLinkSecuredControlWithRoleModal roleId={props.roleId} instance={linksInstance} />,
        })
    }

    function handleOnClickUnlink(props: any) {
        Utils.showConfirmDialog(
            Messages.messSureOnUnLinkSecuredControl
            , Messages.messSureOnUnLinkSecuredControlBody
            , async () => {
                const traceDataObject: TraceDataObjectType = {
                    tableName: AllTables.RoleSecuredControlX.name,
                    deletedIds: [props.id],
                };
                try {
                    const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                    const queryName: string = GraphQLQueriesMapNames.genericUpdate;
                    await Utils.mutateGraphQL(q, queryName);
                    await context.CompSyncFusionTreeGrid[linksInstance].loadData();
                    Utils.showCustomMessage(Messages.messSecuredControlsUnlinkSuccess);
                } catch (e: any) {
                    console.log(e)
                }
            }
        )
    }

    function handleOnClickUnlinkAll(props: any) {
        Utils.showConfirmDialog(
            Messages.messSureOnUnLinkAllSecuredControls
            , Messages.messSureOnUnLinkAllSecuredControlsBody
            , async () => {
                const traceDataObject: TraceDataObjectType = {
                    tableName: AllTables.RoleSecuredControlX.name,
                    deletedIds: getAllIds(),
                };
                try {
                    const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                    const queryName: string = GraphQLQueriesMapNames.genericUpdate;
                    await Utils.mutateGraphQL(q, queryName);
                    await context.CompSyncFusionTreeGrid[linksInstance].loadData();
                    Utils.showCustomMessage(Messages.messSecuredControlsUnlinkSuccess);
                } catch (e: any) {
                    console.log(e)
                }
            }
        )

        function getAllIds() {
            const ids: [string] = props?.securedControls?.map((ctrl: any) => ctrl.id) || []
            return (ids)
        }
    }
}