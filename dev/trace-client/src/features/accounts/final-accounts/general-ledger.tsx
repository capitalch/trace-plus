import { useContext } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import { Utils } from "../../../utils/utils"
import { BranchType, BusinessUnitType, FinYearType, UserDetailsType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn } from "../../login/login-slice"
import { shallowEqual, useSelector } from "react-redux"
import { RootStateType } from "../../../app/store/store"
import { reduxCompSwitchSelectorFn } from "../../../controls/redux-components/redux-comp-slice"
import { ReduxComponentsInstances } from "../../../controls/redux-components/redux-components-instances"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"

export function GeneralLedger() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance: string = DataInstancesMap.generalLedger
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const { dbName, decodedDbParamsObject, } = userDetails

    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    // const isAllBranches: boolean = useSelector((state: RootStateType) => reduxCompSwitchSelectorFn(state, ReduxComponentsInstances.reduxCompSwitchTrialBalance), shallowEqual) || false
    const decFormatter = Utils.getDecimalFormatter()
    const intFormatter = Utils.getIntegerFormatter()

    return (<CompAccountsContainer CustomControl={() => <label className="text-xl text-primary-300 mt-1 font-medium">General Ledger</label>}>
        <div>GeneralLedger</div>
    </CompAccountsContainer>)
}