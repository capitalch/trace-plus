import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconMinusCircle } from "../../../../controls/icons/icon-minus-circle";
import { IconPlusCircle } from "../../../../controls/icons/icon-plus-circle";
import { MenuItemType, menuItemSelectorFn } from "../../layouts-slice";
import { useDispatch, useSelector } from "react-redux";
import { BusinessUnitType, LoginType, UserDetailsType, currentBusinessUnitSelectorFn, doLogout, setCurrentBusinessUnit, setCurrentBusinessUnits } from "../../../login/login-slice";
import { Utils } from "../../../../utils/utils";
import { UserTypesEnum } from "../../../../utils/global-types-interfaces-enums";
import { AppDispatchType } from "../../../../app/store/store";
import { useEffect } from "react";
import { Messages } from "../../../../utils/messages";
import { BusinessUnitsListModal } from "./business-units-list-modal";

export function AccountOptionsInfo() {
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const currentBusinessUnitSelector: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn) || {}
    const dispatch: AppDispatchType = useDispatch()

    const toShowAccountOptions: boolean = menuItemSelector === 'accounts'
    const loginInfo: LoginType = Utils.getCurrentLoginInfo()

    useEffect(() => {
        setBusinessUnit()
    }, [])


    return toShowAccountOptions && (<div className="ml-8 flex items-center bg-gray-500 rounded-full px-2 py-2">
        {/* Business unit */}
        <TooltipComponent content={currentBusinessUnitSelector?.buName || ''}>
            <button onClick={handleOnClickBusinessUnit} className="flex h-8 w-50 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow">

                {/* Badge section */}
                <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                    BU
                </div>
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                    {currentBusinessUnitSelector?.buCode || ''}
                </span>
            </button>
        </TooltipComponent>
        {/* financial year */}
        <div className="ml-4 flex items-center">
            {/* Plus */}
            <button>
                <IconPlusCircle className="h-7 w-7" />
            </button>
            {/* Financial year */}
            <button className="w-70 ml-1 flex h-8 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow">
                {/* Badge section */}
                <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                    FY
                </div>
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">2024 (01/04/2024 - 31/03/2025)</span>
            </button>
            {/* minus */}
            <button className="ml-1">
                <IconMinusCircle className="h-7 w-7" />
            </button>
        </div>

        {/* Branch */}
        <button className="w-70 ml-4 flex h-8 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow">
            {/* Badge section */}
            <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                BR
            </div>
            {/* Text section */}
            <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">Head office</span>
        </button>
    </div>)

    function handleOnClickBusinessUnit() {
        Utils.showHideModalDialogA({
            title: "Select a business unit",
            isOpen: true,
            element: <BusinessUnitsListModal />,
        })
    }

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
                dispatch(setCurrentBusinessUnits(allBusinessUnits))
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
                dispatch(setCurrentBusinessUnits(userBusinessUnits))
            } else {
                Utils.showAlertMessage('Information', Messages.messUserNotAssociatedWithBu)
                dispatch(doLogout())
            }
        }
    }
}