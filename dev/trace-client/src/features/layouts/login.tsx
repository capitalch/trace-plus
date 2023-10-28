import { Astrix } from "../../components/controls/astrix"

function Login() {
    return (
        <div className='w-[100vw] '>
            <div className="flex flex-col p-5 ml-14 prose shadow-xl border-[3px] rounded-xl sm:mx-auto border-primary-400 h-96 w-96">
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
                    <button className="flex items-center h-6 px-2 ml-auto text-xs font-bold text-pink-400" type="button">
                        Forgot password</button>
                </div>
            </div>
            
        </div>
    )
}
export { Login }

{/* <div className='w-[100vw]'>
<div className="flex flex-col p-4 ml-14 prose shadow-xl border-[3px] rounded-xl sm:mx-auto border-primary-400 h-96 w-96">
    <label className="mx-auto text-3xl font-bold text-primary-500 ">Login</label>
    <label  className="mt-2">User id / Email</label>
</div>
</div> */}