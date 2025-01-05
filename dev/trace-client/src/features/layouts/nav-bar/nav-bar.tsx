import clsx from "clsx"
import { useNavBar } from "./nav-bar-hook"
import { LogoutMenuButton } from "./logout-menu-button"
import { ModalDialogA } from "./modal-dialogA"
import { IconMenuUnfold } from "../../../controls/icons/icon-menu-unfold"
import { CompAppLoader } from "../../../controls/redux-components/comp-app-loader"
import { CompInstances } from "../../../controls/redux-components/comp-instances"
import { closeSlidingPane, compAppLoaderVisibilityFn, selectSlidingPaneStateFn } from "../../../controls/redux-components/comp-slice"
import { AppDispatchType, RootStateType } from "../../../app/store/store"
import { useDispatch, useSelector } from "react-redux"
import ReactSlidingPane from "react-sliding-pane"
import { SlidingPaneMap } from "../../../controls/redux-components/sliding-pane/sliding-pane-map"
import { FC} from "react"

function NavBar() {
    const dispatch: AppDispatchType = useDispatch()
    const {isOpen, identifier} = useSelector(selectSlidingPaneStateFn) // for sliding pane
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, CompInstances.compAppLoader))
    const { getBuFyBranchInfo, getMenuButtons, getMenuShowHideClass, handleShowSideBar } = useNavBar()
    // console.log(identifier)
    const SlidingPaneChildComp: FC = SlidingPaneMap[identifier]
    // const x: FC = SlidingPaneMap[identifier]
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

            {/* react sliding pane */}
            {identifier && <ReactSlidingPane 
            isOpen={isOpen} 
            onRequestClose={() => dispatch(closeSlidingPane())}
            width="90%"
            >
                <SlidingPaneChildComp></SlidingPaneChildComp>
            </ReactSlidingPane>}
        </div>)
}
export { NavBar }