import { useSelector } from "react-redux"
import { isLoggedInSelectorFn } from "../../../app/app-slice"
import { Navigate } from "react-router-dom"

function Protected({ children }: { children: any }) {
    const isLoggedInSelector = useSelector(isLoggedInSelectorFn)
    if (isLoggedInSelector) {
        return (children)
    } else {
        return (<Navigate to='/login' />)
    }
}
export { Protected }