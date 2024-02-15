import { useDispatch, useSelector } from "react-redux"
import { isSideBarOpenSelectorFn, setIsSideBarOpen, userTypeSelectorFn, } from "../../../app/store/app-slice"
import { AppDispatchType } from "../../../app/store/store"
import { UserTypesEnum } from "../../../utils/global-types-interfaces-enums"
import { SuperAdminMenuButton } from "./super-admin-menu-button"
import { AccountsMenuButton } from "./accounts-menu-button"
import { AdminMenuButton } from "./admin-menu-button"
// import { AdminMenuButton } from "./admn-menu-button"
// import { useEffect } from "react"
// import { UserTypesEnum } from "../../../utils/global-types-interfaces-enums"

export function useTopNavBar() {
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    const userTypeSelector: string = useSelector(userTypeSelectorFn)
    const dispatch: AppDispatchType = useDispatch()

    function getMenuShowHideClass() {
        return (isSideBarOpenSelector ? 'hidden' : 'block')
    }

    function getMenuButtons() {
        if (userTypeSelector === UserTypesEnum.SuperAdmin) {
            return (<div>
                <SuperAdminMenuButton />
            </div>)
        } else if (userTypeSelector === UserTypesEnum.Admin) {
            return (<div className="flex">
                <AccountsMenuButton />
                <AdminMenuButton />
            </div>)
        } else {
            return (<div>
                <AccountsMenuButton />
            </div>)
        }
    }

    function handleShowSideBar() {
        dispatch(setIsSideBarOpen({ isSideBarOpen: true }))
    }
    return ({ getMenuButtons, getMenuShowHideClass, handleShowSideBar })
}