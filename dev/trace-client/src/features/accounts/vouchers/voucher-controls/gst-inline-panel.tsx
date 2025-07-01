import { NumericFormat } from "react-number-format";
import { FormField } from "../../../../controls/widgets/form-field";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { useCallback, useEffect } from "react";
import { Messages } from "../../../../utils/messages";
import Decimal from "decimal.js";
import { Utils } from "../../../../utils/utils";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";
import { useValidators } from "../../../../utils/validators-hook";

export function GstInLinePanel({
    className = '',
    index,
    lineItemEntryName
}: GstInLinePanelType) {
    const {
        watch,
        // clearErrors,
        register,
        setValue,
        formState: { errors },
    } = useFormContext<VoucherFormDataType>();

    const { isValidGstin } = useValidators();

    const isGst = watch(`isGst`)
    const gstRateErrorMessage = errors?.[lineItemEntryName]?.[index]?.gst?.rate?.message
    const hsnErrorMessage = errors?.[lineItemEntryName]?.[index]?.gst?.hsn?.message
    const gstinErrorMessage = errors?.[lineItemEntryName]?.[index]?.gst?.gstin?.message
    const amount = watch(`${lineItemEntryName}.${index}.amount`)
    const gstRate = watch(`${lineItemEntryName}.${index}.gst.rate`)
    const isIgst = watch(`${lineItemEntryName}.${index}.gst.isIgst`)

    const calculateGst = useCallback(
        ({ amount, rate, isIgst, index }: { amount: number, rate: number, isIgst: boolean, index: number }) => {
            if (!isGst || !amount || !rate) return;

            const amt = new Decimal(amount);
            const rat = new Decimal(rate);

            const divisor = new Decimal(1).plus(rat.div(100));
            const taxableAmount = amt.div(divisor);
            const gst = taxableAmount.mul(rat.div(100)).toDecimalPlaces(2);
            const gstHalf = gst.div(2).toDecimalPlaces(2);

            if (isIgst) {
                setValue(`${lineItemEntryName}.${index}.gst.igst`, gst.toNumber(), { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.gst.cgst`, 0, { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.gst.sgst`, 0, { shouldDirty: true });
            } else {
                setValue(`${lineItemEntryName}.${index}.gst.igst`, 0, { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.gst.cgst`, gstHalf.toNumber(), { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.gst.sgst`, gstHalf.toNumber(), { shouldDirty: true });
            }
        },
        [isGst, setValue, lineItemEntryName] // dependencies
    );

    // useEffect(() => {
    //     if (!isGst) {
    //         clearErrors(`${lineItemEntryName}.${index}.gst.rate`)
    //         clearErrors(`${lineItemEntryName}.${index}.gst.hsn`)
    //         clearErrors(`${lineItemEntryName}.${index}.gst.gstin`)
    //     }
    // }, [isGst, index, clearErrors, lineItemEntryName])

    useEffect(() => {
        calculateGst({
            amount: amount,
            rate: gstRate || 0,
            isIgst: isIgst || false,
            index: index
        })
    }, [amount, gstRate, isIgst, index, calculateGst])

    return (
        <div className={clsx("flex gap-2 min-w-[130px] bg-gray-50 border p-1 px-2 rounded-sm items-start", className)}>

            <div className="flex flex-col">
                <div className="flex gap-2">
                    {/* GST Rate */}
                    <FormField label="GST Rate" className="w-18 text-xs" required error={gstRateErrorMessage} >
                        <NumericFormat
                            allowNegative={false}
                            decimalScale={2}
                            defaultValue={0}
                            fixedDecimalScale={true}
                            className={clsx("h-6 text-xs text-right", inputFormFieldStyles, gstRateErrorMessage ? 'border-red-400' : '')}
                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                            onValueChange={(values) =>
                                setValue(
                                    `${lineItemEntryName}.${index}.gst.rate`,
                                    values.floatValue ?? 0,
                                    { shouldValidate: true, shouldDirty: true }
                                )
                            }
                            value={watch(`${lineItemEntryName}.${index}.gst.rate`)}
                            {...register(`${lineItemEntryName}.${index}.gst.rate`, {
                                validate: (value) => {
                                    const liveIsGst = watch("isGst"); // Get latest value dynamically
                                    if (liveIsGst && (!value || value === 0)) return Messages.errRequiredShort;
                                    return true;
                                },
                            })}
                        />
                    </FormField>

                    {/* HSN Code */}
                    <FormField label="HSN Code" className="w-20 text-xs" required error={hsnErrorMessage}>
                        <input
                            type="text"
                            className={clsx("h-6 text-xs", inputFormFieldStyles, hsnErrorMessage ? 'border-red-400' : '')}
                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                            {...register(`${lineItemEntryName}.${index}.gst.hsn`, {
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
                                },
                            })}
                        />
                    </FormField>
                </div>

                {/* GSTIN Input */}
                <FormField label="" className="w-40 text-xs" error={gstinErrorMessage}>
                    <input
                        type="text"
                        {...register(`${lineItemEntryName}.${index}.gst.gstin`, {
                            validate: (value) => {
                                const liveIsGst = watch("isGst");
                                if (!liveIsGst) return true; // Skip validation if GST is not applicable
                                if (!value) return Messages.errRequiredShort;
                                if (!isValidGstin(value)) {
                                    return (Messages.errInvalidGstin);
                                }
                            }
                        })}
                        className={clsx(
                            "h-6 text-xs",
                            inputFormFieldStyles,
                            "uppercase"
                        )}
                        placeholder="GSTIN"
                        maxLength={15}
                    />
                </FormField>
            </div>

            {/* Tax Breakdown */}
            <div className="flex flex-col gap-1 border-l-2 pl-3 border-blue-200 min-w-[130px] text-right text-xs text-gray-700 pr-2">
                {/* IGST Toggle */}
                <div className="flex items-center justify-between gap-2 mb-1">
                    <label htmlFor={`${lineItemEntryName}.${index}.isIgst`} className="text-sm cursor-pointer">
                        Apply IGST
                    </label>
                    <input
                        type="checkbox"
                        id={`${lineItemEntryName}.${index}.isIgst`}
                        {...register(`${lineItemEntryName}.${index}.gst.isIgst`)}
                        className="w-4 h-4 cursor-pointer"
                    />
                </div>

                {/* CGST / SGST / IGST values */}
                <div className="flex justify-between">
                    <span className="font-medium">CGST:</span>
                    <span className="min-w-[60px] text-right">{Utils.toDecimalFormat(watch(`${lineItemEntryName}.${index}.gst.cgst`))}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">SGST:</span>
                    <span className="min-w-[60px] text-right">{Utils.toDecimalFormat(watch(`${lineItemEntryName}.${index}.gst.sgst`))}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">IGST:</span>
                    <span className="min-w-[60px] text-right">{Utils.toDecimalFormat(watch(`${lineItemEntryName}.${index}.gst.igst`))}</span>
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