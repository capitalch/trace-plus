import { MenuItemType, menuItemSelectorFn } from "../../layouts-slice";
import { useSelector } from "react-redux";
import { BusinessUnitsOptions } from "./business-units-options";
import { FinYearsBranchesOptions } from "./fin-years-branches-options";
import { useMediaQuery } from "react-responsive";

export function AccountOptionsInfo() {
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const toShowAccountOptions: boolean = menuItemSelector === 'accounts'
    const isMobile = useMediaQuery({ query: '(max-width: 639px)' })

    return toShowAccountOptions && (
        <div className={`flex items-center ${isMobile ? 'ml-1 px-1 py-1' : 'ml-4 sm:ml-6 md:ml-8 px-2 py-2'} bg-gray-500 rounded-full gap-1`}>
            {/* Business units */}
            <BusinessUnitsOptions />
            {/* Fin years and branches */}
            <FinYearsBranchesOptions />
        </div>
    )
}