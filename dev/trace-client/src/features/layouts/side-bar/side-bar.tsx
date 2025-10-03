import { useDispatch, useSelector } from "react-redux"
import clsx from "clsx"
import { AppDispatchType } from "../../../app/store"
import { isSideBarOpenSelectorFn, setIsSideBarOpen } from "../layouts-slice"
import { SideMenu } from "./side-menu"
import { IconMenuFold } from "../../../controls/icons/icon-menu-fold"
import { UserDetailsType } from "../../login/login-slice"
import { Utils } from "../../../utils/utils"
import logo from '../../../assets/trace-logo.png'
function SideBar() {
    const isSideBarOpen = useSelector(isSideBarOpenSelectorFn)
    const dispatch: AppDispatchType = useDispatch()

    return (
        <aside
            className={clsx(
                'fixed xl:static top-0 left-0 h-screen border-r-2 z-50',
                'flex flex-col transition-all duration-500 ease-in-out',
                isSideBarOpen ? 'w-[220px] translate-x-0 bg-gradient-to-b from-slate-50 via-blue-50 to-purple-50 border-r-purple-200' : 'w-0 -translate-x-full xl:translate-x-0 xl:border-0 bg-transparent',
                'overflow-hidden shadow-xl'
            )}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-12 px-4 border-b border-neutral-200 bg-white">
                <div className="flex items-center gap-2">
                    <img src={logo} className="h-8" alt="Logo" />
                </div>
                <button
                    onClick={() => dispatch(setIsSideBarOpen({ isSideBarOpen: false }))}
                    type="button"
                    title="Close sidebar"
                    className="p-1 hover:bg-neutral-100 rounded-md transition-colors"
                >
                    <IconMenuFold className='h-5 w-5 text-neutral-600' />
                </button>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
                <SideMenu />
            </div>

            {/* User Type Badge */}
            <div className="p-3 border-t border-neutral-200 bg-white">
                <span className="inline-block px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full">
                    {getUserType()}
                </span>
            </div>
        </aside>
    )

    function getUserType(): string {
        const userDetails: UserDetailsType | undefined = Utils.getUserDetails()
        const uType: string = userDetails?.userType || ''
        const logic: any = {
            B: 'Business user',
            S: 'Super admin',
            A: 'Admin user'
        }
        return logic[uType] || 'Unknown'
    }
}
export { SideBar }