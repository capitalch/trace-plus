import { useForm } from "react-hook-form"
import { Astrix } from "../../components/widgets/astrix"
import { Messages } from "../../utils/messages"
import { FormErrorMessage } from "../../components/widgets/form-error-message"
import { FormHelperText } from "../../components/widgets/form-helper-text"
import { useLogin } from "./login-hook"
import { ButtonSubmitFullWidth } from "../../components/widgets/button-submit-full-width"
import { useValidators } from "../../utils/validators-hook"
import { UserTypesEnum } from "../../utils/global-types-interfaces-enums"
import { GlobalContextType } from "../../app/global-context"
import { useContext } from "react"
import { GlobalContext } from "../../App"

function Login() {
    const { handleSubmit, register, formState: { errors } } = useForm({ mode: 'onTouched' })
    const { handleForgotPassword,  handleTestSignIn, onSubmit } = useLogin()
    const { checkPassword, checkUserNameOrEmail }: any = useValidators()
    const globalContext: GlobalContextType = useContext(GlobalContext)
    const registerUserName = register('username', {
        required: Messages.errRequired,
        validate: { checkUserNameOrEmail },
        minLength: { value: 4, message: Messages.errAtLeast4Chars }
    })

    const registerPassword = register('password', {
        required: Messages.errRequired,
        validate: { checkPassword },
        minLength: { value: 8, message: Messages.errAtLeast8Chars }
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex h-screen">
            <div className="prose m-auto flex w-96 flex-col gap-3 rounded-md border-[2px] border-primary-200 p-5 shadow-xl">
            <span className="text-xs text-primary-300 flex justify-end -my-4 -mr-4">{globalContext.app.name} {globalContext.app.version}</span>
                <h2 className="mx-auto font-bold text-primary-400 m-2"> Login </h2>
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">User name / Email <Astrix /></span>
                    <input autoFocus autoComplete="username" placeholder="accounts@gmail.com" type="text" className="rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic" {...registerUserName} />
                    {(errors.username)
                        ? <FormErrorMessage errorMessage={Messages.errInvalidUserNameOrEmail} />
                        : <FormHelperText helperText="&nbsp;" />}
                    <FormHelperText helperText={Messages.messUserNameEmailHelper} />
                </label>
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Password <Astrix /></span>
                    <input type="password" placeholder="*********" autoComplete='current-password' className="rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic" {...registerPassword} />
                    {(errors.password
                        ? <FormErrorMessage errorMessage={errors.password.message} />
                        : <FormHelperText helperText='&nbsp;' />)}
                    <FormHelperText helperText={Messages.messPasswordHelper} />
                </label>
                <span onClick={handleForgotPassword} className="ml-auto px-2 text-xs text-primary-400 hover:cursor-pointer hover:font-semibold hover:text-blue-400 hover:underline">Forgot password</span>                               
                <div className="mt-2 flex flex-col">
                    <ButtonSubmitFullWidth label="Sign in"  />
                    <div className="mt-2 flex justify-start">
                        <span onClick={() => handleTestSignIn(UserTypesEnum.SuperAdmin)} className="py-1 text-xs text-primary-400 hover:cursor-pointer hover:font-semibold hover:text-primary-600 hover:underline">Super admin</span>
                        <span onClick={() => handleTestSignIn(UserTypesEnum.Admin)} className="ml-auto py-1 text-xs text-primary-400 hover:cursor-pointer hover:font-semibold hover:text-primary-600 hover:underline">Admin</span>
                        <span onClick={() => handleTestSignIn(UserTypesEnum.BusinessUser)} className="ml-auto py-1 text-xs text-primary-400 hover:cursor-pointer hover:font-semibold hover:text-primary-600 hover:underline">Business user</span>
                    </div>
                </div>                
            </div>
        </form>
    )
}
export { Login }