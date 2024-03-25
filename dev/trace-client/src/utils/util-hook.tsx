// import { FC, } from "react"
// import { GlobalContext } from "../App"
// import { AppDispatchType } from "../app/store/store"
// import { GlobalContextType } from "../app/global-context"
// import { useDispatch } from "react-redux"
// import { showModalDialogAR, showModalDialogBR } from "../features/layouts/layouts-slice"
// import { ibukiEmit } from "./ibuki"

export function useUtils() {
    // const globalContext: GlobalContextType = useContext(GlobalContext)
    // const dispatch: AppDispatchType = useDispatch()
    // function showModalDialogA({ element }: { element?: FC }) {
    //     // globalContext.layouts.navBar.modalDialogA = element
    //     ibukiEmit('ShowModalDialogA', { title: 'Modal dialog A1', isOpen: true, element: <>Element</> })
    //     // dispatch(showModalDialogAR({ isOpen: true }))
    // }
    // function hideModalDialogA() {
    //     // globalContext.layouts.navBar.modalDialogA = () => <></>
    //     dispatch(showModalDialogAR({ isOpen: false }))
    // }
    // function showModalDialogB({ element }: { element: FC }) {
    //     // globalContext.layouts.navBar.modalDialogB = element
    //     dispatch(showModalDialogBR({ isOpen: true }))
    // }
    // function hideModalDialogB() {
    //     // globalContext.layouts.navBar.modalDialogB = () => <></>
    //     dispatch(showModalDialogBR({ isOpen: false }))
    // }
    function getHostUrl() {
        let url
        if (import.meta.env.DEV) {
            url = import.meta.env['VITE_APP_LOCAL_SERVER_URL']
        } else {
            url = window.location.href
        }
        return (url)
    }



    return ({ getHostUrl })
}