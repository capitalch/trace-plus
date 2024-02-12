import { useDispatch, useSelector } from "react-redux"
import { isSideBarOpenSelectorFn, setIsSideBarOpen } from "../../../app/store/app-slice"
import { AppDispatchType } from "../../../app/store/store"

export function useTopNavBar() {
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    const dispatch: AppDispatchType = useDispatch()
    function getMenuShowHideClass() {
        return (isSideBarOpenSelector ? 'hidden' : 'block')
    }

    function handleShowSideBar() {
        dispatch(setIsSideBarOpen({ isSideBarOpen: true }))
    }
    return ({ getMenuShowHideClass, handleShowSideBar })
}