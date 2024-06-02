import clsx from "clsx"
import { MenuUnfoldIcon } from "../../../components/icons/menu-unfold-icon"
import { useNavBar } from "./nav-bar-hook"
import { LogoutMenuButton } from "./logout-menu-button"
import { ModalDialogA } from "./modal-dialogA"

function NavBar() {
    const { getMenuButtons, getMenuShowHideClass, handleShowSideBar } = useNavBar()
    
    return (
        // Top Nav bar
        <div className="flex h-12 items-center justify-between bg-primary-500">
            <div className="prose flex items-center text-white text-lg">
                <button onClick={handleShowSideBar} className={clsx(getMenuShowHideClass(), 'mx-2')}>
                    <MenuUnfoldIcon className='h-6' />
                </button>
                {getMenuButtons()}
            </div>
            <LogoutMenuButton />
            <ModalDialogA />
        </div>)
}
export { NavBar }