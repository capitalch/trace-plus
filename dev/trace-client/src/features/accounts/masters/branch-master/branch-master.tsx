import { useContext } from "react";
import { GlobalContext, GlobalContextType } from "../../../../app/global-context";
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map";
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container";
import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../app/store/store";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";

export function BranchMaster() {
    const context: GlobalContextType = useContext(GlobalContext);
    const instance = DataInstancesMap.branchMaster; // Grid instance for Business Units
    const dispatch: AppDispatchType = useDispatch()

    return (<CompAccountsContainer >
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            // CustomControl={() => <BankReconCustomControls instance={instance} meta={meta} />}
            minWidth="1000px"
            title='Branches'
            isPdfExport={true}
            isExcelExport={true}
            isCsvExport={true}
            isLastNoOfRows={true}
            instance={instance}
        />

        <CompSyncFusionGrid

            // aggregates={getAggregates()}
            className="mr-6 mt-4"
            columns={getColumns()}
            // dataSource={meta?.current?.rows || []}
            // editSettings={{
            //     allowEditing: true,
            //     mode: 'Batch',
            //     showConfirmDialog: false
            // }}
            hasIndexColumn={false}
            height="calc(100vh - 240px)"
            instance={instance}
            isLoadOnInit={true}
            // loadData={loadData}
            minWidth="1400px"
            
            sqlId={SqlIdsMap.getAllBranches}
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