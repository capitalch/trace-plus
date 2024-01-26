// import { useContext} from "react"
import { Sidebar } from "../sidebar/sidebar"
import { setSidebarOpen } from "../navigation-slice"
import { AppDispatchType, store } from "../../../app/store"
// import { GlobalContext } from "../../../App"
import { useAppDispatch } from "../../../app/hooks"
import { Outlet } from "react-router-dom"

function Layouts() {
    const dispatch:AppDispatchType = useAppDispatch()
    // const { profile }: any = useContext(GlobalContext)

    return (<div className="flex">        
        <Sidebar />
        <button onClick={handleSidebarToggle} className="m-2 px-2 bg-slate-200 h-8 rounded-md">Toggle sidebar</button>
        <Outlet />
        {/* <button onClick={handleOnChangeContext}>Change Context Value</button> */}
    </div>)

    function handleSidebarToggle() {
        const state = store.getState();
        dispatch(setSidebarOpen({isSidebarOpen: !(state?.navigation?.isSidebarOpen || false)}))
    }

    // function handleOnChangeContext() {
    //     profile.name = 'Nahsdf', profile.address = 'P 161'
    // }
}
export { Layouts }