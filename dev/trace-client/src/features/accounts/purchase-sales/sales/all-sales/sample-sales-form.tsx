import React, { useState } from 'react';

const SalesForm = () => {
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

  const removeItem = (id) => {
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

  const removePaymentMethod = (id) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
      <div className="max-w-full mx-auto">
        {/* Enhanced Header - Changed to light gray */}
        <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl shadow-lg mb-4 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              {/* Sales Invoice title and company name removed */}
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                <div className="flex items-center space-x-3 text-sm">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    Debits: ₹0.00
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                    Credits: ₹0.00
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                    Diff: ₹0.00
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
                  🔄 RESET
                </button>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
                  👁️ VIEW
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg">
                  ✅ SUBMIT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer and Invoice Details Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Customer Section */}
          <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-400 p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-3">
              <div className="bg-blue-400 text-white p-2 rounded-lg mr-3">
                <span className="text-sm font-bold">👤</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Customer Details</h2>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Customer *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  placeholder="Search customer..."
                />
                <span className="absolute right-3 top-9 text-gray-400 text-lg">🔍</span>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  placeholder="Enter GSTIN"
                />
              </div>
            </div>
          </div>

          {/* Invoice Details Section */}
          <div className="bg-white rounded-xl shadow-md border-l-4 border-indigo-400 p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-3">
              <div className="bg-indigo-400 text-white p-2 rounded-lg mr-3">
                <span className="text-sm font-bold">📄</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Invoice Details</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  defaultValue="2025-08-23"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reference No.</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                  placeholder="REF-001"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Invoice Remarks</label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 resize-none"
                  placeholder="Add any special instructions or notes..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Items Section */}
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
    </div>
  );
};

export default SalesForm;

// import React, { useState } from 'react';

// const SalesForm = () => {
//   const [items, setItems] = useState([
//     { id: 1, productCode: '', hsn: '', gst: 0, qty: 1, price: 0, gstPrice: 0, discount: 0, remarks: '', serialNo: '' }
//   ]);
//   const [paymentMethods, setPaymentMethods] = useState([{ id: 1, amount: 0, instrNo: '', remarks: '' }]);
//   const [salesType, setSalesType] = useState('retail');
//   const [showErrors, setShowErrors] = useState(true);

//   const addItem = () => {
//     const newItem = {
//       id: items.length + 1,
//       productCode: '',
//       hsn: '',
//       gst: 0,
//       qty: 1,
//       price: 0,
//       gstPrice: 0,
//       discount: 0,
//       remarks: '',
//       serialNo: ''
//     };
//     setItems([...items, newItem]);
//   };

//   const removeItem = (id) => {
//     if (items.length > 1) {
//       setItems(items.filter(item => item.id !== id));
//     }
//   };

//   const addPaymentMethod = () => {
//     const newPayment = {
//       id: paymentMethods.length + 1,
//       amount: 0,
//       instrNo: '',
//       remarks: ''
//     };
//     setPaymentMethods([...paymentMethods, newPayment]);
//   };

//   const removePaymentMethod = (id) => {
//     if (paymentMethods.length > 1) {
//       setPaymentMethods(paymentMethods.filter(p => p.id !== id));
//     }
//   };

//   const calculateTotals = () => {
//     const subtotal = items.reduce((sum, item) => {
//       const itemTotal = (item.qty || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100);
//       return sum + itemTotal;
//     }, 0);
//     const cgst = subtotal * 0.09; // 9% CGST
//     const sgst = subtotal * 0.09; // 9% SGST
//     const igst = 0; // Default to 0, would be 18% if inter-state
//     const total = subtotal + cgst + sgst + igst;
    
//     return { 
//       subtotal: subtotal.toFixed(2), 
//       cgst: cgst.toFixed(2), 
//       sgst: sgst.toFixed(2), 
//       igst: igst.toFixed(2), 
//       total: total.toFixed(2) 
//     };
//   };

//   const totals = calculateTotals();

//   const updateItem = (id, field, value) => {
//     setItems(items.map(item => 
//       item.id === id ? { ...item, [field]: value } : item
//     ));
//   };

