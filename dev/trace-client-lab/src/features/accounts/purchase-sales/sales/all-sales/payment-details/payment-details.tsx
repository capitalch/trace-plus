import React from 'react';
import { CreditCard, PlusCircle, Trash2 } from 'lucide-react';

interface PaymentMethod {
    id: number;
    amount: number;
    instrNo: string;
    remarks: string;
}

interface PaymentDetailsProps {
    paymentMethods: PaymentMethod[];
    setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
    addPaymentMethod: () => void;
    removePaymentMethod: (id: number) => void;
    salesType: string;
    setSalesType: React.Dispatch<React.SetStateAction<string>>;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
    paymentMethods,
    setPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    salesType,
    setSalesType,
}) => {
    return (
        <div className="lg:col-span-6 bg-white rounded-lg shadow-lg border-l-4 border-purple-500 p-6 transition-all duration-300 ease-in-out hover:shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-purple-100 rounded-full">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
                    <p className="text-sm text-gray-600">Configure sales and payment methods</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-md font-semibold text-gray-800">Sales Type</h3>
                    </div>
                    <div className="flex items-center space-x-4">
                        {['Retail', 'Wholesale', 'Institution'].map((type) => (
                            <label key={type} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="salesType"
                                    value={type.toLowerCase()}
                                    checked={salesType === type.toLowerCase()}
                                    onChange={(e) => setSalesType(e.target.value)}
                                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Sales Account</label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                            <option>Select Sales Account</option>
                            <option>Sales - General</option>
                            <option>Sales - Export</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Payment Account</label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                            <option>Select Payment Account</option>
                            <option>Cash</option>
                            <option>Bank - SBI</option>
                            <option>Bank - HDFC</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-md font-semibold text-gray-800">Payment Methods</h3>
                        <button
                            onClick={addPaymentMethod}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <PlusCircle size={16} />
                            <span>Add Method</span>
                        </button>
                    </div>

                    {paymentMethods.map((payment) => (
                        <div key={payment.id} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        defaultValue="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Reference</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                        placeholder="Ref No."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                        placeholder="Optional notes"
                                    />
                                </div>
                                <div className="flex items-center">
                                    {paymentMethods.length > 1 && (
                                        <button
                                            onClick={() => removePaymentMethod(payment.id)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full transition-colors duration-200 hover:bg-red-100"
                                        >
                                            <Trash2 size={16} />
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