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

const ItemsAndServices: React.FC = () => {
    const [items, setItems] = useState<Item[]>([
        { id: 1, productCode: '', hsn: '', gst: 0, qty: 1, price: 0, gstPrice: 0, discount: 0, remarks: '', serialNo: '' }
    ]);
    const addItem = () => {
        const newItem = {
            id: items.length + 1,
            productCode: '',
            hsn: '',
            gst: 0,
            qty: 1,
            price: 0,
            gstPrice: 0,
            discount: 0,
            remarks: '',
            serialNo: ''
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: any) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => {
            const itemTotal = (item.qty || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100);
            return sum + itemTotal;
        }, 0);
        const cgst = subtotal * 0.09;
        const sgst = subtotal * 0.09;
        const igst = 0;
        const total = subtotal + cgst + sgst + igst;

        return {
            subtotal: subtotal.toFixed(2),
            cgst: cgst.toFixed(2),
            sgst: sgst.toFixed(2),
            igst: igst.toFixed(2),
            total: total.toFixed(2)
        };
    };

    const totals = calculateTotals();

    return (
        <div className="bg-white rounded-xl shadow-md border-l-4 border-green-400 mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b border-green-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-green-400 text-white p-2 rounded-lg mr-3">
                            <span className="text-sm font-bold">📦</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Items & Services</h2>
                            <p className="text-sm text-gray-600">Add products and services to this invoice</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <label className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm">
                            <input type="checkbox" className="mr-2 text-green-400" />
                            <span className="text-sm font-semibold text-gray-700">Inter-state (IGST)</span>
                        </label>
                        <button
                            onClick={addItem}
                            className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            ➕ Add Item
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">#</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[150px]">Product</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">HSN</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">GST%</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Qty</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Rate</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">GST Rate</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Disc%</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Notes</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Serial</th>
                            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Amount</th>
                            <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-blue-50 transition-colors duration-150">
                                <td className="px-3 py-3 text-sm font-semibold text-gray-700 bg-gray-50">{index + 1}</td>
                                <td className="px-3 py-3">
                                    <input
                                        type="text"
                                        value={item.productCode}
                                        onChange={(e) => updateItem(item.id, 'productCode', e.target.value)}
                                        className="w-full px-2 py-2 border border-gray-300 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm transition-all duration-200"
                                        placeholder="Enter product code"
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <input
                                        type="text"
                                        value={item.hsn}
                                        onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                                        className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
                                        placeholder="HSN"
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <input
                                        type="number"
                                        value={item.gst}
                                        onChange={(e) => updateItem(item.id, 'gst', parseFloat(e.target.value) || 0)}
                                        className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
                                        step="0.01"
                                        placeholder="18"
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <input
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 1)}
                                        className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
                                        step="0.01"
                                        min="0.01"
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                        className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <input
                                        type="number"
                                        value={item.gstPrice}
                                        onChange={(e) => updateItem(item.id, 'gstPrice', parseFloat(e.target.value) || 0)}
                                        className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <input
                                        type="number"
                                        value={item.discount}
                                        onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                        className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
                                        step="0.01"
                                        placeholder="0"
                                        max="100"
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <input
                                        type="text"
                                        value={item.remarks}
                                        onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                                        className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
                                        placeholder="Notes"
                                    />
                                </td>
                                <td className="px-3 py-3">
                                    <textarea
                                        value={item.serialNo}
                                        onChange={(e) => updateItem(item.id, 'serialNo', e.target.value)}
                                        rows={2}
                                        className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-xs resize-none transition-all duration-200"
                                        placeholder="Enter serial numbers..."
                                    />
                                </td>
                                <td className="px-3 py-3 text-sm font-bold text-green-600 bg-green-50">
                                    ₹{((item.qty || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100)).toFixed(2)}
                                </td>
                                <td className="px-3 py-3 text-center">
                                    {items.length > 1 && (
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-all duration-200 hover:scale-110"
                                        >
                                            <span className="text-lg font-bold">🗑️</span>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-t">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm font-semibold">
                        <span className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Items: {items.length}
                        </span>
                        <span className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Total Qty: {items.reduce((sum, item) => sum + (item.qty || 0), 0)}
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 text-sm font-semibold">
                            <span>CGST: ₹{totals.cgst}</span>
                            <span>SGST: ₹{totals.sgst}</span>
                            <span>IGST: ₹{totals.igst}</span>
                        </div>
                        <div className="flex space-x-2">
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200">
                                🧹 CLEAR
                            </button>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200">
                                📊 ROUND OFF
                            </button>
                            <button className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200">
                                🔢 BACK CAL
                            </button>
                        </div>
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                            Total: ₹{totals.total}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemsAndServices;