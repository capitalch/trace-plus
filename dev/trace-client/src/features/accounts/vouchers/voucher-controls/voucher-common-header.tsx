import clsx from "clsx";
import { FormField } from "../../../../controls/widgets/form-field";
import { useFormContext, } from "react-hook-form";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../utils/messages";
import { useValidators } from "../../../../utils/validators-hook";
import { FormActionButtons } from "./form-action-buttons";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";

export function VoucherCommonHeader() {
    const { checkAllowedDate } = useValidators();
    const { hasGstin } = useUtilsInfo()
    const {
        setValue,
        watch,
        register,
        formState: { errors }
    } = useFormContext<VoucherFormDataType>();
    const showGstInHeader = watch('showGstInHeader');
    return (
        <div className="flex flex-wrap mt-2 gap-4">

            {/* Auto ref no */}
            <FormField label="Auto ref no" className="w-40">
                <input
                    type="text"
                    className={clsx("mt-1 bg-gray-200 rounded-lg", inputFormFieldStyles)}
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
                        "text-right rounded-lg mt-1",
                        inputFormFieldStyles,
                        errors?.tranDate && "border-red-500 bg-red-100"
                    )}
                    {...register("tranDate", {
                        required: Messages.errRequired,
                        validate: checkAllowedDate
                    })}
                />
            </FormField>

            {/* User ref no */}
            <FormField label="User ref no" className="max-w-44">
                <input
                    type="text"
                    className={clsx(inputFormFieldStyles, "mt-1")}
                    placeholder="Enter user ref no"
                    {...register("userRefNo")}
                />
            </FormField>

            {/* Remarks */}
            <FormField className="w-auto min-w-60" label="Remarks">
                <textarea
                    rows={3}
                    className={clsx(inputFormFieldStyles, "text-xs mt-1")}
                    placeholder="Enter remarks"
                    {...register("remarks")}
                />
            </FormField>

            {/* GST Toggle */}
            {hasGstin && showGstInHeader && (
                <FormField label="GST Applicable" className="items-center">
                    <div className="flex items-center mt-3 gap-2">
                        <button
                            type="button"
                            className={clsx(
                                "px-4 py-1 text-sm rounded-sm border",
                                watch("isGst")
                                    ? "bg-green-500 text-white border-green-600"
                                    : "bg-white text-gray-600 border-gray-300"
                            )}
                            onClick={() => setValue("isGst", true, { shouldDirty: true })}
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            className={clsx(
                                "px-4 py-1 text-sm rounded-sm border",
                                !watch("isGst")
                                    ? "bg-red-500 text-white border-red-600"
                                    : "bg-white text-gray-600 border-gray-300"
                            )}
                            onClick={handleOnClickNoGst}
                        >
                            No
                        </button>
                    </div>
                </FormField>
            )}
            <FormActionButtons className="mt-6 ml-auto" />
        </div>
    )

    function handleOnClickNoGst() {
        const debitEntries = watch("debitEntries") || [];
        const creditEntries = watch("creditEntries") || [];
        debitEntries.forEach((entry, index) => {
            if (entry?.gst?.id) {
                const existing = watch(`debitEntries.${index}.deletedIds`) || [];
                const updated = [...existing, entry.gst.id];
                setValue(`debitEntries.${index}.deletedIds`, updated, { shouldDirty: true });
            }
            setValue(`debitEntries.${index}.gst`, undefined, { shouldDirty: true });
        });

        creditEntries.forEach((entry, index) => {
            if (entry?.gst?.id) {
                const existing = watch(`creditEntries.${index}.deletedIds`) || [];
                const updated = [...existing, entry.gst.id];
                setValue(`creditEntries.${index}.deletedIds`, updated, { shouldDirty: true });
            }
            setValue(`creditEntries.${index}.gst`, undefined, { shouldDirty: true });
        });

        setValue("isGst", false, { shouldDirty: true });
    }
}