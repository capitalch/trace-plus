function LoginForm(){
    return(
        <div className="m-10 w-1/3 h-32 bg-slate-100 flex flex-col gap-3 items-center">
            <div className="flex items-center">
                <label className="w-36">User name:</label>
                <input className="h-8" type="text" />
            </div>
            <div className="flex items-center">
                <label className="w-36">Password:</label>
                <input className="h-8" type="text" />
            </div>
            <button className="w-auto px-2 rounded-sm bg-gray-400">Submit</button>
        </div>
    )
}
export {LoginForm}