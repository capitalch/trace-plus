import clsx from "clsx"
import { useNavBar } from "./nav-bar-hook"
import { LogoutMenuButton } from "./logout-menu-button"
import { ModalDialogA } from "./modal-dialogA"
import { IconMenuUnfold } from "../../../controls/icons/icon-menu-unfold"
import { AppLoader } from "./app-loader"
// import { WidgetLoadingIndicator } from "../../../controls/widgets/widget-loading-indicator"

function NavBar() {
    const { getMenuButtons, getMenuShowHideClass, handleShowSideBar } = useNavBar()
    
    return (
        // Top Nav bar
        <div className="flex h-12 items-center justify-between bg-primary-500">
            <div className="prose flex items-center text-white text-lg">
                <button onClick={handleShowSideBar} className={clsx(getMenuShowHideClass(), 'mx-2')}>
                    <IconMenuUnfold className='h-6' />
                </button>
                {getMenuButtons()}
            </div>
            <LogoutMenuButton />
            <ModalDialogA />
            <AppLoader />
        </div>)
}
export { NavBar }