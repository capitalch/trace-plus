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
        <div className="p-4 bg-white border-l-4 border-purple-500 rounded-xl shadow-lg lg:col-span-6">
            <div className="flex items-center mb-3">
                <div className="mr-3 p-2 text-white bg-purple-500 rounded-lg">
                    <span className="font-bold text-sm">💳</span>
                </div>
                <div>
                    <h2 className="font-bold text-gray-800 text-lg">Payment Details</h2>
                    <p className="text-gray-600 text-sm">Methods: {paymentMethods.length}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="mb-2">
                        <div className="flex justify-end mb-1">
                            <label className="text-gray-600 text-xs">Sales Account</label>
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
                                    <span className="font-semibold text-gray-700 text-sm">🏪 Retail</span>
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
                                    <span className="font-semibold text-gray-700 text-sm">🏭 Wholesale</span>
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
                                    <span className="font-semibold text-gray-700 text-sm">🏢 Institution</span>
                                </label>
                            </div>
                            <select className="px-2 py-1 w-48 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200">
                                <option>💰 Select sales account</option>
                                <option>Sales - General</option>
                                <option>Sales - Export</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2 grid-cols-1">
                        <div>
                            <label className="block mb-1 font-semibold text-gray-700 text-xs">Payment Account</label>
                            <select className="px-2 py-1 w-full text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200">
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
                        <h3 className="font-bold text-gray-800 text-sm">Payment Methods</h3>
                        <button
                            onClick={addPaymentMethod}
                            className="px-3 py-1 font-semibold text-white text-xs bg-purple-500 rounded-md transition-all duration-200 hover:bg-purple-600"
                        >
                            ➕ Add
                        </button>
                    </div>

                    {paymentMethods.map((payment) => (
                        <div key={payment.id} className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="grid gap-2 grid-cols-12">
                                <div className="col-span-3">
                                    <label className="block mb-1 font-semibold text-gray-700 text-xs">💳 Payment Account</label>
                                    <select className="px-2 py-1 w-full text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200">
                                        <option>Select account</option>
                                        <option>Cash</option>
                                        <option>Bank - SBI</option>
                                        <option>Bank - HDFC</option>
                                        <option>Credit Card</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1 font-semibold text-gray-700 text-xs">💵 Amount</label>
                                    <input
                                        type="number"
                                        defaultValue="0.00"
                                        className="px-2 py-1 w-full text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-1 font-semibold text-gray-700 text-xs">📄 Reference</label>
                                    <input
                                        type="text"
                                        className="px-2 py-1 w-full text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                                        placeholder="Ref No."
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block mb-1 font-semibold text-gray-700 text-xs">📝 Notes</label>
                                    <textarea
                                        className="px-2 py-1 w-full text-sm border border-gray-300 rounded-md resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaymentDetails;