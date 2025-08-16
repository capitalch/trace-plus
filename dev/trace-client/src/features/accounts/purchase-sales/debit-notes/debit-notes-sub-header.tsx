import { useFormContext } from "react-hook-form";
import { DebitNoteFormDataType } from "./debit-notes";
import { ControlledNumericInput } from "../../../../controls/components/controlled-numeric-input";
// import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";
import clsx from "clsx";
import { Messages } from "../../../../utils/messages";
import { FormField } from "../../../../controls/widgets/form-field";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import { useValidators } from "../../../../utils/validators-hook";

export function DebitNotesSubHeader() {
    const { isValidGstin } = useValidators();
    const {
        setValue,
        watch,
        register,
        trigger,
        // getValues,
        formState: { errors }
    } = useFormContext<DebitNoteFormDataType>();
    // const inputClass = " border-gray-300 focus:outline-none text-right font-semibold text-[16px] w-[10rem] h-7 rounded-md";
    const errorClass = 'bg-red-100 border-red-500 border-2'

    return (<div className="flex gap-6">

        {/* Amount */}
        {/* <div className="flex flex-col">
            <label className="font-semibold text-sm">Amount <WidgetAstrix /></label> */}
        <FormField label="Amount" required={true} error={errors?.amount?.message}>
            <ControlledNumericInput
                className={clsx(inputFormFieldStyles, errors?.amount && errorClass, 'mt-1.5 text-right')}
                fieldName="amount"
                required={true}
                onValueChange={(floatValue) => {
                    setValue('amount', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                }}
                validate={
                    (val: number) =>
                        val !== null && val !== undefined && !isNaN(val) && val > 0
                            ? true
                            : Messages.errRequired
                }
            />
        </FormField>
        {/* </div> */}

        {/* Is GST Applicable */}
        <FormField label="GST Applicable ?" className="items-center flex flex-col">
            <div className="flex items-center gap-2 mt-1.5">
                <button
                    type="button"
                    className={clsx(
                        "px-4 py-1 text-sm rounded-full border",
                        watch("isGstApplicable")
                            ? "bg-green-500 text-white border-green-600"
                            : "bg-white text-gray-600 border-gray-300"
                    )}
                    onClick={() => setValue("isGstApplicable", true, { shouldDirty: true })}
                >
                    Yes
                </button>
                <button
                    type="button"
                    className={clsx(
                        "px-4 py-1 text-sm rounded-full border",
                        !watch("isGstApplicable")
                            ? "bg-red-500 text-white border-red-600"
                            : "bg-white text-gray-600 border-gray-300"
                    )}
                    onClick={() => setValue("isGstApplicable", false, { shouldDirty: true })}
                >
                    No
                </button>
            </div>
        </FormField>

        {/* GSTIN No + isIgst Checkbox */}
        <FormField
            label="Gstin No"
            error={errors?.gstin?.message}
            className="mt-0.5"
            required={watch('isGstApplicable')}
        >
            <div className="flex items-center gap-3">
                <input
                    type="text"
                    {...register('gstin', {
                        validate: validateGstin,
                    })}
                    // className={clsx(inputFormFieldStyles, 'mt-0.5 w-40')}
                    className={clsx(inputFormFieldStyles, errors?.amount && errorClass, 'mt-1.5')}
                    placeholder="Enter GSTIN No"
                />

                {/* isIgst Checkbox */}
                <label className="flex items-center gap-2 text-xs mt-[2px] cursor-pointer font-medium ml-3">
                    <input
                        type="checkbox"
                        {...register('isIgst', {
                            onChange: () => {
                                trigger();
                            },
                        })}
                        className="checkbox checkbox-xs cursor-pointer"
                    />
                    IGST
                </label>
            </div>
        </FormField>

    </div>)

    function validateGstin(): string | undefined {
        const gstin = watch('gstin');
        const isGstApplicable = watch('isGstApplicable');

        if (!isGstApplicable) return;

        if (!gstin) {
            return Messages.errRequired;
        }

        if (!isValidGstin(gstin)) {
            return Messages.errInvalidGstin;
        }

        return;
    }
}