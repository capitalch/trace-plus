import clsx from "clsx"
import { MenuUnfoldIcon } from "../../../components/icons/menu-unfold-icon"
import { useTopNavBar } from "./top-nav-bar-hook"
// import { AccountsMenuButton } from "./accounts-menu-button"

function TopNavBar() {
    const { getMenuButtons, getMenuShowHideClass, handleShowSideBar } = useTopNavBar()
    return (
        // Top Nav bar
        <div className="flex h-12 items-center justify-between bg-primary-500">
            <div className="prose flex items-center text-white text-lg">
                <button onClick={handleShowSideBar} className={clsx(getMenuShowHideClass(), 'mx-2')}>
                    <MenuUnfoldIcon className='h-6' />
                </button>

                {getMenuButtons()}

            </div>

        </div>)
}
export { TopNavBar }