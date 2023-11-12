import { SignalsStore } from "../app/signals-store"
import { Layout } from "./layout"
import { Login } from "./login"

function AppMain() {
    return (<>
        {SignalsStore.login.isLoggedIn.value ? <Layout /> : <Login />}
    </>)
}
export { AppMain }