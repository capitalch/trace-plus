import {useForm} from 'react-hook-form'

function LoginForm(){
    const { handleSubmit} = useForm()
    return(
        <form  onSubmit={handleSubmit(onSubmit)} className="m-10 p-2 w-1/3 h-32 bg-slate-100 flex flex-col gap-3 items-center">
            <div className="flex items-center">
                <label className="w-36">User name:</label>
                <input className="h-8" type="text" />
            </div>
            <div className="flex items-center">
                <label className="w-36">Password:</label>
                <input className="h-8" type="text" />
            </div>
            <input type="submit" value='Submit' className="w-auto px-2 rounded-sm bg-gray-400" />
        </form>
    )

    function onSubmit(e:any){
        console.log('form subitted')
    }
}
export {LoginForm}