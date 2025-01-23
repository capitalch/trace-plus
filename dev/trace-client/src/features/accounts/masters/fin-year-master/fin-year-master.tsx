import { useDispatch } from "react-redux";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { AppDispatchType } from "../../../../app/store/store";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";

export function FinYearMaster() {
    const instance = DataInstancesMap.finYearsMaster; // Grid instance for Business Units
    const dispatch: AppDispatchType = useDispatch()
    const { buCode, dbName, decodedDbParamsObject, } = useUtilsInfo()
    
    return (<CompAccountsContainer >
            <CompSyncFusionGridToolbar className='mt-2 mr-6'
                // CustomControl={() => <NewBranchButton />}
                minWidth="1000px"
                title='Branches'
                isPdfExport={false}
                isExcelExport={false}
                isCsvExport={false}
                isLastNoOfRows={false}
                instance={instance}
            />
    
            <CompSyncFusionGrid
                // aggregates={getAggregates()}
                buCode={buCode}
                className="mr-6 mt-4"
                columns={getColumns()}
                dbName={dbName}
                dbParams={decodedDbParamsObject}
                hasIndexColumn={true}
                height="calc(100vh - 250px)"
                instance={instance}
                isLoadOnInit={true}
                minWidth="1400px"
                // onDelete={handleOnDelete}
                // onEdit={handleOnEdit}
                // sqlId={SqlIdsMap.getAllBranches}
            />
        </CompAccountsContainer>)

        function getColumns(): SyncFusionGridColumnType[] {
                return ([
                    {
                        field: 'branchName',
                        headerText: 'Branch name',
                        type: 'string',
                        width: 200,
                    },
                    {
                        field: 'branchCode',
                        headerText: 'Branch code',
                        type: 'string',
                        width: 80,
                    },
                    {
                        field: 'remarks',
                        headerText: 'Remarks',
                        type: 'string',
                        // width: 40,
                    },
                ])
            }
}