import React, { useState } from 'react';

interface PaymentMethod {
    id: number;
    amount: number;
    instrNo: string;
    remarks: string;
}

const PaymentDetails: React.FC = () => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { id: 1, amount: 0, instrNo: '', remarks: '' }
    ]);
    const [salesType, setSalesType] = useState('retail');
    const addPaymentMethod = () => {
        const newPayment = {
            id: paymentMethods.length + 1,
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

    return (
        <div className="lg:col-span-6 bg-white rounded-xl shadow-lg border-l-4 border-purple-500 p-4">
            <div className="flex items-center mb-3">
                <div className="bg-purple-500 text-white p-2 rounded-lg mr-3">
                    <span className="text-sm font-bold">💳</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>
                    <p className="text-sm text-gray-600">Methods: {paymentMethods.length}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="mb-2">
                        <div className="flex justify-end mb-1">
                            <label className="text-xs text-gray-600">Sales Account</label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesType"
                                        value="retail"
                                        checked={salesType === 'retail'}
                                        onChange={(e) => setSalesType(e.target.value)}
                                        className="mr-2 text-purple-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">🏪 Retail</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesType"
                                        value="wholesale"
                                        checked={salesType === 'wholesale'}
                                        onChange={(e) => setSalesType(e.target.value)}
                                        className="mr-2 text-purple-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">🏭 Wholesale</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesType"
                                        value="institution"
                                        checked={salesType === 'institution'}
                                        onChange={(e) => setSalesType(e.target.value)}
                                        className="mr-2 text-purple-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">🏢 Institution</span>
                                </label>
                            </div>
                            <select className="w-48 px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm">
                                <option>💰 Select sales account</option>
                                <option>Sales - General</option>
                                <option>Sales - Export</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Account</label>
                            <select className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm">
                                <option>🏦 Select payment account</option>
                                <option>Cash</option>
                                <option>Bank - SBI</option>
                                <option>Bank - HDFC</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-800">Payment Methods</h3>
                        <button
                            onClick={addPaymentMethod}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200"
                        >
                            ➕ Add
                        </button>
                    </div>

                    {paymentMethods.map((payment) => (
                        <div key={payment.id} className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-3">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">💳 Payment Account</label>
                                    <select className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm">
                                        <option>Select account</option>
                                        <option>Cash</option>
                                        <option>Bank - SBI</option>
                                        <option>Bank - HDFC</option>
                                        <option>Credit Card</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">💵 Amount</label>
                                    <input
                                        type="number"
                                        defaultValue="0.00"
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">📄 Reference</label>
                                    <input
                                        type="text"
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm"
                                        placeholder="Ref No."
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">📝 Notes</label>
                                    <textarea
                                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm resize-none"
                                        rows={1}
                                        placeholder="Notes"
                                    />
                                </div>
                                <div className="col-span-1 flex items-end justify-center">
                                    {paymentMethods.length > 1 && (
                                        <button
                                            onClick={() => removePaymentMethod(payment.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-all duration-200 mb-1.5"
                                        >
                                            <span className="text-sm">🗑️</span>
                                        </button>
                                    )}
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