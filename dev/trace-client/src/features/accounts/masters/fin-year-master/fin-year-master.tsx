import { useDispatch } from "react-redux";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { AppDispatchType } from "../../../../app/store";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { Utils } from "../../../../utils/utils";
import { DatabaseTablesMap } from "../../../../app/maps/database-tables-map";
import { changeAccSettings } from "../../accounts-slice";
import { NewEditFinYear } from "./new-edit-fin-year";
import { NewFinYearButton } from "./new-fin-year-button";
import { useEffect } from "react";

export function FinYearMaster() {
    const instance = DataInstancesMap.finYearMaster; // Grid instance for Business Units
    const dispatch: AppDispatchType = useDispatch()
    const { buCode, context, dbName, decodedDbParamsObject, } = useUtilsInfo()
    const dateFormat: string = Utils.getCurrentDateFormat()

    useEffect(() => {
        const loadData = context?.CompSyncFusionGrid[instance]?.loadData
        if (loadData && buCode) {
            loadData()
        }
    }, [buCode])

    return (<CompAccountsContainer >
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            CustomControl={() => <NewFinYearButton />}
            minWidth="1000px"
            title='Financial years'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            isLastNoOfRows={false}
            instance={instance}
        />

        <CompSyncFusionGrid
            aggregates={getAggregates()}
            buCode={buCode}
            className="mr-6 mt-4"
            columns={getColumns()}
            dbName={dbName}
            dbParams={decodedDbParamsObject}
            hasIndexColumn={true}
            height="calc(100vh - 238px)"
            instance={instance}
            // isLoadOnInit={false}
            minWidth="1400px"
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
            sqlId={SqlIdsMap.getFinYears}
        />
    </CompAccountsContainer>)

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'id',
                type: 'Count',
                field: 'id',
                format: 'N0',
                footerTemplate: finYearAggrTemplate
            }
        ])
    }

    function finYearAggrTemplate(props: any) {
        return (<span className="text-xs">Count: {props.Count}</span>)
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'id',
                headerText: 'Financial year',
                type: 'number',
                width: 100,
            },
            {
                field: 'startDate',
                format: dateFormat.toLowerCase().replace('mm', 'MM'),
                headerText: 'Start date',
                type: 'date',
                width: 80,
            },
            {
                field: 'endDate',
                format: dateFormat.toLowerCase().replace('mm', 'MM'),
                headerText: 'End date',
                type: 'date',
                // width: 40,
            },
        ])
    }

    async function handleOnDelete(id: string | number) {
        Utils.showDeleteConfirmDialog(doDelete)
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.FinYearM,
                    deletedIds: [id],
                })
                Utils.showSaveMessage()
                dispatch(changeAccSettings())
                const loadData = context.CompSyncFusionGrid[instance].loadData
                if (loadData) {
                    await loadData()
                }
            } catch (e: any) {
                console.log(e)
            }
        }
    }

    async function handleOnEdit(props: any) {
        Utils.showHideModalDialogA({
            title: 'Edit financial year',
            isOpen: true,
            element: <NewEditFinYear
                id={props.id}
                startDate={props.startDate}
                endDate={props.endDate}
            />
        });
    }
}