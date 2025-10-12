import clsx from "clsx";
import { FormField } from "../../../../controls/widgets/form-field";
import { useFormContext, } from "react-hook-form";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../utils/messages";
import { useValidators } from "../../../../utils/validators-hook";
import { FormActionButtons } from "./form-action-buttons";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";

export function VoucherCommonHeader() {
    const { checkAllowedDate } = useValidators();
    const {
        watch,
        register,
        formState: { errors }
    } = useFormContext<VoucherFormDataType>();

    return (
        <div className="flex flex-wrap gap-4">
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

            <FormActionButtons className="ml-auto" />
        </div>
    )
}