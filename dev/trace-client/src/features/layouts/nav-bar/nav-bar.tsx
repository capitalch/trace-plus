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
import { FC, useEffect } from "react"
import { ModalDialogB } from "./modal-dialogB"
import { SearchProduct } from "./search-product"
import { menuItemSelectorFn } from "../layouts-slice"
import { useLocation } from "react-router-dom"

export function NavBar() {
    const dispatch: AppDispatchType = useDispatch()
    const { isOpen, identifier, title, width } = useSelector(selectSlidingPaneStateFn) // for sliding pane
    const isVisibleAppLoader: boolean = useSelector((state: RootStateType) => compAppLoaderVisibilityFn(state, CompInstances.compAppLoader))
    const menuItemSelector = useSelector(menuItemSelectorFn)
    const { getBuFyBranchInfo, getMenuButtons, getMenuShowHideClass, handleToggleSideBar } = useNavBar()
    const location = useLocation()

    const SlidingPaneChildComp: FC<any>  = SlidingPaneMap[identifier]?.content
    const slidingPaneChildCompProps: any = SlidingPaneMap[identifier]?.props

    // Close sliding pane when route changes
    useEffect(() => {
        if (isOpen) {
            dispatch(closeSlidingPane())
        }
    }, [location.pathname, dispatch])

    return (
       // Top Nav bar - height matches sidebar logo height (h-12)
       <div className="flex items-center h-12 bg-primary-500 px-1 sm:px-2">
       <div className="flex items-center text-sm sm:text-base md:text-lg text-white gap-1 sm:gap-2">
           <button type="button" onClick={handleToggleSideBar} className={clsx(getMenuShowHideClass(), 'p-1 sm:p-2')} title="Toggle sidebar" >
               <IconMenuUnfold className='h-5 w-5 sm:h-6 sm:w-6' />
           </button>
           {getMenuButtons()}
           {getBuFyBranchInfo()}
           {menuItemSelector === 'accounts' && <SearchProduct />}
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