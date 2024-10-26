import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { IconLink } from "../../../../controls/icons/icon-link";
import { IconUnlink } from "../../../../controls/icons/icon-unlink";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompSyncfusionTreeGrid, SyncFusionTreeGridColumnType } from "../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompSyncFusionTreeGridToolbar } from "../../../../controls/components/generic-syncfusion-tree-grid.tsx/comp-syncfusion-tree-grid-toolbar";
import { AdminLinkUsersCustomControl } from "./admin-link-users-custom-control";
import { GlobalContextType } from '../../../../app/global-context';
import { useContext } from 'react';
import { GlobalContext } from '../../../../App';
import { LinkUserWithBuModal } from './link-user-with-bu-modal';
import { GraphQLQueriesMap } from '../../../../app/graphql/maps/graphql-queries-map';
import { GLOBAL_SECURITY_DATABASE_NAME } from '../../../../app/global-constants';
import { TraceDataObjectType } from '../../../../utils/global-types-interfaces-enums';
import { Messages } from '../../../../utils/messages';

export function AdminLinkUsersWithBu() {
    const instance = DataInstancesMap.adminLinkUsers
    const context: GlobalContextType = useContext(GlobalContext);
    return (
        <CompContentContainer title='Link users with business units'>
            <CompSyncFusionTreeGridToolbar
                CustomControl={() => <AdminLinkUsersCustomControl dataInstance={instance} />}
                instance={instance}
                title=''
            />
            <CompSyncfusionTreeGrid
                addUniqueKeyToJson={true}
                allowPaging={true}
                allowRowDragAndDrop={true}
                childMapping="users"
                columns={getColumns()}
                instance={instance}
                onRowDrop={handleRowDrop}
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
            <span>{props.name}</span>
            {getChildCount(props)}
        </div>)
    }

    async function handleRowDrop(args: any) {
        const gridRef: any = context.CompSyncFusionTreeGrid[instance].gridRef
        const loadData = context.CompSyncFusionTreeGrid[instance]?.loadData
        const currentViewRecords = gridRef.current.getCurrentViewRecords();
        const targetIndex = args.dropIndex;
        const fromIndex = args.fromIndex
        const targetRowData = currentViewRecords[targetIndex];
        const sourceRowData = currentViewRecords[fromIndex];
        const isTargetParent = targetRowData.hasChildRecords
        const isSourceChild = !sourceRowData.hasChildRecords
        if (isSourceChild && isTargetParent) { //OK
            proceedToLink(sourceRowData, targetRowData)
            loadData()
        } else {
            Utils.showAlertMessage('Warning', 'This operation is not allowed')
        }
        args.cancel = true
    }

    async function proceedToLink(sourceRowData: any, targetRowData: any) {
        const action: any = (result: any) => {
            if (result.isConfirmed) {
                console.log(result)
                // User clicked the first option
                // onOptionSelect(option1);
            } else {
                console.log(result)
                // User clicked the second option
                // onOptionSelect(option2);
            }
        }
        Utils.showOptionsSelect('Copy or cut a user',
            'Copy user', 'Cut user', action
        )
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
            element: <LinkUserWithBuModal buId={props.buId} instance={instance} />,
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
                    await context.CompSyncFusionTreeGrid[instance].loadData();
                    // const gridRef = context.CompSyncFusionTreeGrid[instance].gridRef
                    // if(gridRef.current){
                    //     gridRef.current.created = onLoad
                    //     // gridRef.current.expandRow(gridRef.current.getRows()[0])
                    // }
                    // context.CompSyncFusionTreeGrid[instance].gridRef?.current?.expandRow(3)
                    Utils.showCustomMessage(Messages.messUserUnlinkedSuccess);
                } catch (e: any) {
                    console.log(e?.message)
                }
            }
        )
    }
}