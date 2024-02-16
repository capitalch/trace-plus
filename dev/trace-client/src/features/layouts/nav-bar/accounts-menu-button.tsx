import clsx from "clsx"
// import { useSelector } from "react-redux"
// import { topNavBarSelectedMenuItemNameSelectorFn } from "../../../app/store/app-slice"
// import { TopNavBarSelectedMenuItemNameEnum } from "../../../utils/global-types-interfaces-enums"

function AccountsMenuButton({ className }: { className?: string }) {
    // const topNavBarSelectedMenuItemNameSelector = useSelector(topNavBarSelectedMenuItemNameSelectorFn)
    // const clsName = topNavBarSelectedMenuItemNameSelector === TopNavBarSelectedMenuItemNameEnum.Accounts ? 'bg-primary-700' : 'bg-primary-500'
    return (<button className={clsx(className,  'px-10 py-2 text-gray-200 hover:text-white hover:bg-primary-700 hover:cursor-pointer active:bg-primary-400')}>
        Accounts
    </button>)
}
export { AccountsMenuButton }