//   const validateForm = () => {
//     const errors = [];
//     if (!document.querySelector('input[placeholder="Search customer..."]')?.value) {
//       errors.push('Customer is required');
//     }
//     items.forEach((item, index) => {
//       if (!item.productCode) errors.push(`Item ${index + 1}: Product code required`);
//       if (!item.hsn) errors.push(`Item ${index + 1}: HSN code required`);
//     });
//     return errors;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
//       <div className="max-w-full mx-auto">
//         {/* Enhanced Header */}
//         <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl shadow-lg mb-4 p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold mb-1">Sales Invoice</h1>
//               <div className="text-blue-50 text-lg font-medium">Capital Chowringhee Pvt Ltd</div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
//                 <div className="flex items-center space-x-3 text-sm">
//                   <span className="flex items-center">
//                     <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
//                     Debits: ₹0.00
//                   </span>
//                   <span className="flex items-center">
//                     <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
//                     Credits: ₹0.00
//                   </span>
//                   <span className="flex items-center">
//                     <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
//                     Diff: ₹0.00
//                   </span>
//                 </div>
//               </div>
//               <div className="flex space-x-2">
//                 <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
//                   🔄 RESET
//                 </button>
//                 <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
//                   👁️ VIEW
//                 </button>
//                 <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg">
//                   ✅ SUBMIT
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Customer and Invoice Details Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
//           {/* Customer Section */}
//           <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-400 p-4 hover:shadow-lg transition-shadow duration-200">
//             <div className="flex items-center mb-3">
//               <div className="bg-blue-400 text-white p-2 rounded-lg mr-3">
//                 <span className="text-sm font-bold">👤</span>
//               </div>
//               <h2 className="text-lg font-bold text-gray-800">Customer Details</h2>
//             </div>
            
//             <div className="space-y-3">
//               <div className="relative">
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Customer *</label>
//                 <input
//                   type="text"
//                   className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
//                   placeholder="Search customer..."
//                 />
//                 <span className="absolute right-3 top-9 text-gray-400 text-lg">🔍</span>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">GSTIN Number</label>
//                 <input
//                   type="text"
//                   className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
//                   placeholder="Enter GSTIN"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Invoice Details Section */}
//           <div className="bg-white rounded-xl shadow-md border-l-4 border-indigo-400 p-4 hover:shadow-lg transition-shadow duration-200">
//             <div className="flex items-center mb-3">
//               <div className="bg-indigo-400 text-white p-2 rounded-lg mr-3">
//                 <span className="text-sm font-bold">📄</span>
//               </div>
//               <h2 className="text-lg font-bold text-gray-800">Invoice Details</h2>
//             </div>
            
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
//                 <input
//                   type="date"
//                   defaultValue="2025-08-23"
//                   className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Reference No.</label>
//                 <input
//                   type="text"
//                   className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
//                   placeholder="REF-001"
//                 />
//               </div>
              
