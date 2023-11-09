import clsx from "clsx"
import { NavbarMenuItemType } from "../../../app/globals"
import { SignalsStore } from "../../../app/signals-store"
import { SideMenu } from "../menus/side-menu"
import { accountsMenuData } from "../menus/accounts-menu-data"

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