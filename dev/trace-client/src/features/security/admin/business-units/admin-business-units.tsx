import { useContext } from "react";
import { GlobalContextType } from "../../../../app/global-context";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGrid, SyncFusionAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid-toolbar";
import { GlobalContext } from "../../../../App";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
// import { AdminEditNewBusinessUnit } from "./admin-edit-new-business-unit";
import { GraphQLQueriesMap } from "../../../../app/graphql/maps/graphql-queries-map";
import { Messages } from "../../../../utils/messages";
import { AdminBusinessUnitsNewButton } from "./admin-business-units-new-button";
import { AdminNewEditBusinessUnit } from "./admin-new-edit-business-unit";
import { AppDispatchType } from "../../../../app/store/store";
import { useDispatch } from "react-redux";
import { resetQueryHelperData } from "../../../../app/graphql/query-helper-slice";

export function AdminBusinessUnits() {
    const context: GlobalContextType = useContext(GlobalContext);
    const instance = DataInstancesMap.adminBusinessUnits; // Grid instance for Business Units
    const dispatch: AppDispatchType = useDispatch()
    return (
        <CompContentContainer title='Admin business units'>
            <CompSyncFusionGridToolbar
                CustomControl={() => <AdminBusinessUnitsNewButton dataInstance={instance} />}
                title="Business units view"
                isLastNoOfRows={true}
                instance={instance}
            />
            <CompSyncFusionGrid
                className="mt-4"
                aggregates={getAggregates()}
                columns={getColumns()}
                hasIndexColumn={true}
                instance={instance}
                rowHeight={40}
                sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME, clientId: Utils.getCurrentLoginInfo().clientId || 0 }}
                sqlId={SqlIdsMap.allBusinessUnits}
                onDelete={handleOnDelete}
                onEdit={handleOnEdit}
            />
        </CompContentContainer>
    );

    function getAggregates(): SyncFusionAggregateType[] {
        return [
            { type: 'Count', field: 'buCode', format: 'N0', footerTemplate: buCodeAggrTemplate }
        ];
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return [
            {
                field: 'buCode',
                headerText: 'BU Code',
                type: 'string',
                width: 40,
            },
            {
                field: 'buName',
                headerText: 'BU Name',
                type: 'string',
                // width: 80,
            },
            {
                field: 'isActive',
                headerText: 'Active',
                type: 'boolean',
                width: 40,
            },
        ];
    }

    async function handleOnDelete(id: string) {
        const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
            tableName: 'BuM',
            deletedIds: [id]
        });
        Utils.showDeleteConfirmDialog(doDelete);
        async function doDelete() {
            try {
                await Utils.mutateGraphQL(q, GraphQLQueriesMap.genericUpdate.name);
                Utils.showSuccessAlertMessage({ message: Messages.messRecordDeleted, title: Messages.messSuccess }
                    , () => {
                        dispatch(resetQueryHelperData({ instance: instance }))
                        context.CompSyncFusionGrid[instance].loadData();
                    }
                );
            } catch (e: any) {
                Utils.showFailureAlertMessage({ message: e?.message || '', title: 'Failed' });
            }
        }
    }

    async function handleOnEdit(props: any) {
        Utils.showHideModalDialogA({
            title: 'Edit business unit',
            isOpen: true,
            element: <AdminNewEditBusinessUnit
                dataInstance={instance}
                buCode={props.buCode}
                buName={props.buName}
                isActive={props.isActive}
                id={props.id}
            />
        });
    }

    function buCodeAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>);
    }
}