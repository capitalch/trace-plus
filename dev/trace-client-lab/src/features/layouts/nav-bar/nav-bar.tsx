import clsx from "clsx"
import { useNavBar } from "./nav-bar-hook"
import { LogoutMenuButton } from "./logout-menu-button"
import { ModalDialogA } from "./modal-dialogA"
import { IconMenuUnfold } from "../../../controls/icons/icon-menu-unfold"
import { CompAppLoader } from "../../../controls/redux-components/comp-app-loader"
import { CompInstances } from "../../../controls/redux-components/comp-instances"
import { closeSlidingPane, compAppLoaderVisibilityFn, selectSlidingPaneStateFn } from "../../../controls/redux-components/comp-slice"
import { AppDispatchType, RootStateType } from "../../../app/store"
import { useDispatch, useSelector } from "react-redux"
import ReactSlidingPane from "react-sliding-pane"
import { SlidingPaneMap } from "../../../controls/redux-components/sliding-pane/sliding-pane-map"
import { FC } from "react"
import { ModalDialogB } from "./modal-dialogB"

export function NavBar() {
    const dispatch: AppDispatchType = useDispatch()
    const { isOpen, identifier, title, width } = useSelector(selectSlidingPaneStateFn) // for sliding pane
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, CompInstances.compAppLoader))
    const { getBuFyBranchInfo, getMenuButtons, getMenuShowHideClass, handleShowSideBar } = useNavBar()

    const SlidingPaneChildComp: FC<any>  = SlidingPaneMap[identifier]?.content 
    const slidingPaneChildCompProps: any = SlidingPaneMap[identifier]?.props
    
    return (
       // Top Nav bar
       <div className="flex items-center h-12 bg-primary-500">
       <div className="flex items-center text-lg text-white">
           <button type="button" onClick={handleShowSideBar} className={clsx(getMenuShowHideClass(), 'mx-2')} title="toggle" >
               <IconMenuUnfold className='h-6' />
           </button>
           {getMenuButtons()}
           {getBuFyBranchInfo()}
       </div>
       <LogoutMenuButton />
       <ModalDialogA />
       <ModalDialogB />

       {/* <AppLoader /> */}
       {isVisibleAppLoader && <CompAppLoader />}

       {/* react sliding pane */}
       {identifier && isOpen && <ReactSlidingPane 
           className=""
           isOpen={isOpen}
           onRequestClose={() => dispatch(closeSlidingPane())}
           title={<span className="font-bold text-primary-500">{title}</span>}
       
           width={width || '90%'}>
           <SlidingPaneChildComp props={slidingPaneChildCompProps}></SlidingPaneChildComp>
       </ReactSlidingPane>}
   </div>)
}