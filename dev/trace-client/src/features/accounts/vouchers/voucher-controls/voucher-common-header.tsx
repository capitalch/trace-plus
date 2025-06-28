import clsx from "clsx";
import { FormField } from "../../../../controls/widgets/form-field";
import { useFormContext, } from "react-hook-form";
// import { VoucherFormDataType } from "./all-vouchers-main";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../utils/messages";
import { useValidators } from "../../../../utils/validators-hook";
import { FormActionButtons } from "./form-action-buttons";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";


export function VoucherCommonHeader() {
    const { checkAllowedDate, isValidGstin } = useValidators();
    const { hasGstin } = useUtilsInfo()
    const {
        setValue,
        watch,
        register,
        formState: { errors, /*isSubmitting, isDirty */ }
    } = useFormContext<VoucherFormDataType>();

    return (
        <div className="flex gap-4 flex-wrap mt-2">

            {/* Auto ref no */}
            <FormField label="Auto ref no" className="w-40 ">
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
                        "text-right rounded-lg",
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
            <FormField className="min-w-60 w-auto" label="Remarks">
                <textarea
                    rows={3}
                    className={clsx(inputFormFieldStyles, "text-xs mt-1")}
                    placeholder="Enter remarks"
                    {...register("remarks")}
                />
            </FormField>

            {/* GST Toggle */}
            {hasGstin && (
                <FormField label="GST Applicable" className="items-center">
                    <div className="flex items-center gap-2 mt-3">
                        <button
                            type="button"
                            className={clsx(
                                "px-4 py-1 text-sm rounded-full border",
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
                                "px-4 py-1 text-sm rounded-full border",
                                !watch("isGst")
                                    ? "bg-red-500 text-white border-red-600"
                                    : "bg-white text-gray-600 border-gray-300"
                            )}
                            onClick={() => setValue("isGst", false, { shouldDirty: true })}
                        >
                            No
                        </button>
                    </div>
                </FormField>
            )}

            {/* GSTIN no */}
            {watch('isGst') && <FormField label="GSTIN No" error={errors?.gstin?.message}>
                <input
                    type="text"
                    className={clsx(inputFormFieldStyles, "mt-2 text-xs")}
                    placeholder="Enter GSTIN No"
                    {...register("gstin", {
                        validate: (value) => {
                            const liveIsGst = watch("isGst");
                            if (!liveIsGst) return true; // Skip validation if GST is not applicable
                            if (!value) return Messages.errRequiredShort;
                            if (!isValidGstin(value)) {
                                return (Messages.errInvalidGstin);
                            }
                        }
                    })}
                />
            </FormField>}
            <FormActionButtons className="mt-8 ml-auto" />
        </div>
    )
}