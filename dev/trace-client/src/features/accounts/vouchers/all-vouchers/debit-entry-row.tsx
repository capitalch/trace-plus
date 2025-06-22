// DebitEntryRow.tsx (or directly in PaymentVoucher.tsx above the main component)
import { useEffect, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import Decimal from "decimal.js";
import clsx from "clsx";
import { FormField } from "../../../../controls/widgets/form-field";
import { Messages } from "../../../../utils/messages";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import { IconClear } from "../../../../controls/icons/icon-clear";
import { IconPlus } from "../../../../controls/icons/icon-plus";
import { IconCross } from "../../../../controls/icons/icon-cross";
import { AccountOptionType, AccountPickerFlat } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { VoucherFormDataType, DebitEntryType } from "./all-vouchers-main"; // Ensure DebitEntryType is exported

type DebitEntryRowProps = {
    index: number;
    fieldId: string; // The unique ID from useFieldArray
    remove: (index?: number | number[]) => void;
    insert: (index: number, value: DebitEntryType) => void;
    debitFieldsLength: number; // To decide when to show remove button
    debitAccountOptions: AccountOptionType[];
    isGstEnabled: boolean; // Renamed from isGst to avoid confusion with form value
};

export function DebitEntryRow({
    index,
    fieldId,
    remove,
    insert,
    debitFieldsLength,
    debitAccountOptions,
    isGstEnabled,
}: DebitEntryRowProps) {
    const { register, watch, setValue, formState: { errors } } = useFormContext<VoucherFormDataType>();

    // Register fields specific to this debit entry
    register(`debitEntries.${index}.amount`, { validate: (value) => value !== 0 || Messages.errRequired });
    register(`debitEntries.${index}.gstRate`);
    register(`debitEntries.${index}.hsn`);
    register(`debitEntries.${index}.isIgst`);
    register(`debitEntries.${index}.cgst`);
    register(`debitEntries.${index}.sgst`);
    register(`debitEntries.${index}.igst`);

    // Watch values for this specific row
    const amount = watch(`debitEntries.${index}.amount`);
    const gstRate = watch(`debitEntries.${index}.gstRate`);
    const isIgst = watch(`debitEntries.${index}.isIgst`);

    // Memoize calculateGst to ensure stability in useEffect dependencies
    const calculateGst = useCallback(() => {
        if (!isGstEnabled || !amount || !gstRate) {
            // Clear GST fields if conditions are not met
            setValue(`debitEntries.${index}.igst`, 0, { shouldDirty: true });
            setValue(`debitEntries.${index}.cgst`, 0, { shouldDirty: true });
            setValue(`debitEntries.${index}.sgst`, 0, { shouldDirty: true });
            return;
        }

        const amt = new Decimal(amount);
        const rate = new Decimal(gstRate);

        // GST = [amount / (1 + gstRate/100)] * gstRate/100
        const divisor = new Decimal(1).plus(rate.div(100));
        const taxableAmount = amt.div(divisor);
        const gst = taxableAmount.mul(rate.div(100)).toDecimalPlaces(2);
        const gstHalf = gst.div(2).toDecimalPlaces(2);

        if (isIgst) {
            setValue(`debitEntries.${index}.igst`, gst.toNumber(), { shouldDirty: true });
            setValue(`debitEntries.${index}.cgst`, 0, { shouldDirty: true });
            setValue(`debitEntries.${index}.sgst`, 0, { shouldDirty: true });
        } else {
            setValue(`debitEntries.${index}.igst`, 0, { shouldDirty: true });
            setValue(`debitEntries.${index}.cgst`, gstHalf.toNumber(), { shouldDirty: true });
            setValue(`debitEntries.${index}.sgst`, gstHalf.toNumber(), { shouldDirty: true });
        }
    }, [amount, gstRate, isIgst, index, isGstEnabled, setValue]); // Dependencies for useCallback

    // UseEffect at the top level of DebitEntryRow component
    useEffect(() => {
        calculateGst();
    }, [calculateGst]); // calculateGst is already memoized with its own dependencies

    const defaultNewDebitEntry: DebitEntryType = {
        accId: null,
        amount: 0,
        dc: "D",
        entryId: null,
        tranHeaderId: null,
        instrNo: "",
        lineRefNo: "",
        lineRemarks: "",
        gstRate: 0,
        hsn: 0,
        isIgst: false,
        cgst: 0,
        sgst: 0,
        igst: 0,
    };

    return (
        <div key={fieldId} className="grid grid-cols-[30px_1.6fr_1fr_1.5fr_repeat(2,_1fr)] gap-4 items-start bg-white p-4 border rounded relative">
            {/* index */}
            <div className="flex flex-col items-start gap-4 mt-2">
                <div className="text-xs text-gray-600 font-semibold">
                    {index + 1}
                </div>
                <button
                    type="button"
                    className="text-xs text-amber-600 hover:underline"
                    onClick={() => {
                        setValue(`debitEntries.${index}.accId`, null);
                        setValue(`debitEntries.${index}.amount`, 0);
                        setValue(`debitEntries.${index}.lineRefNo`, "");
                        setValue(`debitEntries.${index}.lineRemarks`, "");
                        setValue(`debitEntries.${index}.gstRate`, 0);
                        setValue(`debitEntries.${index}.hsn`, 0);
                        setValue(`debitEntries.${index}.isIgst`, false);
                        setValue(`debitEntries.${index}.cgst`, 0);
                        setValue(`debitEntries.${index}.sgst`, 0);
                        setValue(`debitEntries.${index}.igst`, 0);
                    }}
                >
                    <IconClear className="w-5 h-5" />
                </button>
            </div>

            {/* accId */}
            <FormField label="Debit Account" className="col-span-1" required error={errors?.debitEntries?.[index]?.accId?.message}>
                <AccountPickerFlat
                    accountOptions={debitAccountOptions}
                    accClassNames={['debtor', 'creditor', 'dexp', 'iexp']}
                    instance={`debit-${index}`}
                    {...register(`debitEntries.${index}.accId`, { required: Messages.errRequired })}
                    onChange={(val) => setValue(`debitEntries.${index}.accId`, val, { shouldDirty: true, shouldValidate: true })}
                    showAccountBalance={true}
                    value={watch(`debitEntries.${index}.accId`)}
                    className="w-full"
                />
            </FormField>

            {/* Amount */}
            <FormField
                label="Debit Amount" required
                error={errors?.debitEntries?.[index]?.amount?.message}>
                <NumericFormat
                    allowNegative={false}
                    decimalScale={2}
                    defaultValue={0}
                    fixedDecimalScale={true}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    onValueChange={(values) => {
                        setValue(
                            `debitEntries.${index}.amount`,
                            values.floatValue ?? 0,
                            { shouldValidate: true, shouldDirty: true }
                        );
                    }}
                    thousandSeparator={true}
                    value={amount} // Use the watched 'amount' here
                    className={clsx(
                        "p-2 rounded w-full text-right", errors?.debitEntries?.[index]?.amount ? 'border-red-500' : 'border',
                        inputFormFieldStyles
                    )}
                />
            </FormField>

            {/* GST Section */}
            {isGstEnabled ? (
                <div className="flex gap-1 bg-gray-50 border p-1 rounded-sm">
                    {/* GST Rate */}
                    <FormField label="GST Rate" className="w-20">
                        <NumericFormat
                            allowNegative={false}
                            decimalScale={2}
                            defaultValue={0}
                            fixedDecimalScale={true}
                            className={clsx("h-8 mt-1 text-sm text-right", inputFormFieldStyles)}
                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                            onValueChange={(values) =>
                                setValue(
                                    `debitEntries.${index}.gstRate`,
                                    values.floatValue ?? 0,
                                    { shouldValidate: true, shouldDirty: true }
                                )
                            }
                            value={gstRate} // Use the watched 'gstRate' here
                        />
                    </FormField>

                    {/* HSN Code */}
                    <FormField label="HSN Code" className="w-26">
                        <NumericFormat
                            allowNegative={false}
                            decimalScale={0}
                            fixedDecimalScale={true}
                            className={clsx("h-8 mt-1 text-sm", inputFormFieldStyles)}
                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                            onValueChange={(values) =>
                                setValue(
                                    `debitEntries.${index}.hsn`,
                                    values.floatValue ?? 0,
                                    { shouldValidate: true, shouldDirty: true }
                                )
                            }
                            value={watch(`debitEntries.${index}.hsn`)}
                        />
                    </FormField>

                    {/* Tax Breakdown Display */}
                    <div className="text-xs text-gray-700 space-y-1 ml-1 border-l-2 pl-2 border-blue-200">
                        {/* IGST Toggle */}
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="checkbox"
                                id={`debitEntries.${index}.isIgst`}
                                {...register(`debitEntries.${index}.isIgst`)}
                                className="w-4 h-4 cursor-pointer"
                            />
                            <label htmlFor={`debitEntries.${index}.isIgst`} className="text-sm text-gray-700 cursor-pointer">
                                Apply IGST
                            </label>
                        </div>
                        <div><strong>CGST:</strong> {watch(`debitEntries.${index}.cgst`)}</div>
                        <div><strong>SGST:</strong> {watch(`debitEntries.${index}.sgst`)}</div>
                        <div><strong>IGST:</strong> {watch(`debitEntries.${index}.igst`)}</div>
                    </div>
                </div>
            ) : <div className="col-span-1"></div>}

            {/* lineRefNo */}
            <FormField label="Line Ref No" error={errors?.debitEntries?.[index]?.lineRefNo?.message}>
                <input
                    type="text"
                    {...register(`debitEntries.${index}.lineRefNo`)}
                    className={clsx("border p-2 rounded h-10 w-full", inputFormFieldStyles)}
                />
            </FormField>

            {/* lineRemarks */}
            <FormField label="Line Remarks">
                <textarea
                    rows={3}
                    className={clsx(inputFormFieldStyles, "w-full text-xs")}
                    placeholder="Remarks"
                    {...register(`debitEntries.${index}.lineRemarks`)}
                />
            </FormField>

            <button
                type="button"
                className="absolute top-2 right-12 text-blue-500 hover:text-blue-700"
                onClick={() => insert(index + 1, defaultNewDebitEntry)}>
                <IconPlus className="w-5 h-5" />
            </button>

            <button
                type="button"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => debitFieldsLength > 1 && remove(index)}>
                <IconCross className="w-5 h-5" />
            </button>
        </div>
    );
}