import { useDispatch, useSelector } from "react-redux"
import { isSideBarOpenSelectorFn, setIsSideBarOpen } from "../../../app/store/app-slice"
import clsx from "clsx"
import { AppDispatchType } from "../../../app/store/store"
import { MenuFoldIcon } from "../../../components/icons/menu-fold-icon"

function SideBar() {
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    const dispatch: AppDispatchType = useDispatch()

    return (<div className={clsx(getSideBarClassName(), 'bg-neutral-50 overflow-clip flex flex-col transition-[width] duration-500 ease-linear')}>
        
        {/* SideBar header */}
        <div className="flex h-12 items-center justify-between border-b-[1px] border-primary-100 pl-2">
            <img src="trace-logo.png" />
            <button onClick={handleHideSideBar}>
                <MenuFoldIcon className='mr-2 h-6 text-primary-500' />
            </button>
        </div>
    </div>)

    function getSideBarClassName() {
        return (isSideBarOpenSelector ? 'w-[220px]' : 'w-0')
    }

    function handleHideSideBar() {
        dispatch(setIsSideBarOpen({ isSideBarOpen: false }))
    }
}
export { SideBar }