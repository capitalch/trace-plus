import { useForm } from "react-hook-form"
import { Astrix } from "../../components/widgets/astrix"
import { Messages } from "../../utils/messages"

function Login() {
    const { handleSubmit, register, formState: { errors } } = useForm({ mode: 'onTouched' })

    const registerUserName = register('username', {
        required: Messages.errRequired,
        // validate: { checkUserNameOrEmail },
        minLength: { value: 4, message: Messages.errAtLeast4Chars }
    })

    const registerPassword = register('password', {
        required: Messages.errRequired,
        // validate: { checkPassword },
        minLength: { value: 8, message: Messages.errAtLeast8Chars}
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="h-screen flex">
            <div className="prose flex w-96 flex-col rounded-md border-[2px] border-primary-200 p-5 shadow-xl m-auto">
                <h3 className="mx-auto font-bold text-primary-400">Login</h3>
                <div className="flex flex-col">
                    <label className="flex flex-col gap-1 font-medium text-primary-400">
                        <span>User name / Email <Astrix /></span>
                        <input autoFocus autoComplete="username" placeholder="accounts@gmail.com" type="text" className="rounded-sm border-[1px] border-primary-200 px-2 py-1 placeholder-slate-400 placeholder:text-xs placeholder:italic" {...registerUserName} />
                        {/* {(errors.username)
                            ? <FormErrorMessage errorMessage={Messages.errInvalidUserNameOrEmail} />
                            : <FormHelperText helperText={Messages.messUserNameEmailHelper} />} */}
                        <label className="mt-1 text-xs text-slate-500"></label>
                    </label>
                </div>
            </div>
        </form>
    )

    function onSubmit(){

    }
}
export { Login }