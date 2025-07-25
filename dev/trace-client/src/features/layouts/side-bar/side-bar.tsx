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
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    const dispatch: AppDispatchType = useDispatch()

    return (<div className={clsx(getSideBarClassName(), 'bg-neutral-100 overflow-hidden whitespace-nowrap flex flex-col transition-[width] duration-500 ease-linear', '')}>

        {/* SideBar header */}
        <div className="flex h-12 w-max items-center border-b-[1px] border-primary-100 pl-2">
            <div className="h-12">
                <img src={logo} className="mr-5 mt-3" alt='' />
            </div>
            <button onClick={handleHideSideBar} type="button" title="Hide side menu">
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
        const userDetails: UserDetailsType | undefined = Utils.getUserDetails()
        const uType: string = userDetails?.userType || ''
        const logic: any = {
            B: 'Business user'
            , S: 'Super admin user'
            , A: 'Admin user'
        }
        return (logic[uType] || 'Unknown')
    }
    function handleHideSideBar() {
        dispatch(setIsSideBarOpen({ isSideBarOpen: false }))
    }

}
export { SideBar }