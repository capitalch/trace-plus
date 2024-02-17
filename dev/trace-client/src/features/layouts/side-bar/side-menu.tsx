// import { useSelector } from "react-redux"
// import { MenuItemType, menuItemSelectorFn } from "../layouts-slice"
// import { MasterMenuData } from "../menus/master-menu-data"
import { VoucherIcon } from "../../../components/icons/voucher-icon"
import { CheveronDownIcon } from "../../../components/icons/cheveron-down-icon"

function SideMenu() {
    // const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    // const menuData: any = MasterMenuData?.[menuItemSelector] || 'Nothing'
    return (<div className="prose mt-0.5 flex flex-col text-sm  text-black md:text-base">
        <button id='1' className="flex h-10 items-center gap-3 font-semibold rounded-md border-none bg-primary-50 px-2 hover:bg-slate-300 focus:outline-none">
            <VoucherIcon />
            <span>Vouchers</span>
            <CheveronDownIcon className='ml-auto' />
        </button>
        <div>
            <button id='11' className="flex items-center w-full pl-9 h-10 rounded-md bg-lime-50 hover:bg-slate-300  border-none focus:outline-none">Journals</button>
        </div>
    </div>)
}
export { SideMenu }