import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { CompSyncFusionGridToolbar } from "../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { IconOpen } from "../../../controls/icons/icon-open"
import { IconSelect } from "../../../controls/icons/icon-select"
// import { useUtilsInfo } from "../../../utils/utils-info-hook"

export function BankRecon() {
    const instance: string = DataInstancesMap.bankRecon
    // const { buCode
    //     , context
    //     , dbName
    //     , decodedDbParamsObject
    //     , decFormatter
    //     , finYearId
    //     , intFormatter
    // } = useUtilsInfo()

    return (<CompAccountsContainer>
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            CustomControl={() => <BankReconCustomControls />}
            minWidth="600px"
            title='Bank reconcillation'
            isPdfExport={false}
            isExcelExport={false}
            isCsvExport={false}
            isLastNoOfRows={false}
            instance={instance}
        />

        <CompSyncFusionGrid
            // aggregates={getAggregates()}
            className="mr-6 mt-4"
            columns={getColumns()}
            // dataSource={meta?.current?.transactions || []}
            hasIndexColumn={false}
            height="calc(100vh - 210px)"
            instance={instance}
            isLoadOnInit={false}
            minWidth="600px"
        // loadData={loadData}
        // onRowDataBound={onRowDataBound}
        />
    </CompAccountsContainer>)

    function getColumns(): SyncFusionGridColumnType[] {
        return ([
            {
                field: 'tranDate',
                headerText: 'Date',
                width: 100,
                textAlign: 'Left',
                type: 'string',

            }
        ])
    }
}

function BankReconCustomControls() {
    return (
        <div className="flex gap-8">
            <button type="button" className="px-5 py-2 text-sm font-medium text-white inline-flex items-center bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <IconSelect className="text-white w-6 h-6 mr-2"/>
                Select Bank
            </button>
            <button type="button" className="px-5 py-2 text-sm font-medium text-white inline-flex items-center bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <IconOpen />
                Opening</button>
            <button>Rearrange</button>
            <button>Submit</button>
        </div>
    )
}