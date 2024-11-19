import { MenuItemType, menuItemSelectorFn } from "../../layouts-slice";
import { useDispatch, useSelector } from "react-redux";
import { BusinessUnitType, LoginType, UserDetailsType, doLogout, setCurrentBusinessUnit, setUserBusinessUnits } from "../../../login/login-slice";
import { Utils } from "../../../../utils/utils";
import { UserTypesEnum } from "../../../../utils/global-types-interfaces-enums";
import { AppDispatchType } from "../../../../app/store/store";
import { useEffect } from "react";
import { Messages } from "../../../../utils/messages";
import { BusinessUnitsOptions } from "./business-units-options";
import { FinYearsBranchesOptions } from "./fin-years-branches-options";

export function AccountOptionsInfo() {
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)

    const dispatch: AppDispatchType = useDispatch()

    const toShowAccountOptions: boolean = menuItemSelector === 'accounts'
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()

    useEffect(() => {
        setBusinessUnit()
    }, [])

    return toShowAccountOptions && (<div className="ml-8 flex items-center bg-gray-500 rounded-full px-2 py-2">
        {/* Business units */}
        <BusinessUnitsOptions />
        {/* Fin years and branches */}
        <FinYearsBranchesOptions />
    </div>)


    function setBusinessUnit() {
        let bu: BusinessUnitType = {}
        const allBusinessUnits: BusinessUnitType[] = loginInfo.allBusinessUnits || []
        const userDetails: UserDetailsType = loginInfo?.userDetails || {}
        const userBusinessUnits: BusinessUnitType[] = loginInfo?.userBusinessUnits || []
        const lastUsedBuId: number | undefined = userDetails?.lastUsedBuId
        const userType: string | undefined = userDetails.userType

        if (userType === UserTypesEnum.Admin) {
            if (allBusinessUnits.length > 0) {
                if (lastUsedBuId) {
                    bu = allBusinessUnits.find(bu => bu.buId === lastUsedBuId) || {}
                } else {
                    bu = allBusinessUnits[0]
                }
                dispatch(setCurrentBusinessUnit(bu))
                dispatch(setUserBusinessUnits(allBusinessUnits))
                // fetchAccDetails()
            } else { // throw error and logout
                Utils.showAlertMessage('Information', Messages.messNoBusinessUnitsDefined)
                dispatch(doLogout())
            }
        }
        if (userType === UserTypesEnum.BusinessUser) {
            if (userBusinessUnits.length > 0) {
                if (lastUsedBuId) {
                    bu = userBusinessUnits.find(bu => bu.buId === lastUsedBuId) || {}
                } else {
                    bu = userBusinessUnits[0]
                }
                dispatch(setCurrentBusinessUnit(bu))
                // fetchAccDetails()
            } else {
                Utils.showAlertMessage('Information', Messages.messUserNotAssociatedWithBu)
                dispatch(doLogout())
            }
        }
    }

    // async function fetchAccDetails(){
    //     const userDetails: UserDetailsType = loginInfo.userDetails || {}
    //     const dbName: string = userDetails.dbName || ''
    //     const isExternalDb: boolean = userDetails.isExternalDb || false
    //     const dbParams: string | undefined = userDetails?.dbParams
    //     let dbParamsObject: any
    //     if (isExternalDb && dbParams) {
    //         const decodedDbParams = await Utils.decodeExtDbParams(dbParams)
    //         dbParamsObject = JSON.parse(decodedDbParams)
    //         dispatch(setDecodedDbParamsObject(dbParamsObject))
    //     }
    //     // If there is no current business unit then show message and logout
    //     if(!loginInfo?.currentBusinessUnit?.buCode){
    //         Utils.showFailureAlertMessage({title:Messages.messFailure,message:Messages.messNoBusinessUnitsDefined})
    //         dispatch(doLogout())
    //         return
    //     }
    //     try {
    //         const q = GraphQLQueriesMap.genericQuery(dbName, {
    //             buCode: loginInfo.currentBusinessUnit?.buCode,
    //             dbParams: dbParamsObject,
    //             sqlId: SqlIdsMap.getSettingsFinYearsBranches,
    //             sqlArgs: {}
    //         });
    //         const res: any = await Utils.queryGraphQL(q, GraphQLQueriesMap.genericQuery.name);
    //         console.log(res);
    //     } catch (e: any) {
    //         console.log(e?.message)
    //         Utils.showFailureAlertMessage({ title: Messages.messFailure, message: Messages.errFailFetchingDataFromAccounts })
    //         dispatch(doLogout())
    //     }
    // }
}