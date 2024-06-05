import { WidgetButtonSubmitFullWidth } from "../../../controls/widgets/widget-button-submit-full-width";
import { WidgetTextInput } from "../../../controls/widgets/widget-text-input";

export function ChangeUid() {
    return (<div className="w-80 h-auto flex flex-col gap-3 ">
        <div className="flex flex-col">
            <label className="text-sm text-primary-500" >Current uid</label>
            <WidgetTextInput type="text" size1="md" />
        </div>
        <div className="flex flex-col">
            <label className="text-sm text-primary-500">New uid</label>
            <WidgetTextInput size1="md" type='text' />
        </div>
        <WidgetButtonSubmitFullWidth label="Submit" onClick={handleSubmit} className="mt-4" />
    </div>)

    function handleSubmit() {

    }
}