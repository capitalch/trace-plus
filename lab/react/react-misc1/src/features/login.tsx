import { SignalsStore } from "../app/signals-store"

function Login() {
    return (
        // <div className="w-[100vw] h-[100vh] items-center">
            <div className="flex flex-col items-center w-full gap-3 p-5 mx-auto mt-32 prose border-2 h-60 border-cyan-500 bg-slate-300">
                <label className="w-auto font-semibold">User name / Email id</label>
                <input type="text" />
                <label className="font-semibold">Password</label>
                <input type="password" />
                <button onClick={handleLogin} className="h-8 px-2 text-white bg-blue-600">Login</button>
            </div>
        // </div>
    )

    function handleLogin() {
        SignalsStore.login.isLoggedIn.value = true
    }
}
export { Login }