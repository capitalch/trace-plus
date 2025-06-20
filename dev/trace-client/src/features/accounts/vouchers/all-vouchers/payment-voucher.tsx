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

export function PaymentVoucher({ instance }: PaymentVoucherType) {
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
                        <div key={index} className="grid grid-cols-[30px_repeat(6,_1fr)] gap-4 items-start bg-gray-50 p-4 rounded shadow-sm">

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
                            <FormField label="Credit Account" className="col-span-2" required error={errors?.creditEntries?.[index]?.accId?.message}>
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
                                    // {...register(`debitEntries.${index}.amount`)}
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
                            className="grid grid-cols-[30px_repeat(6,_1fr)] gap-4 items-start bg-white p-4 border rounded relative">
                            {/* className="grid grid-cols-[30px_260px_90px_240px_repeat(3,_1fr)] gap-3 items-start"> */}

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
                            <FormField label="Debit Account" className="col-span-2" required error={errors?.debitEntries?.[index]?.accId?.message}>
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
                                    onValueChange={(values) =>
                                        setValue(
                                            `debitEntries.${index}.amount`,
                                            values.floatValue ?? 0,
                                            { shouldValidate: true, shouldDirty: true }
                                        )
                                    }
                                    thousandSeparator={true}
                                    value={watch(`debitEntries.${index}.amount`)}
                                    className={clsx(
                                        "p-2 rounded w-full text-right", errors?.debitEntries?.[index]?.amount ? 'border-red-500' : 'border',
                                        inputFormFieldStyles
                                    )}
                                />

                            </FormField>
                            {/* instrNo */}
                            {/* <div className="bg-gray-300"></div> */}

                            {/* GST Section */}
                            {isGst ? (
                                <div className="flex flex-col gap-2 w-60">
                                    <div className="flex gap-2">
                                        {/* GST Rate */}
                                        <FormField label="GST Rate (%)" className="w-1/2">
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                className={clsx("h-10", inputFormFieldStyles)}
                                                {...register(`debitEntries.${index}.gstRate`)}
                                            />
                                        </FormField>

                                        {/* HSN Code */}
                                        <FormField label="HSN Code" className="w-1/2">
                                            <input
                                                type="text"
                                                className={clsx("h-10", inputFormFieldStyles)}
                                                {...register(`debitEntries.${index}.hsn`)}
                                            />
                                        </FormField>
                                    </div>

                                    {/* IGST Toggle */}
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="checkbox"
                                            id={`debitEntries.${index}.isIgst`}
                                            {...register(`debitEntries.${index}.isIgst`)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor={`debitEntries.${index}.isIgst`} className="text-sm text-gray-700">
                                            Apply IGST instead of CGST+SGST
                                        </label>
                                    </div>

                                    {/* Tax Breakdown Display */}
                                    <div className="text-xs text-gray-600 space-y-1 ml-1 border-l-2 pl-2 border-gray-300">
                                        {/* <div><strong>CGST:</strong> {watch(`debitEntries.${index}.isIgst`) ? '0%' : `${watch(`debitEntries.${index}.gstRate`) / 2 || 0}%`}</div>
                                        <div><strong>SGST:</strong> {watch(`debitEntries.${index}.isIgst`) ? '0%' : `${watch(`debitEntries.${index}.gstRate`) / 2 || 0}%`}</div>
                                        <div><strong>IGST:</strong> {watch(`debitEntries.${index}.isIgst`) ? `${watch(`debitEntries.${index}.gstRate`) || 0}%` : '0%'}</div> */}
                                        <div><strong>CGST:</strong> {123.45}</div>
                                        <div><strong>SGST:</strong> {145.54}</div>
                                        <div><strong>IGST:</strong> {14445.76}</div>
                                    </div>
                                </div>
                            ) : <div></div>}

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