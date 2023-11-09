import clsx from "clsx"
import { NavbarMenuItemType } from "../../../app/globals"
import { SignalsStore } from "../../../app/signals-store"
import { SideMenu } from "../menus/side-menu"
import { superAdminMenuData } from "../menus/super-admin-menu-data"

function SuperAdminMenuButton({ className }: { className?: string }) {
    const activeMenuItem: NavbarMenuItemType = SignalsStore.layouts.navbar.activeMenuItem.value
    const cls: string = (activeMenuItem === 'superAdmin') ? 'bg-primary-600' : 'bg-primary-500'
    return (<span onClick={handleClick} className={clsx(className, cls, "px-10 py-3   text-gray-200 hover:text-white hover:bg-primary-600 hover:cursor-pointer active:bg-primary-400")}>
        Super admin
    </span>)

    function handleClick() {
        SignalsStore.layouts.navbar.activeMenuItem.value = 'superAdmin'
        SignalsStore.layouts.sidebar.currentMenuComponent.value = <SideMenu menuData={superAdminMenuData} />
    }   
}
export { SuperAdminMenuButton }