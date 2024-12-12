import { shallowEqual, useSelector } from "react-redux"
import { BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, UserDetailsType } from "../features/login/login-slice"
import { Utils } from "./utils"
import { GlobalContext, GlobalContextType } from "../app/global-context"
import { useContext } from "react"

export function useUtilsInfo() {
    const context: GlobalContextType = useContext(GlobalContext)
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn, shallowEqual)
    const decFormatter = Utils.getDecimalFormatter()
    const intFormatter = Utils.getIntegerFormatter()
    const { dbName, decodedDbParamsObject, } = userDetails

    const buCode: string | undefined = currentBusinessUnit.buCode
    const finYearId: number | undefined = currentFinYear?.finYearId
    const branchId: number | undefined = currentBranch?.branchId
    return ({
        branchId
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        , decFormatter
        , finYearId
        , intFormatter
    })
}