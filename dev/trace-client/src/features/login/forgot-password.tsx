import { useForm } from "react-hook-form";
import _ from "lodash";
import { Messages } from "../../utils/messages";
import { WidgetFormErrorMessage } from "../../controls/widgets/widget-form-error-message";
import { WidgetFormHelperText } from "../../controls/widgets/widget-form-helper-text";
import { WidgetButtonSubmitFullWidth } from "../../controls/widgets/widget-button-submit-full-width";
import { WidgetAstrix } from "../../controls/widgets/widget-astrix";
import { Utils } from "../../utils/utils";
import urlJoin from "url-join";
import axios from "axios";
import { CompTypeAhead } from "../../controls/components/comp-type-ahead";

export function ForgotPassword() {
    const instance = 'forgot-password'
    const clientsUrl = urlJoin(Utils.getHostUrl(), 'api/login-clients')
    const { clearErrors, handleSubmit, register, setValue, formState: { errors } } = useForm<FormDataType>({
        mode: "onTouched",
        criteriaMode: "firstError"
    });

    const registerClientId = register('clientId', {
        required: Messages.errRequired
    })

    const registerEmail = register("email", {
        required: Messages.errRequired,
        pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: Messages.errInvalidEmail
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 w-auto min-w-72">

                {/* ClientId */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Client name <WidgetAstrix /></span>
                    <CompTypeAhead
                        instance={instance}
                        noOfCharsToType={1}
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

                {/* Email */}
                <label className="flex flex-col font-medium text-primary-400">
                    <span className="font-bold">Email <WidgetAstrix /></span>
                    <input type="email" placeholder="e.g. user@example.com" autoComplete="off"
                        className="mt-1 rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic"
                        {...registerEmail}
                    />
                    <span className="flex justify-between">
                        {(errors.email)
                            ? <WidgetFormErrorMessage errorMessage={errors.email.message} />
                            : <WidgetFormHelperText helperText="&nbsp;" />}
                    </span>
                </label>

                {/* Send Reset Link */}
                <div className="mt-4 flex justify-start">
                    <WidgetButtonSubmitFullWidth label="Send Reset Link" disabled={!_.isEmpty(errors)} />
                </div>
            </div>
        </form>
    );

    function handleOnChangeClient(selectedObject: any) {
        setValue('clientId', selectedObject?.id)
        clearErrors('clientId')
    }

    async function onSubmit(data: any) {
        // Use clientId also from login form
        try {
            const hostUrl = Utils.getHostUrl()
            const forgotPasswordUrl = urlJoin(hostUrl, 'api/forgot-password')
            await axios({
                method: 'post',
                url: forgotPasswordUrl,
                data: {
                    clientId: data.clientId,
                    email: data.email
                }
            })
            Utils.showSuccessAlertMessage({ message: Messages.messResetLinkSendSuccess, title: 'Success' })
        } catch (e: any) {
            Utils.showFailureAlertMessage({
                message: e?.response?.data?.message || e?.message || Messages.messResetLinkSendFail,
                title: 'Error'
            })
        }
    }
}

type FormDataType = {
    clientId: string
    email: string;
};
