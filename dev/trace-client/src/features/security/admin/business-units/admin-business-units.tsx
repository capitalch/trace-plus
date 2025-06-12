import { useContext, useEffect } from "react";
// import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { CompContentContainer } from "../../../../controls/components/comp-content-container";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { GLOBAL_SECURITY_DATABASE_NAME } from "../../../../app/global-constants";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
// import { GraphQLQueriesMap, GraphQLQueriesMapNames } from "../../../../app/graphql/maps/graphql-queries-map";
// import { Messages } from "../../../../utils/messages";
import { AdminNewBusinessUnitButton } from "./admin-new-business-unit-button";
import { AdminNewEditBusinessUnit } from "./admin-new-edit-business-unit";
import { AppDispatchType, RootStateType } from "../../../../app/store/store";
import { useDispatch, useSelector } from "react-redux";
// import { resetQueryHelperData } from "../../../../app/graphql/query-helper-slice";
// import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { BusinessUnitType, setAllBusinessUnits, setUserBusinessUnits } from "../../../login/login-slice";
import _ from 'lodash'
import { AdminLinkBusinessUnitButton } from "./admin-link-business-unit-button";

export function AdminBusinessUnits() {
    // const context: GlobalContextType = useContext(GlobalContext);
    const instance = DataInstancesMap.adminBusinessUnits; // Grid instance for Business Units
    const selectedData = useSelector((state: RootStateType) => state.queryHelper[instance])
    const dispatch: AppDispatchType = useDispatch()

    useEffect(() => {
        if (_.isEmpty(selectedData?.data)) {
            return
        }
        const allBusinessUnits: BusinessUnitType[] = selectedData.data.map((bu: any) => {
            return ({
                buCode: bu.buCode,
                buName: bu.buName,
                buId: bu.id
            })
        })
        dispatch(setAllBusinessUnits(allBusinessUnits))
        dispatch(setUserBusinessUnits(allBusinessUnits))
    }, [selectedData])

    return (
        <CompContentContainer title='Admin business units' CustomControl={() => <label className="text-primary-300">{Utils.getUserDetails()?.clientName}</label>}>
            <CompSyncFusionGridToolbar
                CustomControl={() =>
                    <div className="flex gap-2">
                        <AdminLinkBusinessUnitButton />
                        <AdminNewBusinessUnitButton dataInstance={instance} />
                    </div>
                }
                title="Business units already linked"
                isLastNoOfRows={true}
                instance={instance}
            />
            <CompSyncFusionGrid
                className="mt-4"
                aggregates={getAggregates()}
                columns={getColumns()}
                hasIndexColumn={true}
                height="calc(100vh - 258px)"
                instance={instance}
                sqlArgs={{ dbName: GLOBAL_SECURITY_DATABASE_NAME, clientId: Utils.getCurrentLoginInfo()?.userDetails?.clientId || 0 }}
                sqlId={SqlIdsMap.allBusinessUnits}
                // onDelete={handleOnDelete}
                onRemove={handleOnRemove}
                onEdit={handleOnEdit}
            />
        </CompContentContainer>
    );

    function getAggregates(): SyncFusionGridAggregateType[] {
        return [
            { columnName: 'buCode', type: 'Count', field: 'buCode', format: 'N0', footerTemplate: buCodeAggrTemplate }
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
            },
            {
                field: 'isActive',
                headerText: 'Active',
                type: 'boolean',
                width: 40,
            },
        ];
    }

    // async function handleOnDelete(id: string) {
    //     const q: any = GraphQLQueriesMap.genericUpdate(GLOBAL_SECURITY_DATABASE_NAME, {
    //         tableName: DatabaseTablesMap.BuM,
    //         deletedIds: [id]
    //     });
    //     Utils.showDeleteConfirmDialog(doDelete);
    //     async function doDelete() {
    //         try {
    //             await Utils.mutateGraphQL(q, GraphQLQueriesMapNames.genericUpdate);
    //             Utils.showSuccessAlertMessage({ message: Messages.messRecordDeleted, title: Messages.messSuccess }
    //                 , () => {
    //                     dispatch(resetQueryHelperData({ instance: instance }))
    //                     context.CompSyncFusionGrid[instance].loadData();
    //                 }
    //             );
    //         } catch (e: any) {
    //             Utils.showFailureAlertMessage({ message: e?.message || '', title: 'Failed' });
    //         }
    //     }
    // }

    async function handleOnEdit(props: any) {
        Utils.showHideModalDialogA({
            title: 'Edit business unit',
            isOpen: true,
            element: <AdminNewEditBusinessUnit
                buCode={props.buCode}
                buName={props.buName}
                isActive={props.isActive}
                id={props.id}
                loadData={() => { }}
            />
        });
    }

    async function handleOnRemove(item: any) {
        const id = item.id
        await Utils.doGenericUpdateQuery({
            dbName: GLOBAL_SECURITY_DATABASE_NAME,
            buCode: 'public',
            sqlId: SqlIdsMap.deleteBusinessUnit,
            sqlArgs: { id: id }
        })
        console.log(id)
    }

    function buCodeAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>);
    }
}
