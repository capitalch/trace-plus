import { Outlet } from "react-router-dom"
import { SideBar } from "./side-bar/side-bar"
import { NavBar } from "./nav-bar/nav-bar"
import { useEffect } from "react"
import { useMediaQuery } from "react-responsive"
import { AppDispatchType } from "../../app/store"
import { useDispatch } from "react-redux"
import { setIsSideBarOpen } from "./layouts-slice"

function Layouts() {

    const isBigScreen = useMediaQuery({ query: '(min-width: 1536px)' })
    const dispatch: AppDispatchType = useDispatch()

    useEffect(() => {
        if (isBigScreen) {
            dispatch(setIsSideBarOpen({ isSideBarOpen: true }))
        } else {
            dispatch(setIsSideBarOpen({ isSideBarOpen: false }))
        }
    })

    return (<div className="">
        <div className="flex h-screen w-screen bg-white">
            <SideBar />
            <div className="flex flex-col w-full">
                <NavBar />
                <Outlet />
            </div>
        </div>
    </div>)
}
export { Layouts }