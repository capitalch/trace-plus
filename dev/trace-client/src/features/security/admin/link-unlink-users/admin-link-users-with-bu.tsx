import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { IconLink } from "../../../../controls/icons/icon-link";
import _ from 'lodash'
import { IconUnlink } from "../../../../controls/icons/icon-unlink";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { GlobalContext, GlobalContextType } from '../../../../app/global-context';
import { useContext } from 'react';
import { AdminLinkUserWithBuModal } from './admin-link-user-with-bu-modal';
import { GraphQLQueriesMap, GraphQLQueriesMapNames } from '../../../../app/maps/graphql-queries-map';
import { GLOBAL_SECURITY_DATABASE_NAME } from '../../../../app/global-constants';
import { TraceDataObjectType } from '../../../../utils/global-types-interfaces-enums';
import { Messages } from '../../../../utils/messages';
import { CompSyncFusionTreeGridToolbar } from '../../../../controls/components/syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar';
import { CompSyncFusionGridToolbar } from '../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar';
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from '../../../../controls/components/syncfusion-grid/comp-syncfusion-grid';
import { AdminNewBusinessUserButton } from '../business users/admin-new-business-user-button';
import { AdminNewBusinessUnitButton } from '../business-units/admin-new-business-unit-button';
import { AllTables } from '../../../../app/maps/database-tables-map';

