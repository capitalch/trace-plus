import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { SalesReturnFormDataType } from '../all-sales-return';
import { AccountPickerFlat } from '../../../../../controls/redux-components/account-picker-flat/account-picker-flat';
import { Banknote } from 'lucide-react';
import { FormField } from '../../../../../controls/widgets/form-field';
import { DataInstancesMap } from '../../../../../app/maps/data-instances-map';
import { Messages } from '../../../../../utils/messages';
import clsx from 'clsx';
import { ControlledNumericInput } from '../../../../../controls/components/controlled-numeric-input';
import Decimal from 'decimal.js';
import { Utils } from '../../../../../utils/utils';
import { useSalesReturnContext } from '../sales-return-context';

const SalesReturnAccountingDetails: React.FC = () => {
    const instance = DataInstancesMap.allSalesReturn;
    const errorClass = 'bg-red-200 border-2 border-red-500';
    const {
        register,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useFormContext<SalesReturnFormDataType>();
    const { getDefaultCreditAccount } = useSalesReturnContext();

    const totalInvoiceAmount = watch('totalInvoiceAmount')

    // Initialize credit account if not present
    useEffect(() => {
        const creditAccount = getValues('creditAccount');
        if (!creditAccount && getDefaultCreditAccount) {
            setValue('creditAccount', getDefaultCreditAccount());
        }
    }, [getValues, setValue, getDefaultCreditAccount]);

    // Auto-set amount when totalInvoiceAmount changes
    useEffect(() => {
        if (totalInvoiceAmount && totalInvoiceAmount.greaterThan(0)) {
            const currentAmount = getValues(`creditAccount.amount`) || 0;
            const newAmount = totalInvoiceAmount.toDecimalPlaces(2).toNumber();

            if (currentAmount !== newAmount) {
                setValue(`creditAccount.amount`, newAmount, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                });
            }
        }
    }, [totalInvoiceAmount, setValue, getValues])

    const creditAccountAmount = watch('creditAccount.amount') || new Decimal(0);

    return (
        <div className="p-4 bg-white border-l-4 border-cyan-500 rounded-lg shadow-sm lg:col-span-6 h-full">

            {/* Header section */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-y-4">
                <div className="flex items-center">
                    <div className="mr-3 p-2 text-white bg-cyan-100 rounded-lg flex-shrink-0">
                        <Banknote className='w-5 h-5 text-cyan-600' />
                    </div>
                    <h2 className="font-semibold text-gray-800 text-lg">Accounting Details</h2>
                </div>
                <div className="text-right">
                    <div className="font-bold text-lg text-gray-800">Total: {Utils.toDecimalFormat(typeof creditAccountAmount === 'number' ? creditAccountAmount : creditAccountAmount.toNumber())}</div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Debit account (Sale Account) */}
                <div className="rounded-lg">
                    <FormField
                        label='Debit Account (Sale)'
                        required
                        error={errors?.debitAccId?.message}
                        className='-mt-2'
                        toShowErrorMessage={false}
                    >
                        <AccountPickerFlat
                            accClassNames={['sale']}
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
                            showRefreshButton={false}
                            value={watch('debitAccId') as string}
                            className={clsx("mt-1 w-full max-w-80", errors?.debitAccId && errorClass)}
                            toSelectFirstOption={true}
                        />
                    </FormField>
                </div>

                {/* Credit account row */}
                <div className="space-y-1">
                    <h3 className="font-bold text-gray-800 text-sm mb-4">Refund Details</h3>

                    <div className={clsx(
                        "relative p-2 border rounded-lg transition-all duration-200",
                        watch('creditAccount.id') ? "bg-amber-50 border-cyan-200 shadow-sm ring-1 ring-amber-200" : "bg-cyan-50 border-cyan-200"
                    )}>
                        {/* Existing Row Indicator */}
                        {watch('creditAccount.id') && (
                            <div
                                className="absolute -top-1 left-4 w-2 h-2 bg-amber-500 rounded-full"
                                title="Existing refund entry"
                            />
                        )}
                        <div className="grid gap-2 grid-col-4 lg:grid-cols-12 items-baseline">

                            {/* Credit account */}
                            <div className="col-span-4">
                                <label className="block mb-1 font-semibold text-gray-700 text-sm items-center">💳 Credit Account (Refund To)</label>
                                <AccountPickerFlat
                                    accClassNames={['cash', 'bank', 'card', 'ecash','debtor','creditor']}
                                    instance={`${instance}-credit-account`}
                                    {...register(`creditAccount.accId`, {
                                        required: Messages.errRequired,
                                    })}
                                    onChange={(value) => {
                                        setValue(`creditAccount.accId`, value, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }}
                                    showRefreshButton={false}
                                    value={getValues(`creditAccount.accId`) as string}
                                    className={clsx("text-sm", errors?.creditAccount?.accId && errorClass)}
                                />
                            </div>

                            {/* Amount */}
                            <div className="col-span-2">
                                <label className="block mb-1 font-semibold text-gray-700 text-sm">💵 Amount</label>
                                <ControlledNumericInput
                                    className={clsx("text-right h-8 w-full text-md rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200",
                                        errors?.creditAccount?.amount ? errorClass : '')}
                                    fieldName={`creditAccount.amount`}
                                    onValueChange={(floatValue) => {
                                        setValue(`creditAccount.amount`, floatValue || 0, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                            shouldTouch: true
                                        })
                                    }}
                                    validate={(value) => {
                                        const ret = value > 0 ? true : Messages.errAmountCannotBeZero;
                                        return (ret)
                                    }}
                                />
                            </div>

                            {/* Instrument */}
                            <div className="col-span-2">
                                <label className="block mb-1 font-semibold text-gray-700 text-sm">🎆 Instrument</label>
                                <input
                                    type="text"
                                    {...register(`creditAccount.instrNo`)}
                                    className={clsx("px-2 py-1 w-full h-8 text-md rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200")}
                                    placeholder="Instrument"
                                />
                            </div>

                            <div className="col-span-4 flex gap-x-2 ">
                                {/* Ref no */}
                                <div className="">
                                    <label className="block mb-1 font-semibold text-gray-700 text-sm">🎇 Ref</label>
                                    <input
                                        type="text"
                                        {...register(`creditAccount.lineRefNo`)}
                                        className={clsx("px-2 py-1 w-full h-8 text-md rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200")}
                                        placeholder="Reference"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="">
                                    <label className="block mb-1 font-semibold text-gray-700 text-sm">📝 Notes</label>
                                    <textarea
                                        {...register(`creditAccount.remarks`)}
                                        className={clsx("px-2 py-1 w-full  text-md rounded-md resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200")}
                                        rows={1}
                                        placeholder="Notes"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReturnAccountingDetails;
