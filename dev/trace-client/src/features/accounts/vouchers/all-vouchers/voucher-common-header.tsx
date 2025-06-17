import clsx from "clsx";
import { FormField } from "../../../../controls/widgets/form-field";
import { useFormContext, } from "react-hook-form";
// import { VourcherType } from "../vouchers-slice";
import { VoucherFormDataType } from "./all-vouchers-main";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../utils/messages";
import { useValidators } from "../../../../utils/validators-hook";
import { FormActionButtons } from "./form-action-buttons";

export function VoucherCommonHeader() {
    const { checkAllowedDate } = useValidators();
    const {
        watch,
        register,
        formState: { errors, /*isSubmitting, isDirty */ }
    } = useFormContext<VoucherFormDataType>();
    return (
        <div className="flex gap-4 flex-wrap">

            {/* Auto ref no */}
            <FormField label="Auto ref no" className="w-52 ">
                <input
                    type="text"
                    className={clsx("mt-1 bg-gray-200 rounded-lg")}
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
                        "text-right rounded-lg h-10",
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
            <FormField label="User ref no">
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

            <FormActionButtons className="mt-8 ml-auto" />
        </div>
    )
}