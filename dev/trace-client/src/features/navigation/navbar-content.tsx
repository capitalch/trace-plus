import { Outlet } from "react-router-dom"
import MenuUnfold from "../../components/icons/menu-unfold"
import { ButtonDropdown } from "../../components/widgets/button-dropdown"
import clsx from "clsx"
import { SignalsStore } from "../../app/signals-store"

function NavbarContent() {
    return (<div className="flex flex-col w-full">
        {/* <Navbar /> */}
        <div className="flex items-center justify-between h-10 bg-primary-500">
            <div className="flex items-center">
                <span onClick={handleShowSideBar} className={clsx(getMenuShowHideClass(),
                    'text-white ml-2 bg-transparent cursor-pointer hover:bg-primary-600  hover:ring-white hover:ring-1 rounded-lg'
                )}>
                    <MenuUnfold />
                </span>
                <div className="ml-3 text-sm text-white">Header</div>
            </div>
            <ButtonDropdown>Drop down list view</ButtonDropdown>
        </div>
        {/* Content */}
        <div className="h-full bg-white">
            <Outlet />
        </div>
    </div>)

    function getMenuShowHideClass(){
        return(SignalsStore.layouts.isSideBarOpen.value ? 'hidden' : 'block')
    }

function handleShowSideBar() {
    SignalsStore.layouts.isSideBarOpen.value = true
}
}

export { NavbarContent }