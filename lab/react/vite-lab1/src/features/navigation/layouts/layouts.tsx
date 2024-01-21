import { useEffect } from "react"
import { Sidebar } from "../sidebar/sidebar"
import { SignalsStore } from "../../../app/signals-store"

function Layouts(){
    const x = SignalsStore.layouts.isSideBarOpen.value
    console.log(x)
    useEffect(()=>{
        // SignalsStore.layouts.isSideBarOpen.value = true
    })

    return(<div className="flex">
        <span>{SignalsStore.layouts.isSideBarOpen.value}</span>
        <Sidebar />
        <button onClick={handleSidebarToggle} className="px-2 bg-slate-200 h-8 rounded-md">Toggle sidebar</button>
    </div>)

    function handleSidebarToggle(){
        SignalsStore.layouts.isSideBarOpen.value =  !(SignalsStore.layouts.isSideBarOpen.value || false)
    }
}
export {Layouts}