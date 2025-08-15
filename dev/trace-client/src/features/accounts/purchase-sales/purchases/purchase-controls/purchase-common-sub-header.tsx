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
import { Utils } from "../../../../../utils/utils";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";

export function PurchaseCommonSubHeader({ className }: PurchaseCommonSubHeaderType) {
    const instance = DataInstancesMap.allPurchases;
    const { isValidGstin } = useValidators();
    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
    const {
        setValue,
        watch,
        register,
        trigger,
        formState: { errors }
    } = useFormContext<PurchaseFormDataType>();
    const { checkPurchaseInvoiceExists }: any = useFormContext<PurchaseFormDataType>()
    const isGstInvoice = watch("isGstInvoice");
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
                    value={watch('debitAccId') as string}
                    className="max-w-80 w-full mt-1"
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
                    onChange={(val) => {
                        setValue('creditAccId', val, {
                            shouldValidate: true,
                            shouldDirty: true,
                        })
                        getSetGstin(val)
                        checkPurchaseInvoiceExists()
                    }}
                    showAccountBalance
                    value={watch('creditAccId') as string}
                    className="w-full mt-1 max-w-80"
                />
            </FormField>

            {/* GSTIN No + isIgst Checkbox */}
            <FormField
                label="Gstin No"
                error={errors?.gstin?.message}
                className="mt-0.5"
                required={isGstInvoice}
            >
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        {...register('gstin', {
                            validate: validateGstin,
                        })}
                        className={clsx(inputFormFieldStyles, 'mt-0.5 w-40')}
                        placeholder="Enter GSTIN No"
                    />

                    {/* isIgst Checkbox */}
                    <label className="flex items-center gap-2 text-xs mt-[2px] cursor-pointer font-medium">
                        <input
                            type="checkbox"
                            {...register('isIgst', {
                                onChange: () => {
                                    trigger();
                                },
                            })}
                            className="checkbox checkbox-xs cursor-pointer"
                        />
                        IGST
                    </label>
                </div>
            </FormField>

            <PurchaseTotalsPanel className="ml-auto -mt-2" />
        </div>
    );

    // async function checkPurchaseInvoiceExists() {
    //     const invoiceNo = getValues('userRefNo')
    //     const creditAccId = getValues('creditAccId')
    //     if ((!invoiceNo) || (!creditAccId)) {
    //         return (true)
    //     }
    //     const res = await Utils.doGenericQuery({
    //         buCode: buCode || '',
    //         dbName: dbName || '',
    //         dbParams: decodedDbParamsObject,
    //         sqlId: SqlIdsMap.doesPurchaseInvoiceExist,
    //         sqlArgs: {
    //             finYearId: finYearId,
    //             id: getValues('id') || 0,
    //             tranTypeId: 5,
    //             accId: creditAccId,
    //             userRefNo: invoiceNo
    //         }
    //     })
    //     const isExists = Boolean(res[0])
    //     if (isExists) {
    //         setError('userRefNo', { type: 'manual', message: Messages.errInvoiceExists });
    //         return (false);
    //     }
    //     return (true);
    // }

    async function getSetGstin(accId: string | null) {
        if (!accId) {
            setValue('gstin', null, { shouldDirty: true });
            return;
        }
        try {
            const result = await Utils.doGenericQuery({
                buCode: buCode || '',
                sqlId: SqlIdsMap.getGstin,
                sqlArgs: { accId: accId },
                dbName: dbName || '',
                dbParams: decodedDbParamsObject
            });
            const gstin = result?.[0]?.gstin || null;
            setValue('gstin', gstin, { shouldDirty: true, shouldValidate: true });
        } catch (error) {
            console.error("Error fetching GSTIN:", error);
        }
    }

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