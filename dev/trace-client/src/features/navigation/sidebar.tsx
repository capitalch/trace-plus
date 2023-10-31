import { getUserTypeName } from "../../app/globals"
import { SignalsStore } from "../../app/signals-store"
import { MenuFold } from "../../components/icons/menu-fold"

function Sidebar() {
    return (
        <div className={getSidebarClassName()}>
            <div className="h-full  bg-neutral-100  w-[200px] flex flex-col">
                {/* SideBar Header */}
                <div className="flex items-center h-10 justify-evenly w-max">
                    <img src="trace-logo.png" />
                    <span onClick={handleHideSideBar}
                        className="ml-6 bg-transparent rounded-lg cursor-pointer text-primary-500 hover:bg-primary-100 hover:ring-1 hover:ring-primary-200">
                        <MenuFold />
                    </span>
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
        return SignalsStore.layouts.isSideBarOpen.value === true ? 'block' : 'hidden'
    }
}
export { Sidebar }