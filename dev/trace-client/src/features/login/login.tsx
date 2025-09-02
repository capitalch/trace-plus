import { useForm } from "react-hook-form"
import { Messages } from "../../utils/messages"
import { useLogin } from "./login-hook"
import { useValidators } from "../../utils/validators-hook"
import { UserTypesEnum } from "../../utils/global-types-interfaces-enums"
import { GLOBAL_APP_NAME, GLOBAL_APP_VERSION } from "../../app/global-constants"
import { WidgetAstrix } from "../../controls/widgets/widget-astrix"
import { WidgetFormHelperText } from "../../controls/widgets/widget-form-helper-text"
import { WidgetFormErrorMessage } from "../../controls/widgets/widget-form-error-message"
import { WidgetButtonSubmitFullWidth } from "../../controls/widgets/widget-button-submit-full-width"
import { CompTypeAhead } from "../../controls/components/comp-type-ahead"
import { Utils } from "../../utils/utils"
import urlJoin from "url-join"
import { ModalDialogA } from "../layouts/nav-bar/modal-dialogA"

function Login() {
    const { handleSubmit, register, setValue, clearErrors, formState: { errors, } } = useForm({ mode: 'onTouched' })
    const { handleForgotPassword, handleTestSignIn, onSubmit } = useLogin(setValue)
    const { checkPassword, checkUserNameOrEmail }: any = useValidators()
    const instance = 'user-login'
    const clientsUrl = urlJoin(Utils.getHostUrl(), 'api/login-clients')

    const registerClientId = register('clientId', {
        required: Messages.errRequired
    })

    // Note that this username is actually uid for login purposes
    // Fastapi makes it mandatory to name it strictly as username which is actually uid in this software
    const registerUserName = register('username', {
        required: Messages.errRequired,
        validate: { checkUserNameOrEmail },
        minLength: { value: 4, message: Messages.errAtLeast4Chars },
        value: 'capital'
    })

    const registerPassword = register('password', {
        required: Messages.errRequired,
        validate: { checkPassword },
        minLength: { value: 8, message: Messages.errAtLeast8Chars },
        value: 'su$hant123'
    })

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex h-screen">
                <div className="flex flex-col m-auto p-5 w-96 border-[2px] border-primary-200 rounded-md shadow-xl gap-3">
                    <span className="flex justify-end text-primary-300 text-xs -mr-4 -my-4">{GLOBAL_APP_NAME} {GLOBAL_APP_VERSION}</span>
                    <h2 className="m-2 mx-auto font-bold text-2xl text-primary-400"> Login </h2>

                    {/* ClientId */}
                    <label className="flex flex-col font-medium text-primary-400">
                        <span className="font-bold">Client name <WidgetAstrix /></span>
                        <CompTypeAhead
                            instance={instance}
                            noOfCharsToType={2}
                            optionLabel="clientName"
                            optionValue="id"
                            url={clientsUrl}
                            {...registerClientId}
                            onChange={handleOnChangeClient}
                            ref={null} //This is important to avoid an error in react-hook-form
                        />
                        {(errors.clientId)
                            ? <WidgetFormErrorMessage errorMessage={errors?.clientId?.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                        <WidgetFormHelperText helperText={Messages.messSelectClientName} />
                    </label>

                    {/* uid */}
                    <label className="flex flex-col font-medium text-primary-400">
                        <span className="font-bold">UID / Email <WidgetAstrix /></span>
                        <input autoComplete="username"
                            placeholder="accounts@gmail.com"
                            type="text"
                            className="px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs"
                            {...registerUserName} />
                        {(errors.username)
                            ? <WidgetFormErrorMessage errorMessage={Messages.errInvalidUserNameOrEmail} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                        <WidgetFormHelperText helperText={Messages.messUserNameEmailHelper} />
                    </label>

                    {/* Password */}
                    <label className="flex flex-col font-medium text-primary-400">
                        <span className="font-bold">Password <WidgetAstrix /></span>
                        <input placeholder="*****" type="password" className="px-2 border-[1px] border-primary-200 rounded-md placeholder-slate-400 placeholder:italic placeholder:text-xs" {...registerPassword} />
                        {(errors.password
                            ? <WidgetFormErrorMessage errorMessage={errors.password.message} />
                            : <WidgetFormHelperText helperText='&nbsp;' />)}
                        <WidgetFormHelperText helperText={Messages.messPasswordHelper} />
                    </label>
                    <span onClick={handleForgotPassword} className="ml-auto px-2 text-primary-400 text-xs hover:cursor-pointer hover:font-semibold hover:text-blue-400 hover:underline">Forgot password</span>

                    <div className="flex flex-col mt-2">
                        <WidgetButtonSubmitFullWidth label="Sign in" />
                        <div className="flex justify-start mt-2">
                            <span onClick={() => handleTestSignIn(UserTypesEnum.SuperAdmin)} className="py-1 text-primary-400 text-xs hover:cursor-pointer hover:font-semibold hover:text-primary-600 hover:underline">Super admin</span>
                            <span onClick={() => handleTestSignIn(UserTypesEnum.Admin)} className="ml-auto py-1 text-primary-400 text-xs hover:cursor-pointer hover:font-semibold hover:text-primary-600 hover:underline">Admin</span>
                            <span onClick={() => handleTestSignIn(UserTypesEnum.BusinessUser)} className="ml-auto py-1 text-primary-400 text-xs hover:cursor-pointer hover:font-semibold hover:text-primary-600 hover:underline">Business user</span>
                        </div>
                    </div>
                </div>
            </form>
            <ModalDialogA />
        </div>
    )

    function handleOnChangeClient(selectedObject: any) {
        setValue('clientId', selectedObject?.id)
        clearErrors('clientId')
    }
}
export { Login }