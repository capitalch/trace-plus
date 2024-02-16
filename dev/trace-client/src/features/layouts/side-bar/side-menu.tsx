import { useSelector } from "react-redux"
import { MenuItemType, menuItemSelectorFn } from "../layouts-slice"
import { MasterMenuData } from "../menus/master-menu-data"

function SideMenu() {
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const menuData: any = MasterMenuData?.[menuItemSelector] || 'Nothing'
    return (<div>{menuItemSelector}</div>)
}
export { SideMenu }