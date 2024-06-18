import { useSelector } from "react-redux"
// import { isLoggedInSelectorFn } from "../../app/store/app-slice"
import { Navigate } from "react-router-dom"
import { isLoggedInSelectorFn } from "../login/login-slice"
// import { isLoggedInSelectorFn } from "./layouts-slice"

function Protected({ children }: { children: any }) {
    const isLoggedInSelector = useSelector(isLoggedInSelectorFn)
    // if isLoggedIn then return children else return Navigate with path as 'login'
    return (<div className="">
        {isLoggedInSelector ? children : <Navigate to='/login' />}
    </div>)
}
export { Protected }
