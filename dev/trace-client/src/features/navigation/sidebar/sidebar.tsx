import clsx from "clsx"
import { getUserTypeName } from "../../../app/globals"
import { SignalsStore } from "../../../app/signals-store"
import { MenuFoldIcon } from "../../../components/icons/menu-fold-icon"

function Sidebar() {

    return (
        <div className={clsx(getSidebarClassName(),'transition-[width] duration-500 ease-in-out')}>
            <div className="h-full w-[200px] flex flex-col bg-neutral-100">
                {/* SideBar Header */}
                <div className="flex items-center h-12 pl-2 w-max border-b-[1px] border-primary-100 ">
                    <img src="trace-logo.png" className="" />
                    <span onClick={handleHideSideBar}
                        className="ml-5 bg-transparent rounded-lg cursor-pointer text-primary-500 hover:bg-primary-100 hover:ring-1 hover:ring-primary-200">
                        <MenuFoldIcon className='' />
                    </span>
                </div>

                {/* sidebar body */}
                <div className="py-5">
                    {SignalsStore.layouts.sidebar.currentMenuComponent.value}
                </div>


                {/* Sidebar footer */}
                <span className="flex justify-center mt-auto mb-2 prose">{<h4 className="text-primary-300">{getUserTypeName()}</h4>}</span>
            </div>
        </div>
    )

    function handleHideSideBar() {
        SignalsStore.layouts.isSideBarOpen.value = false
    }

    function getSidebarClassName() {
        // return SignalsStore.layouts.isSideBarOpen.value === true ? 'block' : 'hidden'
        return SignalsStore.layouts.isSideBarOpen.value === true ? 'w-[200px]' : 'w-0'
    }
}
export { Sidebar }