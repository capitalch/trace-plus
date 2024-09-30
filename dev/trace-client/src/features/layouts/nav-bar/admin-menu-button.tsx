import clsx from "clsx"
import { MenuItemType, menuItemSelectorFn, setMenuItem } from "../layouts-slice"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatchType } from "../../../app/store/store"

export function AdminMenuButton() {
    const dispatch: AppDispatchType = useDispatch()
    const menuItemSelector: MenuItemType = useSelector(menuItemSelectorFn)
    const clsName = menuItemSelector === 'admin' ? 'bg-primary-700' : 'bg-primary-500'

    return (<button onClick={handleOnClick}
        className={clsx(clsName, 'px-10 py-2 text-gray-200 hover:text-white hover:bg-primary-600 hover:cursor-pointer active:bg-primary-400')}>
        Admin
    </button>)

    function handleOnClick() {
        dispatch(setMenuItem({ menuItem: 'admin' }))
    }

}
