import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import { Utils } from "../../../utils/utils"
import { BranchType, BusinessUnitType, FinYearType, UserDetailsType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn } from "../../login/login-slice"
import { shallowEqual, useSelector } from "react-redux"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { LedgerSubledger } from "../../../controls/redux-components/ledger-subledger"
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map"
import { CompSwitch } from "../../../controls/redux-components/comp-switch"
import { CompSyncFusionGrid } from "../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid"
import { selectCompSwitchStateFn } from "../../../controls/redux-components/comp-slice"
import { RootStateType } from "../../../app/store/store"
import { useUtilsInfo } from "../../../utils/utils-info-hook"

export function GeneralLedger() {
    // const context: GlobalContextType = useContext(GlobalContext)
    const instance: string = DataInstancesMap.generalLedger
    // const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    // const { dbName, decodedDbParamsObject, } = userDetails

    // const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    // const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    // const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    // const decFormatter = Utils.getDecimalFormatter()
    // const intFormatter = Utils.getIntegerFormatter()

    const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, instance))
    const {
        branchId
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        , decFormatter
        , finYearId
        , intFormatter
    } = useUtilsInfo()

    return (<CompAccountsContainer >
        <div className="flex items-center">
            <label className="text-lg font-medium text-primary-400">General ledger</label>
            <CompSwitch leftLabel="All branches" instance={instance} className="ml-auto" />
            <LedgerSubledger
                className="mt-4 w-64 ml-auto mr-6"
                heading="All accounts"
                isAllBranches={isAllBranches}
                showAccountBalance={true}
                sqlId={SqlIdsMap.getLedgerLeafAccounts} />
        </div>
        {/* <CompSyncFusionGrid
        
        /> */}
    </CompAccountsContainer>)
}