//               <div className="col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">Invoice Remarks</label>
//                 <textarea
//                   rows="2"
//                   className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 resize-none"
//                   placeholder="Add any special instructions or notes..."
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Items Section */}
//         <div className="bg-white rounded-xl shadow-md border-l-4 border-green-400 mb-4 overflow-hidden">
//           <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b border-green-200">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <div className="bg-green-400 text-white p-2 rounded-lg mr-3">
//                   <span className="text-sm font-bold">📦</span>
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-bold text-gray-800">Items & Services</h2>
//                   <p className="text-sm text-gray-600">Add products and services to this invoice</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <label className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm">
//                   <input type="checkbox" className="mr-2 text-green-400" />
//                   <span className="text-sm font-semibold text-gray-700">Inter-state (IGST)</span>
//                 </label>
//                 <button
//                   onClick={addItem}
//                   className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
//                 >
//                   ➕ Add Item
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-100 text-gray-700">
//                 <tr>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">#</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[150px]">Product</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">HSN</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">GST%</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Qty</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Rate</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">GST Rate</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Disc%</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Notes</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Serial</th>
//                   <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Amount</th>
//                   <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {items.map((item, index) => (
//                   <tr key={item.id} className="hover:bg-blue-50 transition-colors duration-150">
//                     <td className="px-3 py-3 text-sm font-semibold text-gray-700 bg-gray-50">{index + 1}</td>
//                     <td className="px-3 py-3">
//                       <input
//                         type="text"
//                         value={item.productCode}
//                         onChange={(e) => updateItem(item.id, 'productCode', e.target.value)}
//                         className="w-full px-2 py-2 border border-gray-300 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-sm transition-all duration-200"
//                         placeholder="Enter product code"
//                       />
//                     </td>
//                     <td className="px-3 py-3">
//                       <input
//                         type="text"
//                         value={item.hsn}
//                         onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
//                         className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
//                         placeholder="HSN"
//                       />
//                     </td>
//                     <td className="px-3 py-3">
//                       <input
//                         type="number"
//                         value={item.gst}
//                         onChange={(e) => updateItem(item.id, 'gst', parseFloat(e.target.value) || 0)}
//                         className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
//                         step="0.01"
//                         placeholder="18"
//                       />
//                     </td>
//                     <td className="px-3 py-3">
//                       <input
//                         type="number"
//                         value={item.qty}
//                         onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 1)}
//                         className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
//                         step="0.01"
//                         min="0.01"
//                       />
//                     </td>
//                     <td className="px-3 py-3">
//                       <input
//                         type="number"
//                         value={item.price}
//                         onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
//                         className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
//                         step="0.01"
//                         placeholder="0.00"
//                       />
//                     </td>
//                     <td className="px-3 py-3">
//                       <input
//                         type="number"
//                         value={item.gstPrice}
//                         onChange={(e) => updateItem(item.id, 'gstPrice', parseFloat(e.target.value) || 0)}
//                         className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
//                         step="0.01"
//                         placeholder="0.00"
//                       />
//                     </td>
//                     <td className="px-3 py-3">
//                       <input
//                         type="number"
//                         value={item.discount}
//                         onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
//                         className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
//                         step="0.01"
//                         placeholder="0"
//                         max="100"
//                       />
//                     </td>
//                     <td className="px-3 py-3">
//                       <input
//                         type="text"
//                         value={item.remarks}
//                         onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
//                         className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm transition-all duration-200"
//                         placeholder="Notes"
//                       />
//                     </td>
//                     <td className="px-3 py-3">
//                       <textarea
//                         value={item.serialNo}
//                         onChange={(e) => updateItem(item.id, 'serialNo', e.target.value)}
//                         rows="2"
//                         className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-xs resize-none transition-all duration-200"
//                         placeholder="Enter serial numbers...&#10;SN001&#10;SN002"
//                       />
//                     </td>
//                     <td className="px-3 py-3 text-sm font-bold text-green-600 bg-green-50">
//                       ₹{((item.qty || 0) * (item.price || 0) * (1 - (item.discount || 0) / 100)).toFixed(2)}
//                     </td>
//                     <td className="px-3 py-3 text-center">
//                       {items.length > 1 && (
//                         <button
//                           onClick={() => removeItem(item.id)}
//                           className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-all duration-200 hover:scale-110"
//                         >
//                           <span className="text-lg font-bold">🗑️</span>
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Enhanced Items Footer */}
//           <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-t">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-6 text-sm font-semibold">
//                 <span className="flex items-center">
//                   <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
//                   Items: {items.length}
//                 </span>
//                 <span className="flex items-center">
//                   <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
//                   Total Qty: {items.reduce((sum, item) => sum + (item.qty || 0), 0)}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-3 text-sm font-semibold">
//                   <span>CGST: ₹{totals.cgst}</span>
//                   <span>SGST: ₹{totals.sgst}</span>
//                   <span>IGST: ₹{totals.igst}</span>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200">
//                     🧹 CLEAR
//                   </button>
//                   <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200">
//                     📊 ROUND OFF
//                   </button>
//                   <button className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200">
//                     🔢 BACK CAL
//                   </button>
//                 </div>
//                 <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
//                   Total: ₹{totals.total}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Sections Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//           {/* Payments Section */}
//           <div className="lg:col-span-6 bg-white rounded-xl shadow-lg border-l-4 border-purple-500 p-4">
//             <div className="flex items-center mb-3">
//               <div className="bg-purple-500 text-white p-2 rounded-lg mr-3">
//                 <span className="text-sm font-bold">💳</span>
//               </div>
//               <div>
//                 <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>
//                 <p className="text-sm text-gray-600">Methods: {paymentMethods.length}</p>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <div className="bg-gray-50 rounded-lg p-3">
//                 <div className="flex items-center space-x-4 mb-2">
//                   <label className="flex items-center cursor-pointer">
//                     <input 
//                       type="radio" 
//                       name="salesType" 
//                       value="retail"
//                       checked={salesType === 'retail'}
//                       onChange={(e) => setSalesType(e.target.value)}
//                       className="mr-2 text-purple-500" 
//                     />
//                     <span className="text-sm font-semibold text-gray-700">🏪 Retail</span>
//                   </label>
//                   <label className="flex items-center cursor-pointer">
//                     <input 
//                       type="radio" 
//                       name="salesType" 
//                       value="wholesale"
//                       checked={salesType === 'wholesale'}
//                       onChange={(e) => setSalesType(e.target.value)}
//                       className="mr-2 text-purple-500" 
//                     />
//                     <span className="text-sm font-semibold text-gray-700">🏭 Wholesale</span>
//                   </label>
//                   <label className="flex items-center cursor-pointer">
//                     <input 
//                       type="radio" 
//                       name="salesType" 
//                       value="institution"
//                       checked={salesType === 'institution'}
//                       onChange={(e) => setSalesType(e.target.value)}
//                       className="mr-2 text-purple-500" 
//                     />
//                     <span className="text-sm font-semibold text-gray-700">🏢 Institution</span>
//                   </label>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-2">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1">Sales Account</label>
//                     <select className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm">
//                       <option>💰 Select sales account</option>
//                       <option>Sales - General</option>
//                       <option>Sales - Export</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Account</label>
//                     <select className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm">
//                       <option>🏦 Select payment account</option>
//                       <option>Cash</option>
//                       <option>Bank - SBI</option>
//                       <option>Bank - HDFC</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-sm font-bold text-gray-800">Payment Methods</h3>
//                   <button
//                     onClick={addPaymentMethod}
//                     className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200"
//                   >
//                     ➕ Add
//                   </button>
//                 </div>

