import { useEffect } from "react"
import { UserTypesEnum } from "../../../app/globals"
import { SignalsStore, doLogout } from "../../../app/signals-store"
import { ChangePasswordIcon } from "../../../components/icons/change-password-icon"
import { ChangeUidIcon } from "../../../components/icons/change-uid-icon"
import { LogoutIcon } from "../../../components/icons/logout-icon"
import { SideMenu } from "../menus/side-menu"
import { accountsMenuData } from "../menus/accounts-menu-data"
import { ChangeUid } from "./change-uid"
import { ChangePassword } from "./change-password"
import { superAdminMenuData } from "../menus/super-admin-menu-data"
// import { AccountsMenu } from "../menus/accounts-menu"

function useNavbarContent() {
    const userType = SignalsStore.login.userType.value
    useEffect(() => {
        showMenuItems()
    })

    function getDropdownChildren() {
        if (SignalsStore.login.userType.value === 0) { // Super admin user
            return <div className="absolute z-10 mt-2 w-32 rounded-md shadow-lg bg-gray-50 right-0 border-[1px]">
                <div className="divide-y divide-primary-100" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <span onClick={handleLogout} className="flex items-center cursor-pointer hover:bg-gray-200 border-primary-50">
                        <LogoutIcon className='w-4 h-4 mx-4 my-2 text-secondary-700' />
                        <span>Log out</span>
                    </span>
                </div>
            </div>
        }

        if (SignalsStore.login.userType.value !== 0) { // Not super admin user
            return <div className="absolute z-10 mt-2 w-52 rounded-md shadow-lg bg-gray-50 right-0 border-[1px]">
                <div className="divide-y divide-primary-100" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <span onClick={handleChangeUid} className="flex items-center text-sm cursor-pointer hover:bg-gray-200">
                        <ChangeUidIcon className='w-4 h-4 mx-4 my-2 text-primary-500' />
                        <span>Change uid</span>
                    </span>
                    <span onClick={handleChangePassword} className="flex items-center text-sm cursor-pointer hover:bg-gray-200">
                        <ChangePasswordIcon className='w-4 h-4 mx-4 my-2 text-red-600' />
                        <span>Change password</span>
                    </span>
                    <span onClick={handleLogout} className="flex items-center text-sm cursor-pointer hover:bg-gray-200 border-primary-50">
                        <LogoutIcon className='w-4 h-4 mx-4 my-2 text-secondary-700' />
                        <span>Log out</span>
                    </span>
                </div>
            </div>
        }
    }

    function handleChangeUid() {
        SignalsStore.modalDialogA.title.value = 'Change uid'
        SignalsStore.modalDialogA.isOpen.value = true
        SignalsStore.modalDialogA.body.value = () => <ChangeUid />
        // SignalsStore.modalDialogA.toShowCloseButton.value = true
    }

    function handleChangePassword() {
        SignalsStore.modalDialogA.title.value = 'Change password'
        SignalsStore.modalDialogA.isOpen.value = true
        SignalsStore.modalDialogA.body.value = () => <ChangePassword />
        // SignalsStore.modalDialogA.toShowCloseButton.value = true
    }

    function getMenuShowHideClass() {
        return (SignalsStore.layouts.isSideBarOpen.value ? 'hidden' : 'block')
    }

    function handleLogout() {
        doLogout()
    }

    function handleShowSideBar() {
        SignalsStore.layouts.isSideBarOpen.value = true
    }

    function showMenuItems() {
        if (userType === UserTypesEnum.ADMIN) {
            SignalsStore.layouts.navbar.toShowAccountsMenuItem.value = true
            SignalsStore.layouts.navbar.toShowAdminMenuItem.value = true
            SignalsStore.layouts.navbar.toShowSuperAdminMenuItem.value = false

            SignalsStore.layouts.navbar.activeMenuItem.value = 'accounts'
            // SignalsStore.layouts.sidebar.currentMenuComponent.value = <AccountsMenu />
            SignalsStore.layouts.sidebar.currentMenuComponent.value = <SideMenu menuData={accountsMenuData} />
        }
        if (userType === UserTypesEnum.SUPER_ADMIN) {
            SignalsStore.layouts.navbar.toShowAccountsMenuItem.value = false
            SignalsStore.layouts.navbar.toShowAdminMenuItem.value = false
            SignalsStore.layouts.navbar.toShowSuperAdminMenuItem.value = true

            SignalsStore.layouts.navbar.activeMenuItem.value = 'superAdmin'
            SignalsStore.layouts.sidebar.currentMenuComponent.value = <SideMenu menuData={superAdminMenuData} />
        }
        if (userType === UserTypesEnum.BUSINESS_USER) {
            SignalsStore.layouts.navbar.toShowAccountsMenuItem.value = true
            SignalsStore.layouts.navbar.toShowAdminMenuItem.value = false
            SignalsStore.layouts.navbar.toShowSuperAdminMenuItem.value = false

            SignalsStore.layouts.navbar.activeMenuItem.value = 'accounts'
            // SignalsStore.layouts.sidebar.currentMenuComponent.value = <AccountsMenu />
            SignalsStore.layouts.sidebar.currentMenuComponent.value = <SideMenu menuData={accountsMenuData} />
        }
    }

    return ({ getDropdownChildren, getMenuShowHideClass, handleShowSideBar, showMenuItems })

}
export { useNavbarContent }