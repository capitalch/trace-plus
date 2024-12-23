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
import { bankReconSelectedBankFn, SelectedBankType } from "../../accounts-slice"
import { Messages } from "../../../../utils/messages"
import { BankReconCustomControls } from "./bank-recon-custom-controls"
// import { useUtilsInfo } from "../../../utils/utils-info-hook"

export function BankRecon() {
    const instance: string = DataInstancesMap.bankRecon
    const dispatch: AppDispatchType = useDispatch()
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn) || Utils.getRunningFinYear()
    const selectedData: any = useSelector((state: RootStateType) => state.queryHelper[instance]?.data, shallowEqual)
    const selectedBank: SelectedBankType = useSelector(bankReconSelectedBankFn)

    const { buCode
        // , context
        , dbName
        , decodedDbParamsObject
        // , decFormatter
        , finYearId
        // , intFormatter
    } = useUtilsInfo()

    return (<CompAccountsContainer MiddleCustomControl={() => getHeader()}>
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

    function getHeader() {
        let ret: any = undefined
        if (selectedBank.accName) {
            ret = <label className="font-bold text-blue-500 text-lg">{selectedBank.accName}</label>
        } else {
            ret = <label className="font-bold text-red-500 text-xl">{Messages.messSelectBank}</label>
        }
        return (ret)
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