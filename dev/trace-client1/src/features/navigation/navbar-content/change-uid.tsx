
import { ButtonSubmitFullWidth } from "../../../components/controls/button-submit-full-width"
import { TextInput } from "../../../components/controls/text-input"

function ChangeUid() {
    return (<div className="w-80 h-auto flex flex-col gap-3 ">
        <div className="flex flex-col">
            <label className="text-sm text-primary-500">Current uid</label>
            <TextInput size='md' />
        </div>
        <div className="flex flex-col">
            <label className="text-sm text-primary-500">New uid</label>
            <TextInput size="md" />
        </div>
        <ButtonSubmitFullWidth label="Submit" onClick={handleSubmit} className="mt-4" />
    </div>)

    function handleSubmit() {

    }
}
export { ChangeUid }