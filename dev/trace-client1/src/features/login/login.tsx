import { useForm } from "react-hook-form"
import { Astrix } from "../../components/controls/astrix"
import { ButtonSubmitFullWidth } from "../../components/controls/button-submit-full-width"
import { useLogin } from "./login-hook"
import { Messages } from "../../app/messages"
import { useAppValidators } from "../../app/app-validators-hook"
import { FormErrorMessage } from "../../components/controls/form-error-message"
import { FormHelperText } from "../../components/controls/form-helper-text"

function Login() {
    const { handleForgotPassword, handleTestSignIn, onSubmit } = useLogin()
    const { handleSubmit, register, formState: { errors } } = useForm({ mode: 'onTouched' })
    const { checkPassword, checkUserNameOrEmail }: any = useAppValidators()

    const registerUserName = register('username', {
        required: Messages.errRequired,
        validate: { checkUserNameOrEmail },
        minLength: { value: 4, message: Messages.errAtLeast4Chars }
    })

    const registerPassword = register('password', {
        required: Messages.errRequired,
        validate: { checkPassword },
        minLength: { value: 8, message: Messages.errAtLeast8Chars}
    })
    return (
        <form onSubmit={handleSubmit(onSubmit)} className='w-[100vw] '>
            <div className="flex flex-col p-5 ml-14 prose shadow-xl border-[3px] rounded-xl sm:mx-auto border-primary-400 h-auto w-96">
                <h2 className="mx-auto text-primary-400">Login</h2>
                <div className="flex flex-col gap-1">
                    <label className="flex flex-col font-medium text-primary-400">
                        <span>User name / Email <Astrix /></span>
                        <input autoFocus autoComplete="username" placeholder="accounts@gmail.com" type="text" className="border-[1px] border-primary-200 px-2 rounded-md placeholder-slate-400 placeholder:text-xs placeholder:italic" {...registerUserName} />
                        {(errors.username)
                            ? <FormErrorMessage errorMessage={Messages.errInvalidUserNameOrEmail} />
                            : <FormHelperText helperText={Messages.messUserNameEmailHelper} />}
                        <label className="mt-1 text-xs text-slate-500"></label>
                    </label>
                </div>

                <div className="flex flex-col gap-1 mt-3">
                    <div className="flex flex-col gap-1" >
                        <label className="flex flex-col font-medium text-primary-400">
                            <span>Password <Astrix /></span>
                            <input type="password" placeholder="*****" autoComplete='current-password' className="border-[1px] border-primary-200 px-2 rounded-md placeholder-slate-400 placeholder:text-xs placeholder:italic" {...registerPassword} />
                            {(errors.password ?
                                <FormErrorMessage errorMessage={errors.password.message} /> : <FormHelperText helperText={Messages.messPasswordHelper} />)}

                        </label>
                        <span onClick={handleForgotPassword} className="px-2 py-1 mt-1 ml-auto text-xs text-primary-400 hover:text-error-600 hover:cursor-pointer hover:font-semibold hover:underline">Forgot password</span>
                    </div>
                </div>
                <div className="flex flex-col mt-3">                    
                    <ButtonSubmitFullWidth label="Sign in"  />
                    <div className="flex justify-start mt-2 ">
                        <span onClick={() => handleTestSignIn('superAdmin')} className="py-1 text-xs text-primary-400 hover:text-primary-600 hover:cursor-pointer hover:font-semibold hover:underline">Super admin</span>
                        <span onClick={() => handleTestSignIn('admin')} className="py-1 ml-auto text-xs text-primary-400 hover:text-primary-600 hover:cursor-pointer hover:font-semibold hover:underline">Admin</span>
                        <span onClick={() => handleTestSignIn('businessUser')} className="py-1 ml-auto text-xs text-primary-400 hover:text-primary-600 hover:cursor-pointer hover:font-semibold hover:underline">Business user</span>
                    </div>
                </div>
            </div>
        </form>
    )
}
export { Login }