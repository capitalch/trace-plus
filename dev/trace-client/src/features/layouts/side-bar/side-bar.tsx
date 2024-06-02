import { useDispatch, useSelector } from "react-redux"
import clsx from "clsx"
import { AppDispatchType, store } from "../../../app/store/store"
import { IconMenuFold } from "../../../components/icons/icon-menu-fold"
import { isSideBarOpenSelectorFn, setIsSideBarOpenR } from "../layouts-slice"
import { SideMenu } from "./side-menu"

function SideBar() {
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    const dispatch: AppDispatchType = useDispatch()

    return (<div className={clsx(getSideBarClassName(), 'bg-neutral-100 overflow-hidden whitespace-nowrap flex flex-col transition-[width] duration-500 ease-linear')}>

        {/* SideBar header */}
        <div className="flex h-12 w-max items-center border-b-[1px] border-primary-100 pl-2">
            <img src="trace-logo.png" className="mr-5" alt='' />
            <button onClick={handleHideSideBar}>
                <IconMenuFold className='h-6 text-primary-500' />
            </button>
        </div>
        <SideMenu />
        <span className="mt-auto px-2 text-success-500 font-semibold bg-amber-100">{getUserType()}</span>
    </div>)


    function getSideBarClassName() {
        return (isSideBarOpenSelector ? 'w-[220px]' : 'w-0')
    }

    function getUserType(): string {
        const uType: string = store.getState().login.userType || ''
        const logic: any = {
            B: 'Business user'
            , S: 'Super admin user'
            , A: 'Admin user'
        }
        return (logic[uType] || 'Unknown')
    }
    function handleHideSideBar() {
        dispatch(setIsSideBarOpenR({ isSideBarOpen: false }))
    }

}
export { SideBar }