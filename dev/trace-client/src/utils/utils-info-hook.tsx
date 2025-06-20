import { shallowEqual, useSelector } from "react-redux"
import { BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, UserDetailsType } from "../features/login/login-slice"
import { UnitInfoType, Utils } from "./utils"
import { GlobalContext, GlobalContextType } from "../app/global-context"
import { useContext } from "react"
import { GraphQLQueriesMapNames } from "../app/graphql/maps/graphql-queries-map"

export function useUtilsInfo() {
    const context: GlobalContextType = useContext(GlobalContext)
    const userDetails: UserDetailsType = Utils.getUserDetails() || {}
    const currentBusinessUnit: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn, shallowEqual) || {}
    const currentFinYear: FinYearType | undefined = useSelector(currentFinYearSelectorFn, shallowEqual)
    const currentBranch: BranchType | undefined = useSelector(currentBranchSelectorFn,)
    const decFormatter = Utils.getDecimalFormatter()
    const intFormatter = Utils.getIntegerFormatter()
    const currentDateFormat: string = Utils.getCurrentDateFormat().replace('DD', 'dd').replace('YYYY', 'yyyy') || 'dd/MM/yyyy'
    const { dbName, decodedDbParamsObject, } = userDetails
    const buCode: string | undefined = currentBusinessUnit.buCode
    const finYearId: number | undefined = currentFinYear?.finYearId
    const branchId: number | undefined = currentBranch?.branchId
    const branchCode: string | undefined = currentBranch?.branchCode
    const branchName = currentBranch?.branchName
    const unitInfo: UnitInfoType = Utils.getUnitInfo() || {}
    const hasGstin: boolean = unitInfo.gstin ? true : false
    const genericUpdateQueryName: string = GraphQLQueriesMapNames.genericUpdate;
    
    return ({
        branchId
        , branchCode
        , branchName
        , buCode
        , context
        , currentDateFormat
        , currentFinYear
        , dbName
        , decodedDbParamsObject
        , decFormatter
        , finYearId
        , genericUpdateQueryName
        , hasGstin
        , intFormatter
    })
}