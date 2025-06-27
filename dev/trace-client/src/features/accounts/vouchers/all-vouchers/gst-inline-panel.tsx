import { NumericFormat } from "react-number-format";
import { FormField } from "../../../../controls/widgets/form-field";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "./all-vouchers-main";
import { useCallback, useEffect } from "react";
import { Messages } from "../../../../utils/messages";
import Decimal from "decimal.js";
import { Utils } from "../../../../utils/utils";

export function GstInLinePanel({
    className = '',
    index,
    lineItemEntryName
}: GstInLinePanelType) {
    const {
        watch,
        register,
        setValue,
        formState: { errors },
    } = useFormContext<VoucherFormDataType>();

    const isGst = watch(`isGst`)
    const gstRateErrorMessage = errors?.[lineItemEntryName]?.[index]?.gstRate?.message
    const hsnErrorMessage = errors?.[lineItemEntryName]?.[index]?.hsn?.message
    const amount = watch(`${lineItemEntryName}.${index}.amount`)
    const gstRate = watch(`${lineItemEntryName}.${index}.gstRate`)
    const isIgst = watch(`${lineItemEntryName}.${index}.isIgst`)

    const calculateGst = useCallback(
        ({ amount, gstRate, isIgst, index }: { amount: number, gstRate: number, isIgst: boolean, index: number }) => {
            if (!isGst || !amount || !gstRate) return;

            const amt = new Decimal(amount);
            const rate = new Decimal(gstRate);

            const divisor = new Decimal(1).plus(rate.div(100));
            const taxableAmount = amt.div(divisor);
            const gst = taxableAmount.mul(rate.div(100)).toDecimalPlaces(2);
            const gstHalf = gst.div(2).toDecimalPlaces(2);

            if (isIgst) {
                setValue(`${lineItemEntryName}.${index}.igst`, gst.toNumber(), { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.cgst`, 0, { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.sgst`, 0, { shouldDirty: true });
            } else {
                setValue(`${lineItemEntryName}.${index}.igst`, 0, { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.cgst`, gstHalf.toNumber(), { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.sgst`, gstHalf.toNumber(), { shouldDirty: true });
            }
        },
        [isGst, setValue, lineItemEntryName] // dependencies
    );

    useEffect(() => {
        calculateGst({
            amount: amount,
            gstRate: gstRate || 0,
            isIgst: isIgst || false,
            index: index
        })
    }, [amount, gstRate, isIgst, index, calculateGst])

    return (
        <div className={clsx("flex gap-2 min-w-[130px] bg-gray-50 border p-1 px-2 rounded-sm items-start", className)}>

            {/* GST Rate */}
            <FormField label="GST Rate" className="w-20" required error={gstRateErrorMessage}>
                <NumericFormat
                    allowNegative={false}
                    decimalScale={2}
                    defaultValue={0}
                    fixedDecimalScale={true}
                    className={clsx("h-8  text-sm text-right", inputFormFieldStyles, gstRateErrorMessage ? 'border-red-400' : '')}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    onValueChange={(values) =>
                        setValue(
                            `${lineItemEntryName}.${index}.gstRate`,
                            values.floatValue ?? 0,
                            { shouldValidate: true, shouldDirty: true }
                        )
                    }
                    value={watch(`${lineItemEntryName}.${index}.gstRate`)}
                    {...register(`${lineItemEntryName}.${index}.gstRate`, {
                        validate: (value) => {
                            const liveIsGst = watch("isGst"); // Get latest value dynamically
                            if (liveIsGst && (!value || value === 0)) return Messages.errRequiredShort;
                            return true;
                        },
                    })}
                />
            </FormField>

            {/* HSN Code */}
            <FormField label="HSN Code" className="w-24" required error={hsnErrorMessage}>
                <input
                    type="text"
                    className={clsx("h-8 text-sm", inputFormFieldStyles, hsnErrorMessage ? 'border-red-400' : '')}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    {...register(`${lineItemEntryName}.${index}.hsn`, {
                        validate: (value) => {
                            const liveIsGst = watch("isGst");
                            if (!liveIsGst) return true;
                            if (value === null || value === undefined) {
                                return Messages.errRequiredShort; // Example: "HSN required"
                            }

                            const num = Number(value);
                            if (isNaN(num) || num === 0) {
                                return Messages.errInvalidHsn; // Custom message
                            }
                            return true;
                            // if (liveIsGst && (!value || value === 0)) return Messages.errRequiredShort;
                            // return true;
                        },
                    })}
                />

            </FormField>

            {/* Tax Breakdown */}
            <div className="flex flex-col gap-1 border-l-2 pl-3 border-blue-200 min-w-[130px] text-right text-xs text-gray-700 pr-2">
                {/* IGST Toggle */}
                <div className="flex items-center justify-center gap-2 mb-1">
                    <label htmlFor={`${lineItemEntryName}.${index}.isIgst`} className="text-sm cursor-pointer">
                        Apply IGST
                    </label>
                    <input
                        type="checkbox"
                        id={`${lineItemEntryName}.${index}.isIgst`}
                        {...register(`${lineItemEntryName}.${index}.isIgst`)}
                        className="w-4 h-4 cursor-pointer"
                    />
                </div>

                {/* CGST / SGST / IGST values */}
                <div className="flex justify-between">
                    <span className="font-medium">CGST:</span>
                    <span className="min-w-[60px] text-right">{Utils.toDecimalFormat(watch(`${lineItemEntryName}.${index}.cgst`))}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">SGST:</span>
                    <span className="min-w-[60px] text-right">{Utils.toDecimalFormat(watch(`${lineItemEntryName}.${index}.sgst`))}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">IGST:</span>
                    <span className="min-w-[60px] text-right">{Utils.toDecimalFormat(watch(`${lineItemEntryName}.${index}.igst`))}</span>
                </div>
            </div>
        </div>
    )
}

type GstInLinePanelType = {
    className?: string
    index: number
    lineItemEntryName: 'debitEntries' | 'creditEntries'
}