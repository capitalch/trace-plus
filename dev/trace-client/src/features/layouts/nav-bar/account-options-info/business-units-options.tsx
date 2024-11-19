import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { BusinessUnitType, currentBusinessUnitSelectorFn } from "../../../login/login-slice"
import { useSelector } from "react-redux"
import { Utils } from "../../../../utils/utils"
import { BusinessUnitsListModal } from "./business-units-list-modal"
// import { useCallback, useEffect, useMemo, } from "react"
// import { RootStateType } from "../../../../app/store/store"

export function BusinessUnitsOptions() {
    // const currentBusinessUnitSelectorFn: any = useCallback(() => (state: RootStateType) => state.login.currentBusinessUnit, [])
    const currentBusinessUnitSelector: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn) || {}
    // const cbu: any = useCallback(() => currentBusinessUnitSelector, [currentBusinessUnitSelectorFn])
    // useEffect(() => {
    //     console.log(currentBusinessUnitSelector)
    // }, [currentBusinessUnitSelector])
    return (
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
    )

    function handleOnClickBusinessUnit() {
        Utils.showHideModalDialogA({
            title: "Select a business unit",
            isOpen: true,
            element: <BusinessUnitsListModal />,
        })
    }
}