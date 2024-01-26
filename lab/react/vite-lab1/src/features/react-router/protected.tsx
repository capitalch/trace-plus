import { Login } from "./login"

function Protected({ children }: { children: any }) {
    const isLoggedIn = true
    if (isLoggedIn) {
        return (children)
    } else {
        return (<Login />)
    }

}
export { Protected }