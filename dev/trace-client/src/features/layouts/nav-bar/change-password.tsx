import { WidgetButtonSubmitFullWidth } from "../../../controls/widgets/widget-button-submit-full-width"
import { WidgetTextInput } from "../../../controls/widgets/widget-text-input"

function ChangePassword() {
    return (<div className="w-80 h-auto flex flex-col gap-3 ">
        <div className="flex flex-col">
            <label className="text-sm text-primary-500 ">Current password</label>
            <WidgetTextInput size1='md' type="password" />
        </div>
        <div className="flex flex-col">
            <label className="text-sm text-primary-500 ">New password</label>
            <WidgetTextInput size1="md" type="password" />
        </div>
        <div className="flex flex-col">
            <label className="text-sm text-primary-500">Confirm new password</label>
            <WidgetTextInput size1="md" type='password' />
        </div>
        <WidgetButtonSubmitFullWidth label="Submit" onClick={handleSubmit} className="mt-4" />
    </div>)

    function handleSubmit() {

    }
}

export { ChangePassword }