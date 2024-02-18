import { useDispatch, useSelector } from "react-redux"
// import { isSideBarOpenSelectorFn, setIsSideBarOpen } from "../../../app/store/app-slice"
import clsx from "clsx"
import { AppDispatchType } from "../../../app/store/store"
import { MenuFoldIcon } from "../../../components/icons/menu-fold-icon"
import { isSideBarOpenSelectorFn, setIsSideBarOpen } from "../layouts-slice"
import { SideMenu } from "./side-menu"
// import { SideMenuTemp } from "./side-menu-temp"

function SideBar() {
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    const dispatch: AppDispatchType = useDispatch()

    // sidebar; overflow-x-hidden and whitespace-nowrap classes are important for smooth hiding of contents of sidebar
    return (<div className={clsx(getSideBarClassName(), 'bg-neutral-100 overflow-hidden whitespace-nowrap flex flex-col transition-[width] duration-500 ease-linear')}>

        {/* SideBar header */}
        <div className="flex h-12 w-max items-center border-b-[1px] border-primary-100 pl-2">
            <img src="trace-logo.png" className="mr-5" alt='' />
            <button onClick={handleHideSideBar}>
                <MenuFoldIcon className='h-6 text-primary-500' />
            </button>
        </div>
        <SideMenu />
    </div>)

    function getSideBarClassName() {
        return (isSideBarOpenSelector ? 'w-[220px]' : 'w-0')
    }

    function handleHideSideBar() {
        dispatch(setIsSideBarOpen({ isSideBarOpen: false }))
    }
}
export { SideBar }