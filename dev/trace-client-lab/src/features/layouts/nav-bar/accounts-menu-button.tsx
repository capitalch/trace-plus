import clsx from "clsx"
import { useDispatch, useSelector } from "react-redux"
import { MenuItemType, menuItemSelectorFn, setMenuItem } from "../layouts-slice"
import { AppDispatchType } from "../../../app/store"
import { useNavigate } from "react-router-dom"


function AccountsMenuButton({ className }: { className?: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const navigate = useNavigate()
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const clsName = menuItemSelector === 'accounts' ? 'bg-primary-700' : 'bg-primary-500'
    return (<button onClick={handleOnClick} className={clsx(className, clsName, 'px-4 sm:px-6 md:px-10 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-gray-200 hover:text-white hover:bg-primary-700 hover:cursor-pointer active:bg-primary-400')}>
        Accounts
    </button>)

    function handleOnClick() {
        dispatch(setMenuItem({ menuItem: "accounts" }))
        navigate('/')
    }
}
export { AccountsMenuButton }