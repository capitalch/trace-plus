import { useFormContext } from "react-hook-form";
import { FormField } from "../../../../controls/widgets/form-field";
import { DebitNoteFormDataType } from "./debit-notes";
import { AccountPickerFlat } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { Messages } from "../../../../utils/messages";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";


export function DebitNotesLineItems() {
    const instance = DataInstancesMap.debitNotes;
    const {
        setValue,
        watch,
        register,
        // trigger,
        formState: { errors }
    } = useFormContext<DebitNoteFormDataType>();
    return (
        <div className="flex flex-col flex-wrap gap-12 mt-10">

            {/* 1st row */}
            <div className="flex gap-6 flex-wrap items-start">

                {/* Debit Account */}
                <FormField
                    label='Debit (Debtor / Creditor)'
                    required
                    error={errors?.debitAccId?.message}
                    className=""
                >
                    <AccountPickerFlat
                        accClassNames={['debtor', 'creditor']}
                        instance={`${instance}-debit-account`}
                        {...register('debitAccId', {
                            required: Messages.errRequired,
                        })}
                        onChange={(val) =>
                            setValue('debitAccId', val, {
                                shouldValidate: true,
                                shouldDirty: true,
                            })
                        }
                        showAccountBalance
                        value={watch('debitAccId') as string}
                        className="max-w-100 w-full mt-1"
                        showRefreshButton={false}
                    />
                </FormField>

                {/* Line ref no */}
                <FormField label="Line Ref No">
                    <input
                        type="text"
                        className={clsx(inputFormFieldStyles, 'mt-1')}
                        placeholder="Enter ref no"
                        {...register("debitRefNo")}
                    />
                </FormField>

                {/* Remarks */}
                <FormField className="" label="Line Remarks">
                    <textarea
                        rows={3}
                        className={clsx(inputFormFieldStyles, "mt-1")}
                        placeholder="Enter remarks"
                        {...register("debitRemarks")}
                    />
                </FormField>
            </div>

            {/* 2nd row */}
            <div className="flex gap-6 flex-wrap items-start">
                {/* Credit Account */}
                <FormField
                    label='Credit (Purchase)'
                    required
                    error={errors?.creditAccId?.message}
                    className=""
                >
                    <AccountPickerFlat
                        accClassNames={['purchase',]}
                        instance={`${instance}-credit-account`}
                        {...register('creditAccId', {
                            required: Messages.errRequired,
                        })}
                        onChange={(val) =>
                            setValue('creditAccId', val, {
                                shouldValidate: true,
                                shouldDirty: true,
                            })
                        }
                        showAccountBalance
                        value={watch('creditAccId') as string}
                        className="max-w-80 w-full mt-1"
                        showRefreshButton={false}
                    />
                </FormField>

                {/* Line ref no */}
                <FormField label="Line Ref No">
                    <input
                        type="text"
                        className={clsx(inputFormFieldStyles, 'mt-1')}
                        placeholder="Enter ref no"
                        {...register("creditRefNo")}
                    />
                </FormField>

                {/* Remarks */}
                <FormField className="w-xl" label="Line Remarks">
                    <textarea
                        rows={3}
                        className={clsx(inputFormFieldStyles, "mt-1")}
                        placeholder="Enter remarks"
                        {...register("creditRemarks")}
                    />
                </FormField>

                {/* Gst */}
                
            </div>

        </div>
    )
}