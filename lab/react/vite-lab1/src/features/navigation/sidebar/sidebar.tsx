import clsx from "clsx"
import { SignalsStore } from "../../../app/signals-store"

function Sidebar() {
    // const x = SignalsStore.layouts.isSideBarOpen.value
    // console.log(x)
    return (
        <div className={clsx(SignalsStore.layouts.isSideBarOpen.value == true ? 'w-[220px]' : 'w-0', "overflow-clip flex flex-col m-2 bg-red-300 text-orange-600")}>
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

    // function getClassName() {
    //     return (SignalsStore.layouts.isSideBarOpen.value == true) ? 'w-[220px]' : 'w-0'
    // }
}
export { Sidebar }