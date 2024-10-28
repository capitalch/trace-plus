import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { IconLink } from "../../../../controls/icons/icon-link";
import { IconUnlink } from "../../../../controls/icons/icon-unlink";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
// import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
// import { AdminLinkUsersCustomControl } from "./admin-link-users-custom-control";
import { GlobalContextType } from '../../../../app/global-context';
import { useContext } from 'react';
import { GlobalContext } from '../../../../App';
import { LinkUserWithBuModal } from './link-user-with-bu-modal';
import { GraphQLQueriesMap } from '../../../../app/graphql/maps/graphql-queries-map';
import { GLOBAL_SECURITY_DATABASE_NAME } from '../../../../app/global-constants';
import { TraceDataObjectType } from '../../../../utils/global-types-interfaces-enums';
import { Messages } from '../../../../utils/messages';
// import { CompSyncFusionGridToolbar } from '../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar';
// import { CompSyncFusionGrid, SyncFusionGridColumnType } from '../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid';
// import { AdminNewBusinessUserButton } from '../business users/admin-new-business-user-button';
import { CompSyncFusionTreeGridToolbar } from '../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar';
import { AdminLinkUsersCustomControl } from './admin-link-users-custom-control';
import { CompSyncFusionGridToolbar } from '../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar';
import { AdminNewBusinessUserButton } from '../business users/admin-new-business-user-button';
import { CompSyncFusionGrid, SyncFusionGridColumnType } from '../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid';

export function AdminLinkUsersWithBu() {
    const businessUsersInstance = DataInstancesMap.adminBusinessUsers
    const adminLinkInstance = DataInstancesMap.adminLinkUsers
    const context: GlobalContextType = useContext(GlobalContext);
    return (
        // <CompContentContainer title='Link users with business units' className=''>
            <div className='flex gap-6 ' style ={{maxWidth:'calc(100vw - 225px)'}}>
                <div className='flex flex-col w-[35%]' >
                    <CompSyncFusionGridToolbar
                        className='mt-4'
                        // CustomControl={() => <AdminNewBusinessUserButton dataInstance={businessUsersInstance} />}
                        minWidth='300px'
                        title=''
                        isLastNoOfRows={false}
                        instance={businessUsersInstance}
                    />
                    <label className='ml-4 mt-2 font-medium'>{Messages.messBusinessUsersDragFrom}</label>
                    <CompSyncFusionGrid
                        allowRowDragAndDrop={true}
                        className="mt-4 ml-4"
                        columns={getUsersColumns()}
                        hasIndexColumn={true}
                        height="calc(100vh - 220px)"
                        instance={businessUsersInstance}
                        minWidth='300px'
                        rowHeight={40}
                        sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME, clientId: Utils.getCurrentLoginInfo().clientId || 0 }}
                        sqlId={SqlIdsMap.allBusinessUsers}
                    />
                </div>

                <div className='flex flex-col w-[50%]'>
                    <CompSyncFusionTreeGridToolbar className='mt-4'
                        // CustomControl={() => <AdminLinkUsersCustomControl dataInstance={adminLinkInstance} />}
                        instance={adminLinkInstance}
                        title=''
                    />
                    <label className='ml-4 mt-2 font-medium'>{Messages.messExistingLinksDropHere}</label>
                    <CompSyncfusionTreeGrid
                        addUniqueKeyToJson={true}
                        className="mt-2 ml-4"
                        allowRowDragAndDrop={true}
                        childMapping="users"
                        columns={getColumns()}
                        height="calc(100vh - 220px)"
                        instance={adminLinkInstance}
                        minWidth='300px'
                        onRowDrop={handleRowDrop}
                        pageSize={11}
                        rowHeight={40}
                        sqlArgs={{ clientId: Utils.getCurrentLoginInfo().clientId || 0 }}
                        sqlId={SqlIdsMap.getBuUsersLink}
                        treeColumnIndex={0}
                    />
                </div>
            </div>
        // </CompContentContainer>
    )

    function getUsersColumns(): SyncFusionGridColumnType[] {
        return [
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
            // {
            //     field: "userEmail",
            //     headerText: "Email",
            //     type: "string",
            //     width: 60,
            // },
        ]
    }

    function getColumns(): SyncFusionTreeGridColumnType[] {
        return ([
            {
                field: 'code',
                headerText: 'Code',
                type: 'string',
                template: codeColumnTemplate,
                width: 50
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

    async function handleRowDrop(args: any) {
        const gridRef: any = context.CompSyncFusionTreeGrid[adminLinkInstance].gridRef
        const currentViewRecords = gridRef.current.getCurrentViewRecords();
        const targetIndex = args.dropIndex;
        const fromIndex = args.fromIndex
        const targetRowData = currentViewRecords[targetIndex];
        const sourceRowData = currentViewRecords[fromIndex];
        const isSourceChild = (sourceRowData.level === 1) ? true : false
        const targetUsers: any[] = targetRowData.childRecords

        if (isSourceChild && isSourceUserNotExistsInTargetUsers()) { //OK
            proceedToLink(sourceRowData, targetRowData)
        } else {
            Utils.showAlertMessage('Warning', Messages.messOperationNotAllowed)
        }
        args.cancel = true

        function isSourceUserNotExistsInTargetUsers() {
            const sourceUserId = sourceRowData.userId
            const isNotExists: boolean = targetUsers ? !targetUsers.some(user => user.userId === sourceUserId) : true
            return (isNotExists)
        }
    }

    async function proceedToLink(sourceRowData: any, targetRowData: any) {
        Utils.showOptionsSelect('Copy or cut a user',
            'Copy user', 'Cut user', action
        )

        function action(result: any) {
            if (result.isConfirmed) { //Copy button clicked
                onDragAndDroptCopyButtonClicked(sourceRowData, targetRowData)
            } else if (result.isDenied) {// Cut button clicked
                onDragAndDropCutButtonClicked(sourceRowData, targetRowData)
            } // Otherwise cancel
        }
    }

    async function onDragAndDroptCopyButtonClicked(sourceRowData: any, targetRowData: any) {
        // Only link the source user with target bu
        const sourceUserId: number = sourceRowData.userId
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
            context.CompSyncFusionTreeGrid[adminLinkInstance].loadData();
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e.message);
        }
    }

    async function onDragAndDropCutButtonClicked(sourceRowData: any, targetRowData: any) {
        // Link the source user with target bu and unlink source user from source bu
        const sourceUserId: number = sourceRowData.userId
        const targetBuId: number = targetRowData.buId
        try {
            // Link the target user
            let traceDataObject: TraceDataObjectType = {
                tableName: "UserBuX",
                xData: {
                    userId: sourceUserId,
                    buId: targetBuId
                },
            };

            let q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            let queryName: string = GraphQLQueriesMap.genericUpdate.name;
            await Utils.mutateGraphQL(q, queryName);

            // Unlink the source user
            traceDataObject = {
                tableName: "UserBuX",
                deletedIds: [sourceRowData.id],
            };
            q = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, traceDataObject);
            queryName = GraphQLQueriesMap.genericUpdate.name;
            await Utils.mutateGraphQL(q, queryName);

            context.CompSyncFusionTreeGrid[adminLinkInstance].loadData();
            Utils.showSaveMessage();
        } catch (e: any) {
            console.log(e.message);
        }
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
            element: <LinkUserWithBuModal buId={props.buId} instance={adminLinkInstance} />,
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
                    await context.CompSyncFusionTreeGrid[adminLinkInstance].loadData();
                    Utils.showCustomMessage(Messages.messUserUnlinkedSuccess);
                } catch (e: any) {
                    console.log(e?.message)
                }
            }
        )
    }
}