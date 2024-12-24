import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { DataInstancesMap } from "../../../../app/graphql/maps/data-instances-map"
// import { useQueryHelper } from "../../../app/graphql/query-helper-hook"
import { AppDispatchType, RootStateType } from "../../../../app/store/store"
import { CompAccountsContainer } from "../../../../controls/components/comp-accounts-container"
import { CompSyncFusionGrid, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid"
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar"
import { IconArrange } from "../../../../controls/icons/icon-arrange"
import { IconOpen } from "../../../../controls/icons/icon-open"
import { IconSelect } from "../../../../controls/icons/icon-select"
import { IconSubmit } from "../../../../controls/icons/icon-submit"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { Utils } from "../../../../utils/utils"
import { currentFinYearSelectorFn, FinYearType } from "../../../login/login-slice"
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map"
import { SelectBankModal } from "./select-bank-modal"
// import { useUtilsInfo } from "../../../utils/utils-info-hook"

export function BankRecon() {
    const instance: string = DataInstancesMap.bankRecon
    const dispatch: AppDispatchType = useDispatch()
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn) || Utils.getRunningFinYear()
    const selectedData: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.data, shallowEqual)
    
    const { buCode
        // , context
        , dbName
        , decodedDbParamsObject
        // , decFormatter
        , finYearId
        // , intFormatter
    } = useUtilsInfo()

    

    return (<CompAccountsContainer MiddleCustomControl={()=><label>Bank</label>}>
        <CompSyncFusionGridToolbar className='mt-2 mr-6'
            CustomControl={() => <BankReconCustomControls instance={instance} />}
            minWidth="1000px"
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
            dataSource={selectedData || []}
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

    async function loadData() {
        const res: any = await Utils.doGenericQuery({
            buCode: buCode || '',
            dbName: dbName || '',
            dbParams: decodedDbParamsObject || {},
            instance: instance,
            sqlArgs: {
                // accId: finalAccId,
                finYearId: finYearId,
            },
            sqlId: SqlIdsMap.getAccountLedger
        })
        console.log(res)
        // const jsonResult = res?.[0]?.jsonResult
        // const opBals: any[] = jsonResult?.opBalance || []
        
    }
}

function BankReconCustomControls({ instance }: BankReconCustomControlType) {
    console.log(instance)
    return (
        <div className="flex gap-4 mr-4 flex-wrap">
            <button type="button" onClick={handleSelectBank}
                className="px-5 py-2 text-md font-medium text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <IconSelect className="text-white w-6 h-6 mr-2" />
                Select Bank
            </button>
            <button type="button" className="px-5 py-2 text-md font-medium text-white inline-flex items-center bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                <IconOpen className="text-white w-6 h-6 mr-2" />
                Opening</button>
            <button type="button" className="px-5 py-2 text-md font-medium text-white inline-flex items-center bg-secondary-500 hover:bg-secondary-800 focus:ring-4 focus:outline-none focus:ring-secondary-300 rounded-lg text-center dark:bg-secondary-600 dark:hover:bg-secondary-700 dark:focus:ring-secondary-800">
                <IconArrange className="text-white w-6 h-6 mr-2" /> Rearrange
            </button>
            <button type="button" className="px-5 py-2 text-md font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800">
                <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit</button>
        </div>
    )

    function handleSelectBank(){
        Utils.showHideModalDialogA({
            className: 'ml-2',
            title: "Select a bank",
            isOpen: true,
            element: <SelectBankModal />,
        })
    }
}

type BankReconCustomControlType = {
    instance: string
}


// const { loadData, loading } = useQueryHelper({
//     instance: instance,
//     dbName: dbName,
//     isExecQueryOnLoad: false,
//     getQueryArgs: () => ({
//         buCode: buCode, 
//         dbParams: decodedDbParamsObject, 
//         sqlArgs: {
//             finYearId:finYearId
//         }
//     })
// })