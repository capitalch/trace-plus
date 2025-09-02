import React, { useState } from 'react';

interface Item {
    id: number;
    productCode: string;
    hsn: string;
    gst: number;
    qty: number;
    price: number;
    gstPrice: number;
    discount: number;
    remarks: string;
    serialNo: string;
}

const Validation: React.FC = () => {
    const [showErrors, setShowErrors] = useState(true);
    const [items] = useState<Item[]>([
        { id: 1, productCode: '', hsn: '', gst: 0, qty: 1, price: 0, gstPrice: 0, discount: 0, remarks: '', serialNo: '' }
    ]);
    const validateForm = () => {
        const errors:any[] = [];
        // if (!document.querySelector('input[placeholder="Search customer..."]')?.value) {
        //     errors.push('Customer is required');
        // }
        items.forEach((item, index) => {
            if (!item.productCode) errors.push(`Item ${index + 1}: Product code required`);
            if (!item.hsn) errors.push(`Item ${index + 1}: HSN code required`);
        });
        return errors;
    };

    return (
        <div className="p-4 bg-white border-l-4 border-red-500 rounded-xl shadow-lg lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className="mr-2 p-2 text-white bg-red-500 rounded-lg">
                        <span className="font-bold text-sm">⚠️</span>
                    </div>
                    <h2 className="font-bold text-gray-800 text-lg">Validation</h2>
                </div>
                <button
                    onClick={() => setShowErrors(!showErrors)}
                    className="text-red-500 text-sm hover:text-red-700"
                >
                    {showErrors ? '🙈' : '👁️'}
                </button>
            </div>

            {showErrors && (
                <div className="max-h-48 overflow-y-auto space-y-3">
                    {validateForm().length === 0 ? (
                        <div className="py-4 text-center">
                            <span className="text-4xl">✅</span>
                            <p className="mt-2 font-semibold text-green-600 text-sm">All good!</p>
                        </div>
                    ) : (
                        validateForm().map((error, index) => (
                            <div key={index} className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="font-semibold text-red-600 text-xs">🚨 {error}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Validation;