//                 {paymentMethods.map((payment, index) => (
//                   <div key={payment.id} className="bg-purple-50 rounded-lg p-2 border border-purple-200">
//                     <div className="grid grid-cols-4 gap-2">
//                       <div>
//                         <label className="block text-xs font-semibold text-gray-700 mb-1">💵 Amount</label>
//                         <input
//                           type="number"
//                           defaultValue="0.00"
//                           className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm"
//                           step="0.01"
//                           placeholder="0.00"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs font-semibold text-gray-700 mb-1">📄 Reference</label>
//                         <input
//                           type="text"
//                           className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm"
//                           placeholder="Ref No."
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs font-semibold text-gray-700 mb-1">📝 Notes</label>
//                         <input
//                           type="text"
//                           className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 text-sm"
//                           placeholder="Notes"
//                         />
//                       </div>
//                       <div className="flex items-end">
//                         {paymentMethods.length > 1 && (
//                           <button 
//                             onClick={() => removePaymentMethod(payment.id)}
//                             className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-all duration-200"
//                           >
//                             <span className="text-sm">🗑️</span>
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Validation Errors */}
//           <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-4">
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center">
//                 <div className="bg-red-500 text-white p-2 rounded-lg mr-2">
//                   <span className="text-sm font-bold">⚠️</span>
//                 </div>
//                 <h2 className="text-lg font-bold text-gray-800">Validation</h2>
//               </div>
//               <button 
//                 onClick={() => setShowErrors(!showErrors)}
//                 className="text-red-500 hover:text-red-700 text-sm"
//               >
//                 {showErrors ? '🙈' : '👁️'}
//               </button>
//             </div>
            
//             {showErrors && (
//               <div className="space-y-3 max-h-48 overflow-y-auto">
//                 {validateForm().length === 0 ? (
//                   <div className="text-center py-4">
//                     <span className="text-4xl">✅</span>
//                     <p className="text-sm font-semibold text-green-600 mt-2">All good!</p>
//                   </div>
//                 ) : (
//                   validateForm().map((error, index) => (
//                     <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-2">
//                       <p className="text-xs text-red-600 font-semibold">🚨 {error}</p>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Ship To Section */}
//           <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border-l-4 border-orange-500 p-4">
//             <div className="flex items-center mb-3">
//               <div className="bg-orange-500 text-white p-2 rounded-lg mr-3">
//                 <span className="text-sm font-bold">🚚</span>
//               </div>
//               <div>
//                 <h2 className="text-lg font-bold text-gray-800">Shipping</h2>
//                 <p className="text-sm text-gray-600">Delivery address</p>
//               </div>
//             </div>
            
//             <div className="space-y-3">
//               <textarea
//                 rows="5"
//                 className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm resize-none transition-all duration-200"
//                 placeholder="📍 Enter complete shipping address...&#10;&#10;Name:&#10;Address Line 1:&#10;Address Line 2:&#10;City, State - PIN"
//               />
              
//               <div className="flex justify-between">
//                 <button className="bg-orange-100 hover:bg-orange-200 text-orange-600 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border border-orange-300">
//                   🧹 Clear
//                 </button>
//                 <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200">
//                   ✏️ Edit
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalesForm;