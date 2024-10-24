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
                {getLinkOrUnlinkButton(props)}
            </div>
        )
    }

    function getLinkOrUnlinkButton(props: any) {
        let ret = null
        if (props.level === 0) {
            ret = <TooltipComponent content="Link an existing user with business unit">
                <button><IconLink className="w-5 h-5 ml-2 text-blue-500"></IconLink></button>
            </TooltipComponent>
        } else {
            ret = <TooltipComponent content="Unlink this user from business unit">
                <button><IconUnlink className="w-5 h-5 ml-2 text-red-500"></IconUnlink></button>
            </TooltipComponent>
        }
        return (ret)
    }
}