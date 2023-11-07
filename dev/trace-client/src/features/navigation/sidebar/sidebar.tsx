import clsx from "clsx"
import { getUserTypeName } from "../../../app/globals"
import { SignalsStore } from "../../../app/signals-store"
import { MenuFoldIcon } from "../../../components/icons/menu-fold-icon"

function Sidebar() {

    return (
        <div className={clsx(getSidebarClassName(), 'flex flex-col transition-[width] duration-500 ease-linear bg-neutral-100')}>
            <div className={'overflow-clip'}>
                <div className='flex flex-col h-full w-max '>

                    {/* SideBar Header */}
                    <div className="flex items-center h-12 pl-2  border-b-[1px] border-primary-100">
                        <img src="trace-logo.png" className="" />
                        <span onClick={handleHideSideBar}
                            className="ml-5 bg-transparent rounded-lg cursor-pointer text-primary-500 hover:bg-primary-100 hover:ring-1 hover:ring-primary-200">
                            <MenuFoldIcon className='h-6' />
                        </span>
                    </div>
                    <div className='py-4'>
                        {SignalsStore.layouts.sidebar.currentMenuComponent.value}
                    </div>

                </div>
            </div>

            {/* Sidebar footer */}
            <span className="flex justify-center mt-auto mb-2 prose">{<h4 className="text-primary-300">{getUserTypeName()}</h4>}</span>
        </div>
    )

    function handleHideSideBar() {
        SignalsStore.layouts.isSideBarOpen.value = false
    }

    function getSidebarClassName() {
        return SignalsStore.layouts.isSideBarOpen.value === true ? 'w-[220px]' : 'w-0'
    }

}
export { Sidebar }