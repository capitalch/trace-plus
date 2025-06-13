import { MenuItemType, menuItemSelectorFn } from "../../layouts-slice";
import { useSelector } from "react-redux";
// import { BusinessUnitType, LoginType, UserDetailsType, doLogout, setCurrentBusinessUnit, setUserBusinessUnits } from "../../../login/login-slice";
// import { Utils } from "../../../../utils/utils";
// import { UserTypesEnum } from "../../../../utils/global-types-interfaces-enums";
// import { AppDispatchType } from "../../../../app/store/store";
// import { useEffect } from "react";
// import { Messages } from "../../../../utils/messages";
import { BusinessUnitsOptions } from "./business-units-options";
import { FinYearsBranchesOptions } from "./fin-years-branches-options";

export function AccountOptionsInfo() {
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    // const dispatch: AppDispatchType = useDispatch()
    const toShowAccountOptions: boolean = menuItemSelector === 'accounts'
    // const loginInfo: LoginType = Utils.getCurrentLoginInfo()

    // useEffect(() => {
    //     // setBusinessUnit()
    // }, [])

    return toShowAccountOptions && (<div className="ml-8 flex items-center bg-gray-500 rounded-full px-2 py-2">
        {/* Business units */}
        <BusinessUnitsOptions />
        {/* Fin years and branches */}
        <FinYearsBranchesOptions />
    </div>)
}