import { Outlet } from "react-router-dom"
import clsx from "clsx"
import { MenuUnfoldIcon } from "../../../components/icons/menu-unfold-icon"
import { ButtonDropdown } from "../../../components/widgets/button-dropdown"
import { SignalsStore } from "../../../app/signals-store"
import { useNavbarContent } from "./navbar-content-hook"
import { AccountsMenuButton } from "./accounts-menu-button"
import { SuperAdminMenuButton } from "./super-admin-menu-button"
import { AdminMenuButton } from "./admin-menu-button"

function NavbarContent() {
    const { getDropdownChildren, getMenuShowHideClass, handleShowSideBar } = useNavbarContent()

    return (<div className="flex flex-col w-full">

        {/* <Navbar /> */}
        <div className="flex items-center justify-between h-12 bg-primary-500">
            <div className="flex items-center prose">
                <span onClick={handleShowSideBar} className={clsx(getMenuShowHideClass(),
                    'text-white mx-2 bg-transparent cursor-pointer hover:bg-primary-600  hover:ring-white hover:ring-1 rounded-lg'
                )}>
                    <MenuUnfoldIcon className='h-6' />
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

