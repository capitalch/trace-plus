import { Outlet } from "react-router-dom"
import clsx from "clsx"
import { MenuUnfoldIcon } from "../../../components/icons/menu-unfold-icon"
import { ButtonDropdown } from "../../../components/widgets/button-dropdown"
import { SignalsStore } from "../../../app/signals-store"
import { useNavbarContent } from "./navbar-content-hook"
import { NavbarMenuItemType, } from '../../../app/globals'
// import { AccountsMenu } from "../menus/accounts-menu"
import { SideMenu } from "../menus/side-menu"
import { accountsMenuData } from "../menus/accounts-menu-data"

function NavbarContent() {
    const { getDropdownChildren, getMenuShowHideClass, handleShowSideBar } = useNavbarContent()

    return (<div className="flex flex-col w-full">

        {/* <Navbar /> */}
        <div className="flex items-center justify-between h-12 bg-primary-500">
            <div className="flex items-center prose">
                <span onClick={handleShowSideBar} className={clsx(getMenuShowHideClass(),
                    'text-white mx-2 bg-transparent cursor-pointer hover:bg-primary-600  hover:ring-white hover:ring-1 rounded-lg'
                )}>
                    <MenuUnfoldIcon className='' />
                </span>
                <div className="flex gap-[1px]">
                    {SignalsStore.layouts.navbar.toShowAccountsMenuItem.value ? <AccountsMenuButton /> : ''}
                    {SignalsStore.layouts.navbar.toShowAdminMenuItem.value ? <AdminMenuButton /> : ''}
                    {SignalsStore.layouts.navbar.toShowSuperAdminMenuItem.value ? <SuperAdminMenuButton /> : ''}
                </div>
            </div>
            <ButtonDropdown>{getDropdownChildren()}</ButtonDropdown>
        </div>

        {/* Content */}
        <div className="h-full bg-white">
            <Outlet />
        </div>
    </div>)

}

export { NavbarContent }

function AccountsMenuButton({ className }: { className?: string }) {
    const activeMenuItem: NavbarMenuItemType = SignalsStore.layouts.navbar.activeMenuItem.value
    const cls: string = (activeMenuItem === 'accounts') ? 'bg-primary-600' : 'bg-primary-500'
    return (<span onClick={handleClick} className={clsx(className, cls, "px-10 py-3 text-gray-200 hover:text-white hover:bg-primary-600 hover:cursor-pointer active:bg-primary-400")}>
        Accounts
    </span>)
    function handleClick() {
        SignalsStore.layouts.navbar.activeMenuItem.value = 'accounts'
        // SignalsStore.layouts.sidebar.currentMenuComponent.value= <AccountsMenu />
        SignalsStore.layouts.sidebar.currentMenuComponent.value = <SideMenu menuData={accountsMenuData} />
    }
}
export { AccountsMenuButton }

function AdminMenuButton({ className }: { className?: string }) {
    const activeMenuItem: NavbarMenuItemType = SignalsStore.layouts.navbar.activeMenuItem.value
    const cls: string = (activeMenuItem === 'admin') ? 'bg-primary-600' : 'bg-primary-500'
    return (<span onClick={handleClick} className={clsx(className, cls, "px-10 py-3  text-gray-200 hover:text-white hover:bg-primary-600 hover:cursor-pointer active:bg-primary-400")}>
        Administration
    </span>)

    function handleClick() {
        SignalsStore.layouts.navbar.activeMenuItem.value = 'admin'
    }
}

function SuperAdminMenuButton({ className }: { className?: string }) {
    const activeMenuItem: NavbarMenuItemType = SignalsStore.layouts.navbar.activeMenuItem.value
    const cls: string = (activeMenuItem === 'superAdmin') ? 'bg-primary-600' : 'bg-primary-500'
    return (<span onClick={handleClick} className={clsx(className, cls, "px-10 py-3   text-gray-200 hover:text-white hover:bg-primary-600 hover:cursor-pointer active:bg-primary-400")}>
        Super administration
    </span>)

    function handleClick() {
        SignalsStore.layouts.navbar.activeMenuItem.value = 'superAdmin'
    }
}
export { SuperAdminMenuButton }