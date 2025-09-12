import React, { useState, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SalesFormDataType } from '../all-sales';
import { AccountPickerFlat, AccClassName } from '../../../../../controls/redux-components/account-picker-flat/account-picker-flat';
import { TranDType } from '../../../../../utils/global-types-interfaces-enums';
import { Banknote } from 'lucide-react';

// interface PaymentMethod {
//     id: number;
//     accId: string | null;
//     amount: number;
//     instrNo: string;
//     remarks: string;
// }

type SalesType = 'retail' | 'wholesale' | 'institution';

const PaymentDetails: React.FC = () => {
    const { control,
        getValues,
        setValue,
        trigger,
        formState: { errors }, } = useFormContext<SalesFormDataType>();
    
        const { fields, remove, insert, append } = useFieldArray({
        control,
        name: 'debitAccounts'
    });

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { id: 1, accId: null, amount: 0, instrNo: '', remarks: '' }
    ]);
    const [salesType, setSalesType] = useState<SalesType>('retail');
    const [totalAmount, setTotalAmount] = useState(0);
    // Initialize form values from existing data
    useEffect(() => {
        const formData = getValues();
        if (formData.debitAccounts && formData.debitAccounts.length > 0) {
            const methods = formData.debitAccounts.map((debit, index) => ({
                id: index + 1,
                accId: debit.accId.toString(),
                amount: debit.amount,
                instrNo: debit.instrNo || '',
                remarks: debit.remarks || ''
            }));
            setPaymentMethods(methods);
        }
    }, []);

    // Calculate total whenever payment methods change
    useEffect(() => {
        const total = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
        setTotalAmount(total);
        updateFormDebitAccounts();
    }, [paymentMethods]);

    const addPaymentMethod = () => {
        const newPayment = {
            id: paymentMethods.length + 1,
            accId: null,
            amount: 0,
            instrNo: '',
            remarks: ''
        };
        setPaymentMethods([...paymentMethods, newPayment]);
    };

    const removePaymentMethod = (id: any) => {
        if (paymentMethods.length > 1) {
            setPaymentMethods(paymentMethods.filter(p => p.id !== id));
        }
    };

    const clearPaymentMethods = () => {
        setPaymentMethods([{ id: 1, accId: null, amount: 0, instrNo: '', remarks: '' }]);
    };

    const updatePaymentMethod = (id: number, field: keyof PaymentMethod, value: any) => {
        setPaymentMethods(prev => prev.map(method =>
            method.id === id ? { ...method, [field]: value } : method
        ));
    };

    const updateFormDebitAccounts = () => {
        const debitAccounts: TranDType[] = paymentMethods
            .filter(method => method.accId && method.amount > 0)
            .map(method => ({
                accId: parseInt(method.accId!),
                amount: method.amount,
                instrNo: method.instrNo || null,
                remarks: method.remarks || null,
                dc: 'D',
                tranHeaderId: 0
            }));
        setValue('debitAccounts', debitAccounts);
        trigger('debitAccounts');
    };

    const getAccClassNames = (salesType: SalesType): AccClassName[] => {
        switch (salesType) {
            case 'retail':
                return ['cash', 'bank', 'card', 'ecash'];
            case 'wholesale':
                return [null];
            case 'institution':
                return ['debtor', 'creditor'];
            default:
                return ['cash', 'bank', 'card', 'ecash'];
        }
    };

    return (
        <div className="p-4 bg-white border-l-4 border-violet-500 rounded-lg shadow-sm lg:col-span-6 h-full">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <div className="mr-3 p-2 text-white bg-violet-100 rounded-lg flex-shrink-0">
                        <Banknote className='w-5 h-5 text-violet-600' />
                    </div>
                    <h2 className="font-semibold text-gray-800 text-lg">Payment Details</h2>
                </div>
                <div className="text-right">
                    <div className="font-bold text-lg text-gray-800">{totalAmount.toFixed(2)}</div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="p- rounded-lg">
                    <div className="mb-2">
                        <div className="flex justify-end mb-1">
                            <label className="text-gray-700 text-sm">Sales Account</label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesType"
                                        value="retail"
                                        checked={salesType === 'retail'}
                                        onChange={(e) => setSalesType(e.target.value as SalesType)}
                                        className="mr-2 text-violet-500 cursor-pointer"
                                    />
                                    <span className="font-semibold text-gray-700 text-sm">🏪 Retail</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesType"
                                        value="wholesale"
                                        checked={salesType === 'wholesale'}
                                        onChange={(e) => setSalesType(e.target.value as SalesType)}
                                        className="mr-2 text-violet-500 cursor-pointer"
                                    />
                                    <span className="font-semibold text-gray-700 text-sm">🏭 Auto Subledger (Bill Sale)</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesType"
                                        value="institution"
                                        checked={salesType === 'institution'}
                                        onChange={(e) => setSalesType(e.target.value as SalesType)}
                                        className="mr-2 text-violet-500 cursor-pointer"
                                    />
                                    <span className="font-semibold text-gray-700 text-sm">🏢 Institution</span>
                                </label>
                            </div>
                            <div className="w-64">
                                <AccountPickerFlat
                                    accClassNames={['sale']}
                                    instance="paymentDetails"
                                    value={getValues('creditAccId')?.toString() || null}
                                    onChange={(value) => {
                                        setValue('creditAccId', value ? parseInt(value) : null);
                                        trigger('creditAccId');
                                    }}
                                    showRefreshButton={false}
                                    className="text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 text-sm">Payment Methods</h3>
                        <div className="flex space-x-2">
                            {/* Clear */}
                            <button
                                onClick={clearPaymentMethods}
                                className="px-3 py-1 font-semibold text-amber-700 text-xs bg-amber-200 rounded-md transition-all duration-200 hover:bg-amber-300"
                                type="button"
                            >
                                🗑️ Clear
                            </button>
                            {/* Add */}
                            <button
                                onClick={addPaymentMethod}
                                className="px-3 py-1 font-semibold text-white text-xs bg-violet-500 rounded-md transition-all duration-200 hover:bg-violet-600"
                                type="button"
                            >
                                ➕ Add
                            </button>
                        </div>
                    </div>

                    {paymentMethods.map((payment) => (
                        <div key={payment.id} className="p-2 bg-violet-50 border border-violet-200 rounded-lg">
                            <div className="grid gap-2 grid-col-4 lg:grid-cols-12">
                                {/* Payment account */}
                                <div className="col-span-4">
                                    <label className="block mb-1 font-semibold text-gray-700 text-xs">💳 Payment Account</label>
                                    <AccountPickerFlat
                                        accClassNames={getAccClassNames(salesType)}
                                        instance={`paymentMethod_${payment.id}`}
                                        value={payment.accId}
                                        onChange={(value) => updatePaymentMethod(payment.id, 'accId', value)}
                                        showRefreshButton={false}
                                        className="text-sm"
                                    />
                                </div>
                                {/* Amount */}
                                <div className="col-span-2">
                                    <label className="block mb-1 font-semibold text-gray-700 text-xs">💵 Amount</label>
                                    <input
                                        type="number"
                                        value={payment.amount}
                                        onChange={(e) => updatePaymentMethod(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                                        className="px-1 py-1 w-full text-sm text-right border border-gray-300 rounded-md focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                {/* Instrument */}
                                <div className="col-span-2">
                                    <label className="block mb-1 font-semibold text-gray-700 text-xs">🎆 Instrument</label>
                                    <input
                                        type="text"
                                        value={payment.instrNo}
                                        onChange={(e) => updatePaymentMethod(payment.id, 'instrNo', e.target.value)}
                                        className="px-2 py-1 w-full text-sm border border-gray-300 rounded-md focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
                                        placeholder="Instrument"
                                    />
                                </div>
                                <div className="col-span-4 flex gap-x-2">
                                    {/* Reference */}
                                    <div className="col-span-1">
                                        <label className="block mb-1 font-semibold text-gray-700 text-xs">📄 Ref</label>
                                        <input
                                            type="text"
                                            value={payment.instrNo}
                                            onChange={(e) => updatePaymentMethod(payment.id, 'instrNo', e.target.value)}
                                            className="px-2 py-1 w-full text-sm border border-gray-300 rounded-md focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
                                            placeholder="Ref No"
                                        />
                                    </div>
                                    {/* Notes */}
                                    <div className="col-span-2">
                                        <label className="block mb-1 font-semibold text-gray-700 text-xs">📝 Notes</label>
                                        <textarea
                                            value={payment.remarks}
                                            onChange={(e) => updatePaymentMethod(payment.id, 'remarks', e.target.value)}
                                            className="px-2 py-1 w-full text-sm border border-gray-300 rounded-md resize-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
                                            rows={1}
                                            placeholder="Notes"
                                        />
                                    </div>
                                    <div className="flex items-end justify-center col-span-1">
                                        {paymentMethods.length > 1 && (
                                            <button
                                                onClick={() => removePaymentMethod(payment.id)}
                                                className="mb-1.5 p-1 text-red-500 rounded-full transition-all duration-200 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <span className="text-sm">🗑️</span>
                                            </button>
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