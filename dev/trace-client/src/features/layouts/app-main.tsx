import { SignalsStore } from "../../app/signals-store"
import { Layouts } from "./layouts"
import { Login } from "./login"

function AppMain() {

    return (
        <>
            {SignalsStore.main.login.isLoggedIn.value ? <Layouts /> : <Login />}
        </>
    )
}

export { AppMain }