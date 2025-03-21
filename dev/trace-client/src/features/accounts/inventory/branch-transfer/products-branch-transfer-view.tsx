import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";

export function ProductsBranchTransferView() {
    const instance = DataInstancesMap.productsBranchTransfer
    const { buCode, branchId, context, currentDateFormat, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

    return (<div className="flex flex-col">
        <CompSyncFusionGridToolbar
            className='mt-2 mr-6'
            minWidth="600px"
            title='Branch Transfer View'
            isPdfExport={true}
            isExcelExport={true}
            isCsvExport={true}
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
            deleteColumnWidth={40}
            editColumnWidth={40}
            // hasIndexColumn={true}
            height="calc(100vh - 430px)"
            allowPaging={true}
            instance={instance}
            isLoadOnInit={true}
            minWidth="1400px"
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
            onPreview={handleOnPreview}
            sqlId={SqlIdsMap.getAllBranchTransferHeaders}
            sqlArgs={{ branchId: branchId, finYearId: finYearId }}
        />
    </div>)

    function getAggregates(): SyncFusionGridAggregateType[] {
        return ([
            {
                columnName: 'tranDate',
                type: 'Count',
                field: 'tranDate',
                format: 'N0',
                footerTemplate: (props: any) => <span className="text-xs">Count: {props.Count}</span>
            }
        ]);
    }

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'tranDate',
                headerText: 'Date',
                type: 'date',
                width: 80,
                format: currentDateFormat
            },
            {
                field: 'autoRefNo',
                headerText: 'Auto Ref No',
                type: 'string',
                width: 100
            },
            {
                field: "sourceBranchName",
                headerText: 'Src Branch',
                type: 'string',
                width: 100,
            },
            {
                field: "destBranchName",
                headerText: 'Dest Branch',
                type: 'string',
                width: 100,
            },
            {
                field: "userRefNo",
                headerText: 'User Ref',
                type: 'string',
                width: 80,
            },
            {
                field: "productDetails",
                headerText: 'Prod Details',
                type: 'string',
                width: 120,
            },
            {
                field: "serialNumbers",
                headerText: 'Ser No',
                type: 'string',
                width: 80,
            },
            {
                field: "productCodes",
                headerText: 'Prod Codes',
                type: 'string',
                width: 100,
            },
            {
                field: "amount",
                textAlign: 'Right',
                headerText: 'Amount',
                type: 'number',
                format: 'N2',
                width: 100,
            },
            {
                field: "remarks",
                headerText: 'Remarks',
                type: 'string',
                width: 100,
            },
            {
                field: "lineRemarks",
                headerText: 'Line Remarks',
                type: 'string',
                width: 100,
            }

        ]);
    }

    async function handleOnDelete(id: string) {
        Utils.showDeleteConfirmDialog(doDelete);
        async function doDelete() {
            try {
                await Utils.doGenericDelete({
                    buCode: buCode || '',
                    tableName: DatabaseTablesMap.TranH,
                    deletedIds: [id],
                });
                Utils.showSaveMessage();
                const loadData = context.CompSyncFusionGrid[instance].loadData;
                if (loadData) {
                    await loadData();
                }
            } catch (e: any) {
                console.log(e);
            }
        }
    }

    async function handleOnEdit() {

    }

    async function handleOnPreview() {

    }
}