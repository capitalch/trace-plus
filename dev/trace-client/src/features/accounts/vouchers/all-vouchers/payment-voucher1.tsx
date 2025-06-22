import { useFieldArray, useFormContext } from "react-hook-form";
import { AccountOptionType, AccountPickerFlat } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { VoucherFormDataType } from "./all-vouchers-main";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";
import { FormField } from "../../../../controls/widgets/form-field";
import { Messages } from "../../../../utils/messages";
import { IconPlus } from "../../../../controls/icons/icon-plus";
import { IconCross } from "../../../../controls/icons/icon-cross";
import { NumericFormat } from "react-number-format";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { IconClear } from "../../../../controls/icons/icon-clear";

export function PaymentVoucher1({ instance }: PaymentVoucherType) {
    const [debitAccountOptions, setDebitAccountOptions] = useState<AccountOptionType[]>([])
    const {
        control,
        watch,
        register,
        setValue,
        formState: { errors },
    } = useFormContext<VoucherFormDataType>();
    const {
        buCode
        , dbName
        , decodedDbParamsObject
    } = useUtilsInfo()

    const { fields: creditFields } = useFieldArray({ control, name: "creditEntries" });
    const { fields: debitFields, append, remove, insert } = useFieldArray({ control, name: "debitEntries" });

    const debitAmounts = watch("debitEntries")?.map(e => e.amount) || [];
    const totalDebitAmount = debitAmounts.reduce((acc, amt) => { return (acc.plus(new Decimal(amt || 0))) }, new Decimal(0));

    useEffect(() => {
        setValue("creditEntries.0.amount", totalDebitAmount.toNumber());
    }, [totalDebitAmount, setValue])

    useEffect(() => {
        loadDebitAccountOptions()
    }, [])
    const isGst = watch('isGst')

    return (
        <div className="flex flex-col gap-4 mr-6">

            {/* 💳 Credit Section */}
            <div>
                <h3 className="text-md font-semibold  text-secondary-400">Credit Entries</h3>
                <div className="flex flex-col gap-4 mt-4">
                    {creditFields.map((_, index) => (
                        <div key={index} className="grid grid-cols-[30px_1.6fr_1fr_1.5fr_repeat(2,_1fr)] gap-4 items-start bg-gray-50 p-4 rounded shadow-sm">

                            {/* index */}
                            <div className="flex flex-col items-start gap-4 mt-2">
                                <div className="text-xs text-gray-600 font-semibold">
                                    {index + 1}
                                </div>
                                <button
                                    type="button"
                                    className="text-xs text-amber-600 hover:underline"
                                    onClick={() => {
                                        setValue(`creditEntries.${index}.accId`, null);
                                        setValue(`creditEntries.${index}.instrNo`, "");
                                        setValue(`creditEntries.${index}.lineRefNo`, "");
                                        setValue(`creditEntries.${index}.lineRemarks`, "");
                                    }}
                                ><IconClear className="w-5 h-5" />
                                </button>
                            </div>

                            {/* accId */}
                            <FormField label="Credit Account" className="col-span-1" required error={errors?.creditEntries?.[index]?.accId?.message}>
                                <AccountPickerFlat
                                    accClassNames={['cash', 'bank', 'ecash', 'card']}
                                    instance={`${instance}-credit-${index}`}
                                    {...register(`creditEntries.${index}.accId`, { required: Messages.errRequired })}
                                    onChange={(val) => setValue(`creditEntries.${index}.accId`, val, { shouldDirty: true, shouldValidate: true })}
                                    showAccountBalance={true}
                                    value={watch(`creditEntries.${index}.accId`)}
                                    className="w-full"
                                />
                            </FormField>

                            {/* Amount */}
                            <FormField label="Credit Amount" >
                                <NumericFormat
                                    allowNegative={false}
                                    decimalScale={2}
                                    defaultValue={0}
                                    fixedDecimalScale={true}
                                    thousandSeparator={true}
                                    value={totalDebitAmount.toNumber()}
                                    className={clsx(
                                        "border p-2 rounded w-full text-right bg-gray-200",
                                        inputFormFieldStyles
                                    )} />
                            </FormField>

                            {/* instrNo */}
                            <FormField label="Instr No">
                                <input
                                    type="text"
                                    {...register(`creditEntries.${index}.instrNo`,)}
                                    className={clsx("border p-2 rounded h-10 w-full", inputFormFieldStyles)}
                                />
                            </FormField>

                            {/* lineRefNo */}
                            <FormField label="Line Ref No" error={errors?.creditEntries?.[index]?.lineRefNo?.message}>
                                <input
                                    type="text"
                                    {...register(`creditEntries.${index}.lineRefNo`)}
                                    className={clsx("border p-2 rounded h-10 w-full", inputFormFieldStyles)}
                                />
                            </FormField>

                            {/* lineRemarks */}
                            <FormField label="Line Remarks">
                                <textarea
                                    rows={3}
                                    className={clsx(inputFormFieldStyles, "w-full text-xs")}
                                    placeholder="Remarks"
                                    {...register(`creditEntries.${index}.lineRemarks`)}
                                />
                            </FormField>

                        </div>
                    ))}
                </div>
            </div>

            {/* 💰 Debit Section */}

            <AnimatePresence>
                <div key={1} className="flex justify-between items-center ">
                    <h3 className="text-md font-semibold text-secondary-400">Debit Entries</h3>
                    <button
                        type="button"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                        onClick={() =>
                            append({
                                accId: null,
                                amount: 0,
                                dc: "D",
                                entryId: null,
                                tranHeaderId: null,
                                instrNo: "",
                                lineRefNo: "",
                                lineRemarks: "",
                            })
                        }>
                        <IconPlus /> Add Entry
                    </button>
                </div>

                <div className="flex flex-col gap-1">
                    {debitFields.map((field, index) => {
                        register(`debitEntries.${index}.amount`, {
                            validate: (value) =>
                                value !== 0 || Messages.errRequired
                        })

                        return <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className="grid grid-cols-[30px_1.6fr_1fr_1.5fr_repeat(2,_1fr)] gap-4 items-start bg-white p-4 border rounded relative">

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
                                    }}
                                ><IconClear className="w-5 h-5" />
                                </button>
                            </div>

                            {/* accId */}
                            <FormField label="Debit Account" className="col-span-1" required error={errors?.debitEntries?.[index]?.accId?.message}>
                                <AccountPickerFlat
                                    accountOptions={debitAccountOptions}
                                    accClassNames={['debtor', 'creditor', 'dexp', 'iexp']}
                                    instance={`${instance}-debit-${index}`}
                                    {...register(`debitEntries.${index}.accId`, { required: Messages.errRequired })}
                                    // loadData={loadDebitAccountOptions}
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
                                    // Should not use register here; but use value and onValueChange props
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    onValueChange={(values) => {
                                        setValue(
                                            `debitEntries.${index}.amount`,
                                            values.floatValue ?? 0,
                                            { shouldValidate: true, shouldDirty: true }
                                        )
                                    }}
                                    thousandSeparator={true}
                                    value={watch(`debitEntries.${index}.amount`)}
                                    className={clsx(
                                        "p-2 rounded w-full text-right", errors?.debitEntries?.[index]?.amount ? 'border-red-500' : 'border',
                                        inputFormFieldStyles
                                    )}
                                />

                            </FormField>

                            {/* GST Section */}
                            {isGst ? (
                                <div className="flex gap-1  bg-gray-50 border p-1 rounded-sm">
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
                                            value={watch(`debitEntries.${index}.gstRate`)}
                                        // {...register(`debitEntries.${index}.gstRate`)}
                                        />
                                    </FormField>

                                    {/* HSN Code */}
                                    <FormField label="HSN Code" className="w-26">
                                        <NumericFormat
                                            allowNegative={false}
                                            decimalScale={0}
                                            // defaultValue={0}
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
                                        // {...register(`debitEntries.${index}.hsn`)}
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
                                onClick={() => insert(index + 1, {
                                    accId: null,
                                    amount: 0,
                                    dc: "D",
                                    entryId: null,
                                    tranHeaderId: null,
                                    instrNo: "",
                                    lineRefNo: "",
                                    lineRemarks: "",
                                })}>
                                <IconPlus className="w-5 h-5" />
                            </button>

                            <button
                                type="button"
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                onClick={() => debitFields.length > 1 && remove(index)}>
                                <IconCross className="w-5 h-5" />
                            </button>

                        </motion.div>
                    }
                    )}
                    {/* footer */}
                    <div className="flex justify-end pr-4">
                        <div className="text-sm font-semibold text-right text-gray-700">
                            Total Debit Amount:&nbsp;
                            <span className="text-black">
                                ₹ {Utils.toDecimalFormat(totalDebitAmount.toFixed(2))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* </div> */}
            </AnimatePresence>
        </div>
    );

    // function calculateGst({ amount, gstRate, isIgst, index }: { amount: number, gstRate: number, isIgst: boolean, index: number }) {
    //     if (!isGst || !amount || !gstRate) return;

    //     const amt = new Decimal(amount);
    //     const rate = new Decimal(gstRate);

    //     // GST = [amount / (1 + gstRate/100)] * gstRate/100
    //     const divisor = new Decimal(1).plus(rate.div(100));
    //     const taxableAmount = amt.div(divisor);
    //     const gst = taxableAmount.mul(rate.div(100)).toDecimalPlaces(2);
    //     const gstHalf = gst.div(2).toDecimalPlaces(2);

    //     if (isIgst) {
    //         setValue(`debitEntries.${index}.igst`, gst.toNumber(), { shouldDirty: true });
    //         setValue(`debitEntries.${index}.cgst`, 0, { shouldDirty: true });
    //         setValue(`debitEntries.${index}.sgst`, 0, { shouldDirty: true });
    //     } else {
    //         setValue(`debitEntries.${index}.igst`, 0, { shouldDirty: true });
    //         setValue(`debitEntries.${index}.cgst`, gstHalf.toNumber(), { shouldDirty: true });
    //         setValue(`debitEntries.${index}.sgst`, gstHalf.toNumber(), { shouldDirty: true });
    //     }
    // }

    async function loadDebitAccountOptions() {
        try {
            const res: AccountOptionType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject || {},
                instance: instance,
                sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
                sqlArgs: {
                    accClassNames: ['debtor', 'creditor', 'dexp', 'iexp']?.join(',') || null
                }
            })

            setDebitAccountOptions(res)
        } catch (error) {
            console.error(error)
        }
    }
}

type PaymentVoucherType = {
    className?: string
    instance: string
}