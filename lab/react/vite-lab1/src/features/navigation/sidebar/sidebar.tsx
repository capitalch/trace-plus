import clsx from "clsx"
import { useSelector } from "react-redux"
import { sidebarSelectorFn } from "../navigation-slice"
import { useContext } from "react"
import { GlobalContext } from "../../../App"

function Sidebar() {
    const isSidebarOpen = useSelector(sidebarSelectorFn)
    const { profile}: any = useContext(GlobalContext)
    console.log(profile.name, profile.address)
    return (
        <div className={clsx(getClassName(), "overflow-clip flex flex-col m-2 bg-red-300 text-orange-600")}>
            {/* Header  */}
            <div>
                Header
            </div>
            {/* body */}
            <div>
                Body
            </div>
            {/* Footer */}
            <div>
                Footer
            </div>
        </div>)

    function getClassName() {

        return (isSidebarOpen ? 'w-[220px]' : 'w-0')
    }
}
export { Sidebar }