import { ButtonSubmitFullWidth } from "../../../components/widgets/button-submit-full-width";
import { TextInput } from "../../../components/widgets/text-input";

export function ChangeUid() {
    return (<div className="w-80 h-auto flex flex-col gap-3 ">
        <div className="flex flex-col">
            <label className="text-sm text-primary-500" >Current uid</label>
            <TextInput type="text" size1="md" />
        </div>
        <div className="flex flex-col">
            <label className="text-sm text-primary-500">New uid</label>
            <TextInput size1="md" type='text' />
        </div>
        <ButtonSubmitFullWidth label="Submit" onClick={handleSubmit} className="mt-4" />
    </div>)

    function handleSubmit() {

    }
}