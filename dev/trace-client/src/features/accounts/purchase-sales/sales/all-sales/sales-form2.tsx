import React, { useState } from 'react';
import { Search, Calendar, FileText, User, Edit, History, Trash2, RotateCcw, Eye, Send } from 'lucide-react';


interface Customer {
    name: string;
    contact: string;
    email: string;
    address: string;
    gstin: string;
    balance: number;
}

const SalesForm2: React.FC = () => {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>({
        name: 'ABC Trading Company',
        contact: '+91 9876543210',
        email: 'abc@trading.com',
        address: '123 Business District, Salt Lake, Kolkata - 700091, West Bengal, India',
        gstin: '19ABCDE1234F1Z5',
        balance: 115240.50
    });

    const [invoiceData, setInvoiceData] = useState({
        date: '2025-08-25',
        reference: 'REF-001',
        remarks: ''
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState([
        { id: 1, productCode: '', hsn: '', gst: 0, qty: 1, price: 0, gstPrice: 0, discount: 0, remarks: '', serialNo: '' }
    ]);
     const [paymentMethods, setPaymentMethods] = useState([{ id: 1, amount: 0, instrNo: '', remarks: '' }]);
  const [salesType, setSalesType] = useState('retail');
  const [showErrors, setShowErrors] = useState(true);
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
    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => {
            const itemTotal = (item.qty || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100);
            return sum + itemTotal;
        }, 0);
        const cgst = subtotal * 0.09; // 9% CGST
        const sgst = subtotal * 0.09; // 9% SGST
        const igst = 0; // Default to 0, would be 18% if inter-state
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

    const updateItem = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

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
        <div className="min-h-screen bg-gray-50 m-4 ml-0">
            {/* Status Bar with CSS Grid */}
            <div className="bg-gray-100 text-gray-800 py-3 px-4 mr- rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-8 items-center">

                    {/* Status Indicators */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                            <span className="text-md whitespace-nowrap">Debits: ₹0.00</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <span className="text-md whitespace-nowrap">Credits: ₹0.00</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                            <span className="text-md whitespace-nowrap">Diff: ₹0.00</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-start md:justify-end gap-3">
                        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                            <RotateCcw size={16} className="flex-shrink-0" />
                            <span>RESET</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                            <Eye size={16} className="flex-shrink-0" />
                            <span>VIEW</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                            <Send size={16} className="flex-shrink-0" />
                            <span>SUBMIT</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content with CSS Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
                {/* Invoice Details */}
                <div className="bg-white rounded-lg shadow-sm border-l-4 border-indigo-400 p-6">
                    {/* <div className="p-"> */}
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={invoiceData.date}
                                            onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reference no
                                    </label>
                                    <input
                                        type="text"
                                        value={invoiceData.reference}
                                        onChange={(e) => setInvoiceData(prev => ({ ...prev, reference: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="REF-001"
                                    />
                                </div>
                            </div>

                            {/* Right column - Remarks */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Remarks
                                </label>
                                <textarea
                                    rows={4}
                                    value={invoiceData.remarks}
                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, remarks: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Add any special instructions or notes..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-400 p-4 relative">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                            <User className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left column - Customer and GSTIN inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Search customer..."
                                    />
                                    <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GSTIN Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter GSTIN"
                                />
                            </div>
                        </div>

                        {/* Right column - Selected Customer Info */}
                        <div className="bg-gray-50 rounded-lg p-3 border h-fit">
                            <div className="space-y-1.5 text-sm mb-3">
                                <div>
                                    <span className="font-medium text-gray-900">{selectedCustomer.name}</span>
                                </div>
                                <div className="text-gray-600">
                                    Contact: {selectedCustomer.contact}
                                </div>
                                <div className="text-gray-600">
                                    Email: {selectedCustomer.email}
                                </div>
                                <div className="text-gray-600">
                                    Address: {selectedCustomer.address}
                                </div>
                                <div className="text-gray-600 pt-1 border-t">
                                    GSTIN: {selectedCustomer.gstin}
                                </div>
                            </div>

                            {/* Customer Actions */}
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                <button className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm">
                                    <Edit size={14} className="flex-shrink-0" />
                                    <span>Edit</span>
                                </button>
                                <button className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                                    <History size={14} className="flex-shrink-0" />
                                    <span>History</span>
                                </button>
                                <button className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm">
                                    <Trash2 size={14} className="flex-shrink-0" />
                                    <span>Clear</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                            rows="2"
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

                {/* Enhanced Items Footer */}
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

            {/* Bottom Sections Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Payments Section */}
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
                            <div className="flex items-center space-x-4 mb-2">
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

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Sales Account</label>
                                    <select className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm">
                                        <option>💰 Select sales account</option>
                                        <option>Sales - General</option>
                                        <option>Sales - Export</option>
                                    </select>
                                </div>
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

                            {paymentMethods.map((payment, index) => (
                                <div key={payment.id} className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">💵 Amount</label>
                                            <input
                                                type="number"
                                                defaultValue="0.00"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">📄 Reference</label>
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm"
                                                placeholder="Ref No."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">📝 Notes</label>
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm"
                                                placeholder="Notes"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            {paymentMethods.length > 1 && (
                                                <button
                                                    onClick={() => removePaymentMethod(payment.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-all duration-200"
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

                {/* Validation Errors */}
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

                {/* Ship To Section */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border-l-4 border-orange-500 p-4">
                    <div className="flex items-center mb-3">
                        <div className="bg-orange-500 text-white p-2 rounded-lg mr-3">
                            <span className="text-sm font-bold">🚚</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Shipping</h2>
                            <p className="text-sm text-gray-600">Delivery address</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <textarea
                            rows="5"
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm resize-none transition-all duration-200"
                            placeholder="📍 Enter complete shipping address..."
                        />

                        <div className="flex justify-between">
                            <button className="bg-orange-100 hover:bg-orange-200 text-orange-600 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border border-orange-300">
                                🧹 Clear
                            </button>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200">
                                ✏️ Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SalesForm2;
