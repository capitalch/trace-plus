import { ButtonSubmitFullWidth } from "../../../components/widgets/button-submit-full-width";
import { TextInput, TextInput1 } from "../../../components/widgets/text-input";

export function ChangeUid() {
    return (<div className="w-80 h-auto flex flex-col gap-3 ">
        <div className="flex flex-col">
            <label className="text-sm text-primary-500" >Current uid</label>
            <TextInput1 size="sm" className="text-red-400" value='100'  />
            {/* <TextInput1  className="text-red-400"   /> */}
            <input type="text" className="text-red-400" />
        </div>
        <div className="flex flex-col">
            <label className="text-sm text-primary-500">New uid</label>
            <TextInput size="md" props={{ type: 'password',  }}/>
        </div>
        <ButtonSubmitFullWidth label="Submit" onClick={handleSubmit} className="mt-4" />
    </div>)

    function handleSubmit() {

    }
}