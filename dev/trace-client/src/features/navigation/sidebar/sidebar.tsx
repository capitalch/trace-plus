import { useEffect } from "react"
import { getUserTypeName } from "../../../app/globals"
import { SignalsStore } from "../../../app/signals-store"
import { MenuFoldIcon } from "../../../components/icons/menu-fold-icon"
// import { useSidebar } from "./sidbar-hook"
// import { AccountsMenu } from "./accounts-menu"

function Sidebar() {

    // const { getMenu } = useSidebar()
    useEffect(() => {

    })

    return (
        <div className={getSidebarClassName()}>
            <div className="h-full  bg-neutral-100  w-[200px] flex flex-col">
                {/* SideBar Header */}
                <div className="flex items-center h-12 pl-2 w-max border-b-[1px] border-primary-100">
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

    // function getSideMenu(){

    // }

    function handleHideSideBar() {
        SignalsStore.layouts.isSideBarOpen.value = false
    }

    function getSidebarClassName() {
        return SignalsStore.layouts.isSideBarOpen.value === true ? 'block' : 'hidden'
    }
}
export { Sidebar }