import { Navigate } from "react-router-dom"
import { SignalsStore } from "../../app/signals-store"

function Protected({ children }: any) {
    if (!SignalsStore.login.isLoggedIn.value) {
        return (<Navigate to='/login' replace />)
    } else {
        return children
    }
}

export { Protected }