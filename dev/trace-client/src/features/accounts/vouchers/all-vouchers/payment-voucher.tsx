import { useFieldArray, useFormContext } from "react-hook-form";
import { AccountPickerFlat } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { VoucherFormDataType } from "./all-vouchers-main";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";
import { FormField } from "../../../../controls/widgets/form-field";
import { Messages } from "../../../../utils/messages";
import { IconPlus } from "../../../../controls/icons/icon-plus";
import { IconCross } from "../../../../controls/icons/icon-cross";
import { NumericFormat } from "react-number-format";
import Decimal from "decimal.js";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PaymentVoucher({ instance }: PaymentVoucherType) {
    const {
        control,
        watch,
        register,
        setValue,
        formState: { errors },
    } = useFormContext<VoucherFormDataType>();

    const { fields: creditFields } = useFieldArray({ control, name: "creditEntries" });
    const { fields: debitFields, append, remove } = useFieldArray({ control, name: "debitEntries" });

    const debitAmounts = watch("debitEntries")?.map(e => e.amount) || [];
    const totalDebitAmount = debitAmounts.reduce((acc, amt) => { return (acc.plus(new Decimal(amt || 0))) }, new Decimal(0));

    useEffect(() => {
        setValue("creditEntries.0.amount", totalDebitAmount.toNumber());
    }, [totalDebitAmount, setValue])

    return (
        <div className="flex flex-col gap-8 mt-6 mr-6">

            {/* 💳 Credit Section */}
            <div>
                <h3 className="text-md font-semibold mb-2 text-secondary-400">Credit Entries</h3>
                <div className="flex flex-col gap-4">
                    {creditFields.map((_, index) => (
                        <div key={index} className="grid grid-cols-6 gap-4 items-start bg-gray-50 p-4 rounded shadow-sm">

                            {/* accId */}
                            <FormField label="Credit Account" className="col-span-2">
                                <AccountPickerFlat
                                    accClassNames={['cash', 'bank', 'ecash', 'card']}
                                    instance={`${instance}-credit-${index}`}
                                    {...register(`creditEntries.${index}.accId`, { required: Messages.errRequired })}
                                    onChange={(val) => setValue(`creditEntries.${index}.accId`, val)}
                                    value={watch(`creditEntries.${index}.accId`)}
                                    className="w-full"
                                />
                            </FormField>

                            {/* instrNo */}
                            <FormField label="Instr No" error={errors?.creditEntries?.[index]?.instrNo?.message}>
                                <input
                                    type="text"
                                    {...register(`creditEntries.${index}.instrNo`)}
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

                            {/* Amount */}
                            <FormField label="Amount">
                                <NumericFormat
                                    allowNegative={false}
                                    decimalScale={2}
                                    defaultValue={0}
                                    fixedDecimalScale={true}
                                    // {...register(`debitEntries.${index}.amount`)}
                                    thousandSeparator={true}
                                    value={totalDebitAmount.toNumber()}
                                    className={clsx(
                                        "border p-2 rounded w-full text-right bg-gray-200",
                                        inputFormFieldStyles
                                    )} />
                            </FormField>
                        </div>
                    ))}
                </div>
            </div>

            {/* 💰 Debit Section */}

            <AnimatePresence>
                {/* <div> */}
                <div className="flex justify-between items-center mb-2">
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

                <div className="flex flex-col gap-4">
                    {debitFields.map((field, index) => (
                        <motion.div
                            // key={field.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className="grid grid-cols-6 gap-4 items-start bg-white p-4 border rounded relative"
                        >


                            {/* accId */}
                            <FormField label="Debit Account" className="col-span-2">
                                <AccountPickerFlat
                                    accClassNames={['debtor', 'creditor', 'dexp', 'iexp']}
                                    instance={`${instance}-debit-${index}`}
                                    {...register(`debitEntries.${index}.accId`, { required: Messages.errRequired })}
                                    onChange={(val) => setValue(`debitEntries.${index}.accId`, val)}
                                    value={watch(`debitEntries.${index}.accId`)}
                                    className="w-full"
                                />
                            </FormField>

                            {/* instrNo */}
                            <FormField label="Instr No" error={errors?.debitEntries?.[index]?.instrNo?.message}>
                                <input
                                    type="text"
                                    readOnly
                                    className={clsx("border p-2 rounded h-10 w-full bg-gray-200", inputFormFieldStyles)}
                                />
                            </FormField>

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

                            {/* Amount */}
                            <FormField
                                label="Amount"
                                error={errors?.debitEntries?.[index]?.amount?.message}>
                                <NumericFormat
                                    allowNegative={false}
                                    decimalScale={2}
                                    defaultValue={0}
                                    fixedDecimalScale={true}
                                    {...register(`debitEntries.${index}.amount`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    onValueChange={(values) =>
                                        setValue(
                                            `debitEntries.${index}.amount`,
                                            values.floatValue || 0,
                                            { shouldValidate: true, shouldDirty: true }
                                        )
                                    }
                                    thousandSeparator={true}
                                    value={watch(`debitEntries.${index}.amount`)}
                                    className={clsx(
                                        "border p-2 rounded w-full text-right",
                                        inputFormFieldStyles
                                    )}
                                />

                            </FormField>
                            <button
                                type="button"
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                onClick={() => debitFields.length > 1 && remove(index)}>
                                <IconCross className="w-5 h-5" />
                            </button>

                        </motion.div>
                    ))}

                </div>

                {/* </div> */}
            </AnimatePresence>
        </div>
    );
}

type PaymentVoucherType = {
    className?: string
    instance: string
}