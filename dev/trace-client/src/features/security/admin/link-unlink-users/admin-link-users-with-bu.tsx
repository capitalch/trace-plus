import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { IconLink } from "../../../../controls/icons/icon-link";
import { IconUnlink } from "../../../../controls/icons/icon-unlink";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { GlobalContext, GlobalContextType } from '../../../../app/global-context';
import { useContext } from 'react';
// import { GlobalContext } from '../../../../App';
import { LinkUserWithBuModal } from './link-user-with-bu-modal';
import { GraphQLQueriesMap } from '../../../../app/graphql/maps/graphql-queries-map';
import { GLOBAL_SECURITY_DATABASE_NAME } from '../../../../app/global-constants';
import { TraceDataObjectType } from '../../../../utils/global-types-interfaces-enums';
import { Messages } from '../../../../utils/messages';
import { CompSyncFusionTreeGridToolbar } from '../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar';
import { CompSyncFusionGridToolbar } from '../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar';
import { CompSyncFusionGrid, SyncFusionGridColumnType } from '../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid';
import { AdminNewBusinessUserButton } from '../business users/admin-new-business-user-button';
import { WidgetTooltip } from '../../../../controls/widgets/widget-tooltip';
import { AdminNewBusinessUnitButton } from '../business-units/admin-new-business-unit-button';

export function AdminLinkUsersWithBu() {
    const businessUsersInstance = DataInstancesMap.adminBusinessUsers
    const linkInstance = DataInstancesMap.adminLinkUsers
    const context: GlobalContextType = useContext(GlobalContext);
    return (
        <div className='flex flex-col ml-8'>
            <label className='mt-6 text-xl font-semibold text-primary-400'>Link users with business units (bu)</label>
            <div className='flex gap-8 ' style={{ width: 'calc(100vw - 260px)' }}>
                <div className='flex flex-col w-min' >
                    <CompSyncFusionGridToolbar
                        className='mt-4'
                        CustomControl={() => <WidgetTooltip title='New business user' ><AdminNewBusinessUserButton dataInstance={businessUsersInstance} className='w-10 mb-2 h-8 px-2 text-xs' /></WidgetTooltip>}
                        minWidth='300px'
                        title=''
                        isLastNoOfRows={false}
                        instance={businessUsersInstance}
                    />
                    <label className='mt-2 font-medium text-primary-300'>{Messages.messBusinessUsersDragFrom}</label>
                    <CompSyncFusionGrid
                        className="mt-4 "
                        columns={getUsersColumns()}
                        gridDragAndDropSettings={
                            {
                                allowRowDragAndDrop: true,
                                onRowDrop: onUserRowDrop,
                            }}
                        hasIndexColumn={true}
                        height="calc(100vh - 290px)"
                        instance={businessUsersInstance}
                        minWidth='600px'
                        rowHeight={40}
                        sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME, clientId: Utils.getCurrentLoginInfo().clientId || 0 }}
                        sqlId={SqlIdsMap.allBusinessUsers}
                    />
                </div>

                <div className='flex flex-col w-max'>
                    <CompSyncFusionTreeGridToolbar className='mt-4'
                        CustomControl={() =>
                            <WidgetTooltip title='New business unit' >
                                <AdminNewBusinessUnitButton
                                    dataInstance={linkInstance}
                                    className='w-10 mb-2 h-8 px-2 text-xs'
                                    isTreeGrid={true}
                                />
                            </WidgetTooltip>}
                        instance={linkInstance}
                        title=''
                    />
                    <label className='mt-2 font-medium text-primary-300'>{Messages.messExistingLinksDropHere}</label>
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
                        instance={linkInstance}
                        minWidth='700px'
                        pageSize={11}
                        rowHeight={40}
                        sqlArgs={{ clientId: Utils.getCurrentLoginInfo().clientId || 0 }}
                        sqlId={SqlIdsMap.getBuUsersLink}
                        treeColumnIndex={0}
                    />
                </div>
            </div>
        </div>
    )

    function onUserRowDrop(args: any) {
        args.cancel = true
        const businessUsersGridRef: any = context.CompSyncFusionGrid[businessUsersInstance].gridRef
        const businessUsersViewRecords = businessUsersGridRef.current.getCurrentViewRecords();

        const adminLinkGridRef: any = context.CompSyncFusionTreeGrid[linkInstance].gridRef
        const adminLinkViewRecords = adminLinkGridRef.current.getCurrentViewRecords();

        const fromIndex = args.fromIndex
        const targetIndex = args.dropIndex;

        const sourceRowData = businessUsersViewRecords[fromIndex];
        const targetRowData = adminLinkViewRecords[targetIndex];

        const targetUsers: any[] = getTargetUsers()
        const sourceUserId = sourceRowData.id
        if (targetUsers.some(user => user.userId === sourceUserId)) {
            Utils.showAlertMessage('Information', Messages.messUserExists)
        } else {
            Utils.showConfirmDialog(Messages.messSureToProceed, Messages.messUserWillBeAdded, () => proceedToLink())
        }

        function getTargetUsers() {
            let users: any[] = []
            if (targetRowData?.level === 0) { //dropped on bu
                users = targetRowData?.users || []
            } else if (targetRowData?.level === 1) { //dropped on user
                const parentIndex = targetRowData?.parentItem?.index
                const parentRowData = adminLinkViewRecords[parentIndex]
                users = parentRowData?.users || []
            }
            return (users)
        }

        async function proceedToLink() {
            const sourceUserId: number = sourceRowData.id
            const targetBuId: number = targetRowData.buId
            const traceDataObject: TraceDataObjectType = {
                tableName: "UserBuX",
                xData: {
                    userId: sourceUserId,
                    buId: targetBuId
                },
            };

            try {
                const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
                const queryName: string = GraphQLQueriesMap.genericUpdate.name;
                await Utils.mutateGraphQL(q, queryName);
                context.CompSyncFusionTreeGrid[linkInstance].loadData();
                Utils.showSaveMessage();
            } catch (e: any) {
                console.log(e.message);
            }
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
                // width: 60,
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
            </div>
        )
    }

    function getChildCount(props: any) {
        return (
            <span className='text-xs text-red-500 mt-2 ml-2'> {props?.childRecords ? `(${props.childRecords.length})` : ''} </span>
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
            element: <LinkUserWithBuModal buId={props.buId} instance={linkInstance} />,
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
                    await context.CompSyncFusionTreeGrid[linkInstance].loadData();
                    Utils.showCustomMessage(Messages.messUserUnlinkedSuccess);
                } catch (e: any) {
                    console.log(e?.message)
                }
            }
        )
    }
}


// async function handleRowDrop(args: any) {
//     const gridRef: any = context.CompSyncFusionTreeGrid[adminLinkInstance].gridRef
//     const currentViewRecords = gridRef.current.getCurrentViewRecords();
//     const targetIndex = args.dropIndex;
//     const fromIndex = args.fromIndex
//     const targetRowData = currentViewRecords[targetIndex];
//     const sourceRowData = currentViewRecords[fromIndex];
//     const isSourceChild = (sourceRowData.level === 1) ? true : false
//     const targetUsers: any[] = targetRowData.childRecords

//     if (isSourceChild && isSourceUserNotExistsInTargetUsers()) { //OK
//         proceedToLink(sourceRowData, targetRowData)
//     } else {
//         Utils.showAlertMessage('Warning', Messages.messOperationNotAllowed)
//     }
//     args.cancel = true

//     function isSourceUserNotExistsInTargetUsers() {
//         const sourceUserId = sourceRowData.userId
//         const isNotExists: boolean = targetUsers ? !targetUsers.some(user => user.userId === sourceUserId) : true
//         return (isNotExists)
//     }
// }

// async function proceedToLink(sourceRowData: any, targetRowData: any) {
//     Utils.showOptionsSelect('Copy or cut a user',
//         'Copy user', 'Cut user', action
//     )

//     function action(result: any) {
//         if (result.isConfirmed) { //Copy button clicked
//             onDragAndDroptCopyButtonClicked(sourceRowData, targetRowData)
//         } else if (result.isDenied) {// Cut button clicked
//             onDragAndDropCutButtonClicked(sourceRowData, targetRowData)
//         } // Otherwise cancel
//     }
// }

// async function onDragAndDroptCopyButtonClicked(sourceRowData: any, targetRowData: any) {
//     // Only link the source user with target bu
//     const sourceUserId: number = sourceRowData.userId
//     const targetBuId: number = targetRowData.buId
//     const traceDataObject: TraceDataObjectType = {
//         tableName: "UserBuX",
//         xData: {
//             userId: sourceUserId,
//             buId: targetBuId
//         },
//     };

//     try {
//         const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
//         const queryName: string = GraphQLQueriesMap.genericUpdate.name;
//         await Utils.mutateGraphQL(q, queryName);
//         context.CompSyncFusionTreeGrid[adminLinkInstance].loadData();
//         Utils.showSaveMessage();
//     } catch (e: any) {
//         console.log(e.message);
//     }
// }

// async function onDragAndDropCutButtonClicked(sourceRowData: any, targetRowData: any) {
//     // Link the source user with target bu and unlink source user from source bu
//     const sourceUserId: number = sourceRowData.userId
//     const targetBuId: number = targetRowData.buId
//     try {
//         // Link the target user
//         let traceDataObject: TraceDataObjectType = {
//             tableName: "UserBuX",
//             xData: {
//                 userId: sourceUserId,
//                 buId: targetBuId
//             },
//         };

//         let q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
//         let queryName: string = GraphQLQueriesMap.genericUpdate.name;
//         await Utils.mutateGraphQL(q, queryName);

//         // Unlink the source user
//         traceDataObject = {
//             tableName: "UserBuX",
//             deletedIds: [sourceRowData.id],
//         };
//         q = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
//         queryName = GraphQLQueriesMap.genericUpdate.name;
//         await Utils.mutateGraphQL(q, queryName);

//         context.CompSyncFusionTreeGrid[adminLinkInstance].loadData();
//         Utils.showSaveMessage();
//     } catch (e: any) {
//         console.log(e.message);
//     }
// }