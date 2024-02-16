import { useDispatch, useSelector } from "react-redux"
// import { isSideBarOpenSelectorFn, setIsSideBarOpen, userTypeSelectorFn, } from "../../../app/store/app-slice"
import { AppDispatchType } from "../../../app/store/store"
import { UserTypesEnum } from "../../../utils/global-types-interfaces-enums"
import { SuperAdminMenuButton } from "./super-admin-menu-button"
import { AccountsMenuButton } from "./accounts-menu-button"
import { AdminMenuButton } from "./admin-menu-button"
import { isSideBarOpenSelectorFn, setIsSideBarOpen, setMenuItem, } from "../layouts-slice"
import { userTypeSelectorFn } from "../../login/login-slice"

export function useNavBar() {
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    const userTypeSelector: string = useSelector(userTypeSelectorFn)
    const dispatch: AppDispatchType = useDispatch()

    function getMenuShowHideClass() {
        return (isSideBarOpenSelector ? 'hidden' : 'block')
    }

    function getMenuButtons() {
        if (userTypeSelector === UserTypesEnum.SuperAdmin) {
            dispatch(setMenuItem({ menuItem: 'superAdmin' }))
            return (<div>
                <SuperAdminMenuButton />
            </div>)
        } else if (userTypeSelector === UserTypesEnum.Admin) {
            dispatch(setMenuItem({ menuItem: "accounts" }))
            return (<div className="flex">
                <AccountsMenuButton />
                <AdminMenuButton />
            </div>)
        } else {
            dispatch(setMenuItem({ menuItem: "accounts" }))
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