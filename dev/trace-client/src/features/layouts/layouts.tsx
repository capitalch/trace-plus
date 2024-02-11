import { Outlet } from "react-router-dom"
import { SideBar } from "./side-bar/side-bar"
import { TopNavBar } from "./top-nav-bar/top-nav-bar"

function Layouts() {
    return (<div className="prose">
        <div className="flex h-screen w-screen bg-neutral-100">
            <SideBar />
            <div className="flex flex-col">
                <TopNavBar />
                <Outlet />
            </div>
        </div>
    </div>)
}
export { Layouts }