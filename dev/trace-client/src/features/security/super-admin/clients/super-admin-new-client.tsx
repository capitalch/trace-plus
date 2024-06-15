import { useForm } from "react-hook-form"
import { Messages } from "../../../../utils/messages"
// import { CompContentContainer } from "../../../../controls/components/comp-content-container"
import { WidgetFormErrorMessage } from "../../../../controls/widgets/widget-form-error-message"
import { WidgetFormHelperText } from "../../../../controls/widgets/widget-form-helper-text"
import { WidgetButtonSubmitFullWidth } from "../../../../controls/widgets/widget-button-submit-full-width"
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix"
import { WidgetTooltip } from "../../../../controls/widgets/widget-tooltip"

export function SuperAdminNewClient() {
    const { handleSubmit, register, formState: { errors } } = useForm({ mode: 'onTouched' })
    const registerClientCode = register('clientCode', {
        required: Messages.errRequired,
        minLength: { value: 6, message: Messages.errAtLeast6Chars },
        maxLength: { value: 10, message: Messages.errAtMost10Chars }
    })
    const registerClientName = register('clientName', {
        required: Messages.errRequired,
        minLength: { value: 6, message: Messages.errAtLeast6Chars },
        maxLength: { value: 50, message: Messages.errAtMost50Chars }
    })
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* <CompContentContainer title='New client'> */}
            <div className='flex flex-col gap-2 w-64'>
                <label className='flex flex-col font-medium text-primary-400'>
                    <span className='font-bold'>Client code <WidgetAstrix /></span>
                    <input type='text' className='rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic' {...registerClientCode} />
                    {(errors.clientCode)
                        ? <WidgetFormErrorMessage errorMessage={errors.clientCode.message} />
                        : <WidgetFormHelperText helperText='&nbsp;' />}
                    {/* <WidgetFormHelperText helperText={Messages.errAtLeast6Chars} /> */}
                </label>
                <label className='flex flex-col font-medium text-primary-400'>
                    <span className='font-bold'>Client name <WidgetAstrix /></span>
                    <input type='text' className='rounded-md border-[1px] border-primary-200 px-2 placeholder-slate-400 placeholder:text-xs placeholder:italic' {...registerClientName} />
                    <span className="flex justify-between">
                        {(errors.clientName)
                            ? <WidgetFormErrorMessage errorMessage={errors.clientName.message} />
                            : <WidgetFormHelperText helperText='&nbsp;' />}
                        {/* <WidgetFormHelperText helperText={Messages.errAtLeast6Chars} /> */}
                        <WidgetTooltip title='Client name should be at least 6 characters long' className="font-normal text-sm -top-4">
                            <span className='ml-auto text-xs text-primary-400 hover:cursor-pointer'>?</span>
                        </WidgetTooltip>
                    </span>
                </label>
                <div className='mt-2 flex justify-start'>
                    <WidgetButtonSubmitFullWidth label='Save' />
                </div>
            </div>
            {/* </CompContentContainer> */}
        </form>
    )

    function onSubmit() {
        console.log('onSubmit')
    }
}