import { shallowEqual, useSelector } from "react-redux"
import { BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, UserDetailsType } from "../features/login/login-slice"
import { Utils } from "./utils"
import { GlobalContext, GlobalContextType } from "../app/global-context"
import { useContext } from "react"
import { GraphQLQueriesMap } from "../app/graphql/maps/graphql-queries-map"

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
    const branchCode: string | undefined = currentBranch?.branchCode
    const genericUpdateQueryName: string = GraphQLQueriesMap.genericUpdate.name;
    return ({
        branchId
        , branchCode
        , buCode
        , context
        , dbName
        , decodedDbParamsObject
        , decFormatter
        , finYearId
        , genericUpdateQueryName
        , intFormatter
    })
}