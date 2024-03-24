import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import { MenuItemType, menuItemSelectorFn, setMenuItemR } from "../layouts-slice"
import { AppDispatchType } from "../../../app/store/store"

function AccountsMenuButton({ className }: { className?: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const clsName = menuItemSelector === 'accounts' ? 'bg-primary-700' : 'bg-primary-500'
    return (<button onClick={handleOnClick} className={clsx(className, clsName, 'px-10 py-2 text-gray-200 hover:text-white hover:bg-primary-700 hover:cursor-pointer active:bg-primary-400')}>
        Accounts
    </button>)

    function handleOnClick() {
        dispatch(setMenuItemR({ menuItem: "accounts" }))
    }
}
export { AccountsMenuButton }