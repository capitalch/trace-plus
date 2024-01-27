import { Outlet } from "react-router-dom"

function Layouts() {
    return (<div className="flex flex-col">
        <span className="mb-2">Layouts</span>
        <Outlet />
    </div>)
}
export { Layouts }