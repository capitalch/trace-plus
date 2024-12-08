import clsx from "clsx"
import { useNavBar } from "./nav-bar-hook"
import { LogoutMenuButton } from "./logout-menu-button"
import { ModalDialogA } from "./modal-dialogA"
import { IconMenuUnfold } from "../../../controls/icons/icon-menu-unfold"
// import { AppLoader } from "./app-loader"
import { ReduxCompAppLoader } from "../../../controls/redux-components/redux-comp-app-loader"
import { ReduxComponentsInstances } from "../../../controls/redux-components/redux-components-instances"
import { reduxCompAppLoaderSelectorFn } from "../../../controls/redux-components/redux-comp-slice"
import { RootStateType } from "../../../app/store/store"
import { useSelector } from "react-redux"

function NavBar() {
    const toShowAppLoader: boolean = useSelector((state: RootStateType) => reduxCompAppLoaderSelectorFn(state, ReduxComponentsInstances.reduxCompAppLoader))
    const { getBuFyBranchInfo, getMenuButtons, getMenuShowHideClass, handleShowSideBar } = useNavBar()

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
            {/* <AppLoader /> */}
            {toShowAppLoader && <ReduxCompAppLoader />}
        </div>)
}
export { NavBar }