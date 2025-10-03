import { useDispatch, useSelector } from "react-redux"
import { AppDispatchType } from "../../../app/store"
import { UserTypesEnum } from "../../../utils/global-types-interfaces-enums"
import { SuperAdminMenuButton } from "./super-admin-menu-button"
import { AccountsMenuButton } from "./accounts-menu-button"
import { AdminMenuButton } from "./admin-menu-button"
import { isSideBarOpenSelectorFn, setIsSideBarOpen, setMenuItem, MenuItemType, menuItemSelectorFn } from "../layouts-slice"
import { userTypeSelectorFn } from "../../login/login-slice"
import { useEffect } from "react"
import { AccountOptionsInfo } from "./account-options-info/account-opions-info"
import { useMediaQuery } from "react-responsive"

export function useNavBar() {
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    const userTypeSelector: any = useSelector(userTypeSelectorFn)
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const dispatch: AppDispatchType = useDispatch()

    // Responsive breakpoints
    const isMobile = useMediaQuery({ query: '(max-width: 639px)' })
    const isTablet = useMediaQuery({ query: '(min-width: 640px) and (max-width: 1279px)' })
    const isDesktop = useMediaQuery({ query: '(min-width: 1280px)' })

    useEffect(() => {
        // used the following code so that SideBar component is drawn at the end of this component render
        // If dispatch is used inside the render block then react warning appears. Always try to use dispath in useFeect hook, because it can render another component
        if (userTypeSelector === UserTypesEnum.SuperAdmin) {
            dispatch(setMenuItem({ menuItem: 'superAdmin' }))
        } else if (userTypeSelector === UserTypesEnum.Admin) {
            dispatch(setMenuItem({ menuItem: "accounts" }))
        } else {
            dispatch(setMenuItem({ menuItem: "accounts" }))
        }
    }, [dispatch, userTypeSelector])

    function getBuFyBranchInfo() {
        let ret = <></>
        if ([UserTypesEnum.Admin, UserTypesEnum.BusinessUser].includes(userTypeSelector)) {
            ret = <AccountOptionsInfo />
        }
        return (ret)
    }

    function getMenuShowHideClass() {
        // On large screens, hide button when sidebar is open
        // On small/medium screens, always show button
        if (isDesktop) {
            return isSideBarOpenSelector ? 'hidden' : 'block'
        }
        return 'block'
    }

    function getMenuButtons() {
        // On mobile, only show active menu button
        if (isMobile) {
            if (userTypeSelector === UserTypesEnum.SuperAdmin) {
                return (<div><SuperAdminMenuButton /></div>)
            } else if (userTypeSelector === UserTypesEnum.Admin) {
                // Show only the active menu button on mobile
                return (<div>
                    {menuItemSelector === 'accounts' ? <AccountsMenuButton /> : <AdminMenuButton />}
                </div>)
            } else {
                return (<div><AccountsMenuButton /></div>)
            }
        }

        // On tablet and desktop, show all menu buttons
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

    function handleToggleSideBar() {
        dispatch(setIsSideBarOpen({ isSideBarOpen: !isSideBarOpenSelector }))
    }
    return ({ getBuFyBranchInfo, getMenuButtons, getMenuShowHideClass, handleToggleSideBar, isMobile, isTablet, isDesktop })
}