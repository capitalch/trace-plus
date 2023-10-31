import { Astrix } from "../../components/controls/astrix"
import { useLogin } from "./login-hook"

function Login() {
    const { handleForgotPassword, handleSignIn, handleTestSignIn } = useLogin()

    return (
        <div className='w-[100vw] '>
            <div className="flex flex-col p-5 ml-14 prose shadow-xl border-[3px] rounded-xl sm:mx-auto border-primary-400 h-auto w-96">
                <h2 className="mx-auto text-primary-400">Login</h2>
                <div className="flex flex-col gap-1">
                    <div>
                        <label className="font-medium text-primary-400">User id / Email</label>
                        <Astrix />
                    </div>
                    <input type="text" className="border-[1px] border-primary-200 px-2 rounded-md" />
                    <label className="text-xs text-slate-500">At least 4 characters long | no space | no special char</label>
                </div>
                <div className="flex flex-col gap-1 mt-3">
                    <div>
                        <label className="font-medium text-primary-400">Password</label>
                        <Astrix />
                    </div>
                    <input type="password" className="border-[1px] border-primary-200 px-2 rounded-md" />
                    <label className="text-xs text-slate-500">At least 8 characters long | 1 digit | 1 special char</label>
                    <span onClick={handleForgotPassword} className="px-2 py-1 ml-auto text-xs text-primary-400 hover:text-primary-600 hover:cursor-pointer hover:font-semibold hover:underline">Forgot password</span>
                </div>
                <div className="flex flex-col mt-3">
                    <button onClick={handleSignIn} className="w-full h-10 py-1 text-xl text-white bg-primary-400 hover:bg-primary-600 hover:border-2 hover:border-primary-300">Sign in</button>
                    <div className="flex justify-start mt-2 ">
                        <span onClick={() => handleTestSignIn('superAdmin')} className="py-1 text-xs text-primary-400 hover:text-primary-600 hover:cursor-pointer hover:font-semibold hover:underline">Super admin</span>
                        <span onClick={() => handleTestSignIn('admin')} className="py-1 ml-auto text-xs text-primary-400 hover:text-primary-600 hover:cursor-pointer hover:font-semibold hover:underline">Admin</span>
                        <span onClick={() => handleTestSignIn('businessUser')} className="py-1 ml-auto text-xs text-primary-400 hover:text-primary-600 hover:cursor-pointer hover:font-semibold hover:underline">Business user</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
export { Login }