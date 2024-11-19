// import { useSelector } from "react-redux"
import { IconMinusCircle } from "../../../../controls/icons/icon-minus-circle"
import { IconPlusCircle } from "../../../../controls/icons/icon-plus-circle"
// import { BusinessUnitType, currentBusinessUnitSelectorFn } from "../../../login/login-slice"
// import { useCallback, useEffect, useMemo } from "react"
// import { RootStateType } from "../../../../app/store/store"

export function FinYearsBranchesOptions() {
    // const selectedBu: BusinessUnitType = useSelector(currentBusinessUnitSelectorFn) || {}
    // const currentBusinessUnitSelector = useMemo(selectedBu,[selectedBu])
    // useEffect(()=>{
    //     if(currentBusinessUnitSelector.buCode){
    //         console.log(currentBusinessUnitSelector.buCode)
    //     }
    // },[currentBusinessUnitSelector])
    return (
        <div className="flex items-center">
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

            {/* Branches */}
            <button className="w-70 ml-4 flex h-8 items-center rounded-full bg-gray-200 px-2 py-2 text-gray-800 shadow">
                {/* Badge section */}
                <div className="rounded-full bg-blue-500 px-1 py-1 text-xs font-bold text-white">
                    BR
                </div>
                {/* Text section */}
                <span className="ml-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">Head office</span>
            </button>
        </div>
    )
}