import { useContext, useEffect } from "react"
import { Sidebar } from "../sidebar/sidebar"
import { SignalsStore } from "../../../app/signals-store"
// import { useDispatch } from "react-redux"
import { setSidebarOpen } from "../navigation-slice"
import { AppDispatch, store } from "../../../app/store"
import { GlobalContext } from "../../../App"
import { useAppDispatch } from "../../../app/hooks"

function Layouts() {
    const dispatch:AppDispatch = useAppDispatch()
    const { profile }: any = useContext(GlobalContext)

    useEffect(() => {
        // SignalsStore.layouts.isSideBarOpen.value = true
    })

    return (<div className="flex">
        <span>{SignalsStore.layouts.isSideBarOpen.value}</span>
        <Sidebar />
        <button onClick={handleSidebarToggle} className="px-2 bg-slate-200 h-8 rounded-md">Toggle sidebar</button>
        <button onClick={handleOnChangeContext}>Change Context Value</button>
    </div>)

    function handleSidebarToggle() {
        const state = store.getState();
        // const args: any = { isSidebarOpen: !(state?.navigation?.isSidebarOpen || false) }
        dispatch(setSidebarOpen({isSidebarOpen: !(state?.navigation?.isSidebarOpen || false)}))
        // SignalsStore.layouts.isSideBarOpen.value =  !(SignalsStore.layouts.isSideBarOpen.value || false)
    }

    function handleOnChangeContext() {
        profile.name = 'Nahsdf', profile.address = 'P 161'
    }
}
export { Layouts }