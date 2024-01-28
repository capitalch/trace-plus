import { useSelector } from "react-redux"
import { isLoggedInSelectorFn } from "../../app/app-slice"
import { Navigate } from "react-router-dom"

function Protected({ children }: { children: any }) {
    const isLoggedInSelector = useSelector(isLoggedInSelectorFn)
    return(<div className="">
        {
            isLoggedInSelector ? children: <Navigate to='/login' />
        }
    </div>)
}
export { Protected }
