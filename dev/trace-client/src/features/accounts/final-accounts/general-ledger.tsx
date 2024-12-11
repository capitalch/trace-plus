import { useContext } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import { Utils } from "../../../utils/utils"
import { BranchType, BusinessUnitType, FinYearType, UserDetailsType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn } from "../../login/login-slice"
import { shallowEqual, useSelector } from "react-redux"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { LedgerSubledger } from "../../../controls/redux-components/ledger-subledger"
import { SqlIdsMap } from "../../../app/graphql/maps/sql-ids-map"
import { CompSwitch } from "../../../controls/redux-components/comp-switch"
import { CompSyncFusionGrid } from "../../../controls/components/generic-syncfusion-grid/comp-syncfusion-grid"

export function GeneralLedger() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance: string = DataInstancesMap.generalLedger
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const { dbName, decodedDbParamsObject, } = userDetails

    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    const decFormatter = Utils.getDecimalFormatter()
    const intFormatter = Utils.getIntegerFormatter()

    return (<CompAccountsContainer >
        <div className="flex items-center">
            <label className="text-xl font-medium">General ledger</label>
            <CompSwitch leftLabel="All branches" instance={instance} className="ml-auto" />
            <LedgerSubledger
                className="mt-4 w-64 ml-auto mr-6"
                heading="All accounts"
                isAllBranches={false}
                showAccountBalance={true}
                sqlId={SqlIdsMap.getLedgerLeafAccounts} />
        </div>
        {/* <CompSyncFusionGrid
        
        /> */}
    </CompAccountsContainer>)
}