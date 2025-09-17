import React, { useState, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SalesFormDataType } from '../all-sales';
import { AccountPickerFlat, AccClassName } from '../../../../../controls/redux-components/account-picker-flat/account-picker-flat';
import { Banknote, Plus } from 'lucide-react';
import { FormField } from '../../../../../controls/widgets/form-field';
import { DataInstancesMap } from '../../../../../app/maps/data-instances-map';
import { Messages } from '../../../../../utils/messages';
import { IconCross } from '../../../../../controls/icons/icon-cross';
import clsx from 'clsx';
import { ControlledNumericInput } from '../../../../../controls/components/controlled-numeric-input';
import { SqlIdsMap } from '../../../../../app/maps/sql-ids-map';
import Decimal from 'decimal.js';
import { Utils } from '../../../../../utils/utils';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { TranDExtraType } from '../../../../../utils/global-types-interfaces-enums';

type SalesType = 'retail' | 'bill' | 'institution';

const PaymentDetails: React.FC = () => {
    const instance = DataInstancesMap.allSales;
    const errorClass = 'bg-red-200 border-2 border-red-500';
    const { control,
        register,
        setValue,
        getValues,
        trigger,
        watch,
        formState: { errors }, } = useFormContext<SalesFormDataType>();
    const { getDefaultDebitAccount }: any = useFormContext<SalesFormDataType>();
    const { getDebitCreditDifference }: any = useFormContext<SalesFormDataType>();
    const { fields, remove, append } = useFieldArray({
        control,
        name: 'debitAccounts'
    });

    const [salesType, setSalesType] = useState<SalesType>('retail');
    const isEditMode = Boolean(watch('id'))
    const debitAccounts: TranDExtraType[] = watch('debitAccounts')
    // Ensure we always have at least one item
    useEffect(() => {
        if (fields.length === 0 && getDefaultDebitAccount) {
            append(getDefaultDebitAccount());
        }
    }, [fields.length, append, getDefaultDebitAccount]);

    useEffect(() => {
        // setValue(`debitAccounts.${0}.accId`, null, { shouldValidate: true })
    }, [salesType, setValue])

    useDeepCompareEffect(() => {
        if (debitAccounts && isEditMode) {
            if (debitAccounts.find(((item) => item.isAutoSubledger))) {
                setSalesType('bill')
            } else if (debitAccounts.find(((item) => (item.accClass === 'debtor') || (item.accClass === 'creditor')))) {
                setSalesType('institution')
            }
        }

    }, [isEditMode, debitAccounts])



    const handleAddPaymentMethod = () => {
        if (getDefaultDebitAccount) {
            append(getDefaultDebitAccount());
            trigger('debitAccounts');
        }
    };

    const handleClearPaymentMethods = () => {
        // Remove all except first item, then clear the first item
        for (let i = fields.length - 1; i > 0; i--) {
            remove(i);
        }
        if (fields.length > 0 && getDefaultDebitAccount) {
            const defaultData = getDefaultDebitAccount();
            setValue(`debitAccounts.0.accId`, defaultData.accId);
            setValue(`debitAccounts.0.amount`, defaultData.amount);
            setValue(`debitAccounts.0.instrNo`, defaultData.instrNo);
            setValue(`debitAccounts.0.remarks`, defaultData.remarks);
            trigger('debitAccounts');
        }
        setTotalDebitAmount()
    };

    // Calculate total amount from all payment methods
    const setTotalDebitAmount = () => {
        const debitAccounts = watch('debitAccounts') || [];
        const totalDebitAccount = debitAccounts.reduce((sum: Decimal, account: any) => {
            const amount = account?.amount || 0;
            return sum.add(new Decimal(amount));
        }, new Decimal(0));
        setValue('totalDebitAmount', totalDebitAccount)
    };

    const getAccClassNames = (salesType: SalesType, index: number): AccClassName[] => {
        if (index !== 0) {
            return ['cash', 'bank', 'card', 'ecash'];
        }
        switch (salesType) {
            case 'retail':
                return ['cash', 'bank', 'card', 'ecash'];
            case 'bill':
                return [null];
            case 'institution':
                return ['debtor', 'creditor'];
            default:
                return ['cash', 'bank', 'card', 'ecash'];
        }
    };

    const getSqlId = () => {
        let sqlId = null
        if (salesType === 'bill') {
            if (isEditMode) {
                sqlId = SqlIdsMap.getAutoSubledgerAccountsWithLedgersAndSubledgers
            } else {
                sqlId = SqlIdsMap.getAutoSubledgerAccountsOnClass
            }
        } else if (salesType === 'institution') {
            sqlId = SqlIdsMap.getLeafAccountsOnClassWithoutAutoSubledgers
        }
        return (sqlId)
    }

    return (
        <div className="p-4 bg-white border-l-4 border-violet-500 rounded-lg shadow-sm lg:col-span-6 h-full">

            {/* Header section */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-y-4">
                <div className="flex items-center">
                    <div className="mr-3 p-2 text-white bg-violet-100 rounded-lg flex-shrink-0">
                        <Banknote className='w-5 h-5 text-violet-600' />
                    </div>
                    <h2 className="font-semibold text-gray-800 text-lg">Payment Details <span className="text-sm text-gray-500 font-normal">({fields.length} rows)</span></h2>
                </div>
                <div>
                    <div className="text-gray-800">Payable: {Utils.toDecimalFormat(getDebitCreditDifference())}</div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-lg text-gray-800">Total: {Utils.toDecimalFormat(watch('totalDebitAmount')?.toDecimalPlaces(2).toNumber()) || 0}</div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Radio buttons and sales account */}
                <div className="rounded-lg">
                    <div className="mb-2">
                        <div className="flex items-center justify-between flex-wrap gap-y-4">
                            {/* Radio buttons */}
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesType"
                                        value="retail"
                                        checked={salesType === 'retail'}
                                        onChange={(e) => {
                                            setSalesType(e.target.value as SalesType)
                                            setValue(`debitAccounts.${0}.accId`, null, { shouldValidate: true })
                                        }}
                                        className="mr-2 text-violet-950 cursor-pointer"
                                    />
                                    <span className="font-semibold text-gray-700 text-sm">🏪 Retail</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesType"
                                        value="bill"
                                        checked={salesType === 'bill'}
                                        onChange={(e) => {
                                            setSalesType(e.target.value as SalesType)
                                            setValue(`debitAccounts.${0}.accId`, null, { shouldValidate: true })
                                        }}
                                        className="mr-2 text-violet-950 cursor-pointer"
                                    />
                                    <span className="font-semibold text-gray-700 text-sm">🏭 Auto Subledger (Bill Sale)</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesType"
                                        value="institution"
                                        checked={salesType === 'institution'}
                                        onChange={(e) => {
                                            setSalesType(e.target.value as SalesType)
                                            setValue(`debitAccounts.${0}.accId`, null, { shouldValidate: true })
                                        }}
                                        className="mr-2 text-violet-950 cursor-pointer"
                                    />
                                    <span className="font-semibold text-gray-700 text-sm">🏢 Institution</span>
                                </label>
                            </div>

                            {/* Sales account */}
                            <FormField
                                label='Sale Account'
                                required
                                error={errors?.creditAccId?.message}
                                className='-mt-2'
                                toShowErrorMessage={false}
                            >
                                <AccountPickerFlat
                                    accClassNames={['sale']}
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
                                    showRefreshButton={false}
                                    value={watch('creditAccId') as string}
                                    className={clsx("mt-1 w-full max-w-80", errors?.creditAccId && errorClass)}
                                    toSelectFirstOption={true}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Payment methods */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 text-sm">Payment Methods</h3>
                        <div className="flex space-x-2">
                            {/* Clear */}
                            <button
                                onClick={handleClearPaymentMethods}
                                className="px-3 py-1 font-semibold text-amber-700 text-sm bg-amber-200 rounded-md transition-all duration-200 hover:bg-amber-300"
                                type="button"
                            >
                                🗑️ Clear
                            </button>
                            {/* Add */}
                            <button
                                onClick={handleAddPaymentMethod}
                                className="px-3 flex items-center gap-x-1.5 py-1 font-semibold text-white text-sm bg-violet-500 rounded-md transition-all duration-200 hover:bg-violet-600"
                                type="button"
                            >
                                <Plus className='w-4.5 h-4.5' /> Add
                            </button>
                        </div>
                    </div>

                    {/* Payment methods rows */}
                    {fields.map((_, index) => (
                        <div key={index} className="relative p-2 bg-violet-50 border border-violet-200 rounded-lg">
                            {/* Row Index Badge */}
                            <div className="absolute -top-1 -left-1 w-4 h-4 bg-violet-200 text-violet-700 text-xs font-medium rounded-full flex items-center justify-center z-10">
                                {index + 1}
                            </div>
                            <div className="grid gap-2 grid-col-4 lg:grid-cols-12 items-baseline">

                                {/* Payment account */}
                                <div className="col-span-4">
                                    <label className="block mb-1 font-semibold text-gray-700 text-sm items-center">💳 Payment Account</label>
                                    <AccountPickerFlat
                                        accClassNames={getAccClassNames(salesType, index)}
                                        instance={`${instance}-debit-account-${index}`}
                                        {...register(`debitAccounts.${index}.accId`, {
                                            required: Messages.errRequired,
                                        })}
                                        onChange={(value) =>
                                            setValue(`debitAccounts.${index}.accId`, value, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            })
                                        }
                                        showRefreshButton={false}
                                        value={getValues(`debitAccounts.${index}.accId`) as string}
                                        className={clsx("text-sm", errors?.debitAccounts?.[index]?.accId && errorClass)}
                                        sqlId={getSqlId()}
                                    />
                                </div>

                                {/* Amount */}
                                <div className="col-span-2">
                                    <label className="block mb-1 font-semibold text-gray-700 text-sm">💵 Amount</label>
                                    <ControlledNumericInput
                                        className={clsx("text-right h-8 w-full text-md rounded-md focus:border-violet-500 focus:ring-1 focus:ring-violet-200",
                                            errors?.debitAccounts?.[index]?.amount ? errorClass : '')}
                                        fieldName={`debitAccounts.${index}.amount`}
                                        onValueChange={(floatValue) => {
                                            setValue(`debitAccounts.${index}.amount`, floatValue || 0, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                                shouldTouch: true
                                            })
                                            setTotalDebitAmount()
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
                                        {...register(`debitAccounts.${index}.instrNo`)}
                                        className={clsx("px-2 py-1 w-full h-8 text-md rounded-md focus:border-violet-500 focus:ring-1 focus:ring-violet-200")}
                                        placeholder="Instrument"
                                    />
                                </div>

                                <div className="col-span-4 flex gap-x-2 ">
                                    {/* Ref no */}
                                    <div className="">
                                        <label className="block mb-1 font-semibold text-gray-700 text-sm">🎇 Ref</label>
                                        <input
                                            type="text"
                                            {...register(`debitAccounts.${index}.lineRefNo`)}
                                            className={clsx("px-2 py-1 w-full h-8 text-md rounded-md focus:border-violet-500 focus:ring-1 focus:ring-violet-200")}
                                            placeholder="Reference"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div className="">
                                        <label className="block mb-1 font-semibold text-gray-700 text-sm">📝 Notes</label>
                                        <textarea
                                            {...register(`debitAccounts.${index}.remarks`)}
                                            className={clsx("px-2 py-1 w-full  text-md rounded-md resize-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200")}
                                            rows={1}
                                            placeholder="Notes"
                                        />
                                    </div>

                                    {/* Remove */}
                                    <div className="flex items-end justify-center">
                                        {index !== 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="mb-2 p-1.5 text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-md transition-all duration-200 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                title="Remove payment method"
                                                aria-label="Remove payment method"
                                            >
                                                <IconCross className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <div className="mb-2 p-1.5 w-7 h-7"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaymentDetails;