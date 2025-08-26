import React from 'react';
import { Package, PlusCircle, Trash2 } from 'lucide-react';

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

interface Totals {
    subtotal: string;
    cgst: string;
    sgst: string;
    igst: string;
    total: string;
}

interface ItemsAndServicesProps {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    addItem: () => void;
    removeItem: (id: number) => void;
    updateItem: (id: number, field: string, value: any) => void;
    totals: Totals;
}

const ItemsAndServices: React.FC<ItemsAndServicesProps> = ({ items, setItems, addItem, removeItem, updateItem, totals }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-emerald-500 mb-6 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-50 to-green-100 p-5 border-b border-emerald-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-100 rounded-full">
                            <Package className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Items & Services</h2>
                            <p className="text-sm text-gray-600">Manage products and services for this invoice</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500" />
                            <span className="ml-3 text-sm font-semibold text-gray-700">Inter-state (IGST)</span>
                        </label>
                        <button
                            onClick={addItem}
                            className="flex items-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <PlusCircle size={18} />
                            <span>Add Item</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">HSN</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">GST%</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">GST Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Disc%</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Serial</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-4 py-3 text-sm font-medium text-gray-800 bg-gray-50">{index + 1}</td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={item.productCode}
                                        onChange={(e) => updateItem(item.id, 'productCode', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                        placeholder="Product Name/Code"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={item.hsn}
                                        onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                        placeholder="HSN"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={item.gst}
                                        onChange={(e) => updateItem(item.id, 'gst', parseFloat(e.target.value) || 0)}
                                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                        step="0.01"
                                        placeholder="18"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 1)}
                                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                        step="0.01"
                                        min="0.01"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={item.gstPrice}
                                        onChange={(e) => updateItem(item.id, 'gstPrice', parseFloat(e.target.value) || 0)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        value={item.discount}
                                        onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                        step="0.01"
                                        placeholder="0"
                                        max="100"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={item.remarks}
                                        onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                                        placeholder="Notes"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <textarea
                                        value={item.serialNo}
                                        onChange={(e) => updateItem(item.id, 'serialNo', e.target.value)}
                                        rows={1}
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs resize-none"
                                        placeholder="Serial numbers..."
                                    />
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800 bg-gray-50">
                                    ₹{((item.qty || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100)).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {items.length > 1 && (
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full transition-colors duration-200 hover:bg-red-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 p-5 border-t">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm font-semibold text-gray-600">
                        <span className="flex items-center">
                            <span className="w-2.5 h-2.5 bg-sky-500 rounded-full mr-2.5"></span>
                            Items: <span className="ml-1 text-gray-800">{items.length}</span>
                        </span>
                        <span className="flex items-center">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2.5"></span>
                            Total Qty: <span className="ml-1 text-gray-800">{items.reduce((sum, item) => sum + (item.qty || 0), 0)}</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-4 text-sm font-semibold text-gray-600">
                            <span>CGST: <span className="text-gray-800">₹{totals.cgst}</span></span>
                            <span>SGST: <span className="text-gray-800">₹{totals.sgst}</span></span>
                            <span>IGST: <span className="text-gray-800">₹{totals.igst}</span></span>
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-md text-xs font-bold hover:bg-orange-200 transition-colors">
                                CLEAR
                            </button>
                            <button className="px-3 py-1.5 bg-sky-100 text-sky-600 rounded-md text-xs font-bold hover:bg-sky-200 transition-colors">
                                ROUND OFF
                            </button>
                        </div>
                        <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg">
                            Total: ₹{totals.total}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemsAndServices;