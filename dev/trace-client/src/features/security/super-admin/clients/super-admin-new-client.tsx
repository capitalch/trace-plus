import { useForm } from "react-hook-form"
import { Messages } from "../../../../utils/messages"

export function SuperAdminNewClient(){
    const {register} = useForm({ mode: 'onTouched' })
    const registerClientCode = register('clientCode', {
        required: Messages.errRequired,
        minLength: {value: 6, message: Messages.errAtLeast6Chars},
        maxLength: {value: 10, message: Messages.errAtMost10Chars}
    })
    return (
        <div>
            SuperAdminNewClient
        </div>
    )
}