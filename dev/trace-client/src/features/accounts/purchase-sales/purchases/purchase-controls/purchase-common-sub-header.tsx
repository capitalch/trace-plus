import { useFormContext } from "react-hook-form";
import { AccountPickerFlat } from "../../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { FormField } from "../../../../../controls/widgets/form-field";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { Messages } from "../../../../../utils/messages";
import { PurchaseFormDataType } from "../all-purchases/all-purchases";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";
import { useValidators } from "../../../../../utils/validators-hook";
import { PurchaseTotalsPanel } from "./purchase-totals-panel";

export function PurchaseCommonSubHeader({ className }: PurchaseCommonSubHeaderType) {
    const instance = DataInstancesMap.allPurchases;
    const { isValidGstin } = useValidators();
    const {
        setValue,
        watch,
        register,
        formState: { errors }
    } = useFormContext<PurchaseFormDataType>();

    return (
        <div className={clsx(className, "flex gap-6 flex-wrap items-start")}>

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
                className="mt-0.5"
            >
                <input
                    type="text"
                    {...register('gstin', {
                        validate: validateGstin,
                    })}
                    // value={watch('gstin') || undefined}
                    // onChange={(e) => setValue('gstin', e.target.value, { shouldDirty: true })}
                    className={clsx(inputFormFieldStyles, 'mt-0.5')}
                    placeholder="Enter GSTIN No"
                />
            </FormField>

            <PurchaseTotalsPanel className="ml-auto -mt-2"/>
        </div>
    );

    function validateGstin(): string | undefined {
        const gstin = watch('gstin');
        const isGstInvoice = watch('isGstInvoice');

        if (!isGstInvoice) return;

        if (!gstin) {
            return Messages.errRequired;
        }

        if (!isValidGstin(gstin)) {
            return Messages.errInvalidGstin;
        }

        return;
    }
}
type PurchaseCommonSubHeaderType = {
    className?: string;
}