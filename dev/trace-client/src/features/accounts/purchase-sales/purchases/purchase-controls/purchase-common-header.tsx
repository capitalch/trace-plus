import { useFormContext } from "react-hook-form";
import _ from 'lodash';
import { useValidators } from "../../../../../utils/validators-hook";
import { PurchaseFormDataType } from "../all-purchases/all-purchases";
import { FormField } from "../../../../../controls/widgets/form-field";
import clsx from "clsx";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../../utils/messages";
import { IconReset } from "../../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../../controls/icons/icon-submit";
// import { getVal } from "@syncfusion/ej2-react-inputs";

export function PurchaseCommonHeader() {
    const { checkAllowedDate } = useValidators();
    const {        
        setValue,
        watch,
        register,
        getValues,
        formState: { errors, isSubmitting, isDirty, }
    } = useFormContext<PurchaseFormDataType>();
    const { resetAll }: any = useFormContext();
    return (
        <div className="flex gap-6 flex-wrap">

            {/* Auto ref no */}
            <FormField label="Auto ref no" className="w-52 ">
                <input
                    type="text"
                    className={clsx("bg-gray-200 rounded mt-1")}
                    readOnly
                    disabled
                    title="Auto reference number"
                    value={watch("autoRefNo") ?? undefined}
                />
            </FormField>

            {/* tran date */}
            <FormField label="Date" required error={errors?.tranDate?.message}>
                <input
                    type="date"
                    className={clsx(
                        inputFormFieldStyles, 'mt-1',
                        errors?.tranDate && "border-red-500 bg-red-100"
                    )}
                    {...register("tranDate", {
                        required: Messages.errRequired,
                        validate: checkAllowedDate
                    })}
                />
            </FormField>

            {/* User ref no / Invoice no*/}
            <FormField required label="Invoice No" error={errors?.userRefNo?.message}>
                <input
                    type="text"
                    className={clsx(inputFormFieldStyles, 'mt-1')}
                    placeholder="Enter invoice no"
                    {...register("userRefNo", {
                        required: Messages.errRequired
                    })}
                />
            </FormField>

            {/* Remarks */}
            <FormField className="min-w-60 w-auto" label="Remarks">
                <textarea
                    rows={3}
                    className={clsx(inputFormFieldStyles, "text-xs mt-1")}
                    placeholder="Enter remarks"
                    {...register("remarks")}
                />
            </FormField>

            {/* Is GST Invoice */}
            <FormField label="GST Invoice ?" className="items-center ml-4">
                <div className="flex items-center gap-2 mt-3">
                    <button
                        type="button"
                        className={clsx(
                            "px-4 py-1 text-sm rounded-full border",
                            watch("isGstInvoice")
                                ? "bg-green-500 text-white border-green-600"
                                : "bg-white text-gray-600 border-gray-300"
                        )}
                        onClick={() => setValue("isGstInvoice", true, { shouldDirty: true })}
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        className={clsx(
                            "px-4 py-1 text-sm rounded-full border",
                            !watch("isGstInvoice")
                                ? "bg-red-500 text-white border-red-600"
                                : "bg-white text-gray-600 border-gray-300"
                        )}
                        onClick={() => setValue("isGstInvoice", false, { shouldDirty: true })}
                    >
                        No
                    </button>
                </div>
            </FormField>

            {/* Reset submit */}
            <div className="flex gap-3 ml-auto mt-6 h-10">
                {/* Test */}
                <button
                    type="button" onClick={() => {
                        const formData = getValues();
                        console.log("Form Data:", formData);
                        console.log(errors)                        
                    }}
                >
                    Test
                </button>
                {/* Reset */}
                <button
                    onClick={resetAll}
                    type="button"
                    className="px-5 font-medium text-white inline-flex items-center bg-amber-500 hover:bg-amber-800 focus:ring-4 focus:outline-hidden focus:ring-amber-300 rounded-lg text-center dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800 disabled:bg-amber-200"
                >
                    <IconReset className="text-white w-6 h-6 mr-2" />
                    Reset
                </button>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting || !_.isEmpty(errors) || !isDirty}
                    className="px-5 py-2 font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-hidden focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200"
                >
                    <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit
                </button>
            </div>
        </div>
    );

    // function handleOnClickNoGstInvoice() {

    // }
}