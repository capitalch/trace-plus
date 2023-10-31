import { useEffect } from "react"
import { useMediaQuery } from "react-responsive"
import { SignalsStore } from "../../app/signals-store"
import { Sidebar } from "./sidebar"
import { NavbarContent } from "./navbar-content"

function Layouts() {
    const isBigScreen = useMediaQuery({ query: '(min-width: 1536px)' })

    useEffect(() => {
        if (isBigScreen) {
            SignalsStore.layouts.isSideBarOpen.value = true
        } else {
            SignalsStore.layouts.isSideBarOpen.value = false
        }
    })

    return (
        <div className="prose">
            {/* Container full screen width and height */}
            <div className="flex h-[100vh] w-[100vw]">
                <Sidebar />
                {/* navbar and content container */}
                <NavbarContent />
            </div>
        </div>
    )
}

export { Layouts }