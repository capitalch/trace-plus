import { useFormContext } from "react-hook-form";
import { AccountPickerFlat } from "../../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { FormField } from "../../../../../controls/widgets/form-field";
// import { VoucherFormDataType } from "../../../vouchers/all-vouchers/all-vouchers";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { Messages } from "../../../../../utils/messages";
import { PurchaseFormDataType } from "../all-purchases/all-purchases";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";

export function PurchaseCommonSubHeader() {
    const instance = DataInstancesMap.allPurchases;
    const {
        setValue,
        watch,
        register,
        formState: { errors }
    } = useFormContext<PurchaseFormDataType>();

    return (
        <div className="flex gap-2 flex-wrap items-center">

            {/* Debit Account */}
            <FormField
                label='Purchase Account'
                required
                error={errors?.debitAccId?.message}
                className=""
            >
                <AccountPickerFlat
                    // accountOptions={accountOptions}
                    accClassNames={['purchase']}
                    instance={`${instance}-debit-account`}
                    {...register('debitAccId', {
                        required: Messages.errRequired,
                    })}
                    // loadData={loadData}
                    onChange={(val) =>
                        setValue('debitAccId', val, {
                            shouldValidate: true,
                            shouldDirty: true,
                        })
                    }
                    showAccountBalance
                    value={watch('debitAccId')}
                    className="w-full"
                />
            </FormField>

            {/* Credit Account */}
            <FormField
                label='Credit Account'
                required
                error={errors?.creditAccId?.message}
                className=""
            >
                <AccountPickerFlat
                    // accountOptions={accountOptions}
                    accClassNames={['debtor', 'creditor', 'bank', 'cash', 'card', 'ecash']}
                    instance={`${instance}-credit-account`}
                    {...register('creditAccId', {
                        required: Messages.errRequired,
                    })}
                    // loadData={loadData}
                    onChange={(val) =>
                        setValue('creditAccId', val, {
                            shouldValidate: true,
                            shouldDirty: true,
                        })
                    }
                    showAccountBalance
                    value={watch('creditAccId')}
                    className="w-full"
                />
            </FormField>

            {/* GSTIN No */}
            <FormField
                label="Gstin No"
                error={errors?.gstin?.message}
                className="mt-1"
            >
                <input
                    type="text"
                    {...register('gstin', {
                        pattern: {
                            value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
                            message: "Invalid GSTIN format"
                        }
                    })}
                    value={watch('gstin') || undefined}
                    onChange={(e) => setValue('gstin', e.target.value, { shouldDirty: true })}
                    className={clsx(inputFormFieldStyles,'')}
                    placeholder="Enter GSTIN No"
                />
            </FormField>
        </div>
    );
}