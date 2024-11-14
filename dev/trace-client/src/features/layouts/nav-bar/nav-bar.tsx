import clsx from "clsx"
import { useNavBar } from "./nav-bar-hook"
import { LogoutMenuButton } from "./logout-menu-button"
import { ModalDialogA } from "./modal-dialogA"
import { IconMenuUnfold } from "../../../controls/icons/icon-menu-unfold"
import { AppLoader } from "./app-loader"

function NavBar() {
    const {getBuFyBranchInfo, getMenuButtons, getMenuShowHideClass, handleShowSideBar } = useNavBar()
    
    return (
        // Top Nav bar
        <div className="flex items-center justify-between h-12 bg-primary-500">
            <div className="flex items-center text-lg text-white">
                <button onClick={handleShowSideBar} className={clsx(getMenuShowHideClass(), 'mx-2')}>
                    <IconMenuUnfold className='h-6' />
                </button>
                {getMenuButtons()}
                {getBuFyBranchInfo()}
            </div>
            <LogoutMenuButton />
            <ModalDialogA />
            <AppLoader />
        </div>)
}
export { NavBar }