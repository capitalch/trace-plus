
import { motion, AnimatePresence } from "framer-motion";
import { IconPlus } from "../../../../controls/icons/icon-plus";
import { useFieldArray, useFormContext } from "react-hook-form";
import { VoucherFormDataType } from "./all-vouchers-main";
// import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Messages } from "../../../../utils/messages";
import { IconClear } from "../../../../controls/icons/icon-clear";
import { AccClassName, AccountOptionType, AccountPickerFlat } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { FormField } from "../../../../controls/widgets/form-field";
import { NumericFormat } from "react-number-format";
import clsx from "clsx";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import { IconCross } from "../../../../controls/icons/icon-cross";
import { GstInLinePanel } from "./gst-inline-panel";
import { useEffect } from "react";

export function VoucherLineItemEntry({
    accountOptions,
    accClassNames,
    allowAddRemove = false,
    amount,
    dc,
    instance,
    isAmountFieldDisabled = false,
    lineItemEntryName,
    loadData,
    onChangeAmount,
    title,
    toShowInstrNo,
    tranTypeName
}: VoucherLineItemEntryType) {

    const {
        control,
        watch,
        register,
        setValue,
        formState: { errors },
    } = useFormContext<VoucherFormDataType>();

    const { fields: lineItemFields, append, remove, insert } = useFieldArray({ control, name: lineItemEntryName });
    const isGst = watch('isGst')

    useEffect(() => {
        if (amount) {
            setValue(`${lineItemEntryName}.${0}.amount`, amount);
        }
    }, [amount, lineItemEntryName, setValue])

    return (<AnimatePresence>
        <div key={1} className="flex justify-between items-center ">
            <h3 className="text-md font-semibold text-secondary-400">{title}</h3>
            {allowAddRemove && <button
                type="button"
                className="flex items-center gap-2 text-blue-600 hover:underline"
                onClick={() =>
                    append({
                        accId: null,
                        amount: 0,
                        dc: dc,
                        entryId: null,
                        gstRate: 0,
                        hsn: null,
                        isIgst: false,
                        igst: 0,
                        cgst: 0,
                        sgst: 0,
                        tranHeaderId: null,
                        instrNo: "",
                        lineRefNo: "",
                        lineRemarks: "",
                    })
                }>
                <IconPlus /> Add Entry
            </button>}
        </div>

        <div className="flex flex-col gap-1">
            {lineItemFields.map((field, index) => {
                register(`${lineItemEntryName}.${index}.amount`, {
                    validate: (value) =>
                        value !== 0 || Messages.errRequired
                })

                return <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="grid grid-cols-[30px_1.6fr_1fr_1.5fr_repeat(2,_1fr)] gap-4 items-start bg-white px-4 pt-4 pb-2 border rounded relative">

                    {/* index */}
                    <div className="flex flex-col items-start gap-4 mt-2">
                        <div className="text-xs text-gray-600 font-semibold">
                            {index + 1}
                        </div>
                        <button
                            type="button"
                            className="text-xs text-amber-600 hover:underline"
                            onClick={() => {
                                setValue(`${lineItemEntryName}.${index}.accId`, null);
                                setValue(`${lineItemEntryName}.${index}.amount`, 0);
                                setValue(`${lineItemEntryName}.${index}.lineRefNo`, "");
                                setValue(`${lineItemEntryName}.${index}.lineRemarks`, "");
                            }}
                        ><IconClear className="w-5 h-5" />
                        </button>
                    </div>

                    {/* accId */}
                    <FormField label={`${tranTypeName} Account`} required error={errors?.[lineItemEntryName]?.[index]?.accId?.message} className="-mt-1">
                        <AccountPickerFlat
                            accountOptions={accountOptions}
                            accClassNames={accClassNames}
                            instance={`${instance}-${dc}-${index}`}
                            {...register(`${lineItemEntryName}.${index}.accId`, { required: Messages.errRequired })}
                            loadData={loadData}
                            onChange={(val) => setValue(`${lineItemEntryName}.${index}.accId`, val, { shouldDirty: true, shouldValidate: true })}
                            showAccountBalance={true}
                            value={watch(`${lineItemEntryName}.${index}.accId`)}
                            className="w-full mt-1.5"
                        />
                    </FormField>

                    {/* Amount */}
                    <FormField
                        label={`${tranTypeName} Amount`} required className="-mt-1"
                        error={errors?.[lineItemEntryName]?.[index]?.amount?.message}>
                        <NumericFormat
                            allowNegative={false}
                            decimalScale={2}
                            defaultValue={0}
                            disabled={isAmountFieldDisabled}
                            fixedDecimalScale={true}
                            // Should not use register here; but use value and onValueChange props
                            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                            onValueChange={(values) => {
                                setValue(
                                    `${lineItemEntryName}.${index}.amount`,
                                    values.floatValue ?? 0,
                                    { shouldValidate: true, shouldDirty: true }
                                )
                                if (onChangeAmount) {
                                    onChangeAmount(index, values.floatValue ?? 0);
                                }
                            }}
                            thousandSeparator={true}
                            value={watch(`${lineItemEntryName}.${index}.amount`)}
                            className={clsx(
                                "p-2 rounded w-full text-right mt-1 disabled:bg-gray-300", errors?.[lineItemEntryName]?.[index]?.amount ? 'border-red-500' : 'border',
                                inputFormFieldStyles
                            )}
                        />
                    </FormField>

                    {getInstrNoOrGstLayout(index)}

                    {/* lineRefNo */}
                    <FormField label="Line Ref No">
                        <input
                            type="text"
                            {...register(`${lineItemEntryName}.${index}.lineRefNo`)}
                            className={clsx("border p-2 rounded w-full mt-1", inputFormFieldStyles)}
                        />
                    </FormField>

                    {/* lineRemarks */}
                    <FormField label="Line Remarks">
                        <textarea
                            rows={3}
                            className={clsx(inputFormFieldStyles, "w-full text-xs mt-1")}
                            placeholder="Remarks"
                            {...register(`${lineItemEntryName}.${index}.lineRemarks`)}
                        />
                    </FormField>

                    {/* <div> tag takes extra vertical spacing hence used <> tag  */}
                    {allowAddRemove && <>
                        <button
                            type="button"
                            className="absolute top-4 right-12 text-blue-500 hover:text-blue-700"
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
                            className="absolute top-4 right-2 text-red-500 hover:text-red-700"
                            onClick={() => lineItemFields.length > 1 && remove(index)}>
                            <IconCross className="w-5 h-5" />
                        </button>
                    </>}
                </motion.div>

            })}
        </div>
    </AnimatePresence>)

    function getInstrNoOrGstLayout(index: number) {
        let Ret = <div></div>
        if (toShowInstrNo) {
            Ret = <FormField label="Instr No">
                <input
                    type="text"
                    {...register(`creditEntries.${index}.instrNo`,)}
                    className={clsx("border p-2 rounded w-full mt-1", inputFormFieldStyles)}
                />
            </FormField>
        } else if (isGst) {
            Ret = <GstInLinePanel index={index} lineItemEntryName={lineItemEntryName} />
        }
        return (Ret)
    }
}

type VoucherLineItemEntryType = {
    accClassNames?: AccClassName[]
    accountOptions?: AccountOptionType[]
    allowAddRemove: boolean
    amount?: number
    dc: 'D' | 'C'
    instance: string
    isAmountFieldDisabled: boolean
    lineItemEntryName: 'debitEntries' | 'creditEntries'
    loadData?: () => void
    onChangeAmount?: (index: number, value: number) => void;
    title: string;
    toShowInstrNo: boolean;
    tranTypeName: 'Debit' | 'Credit'
}