export function AdminLinkUsersWithBu() {
    const businessUsersInstance = DataInstancesMap.adminBusinessUsers
    const linksInstance = DataInstancesMap.adminLinkUsers
    const context: GlobalContextType = useContext(GlobalContext);

    return (
        <div className='flex flex-col ml-8'>
            <div className='mt-6 flex justify-between items-center'>
                <label className='text-xl font-semibold text-primary-400'>Link users with business units (bu)</label>
                <label className=' text-primary-300 mr-6'>{Utils.getUserDetails()?.clientName}</label>
            </div>
            <div className='flex gap-8' style={{ width: 'calc(100vw - 260px)' }}>
                <div className='flex flex-col w-min' >
                    <CompSyncFusionGridToolbar
                        className='mt-4'
                        CustomControl={() => <TooltipComponent content='New business user' ><AdminNewBusinessUserButton dataInstance={businessUsersInstance} className='w-10 h-8 px-2 mb-2 text-xs' /></TooltipComponent>}
                        minWidth='300px'
                        title=''
                        isLastNoOfRows={false}
                        instance={businessUsersInstance}
                    />
                    <label className='mt-2 font-medium text-primary-300'>{Messages.messBusinessUsersDragFrom}</label>
                    <CompSyncFusionGrid
                        aggregates={getBusinessUsersAggregates()}
                        className="mt-4"
                        columns={getUsersColumns()}
                        gridDragAndDropSettings={
                            {
                                allowRowDragAndDrop: true,
                                onRowDrop: onUsersRowDrop,
                                selectionType: 'Multiple',
                                targetId: linksInstance
                            }}
                        hasCheckBoxSelection={true}
                        height="calc(100vh - 290px)"
                        instance={businessUsersInstance}
                        minWidth='600px'
                        rowHeight={40}
                        sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME, clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId || 0 }}
                        sqlId={SqlIdsMap.allBusinessUsers}
                    />
                </div>

                <div className='flex flex-col w-max'>
                    <CompSyncFusionTreeGridToolbar className='mt-4'
                        CustomControl={() =>
                            <TooltipComponent content='New business unit' >
                                <AdminNewBusinessUnitButton
                                    dataInstance={linksInstance}
                                    className='w-10 h-8 px-2 mb-2 text-xs'
                                    isTreeGrid={true}
                                />
                            </TooltipComponent>}
                        instance={linksInstance}
                        title=''
                    />
                    <label className='mt-2 font-medium text-primary-300'>{Messages.messExistingLinksDropHere}</label>
                    <CompSyncfusionTreeGrid
                        addUniqueKeyToJson={true}
                        className="mt-2"
                        childMapping="users"
                        columns={getLinkColumns()}
                        height="calc(100vh - 290px)"
                        instance={linksInstance}
                        minWidth='700px'
                        pageSize={11}
                        rowHeight={40}
                        sqlArgs={{ clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId || 0 }}
                        sqlId={SqlIdsMap.getBuUsersLink}
                        treeColumnIndex={0}
                    />
                </div>
            </div>
        </div>
    )

    function getBusinessUsersAggregates(): SyncFusionGridAggregateType[] {
        return [{
            columnName:'roleName',
            field: 'roleName',
            type: "Count",
            format: "N0",
            footerTemplate: businessUserssAggrTemplate
        }]
    }

    function businessUserssAggrTemplate(props: any) {
        return <span className="text-xs">Count: {props.Count}</span>;
    }

    function onUsersRowDrop(args: any) {
        args.cancel = true
        const targetGridRef = context.CompSyncFusionTreeGrid[linksInstance].gridRef
        const sourceGridRef = context.CompSyncFusionGrid[businessUsersInstance].gridRef
        if (targetGridRef.current?.id === businessUsersInstance) {
            return
        }
        // If dropped in empty area of target grid then return
        const targetRow = args?.target.closest('tr');
        if (!targetRow) {
            Utils.showFailureAlertMessage({ title: 'Failure', message: Messages.messNotAllowed })
            return
        }

        const buLinkViewRecords = targetGridRef.current.getCurrentViewRecords();
        const targetIndex = args.dropIndex;

        const targetRowData = buLinkViewRecords[targetIndex];
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
                ctrls = targetRowData?.users || []
            } else if (targetRowData?.level === 1) { //dropped on secured control
                const parentIndex = targetRowData?.parentItem?.index
                const parentRowData = buLinkViewRecords[parentIndex]
                ctrls = parentRowData?.users || []
            }
            const ids: string[] = ctrls.map((ctrl: any) => ctrl.userId)
            return (ids)
        }

        async function proceedToLink() {
            const buId = targetRowData.buId
            const xData: any[] = sourceIds
                .filter((id: string) => !idsToExclude.includes(id))
                .map(x => ({
                    userId: x,
                    buId: buId
                }))
            const traceDataObject: TraceDataObjectType = {
                tableName: AllTables.UserBuX.name,
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
            const expandedKeys:Set<number> = new Set()
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

    function getUsersColumns(): SyncFusionGridColumnType[] {
        return [
            {
                field: "roleName",
                headerText: "Role",
                type: "string",
                width: 80,
            },
            {
                field: "uid",
                headerText: "Uid",
                type: "string",
                width: 60,
            },
            {
                field: "userName",
                headerText: "User name",
                type: "string",
            },
        ]
    }

    function getLinkColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'code',
                headerText: 'Code (Bu / user)',
                type: 'string',
                template: codeColumnTemplate,
                width: 80
            },
            {
                field: 'name',
                headerText: 'Name',
                type: 'string',
                template: nameColumnTemplate,
            },
        ])
    }

    function codeColumnTemplate(props: any) {
        return (<div>
            <span>{props.code}</span>
            {getChildCount(props)}
        </div>)
    }

    function nameColumnTemplate(props: any) {
        return (
            <div className="flex flex-row items-center">
                <span>{props.name}</span>
                {getLinkOrUnlinkButton(props)}
                {getUnlinkAllButton(props)}
            </div>
        )
    }

    function getChildCount(props: any) {
        return (
            <span className='mt-2 ml-2 text-xs text-red-500'> {props?.childRecords ? `(${props.childRecords.length})` : ''} </span>
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

    function getUnlinkAllButton(props: any) {
        let ret = <></>
        const isVisible: boolean = (props?.users?.length || 0) > 0
        if ((props.level === 0) && isVisible) {
            ret = <TooltipComponent content={Messages.messUnlinkAllBusinessUsers}>
                <button onClick={() => handleOnClickUnlinkAll(props)}>
                    <IconUnlink className="w-5 h-5 ml-2 text-red-500"></IconUnlink></button>
            </TooltipComponent>
        }
        return (ret)
    }

    function handleOnClickLink(props: any) {
        Utils.showHideModalDialogA({
            title: "Link user with business unit",
            isOpen: true,
            element: <AdminLinkUserWithBuModal buId={props.buId} instance={linksInstance} />,
        })
    }

    function handleOnClickUnLink(props: any) {
        Utils.showConfirmDialog(
            Messages.messSureUnlinkUser
            , Messages.messSureUnlinkUserBody
            , async () => {
                const traceDataObject: TraceDataObjectType = {
                    tableName: AllTables.UserBuX.name,
                    deletedIds: [props.id],
                };
                try {
                    const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                    const queryName: string = GraphQLQueriesMapNames.genericUpdate;
                    await Utils.mutateGraphQL(q, queryName);
                    await context.CompSyncFusionTreeGrid[linksInstance].loadData();
                    Utils.showCustomMessage(Messages.messUserUnlinkedSuccess);
                } catch (e: any) {
                    console.log(e)
                }
            }
        )
    }

    function handleOnClickUnlinkAll(props: any) {
        Utils.showConfirmDialog(
            Messages.messSureOnUnLinkAllBusinessUsers
            , Messages.messSureOnUnLinkBusinessUsersBody
            , async () => {
                const traceDataObject: TraceDataObjectType = {
                    tableName: AllTables.UserBuX.name,
                    deletedIds: getAllIds(),
                };
                try {
                    const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                    const queryName: string = GraphQLQueriesMapNames.genericUpdate;
                    await Utils.mutateGraphQL(q, queryName);
                    await context.CompSyncFusionTreeGrid[linksInstance].loadData();
                    Utils.showCustomMessage(Messages.messBusinessUsersUnlinkSuccess);
                } catch (e: any) {
                    console.log(e)
                }
            }
        )

        function getAllIds() {
            const ids: [string] = props?.users?.map((ctrl: any) => ctrl.id) || []
            return (ids)
        }
    }
}

