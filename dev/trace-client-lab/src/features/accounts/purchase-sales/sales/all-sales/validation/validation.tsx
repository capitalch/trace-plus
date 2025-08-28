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
        const errors = [];
        if (!document.querySelector('input[placeholder="Search customer..."]')?.value) {
            errors.push('Customer is required');
        }
        items.forEach((item, index) => {
            if (!item.productCode) errors.push(`Item ${index + 1}: Product code required`);
            if (!item.hsn) errors.push(`Item ${index + 1}: HSN code required`);
        });
        return errors;
    };

    return (
        <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className="bg-red-500 text-white p-2 rounded-lg mr-2">
                        <span className="text-sm font-bold">⚠️</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Validation</h2>
                </div>
                <button
                    onClick={() => setShowErrors(!showErrors)}
                    className="text-red-500 hover:text-red-700 text-sm"
                >
                    {showErrors ? '🙈' : '👁️'}
                </button>
            </div>

            {showErrors && (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                    {validateForm().length === 0 ? (
                        <div className="text-center py-4">
                            <span className="text-4xl">✅</span>
                            <p className="text-sm font-semibold text-green-600 mt-2">All good!</p>
                        </div>
                    ) : (
                        validateForm().map((error, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-2">
                                <p className="text-xs text-red-600 font-semibold">🚨 {error}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Validation;