import { NumericFormat } from "react-number-format";
import { FormField } from "../../../../controls/widgets/form-field";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "./all-vouchers-main";
import { useEffect } from "react";
import { Messages } from "../../../../utils/messages";

export function GstInLinePanel({
    className = '',
    index,
    lineItemEntryName
}: GstInLinePanelType) {
    const {
        // control,
        watch,
        register,
        setValue,
        formState: { errors },
    } = useFormContext<VoucherFormDataType>();

    const isGst = watch(`isGst`)

    useEffect(() => {
        register(`${lineItemEntryName}.${index}.gstRate`, {
            validate: (value) => {
                let ret = Messages.errRequiredShort
                if (isGst) {
                    if (value !== 0) {
                        ret = ''
                    }
                }
                return (ret)
            }
        })

        register(`${lineItemEntryName}.${index}.hsn`, {
            validate: (value) => {
                let ret = Messages.errRequiredShort
                if (isGst) {
                    if (value !== 0) {
                        ret = ''
                    }
                }
                return (ret)
            }
        })
    }, [isGst, lineItemEntryName, index, register])

    return (<div className={clsx("flex gap-1  bg-gray-50 border p-1 rounded-sm", className)}>
        {/* GST Rate */}
        <FormField label="GST Rate" className="w-20" required error={errors?.[lineItemEntryName]?.[index]?.gstRate?.message}>
            <NumericFormat
                allowNegative={false}
                decimalScale={2}
                defaultValue={0}
                fixedDecimalScale={true}
                className={clsx("h-8 mt-1 text-sm text-right", inputFormFieldStyles)}
                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                onValueChange={(values) =>
                    setValue(
                        `${lineItemEntryName}.${index}.gstRate`,
                        values.floatValue ?? 0,
                        { shouldValidate: true, shouldDirty: true }
                    )
                }
                value={watch(`${lineItemEntryName}.${index}.gstRate`)}
            />
        </FormField>

        {/* HSN Code */}
        <FormField label="HSN Code" className="w-26" required>
            <NumericFormat
                allowNegative={false}
                decimalScale={0}
                // defaultValue={0}
                fixedDecimalScale={true}
                className={clsx("h-8 mt-1 text-sm", inputFormFieldStyles)}
                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                onValueChange={(values) =>
                    setValue(
                        `${lineItemEntryName}.${index}.hsn`,
                        values.floatValue ?? 0,
                        { shouldValidate: true, shouldDirty: true }
                    )
                }
                value={watch(`${lineItemEntryName}.${index}.hsn`)}
            />
        </FormField>

        {/* Tax Breakdown Display */}
        <div className="text-xs text-gray-700 space-y-1 ml-1 border-l-2 pl-2 border-blue-200">
            {/* IGST Toggle */}
            <div className="flex items-center gap-2 mt-1">
                <input
                    type="checkbox"
                    id={`${lineItemEntryName}.${index}.isIgst`}
                    {...register(`${lineItemEntryName}.${index}.isIgst`)}
                    className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor={`${lineItemEntryName}.${index}.isIgst`} className="text-sm text-gray-700 cursor-pointer">
                    Apply IGST
                </label>
            </div>
            <div><strong>CGST:</strong> {watch(`${lineItemEntryName}.${index}.cgst`)}</div>
            <div><strong>SGST:</strong> {watch(`${lineItemEntryName}.${index}.sgst`)}</div>
            <div><strong>IGST:</strong> {watch(`${lineItemEntryName}.${index}.igst`)}</div>
        </div>
    </div>)
}

type GstInLinePanelType = {
    className?: string
    index: number
    lineItemEntryName: 'debitEntries' | 'creditEntries'
}