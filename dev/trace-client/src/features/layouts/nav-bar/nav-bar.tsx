import clsx from "clsx"
import { useNavBar } from "./nav-bar-hook"
import { LogoutMenuButton } from "./logout-menu-button"
import { ModalDialogA } from "./modal-dialogA"
import { IconMenuUnfold } from "../../../controls/icons/icon-menu-unfold"
import { CompAppLoader } from "../../../controls/redux-components/comp-app-loader"
import { CompInstances } from "../../../controls/redux-components/comp-instances"
import { compAppLoaderVisibilityFn } from "../../../controls/redux-components/comp-slice"
import { RootStateType } from "../../../app/store/store"
import { useSelector } from "react-redux"

function NavBar() {
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, CompInstances.compAppLoader))
    const { getBuFyBranchInfo, getMenuButtons, getMenuShowHideClass, handleShowSideBar } = useNavBar()

    return (
        // Top Nav bar
        <div className="flex items-center h-12 bg-primary-500 overflow-hidden">
            <div className="flex items-center text-lg text-white">
                <button onClick={handleShowSideBar} className={clsx(getMenuShowHideClass(), 'mx-2')}>
                    <IconMenuUnfold className='h-6' />
                </button>
                {getMenuButtons()}
                {getBuFyBranchInfo()}
            </div>
            <LogoutMenuButton className="ml-auto" />
            <ModalDialogA />
            {/* <AppLoader /> */}
            {isVisibleAppLoader && <CompAppLoader />}
        </div>)
}
export { NavBar }