
import { motion, AnimatePresence } from "framer-motion";
import { IconPlus } from "../../../../controls/icons/icon-plus";
import { useFieldArray, useFormContext } from "react-hook-form";
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
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";
import { Utils } from "../../../../utils/utils";
import Decimal from "decimal.js";

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
    toShowSummary = false,
    tranTypeName
}: VoucherLineItemEntryType) {

    const {
        control,
        clearErrors,
        getValues,
        watch,
        register,
        setValue,
        formState: { errors },
    } = useFormContext<VoucherFormDataType>();

    const { fields, append, remove, insert } = useFieldArray({ control, name: lineItemEntryName });
    const isGst = watch('isGst')

    useEffect(() => {
        onChangeAmount?.(0, 0);
    }, [onChangeAmount])

    useEffect(() => {
        if (amount || amount === 0) {
            setValue(`${lineItemEntryName}.${0}.amount`, amount, { shouldDirty: true });
        }
    }, [amount, lineItemEntryName, setValue])

    useEffect(() => {
        if (!isGst) {
            fields.forEach((_, index) => {
                setValue(`${lineItemEntryName}.${index}.gst.rate`, 0, { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.gst.hsn`, null, { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.gst.igst`, 0, { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.gst.cgst`, 0, { shouldDirty: true });
                setValue(`${lineItemEntryName}.${index}.gst.sgst`, 0, { shouldDirty: true });

                clearErrors([
                    `${lineItemEntryName}.${index}.gst.rate`,
                    `${lineItemEntryName}.${index}.gst.hsn`,
                    `${lineItemEntryName}.${index}.gst.gstin`,
                ]);

            });
        }
    }, [isGst, fields.length, lineItemEntryName, setValue, fields, clearErrors]);

    return (
        <AnimatePresence>

            {/* <div className={clsx('mt-2',(dc === 'D') ? 'bg-amber-50' : 'bg-red-50','rounded-xl')}>  */}

                {/* Section Header */}
                <div key={1} className="flex justify-between items-center">
                    <h3 className="text-md font-semibold text-secondary-400">{title}</h3>
                    {allowAddRemove && (
                        <button
                            type="button"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                            onClick={() =>
                                append({
                                    accId: null,
                                    amount: 0,
                                    dc,
                                    id: undefined,
                                    gst: {
                                        isIgst: false,
                                        rate: 0,
                                        hsn: null,
                                        igst: 0,
                                        cgst: 0,
                                        sgst: 0,
                                    },
                                    tranHeaderId: undefined,
                                    instrNo: "",
                                    lineRefNo: "",
                                    remarks: "",
                                    deletedIds: []
                                })
                            }
                        >
                            <IconPlus /> Add Entry
                        </button>
                    )}
                </div>

                {/* Line Items key is important*/}
                <div key={2} className="flex flex-col gap-1">
                    {fields.map((field, index) => {
                        const fieldError = errors?.[lineItemEntryName]?.[index];
                        register(`${lineItemEntryName}.${index}.amount`, {
                            validate: (value) =>
                                value !== 0 || Messages.errRequired
                        })
                        return (
                            <motion.div
                                key={field.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                className={clsx(
                                    "px-4 pt-4 pb-2 border rounded relative",
                                    "grid md:grid-cols-[30px_1.6fr_1fr_1.5fr_repeat(2,_1fr)] gap-4 items-start",
                                    "flex flex-col md:grid",
                                    (field.dc === 'D') ? 'bg-amber-50' : 'bg-red-50'
                                )}
                            >
                                {/* Index + Clear */}
                                <div className="flex flex-col items-start gap-4 mt-2">
                                    <div className="text-xs text-gray-600 font-semibold">{index + 1}</div>
                                    <button
                                        type="button"
                                        className="text-xs text-amber-600 hover:underline"
                                        onClick={() => {
                                            setValue(`${lineItemEntryName}.${index}.accId`, null);
                                            if (amount === undefined) {
                                                setValue(`${lineItemEntryName}.${index}.amount`, 0);
                                            }
                                            setValue(`${lineItemEntryName}.${index}.lineRefNo`, "");
                                            setValue(`${lineItemEntryName}.${index}.remarks`, "");
                                            setValue(`${lineItemEntryName}.${index}.instrNo`, "");
                                            setValue(`${lineItemEntryName}.${index}.gst.rate`, 0);
                                            setValue(`${lineItemEntryName}.${index}.gst.hsn`, null);
                                            setValue(`${lineItemEntryName}.${index}.gst.isIgst`, false);
                                            setValue(`${lineItemEntryName}.${index}.gst.igst`, 0);
                                            setValue(`${lineItemEntryName}.${index}.gst.cgst`, 0);
                                            setValue(`${lineItemEntryName}.${index}.gst.sgst`, 0);
                                        }}>
                                        <IconClear className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Account */}
                                <FormField
                                    label={`${tranTypeName} Account`}
                                    required
                                    error={fieldError?.accId?.message}
                                    className="-mt-1"
                                >
                                    <AccountPickerFlat
                                        accountOptions={accountOptions}
                                        accClassNames={accClassNames}
                                        instance={`${instance}-${dc}-${index}`}
                                        {...register(`${lineItemEntryName}.${index}.accId`, {
                                            required: Messages.errRequired,
                                        })}
                                        loadData={loadData}
                                        onChange={(val) =>
                                            setValue(`${lineItemEntryName}.${index}.accId`, val, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            })
                                        }
                                        showAccountBalance
                                        value={watch(`${lineItemEntryName}.${index}.accId`)}
                                        className="w-full mt-1.5"
                                    />
                                </FormField>

                                {/* Amount */}
                                <FormField
                                    label={`${tranTypeName} Amount`}
                                    required
                                    error={fieldError?.amount?.message}
                                    className="-mt-1"
                                >
                                    <NumericFormat
                                        allowNegative={false}
                                        decimalScale={2}
                                        defaultValue={0}
                                        fixedDecimalScale
                                        disabled={isAmountFieldDisabled}
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        onValueChange={(values) => {
                                            setValue(`${lineItemEntryName}.${index}.amount`, values.floatValue ?? 0, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            });
                                            if (onChangeAmount) onChangeAmount(index, values.floatValue ?? 0);
                                        }}
                                        thousandSeparator
                                        value={watch(`${lineItemEntryName}.${index}.amount`)}
                                        className={clsx(
                                            "p-2 rounded w-full text-right mt-1",
                                            fieldError?.amount ? "border-red-500" : "border",
                                            inputFormFieldStyles,
                                            isAmountFieldDisabled && "bg-gray-300"
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


                                {/* Remarks */}
                                <FormField label="Line Remarks">
                                    <textarea
                                        rows={3}
                                        {...register(`${lineItemEntryName}.${index}.remarks`)}
                                        className={clsx(inputFormFieldStyles, "w-full text-xs mt-1")}
                                    />
                                </FormField>

                                {/* Add/Remove Buttons */}
                                {allowAddRemove && (
                                    <>
                                        <button
                                            type="button"
                                            className="absolute top-4 right-12 text-blue-500 hover:text-blue-700"
                                            onClick={() =>
                                                insert(index + 1, {
                                                    accId: null,
                                                    amount: 0,
                                                    dc: dc,
                                                    id: undefined,
                                                    tranHeaderId: undefined,
                                                    instrNo: "",
                                                    lineRefNo: "",
                                                    remarks: "",
                                                    deletedIds: []
                                                })
                                            }
                                        >
                                            <IconPlus className="w-5 h-5" />
                                        </button>

                                        <button
                                            type="button"
                                            className="absolute top-4 right-2 text-red-500 hover:text-red-700"
                                            onClick={() => {
                                                if (fields.length > 1) {
                                                    const deletedIds = getValues('deletedIds')
                                                    if (field.tranDetailsId) {
                                                        deletedIds.push(field.tranDetailsId) // for server side deletion
                                                    }
                                                    remove(index)
                                                }
                                            }}
                                        >
                                            <IconCross className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary Footer */}
                {toShowSummary && (
                    <div className="flex items-center gap-2 text-xs text-blue-500 -mt-2 justify-end">
                        <div>
                            <span className="font-semibold">Total Amount:</span>{" "}
                            {Utils.toDecimalFormat(
                                fields.reduce((sum, _, i) => {
                                    const val = watch(`${lineItemEntryName}.${i}.amount`);
                                    const decVal = new Decimal(val ?? 0);
                                    return sum.plus(decVal);
                                }, new Decimal(0)).toNumber()
                            )}
                        </div>
                    </div>)
                }
            {/* </div>  */}
        </AnimatePresence>
    );

    function getInstrNoOrGstLayout(index: number) {
        let Ret = <div></div>
        if (toShowInstrNo) {
            Ret = <FormField label="Instr No">
                <input
                    type="text"
                    // {...register(`creditEntries.${index}.instrNo`,)}
                    {...register(`${lineItemEntryName}.${index}.instrNo`)}
                    className={clsx("border p-2 rounded w-full mt-1", inputFormFieldStyles)}
                />
            </FormField>
        } else
            if (isGst) {
                Ret = <GstInLinePanel index={index} lineItemEntryName={lineItemEntryName} />
            } else {
                // clearError
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
    toShowSummary?: boolean;
    tranTypeName: 'Debit' | 'Credit'
    tranDetailsId?: number
}