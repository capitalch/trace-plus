import clsx from "clsx"
import { NavbarMenuItemType } from "../../../app/globals"
import { SignalsStore } from "../../../app/signals-store"
import { SideMenu } from "../menus/side-menu"
import { adminMenuData } from "../menus/admin-menu-data"

function AdminMenuButton({ className }: { className?: string }) {
    const activeMenuItem: NavbarMenuItemType = SignalsStore.layouts.navbar.activeMenuItem.value
    const cls: string = (activeMenuItem === 'admin') ? 'bg-primary-600' : 'bg-primary-500'
    return (<span onClick={handleClick} className={clsx(className, cls, "px-10 py-3  text-gray-200 hover:text-white hover:bg-primary-600 hover:cursor-pointer active:bg-primary-400")}>
        Admin
    </span>)

    function handleClick() {
        SignalsStore.layouts.navbar.activeMenuItem.value = 'admin'
        SignalsStore.layouts.sidebar.currentMenuComponent.value = <SideMenu menuData={adminMenuData} />
    }
}

export {AdminMenuButton}