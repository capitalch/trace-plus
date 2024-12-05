import { useContext, useEffect } from "react"
import { GlobalContext, GlobalContextType } from "../../../app/global-context"
import { DataInstancesMap } from "../../../app/graphql/maps/data-instances-map"
import { BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, UserDetailsType } from "../../login/login-slice"
import { Utils } from "../../../utils/utils"
import { shallowEqual, useSelector } from "react-redux"
import { reduxCompSwitchSelectorFn } from "../../../controls/components/redux-components/redux-comp-slice"
import { RootStateType } from "../../../app/store/store"
import { CompAccountsContainer } from "../../../controls/components/comp-accounts-container"
import { ReduxCompSwitch } from "../../../controls/components/redux-components/redux-comp-switch"

export function BalanceSheet() {
    const context: GlobalContextType = useContext(GlobalContext)
    const instance: string = DataInstancesMap.balanceSheet
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    // const { dbName, decodedDbParamsObject, } = userDetails

    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    const isAllBranches: boolean = useSelector((state: RootStateType) => reduxCompSwitchSelectorFn(state, instance), shallowEqual) || false
    const decFormatter = Utils.getDecimalFormatter()
    const intFormatter = Utils.getIntegerFormatter()

    useEffect(() => {
        const loadData = context.CompSyncFusionTreeGrid[instance]?.loadData
        if (loadData) {
            loadData()
        }
    }, [currentBusinessUnit, currentFinYear, currentBranch, isAllBranches])


    return (<CompAccountsContainer>
        {/* Header */}
        <div className="flex items-center mt-4">
            <label className="font-medium">Balance sheet</label>
            <ReduxCompSwitch className="mt-1" instance={DataInstancesMap.balanceSheet} leftLabel="This branch" rightLabel="All branches" />
        </div>
    </CompAccountsContainer>)
}