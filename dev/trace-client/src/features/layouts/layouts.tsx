import { Outlet } from "react-router-dom"
import { SideBar } from "./side-bar/side-bar"
import { NavBar } from "./nav-bar/nav-bar"
import { useEffect } from "react"
import { useMediaQuery } from "react-responsive"
import { AppDispatchType } from "../../app/store"
import { useDispatch } from "react-redux"
import { setIsSideBarOpen } from "./layouts-slice"

function Layouts() {
    const isXLScreen = useMediaQuery({ query: '(min-width: 1280px)' })
    const dispatch: AppDispatchType = useDispatch()

    // Initialize sidebar state based on screen size
    useEffect(() => {
        dispatch(setIsSideBarOpen({ isSideBarOpen: isXLScreen }))
    }, [isXLScreen, dispatch])

    return (
        <div className="flex w-screen h-screen bg-white overflow-hidden">
            <SideBar />

            <div className="flex flex-col flex-1 min-w-0 relative">
                <NavBar />
                <div id="main-scroll-container" className="flex-1 overflow-auto min-h-0">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
export { Layouts }