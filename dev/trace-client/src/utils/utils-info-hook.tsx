import { shallowEqual, useSelector } from "react-redux"
import { BranchAddressType, BranchType, BusinessUnitType, currentBranchSelectorFn, currentBusinessUnitSelectorFn, currentFinYearSelectorFn, FinYearType, UserDetailsType } from "../features/login/login-slice"
import { GeneralSettingsType, UnitInfoType, Utils } from "./utils"
import { GlobalContext, GlobalContextType } from "../app/global-context"
import { useContext } from "react"
import { GraphQLQueriesMapNames } from "../app/maps/graphql-queries-map"

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

    // Parse branch address from jData
    const branchAddress: BranchAddressType | undefined = currentBranch?.jData?.address
    const branchGstin: string | undefined = currentBranch?.jData?.gstin

    const unitInfo: UnitInfoType = Utils.getUnitInfo() || {}
    const hasGstin: boolean = unitInfo.gstin ? true : false
    const genericUpdateQueryName: string = GraphQLQueriesMapNames.genericUpdate;
    const generalSettings: GeneralSettingsType = Utils.getGeneralSettings()
    const defaultGstRate = generalSettings?.defaultGstRate || 0
    const maxGstRate = generalSettings?.maxGstRate || 30
     const clientId = userDetails?.clientId || 0
    return ({
        branchId
        , branchCode
        , branchName
        , branchAddress    // New: Full address object
        , branchGstin      // New: Branch GSTIN
        , buCode
        , clientId
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
        , defaultGstRate
        , maxGstRate
    })
}