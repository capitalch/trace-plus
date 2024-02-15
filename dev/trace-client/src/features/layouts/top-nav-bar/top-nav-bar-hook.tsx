import { useDispatch, useSelector } from "react-redux"
import { isSideBarOpenSelectorFn, setIsSideBarOpen,  } from "../../../app/store/app-slice"
import { AppDispatchType } from "../../../app/store/store"
// import { useEffect } from "react"
// import { UserTypesEnum } from "../../../utils/global-types-interfaces-enums"

export function useTopNavBar() {
    const isSideBarOpenSelector = useSelector(isSideBarOpenSelectorFn)
    // const userTypeSelector = useSelector(userTypeSelectorFn)
    const dispatch: AppDispatchType = useDispatch()

    // useEffect(()=>{
    //     if(userTypeSelector === UserTypesEnum.Admin){
    //         dispatch()
    //     }
    // })

    function getMenuShowHideClass() {
        return (isSideBarOpenSelector ? 'hidden' : 'block')
    }

    function handleShowSideBar() {
        dispatch(setIsSideBarOpen({ isSideBarOpen: true }))
    }
    return ({ getMenuShowHideClass, handleShowSideBar })
}