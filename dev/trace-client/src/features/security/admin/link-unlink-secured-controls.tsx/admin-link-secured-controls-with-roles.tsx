import { useContext } from "react";
import _ from 'lodash'
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { Messages } from "../../../../utils/messages";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { TraceDataObjectType } from "../../../../utils/global-types-interfaces-enums";
import { Utils } from "../../../../utils/utils";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { IconControls } from "../../../../controls/icons/icon-controls";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconLink } from "../../../../controls/icons/icon-link";
import { IconUnlink } from "../../../../controls/icons/icon-unlink";
import { AdminLinkSecuredControlWithRoleModal } from "./admin-link-secured-control-with-role-modal";
import { IconAutoLink } from "../../../../controls/icons/icon-auto-link";
import { AdminAutoLinkSecuredControlsFromBuiltinRolesModal } from "./admin-auto-link-secured-controls-from-builtin-roles-modal";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";

export function AdminLinkSecuredControlsWithRoles() {
    const securedControlsInstance: string = DataInstancesMap.adminSecuredControls
    const linksInstance: string = DataInstancesMap.securedControlsLinkRoles
    const context: GlobalContextType = useContext(GlobalContext);

    return (
        <div className='flex flex-col ml-8'>
            <div className='mt-6 flex justify-between items-center'>
                <label className="text-xl font-semibold text-primary-400">Linking of secured controls with roles</label>
                <label className=' text-primary-300 mr-6'>{Utils.getUserDetails()?.clientName}</label>
            </div>
            <div className='flex gap-8' style={{ width: 'calc(100vw - 260px)' }}>
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
                        instance={linksInstance}
                        title=''
                    />
                    <label className='mt-2 font-medium text-primary-300'>{Messages.messExistingRolesWithLinksDropHere}</label>
                    <CompSyncfusionTreeGrid
                        addUniqueKeyToJson={true}
                        className="mt-2 "
                        childMapping="securedControls"
                        columns={getLinkColumns()}
                        height="calc(100vh - 290px)"
                        instance={linksInstance}
                        minWidth='700px'
                        pageSize={11}
                        rowHeight={40}
                        sqlArgs={{ clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId || 0 }}
                        sqlId={SqlIdsMap.getAdminRolesSecuredControlsLink}
                        treeColumnIndex={0}
                    />
                </div>
            </div>
        </div>)

    function getSecuredControlsAggregates(): SyncFusionGridAggregateType[] {
        return [{
            columnName:'controlName',
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
                tableName: DatabaseTablesMap.RoleSecuredControlX,
                xData
            };

            try {
                if (_.isEmpty(xData)) {
                    Utils.showAlertMessage('Oops!', Messages.messNothingToDo)
                    return
                }
                const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                const queryName: string = GraphQLQueriesMap.genericUpdate.name;
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
            const expandedKeys = []
            if (targetRowData.level === 0) {
                expandedKeys.push(targetRowData.pkey)
            }
            if (targetRowData.level === 1) {
                const parentItem = targetRowData.parentItem
                expandedKeys.push(parentItem.pkey)
            }
            context.CompSyncFusionTreeGrid[linksInstance].expandedKeys = new Set(expandedKeys)
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
                {getAutoLinkButton(props)}
            </div>
        )
    }

    function getAutoLinkButton(props: any) {
        let ret = <></>
        if ((props.level === 0)) {
            ret = <TooltipComponent content={Messages.messAutoLinkBuiltinRoles}>
                <button onClick={() => handleOnClickAutoLinkFromBuiltinRoles(props)} type="button" title="Auto link from built-in roles">
                    <IconAutoLink className="w-5 h-5 ml-4 text-teal-500"></IconAutoLink></button>
            </TooltipComponent>
        }
        return (ret)
    }

    function handleOnClickAutoLinkFromBuiltinRoles(props: any) {
        Utils.showHideModalDialogA({
            title: "Add secured controls from built-in roles",
            isOpen: true,
            element: <AdminAutoLinkSecuredControlsFromBuiltinRolesModal adminRoleId={props.roleId} instance={linksInstance} />,
        })
    }

    function getLinkOrUnlinkButton(props: any) {
        let ret = null
        if (props.level === 0) {
            ret = <TooltipComponent content={Messages.messLinkSecuredControl}>
                <button type="button" title="link" onClick={() => handleOnClickLink(props)}><IconLink className="w-5 h-5 ml-2 text-blue-500"></IconLink></button>
            </TooltipComponent>
        } else {
            ret = <TooltipComponent content={Messages.messUnlinkSecuredControl}>
                <button type='button' title="link" onClick={() => handleOnClickUnlink(props)}><IconUnlink className="w-5 h-5 ml-2 text-red-500"></IconUnlink></button>
            </TooltipComponent>
        }
        return (ret)
    }

    function getUnlinkAllButton(props: any) {
        let ret = <></>
        const isVisible: boolean = (props?.securedControls?.length || 0) > 0
        if ((props.level === 0) && isVisible) {
            ret = <TooltipComponent content={Messages.messUnlinkAllSecuredControl}>
                <button type ='button' title="unlink" onClick={() => handleOnClickUnlinkAll(props)}>
                    <IconUnlink className="w-5 h-5 ml-2 text-red-500"></IconUnlink></button>
            </TooltipComponent>
        }
        return (ret)
    }

    function handleOnClickLink(props: any) {
        Utils.showHideModalDialogA({
            title: "Link a secured control with role",
            isOpen: true,
            element: <AdminLinkSecuredControlWithRoleModal roleId={props.roleId} instance={linksInstance} />,
        })
    }

    function handleOnClickUnlink(props: any) {
        Utils.showConfirmDialog(
            Messages.messSureOnUnLinkSecuredControl
            , Messages.messSureOnUnLinkSecuredControlBody
            , async () => {
                const traceDataObject: TraceDataObjectType = {
                    tableName: DatabaseTablesMap.RoleSecuredControlX,
                    deletedIds: [props.id],
                };
                try {
                    const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                    const queryName: string = GraphQLQueriesMap.genericUpdate.name;
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
                    tableName: DatabaseTablesMap.RoleSecuredControlX,
                    deletedIds: getAllIds(),
                };
                try {
                    const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                    const queryName: string = GraphQLQueriesMap.genericUpdate.name;
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