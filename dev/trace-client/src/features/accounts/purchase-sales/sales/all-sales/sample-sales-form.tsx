import React, { useState } from 'react';
import { Search, Plus, X, Calendar, ShoppingCart, CreditCard, Truck, AlertCircle } from 'lucide-react';

const SalesForm = () => {
  const [items, setItems] = useState([
    { id: 1, productCode: '', hsn: '', gst: 0, qty: 1, price: 0, gstPrice: 0, discount: 0, remarks: '', serialNo: '' }
  ]);
  const [errors, setErrors] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([{ id: 1, amount: 0, instrNo: '', remarks: '' }]);

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

  const removeItem = (id:any) => {
    setItems(items.filter(item => item.id !== id));
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

  const calculateTotals = () => {
    const cgst = 0.00;
    const sgst = 0.00;
    const igst = 0.00;
    return { cgst, sgst, igst, total: 0.00 };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Sales Invoice</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Debits: 0.00</span>
              <span>Credits: 0.00</span>
              <span>Diff: 0.00</span>
            </div>
          </div>
          
          <div className="text-lg font-semibold text-gray-700 mb-4">
            Capital Chowringhee Pvt Ltd
          </div>
        </div>

        {/* Customer Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex items-center mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search customer..."
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="relative">
                <input
                  type="date"
                  defaultValue="2025-08-23"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ref no</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN no</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter remarks..."
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Plus className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Items</h2>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">IGST</span>
                </label>
                <button
                  onClick={addItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  ADD
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST(%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price(GST)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disc(Unit)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Enter code"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        defaultValue="0"
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue="0.00"
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue="1.00"
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue="0.00"
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue="0.00"
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue="0.00"
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Remarks"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                        SERIAL NO
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">0.00</td>
                    <td className="px-4 py-3 text-center">
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span>Count: {items.length}</span>
                <span>Qty: {items.reduce((sum, item) => sum + (item.qty || 0), 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Cgst: {totals.cgst}</span>
                <span>Sgst: {totals.sgst}</span>
                <span>Igst: {totals.igst}</span>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                  CLEAR
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                  ROUND OFF
                </button>
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                  BACK CAL
                </button>
                <span className="font-semibold">Total: {totals.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payments Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
              <span className="ml-2 text-sm text-gray-500">Count: {paymentMethods.length}</span>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-6 mb-4">
                <label className="flex items-center">
                  <input type="radio" name="salesType" className="mr-2 text-blue-600" defaultChecked />
                  <span className="text-sm font-medium text-gray-700">Retail sales</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="salesType" className="mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Auto subledger sales</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="salesType" className="mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Institution sales</span>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale A/c</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sales account</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Select account</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-700">Payment Methods</h3>
                <button
                  onClick={addPaymentMethod}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ADD
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment account</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Select payment account</option>
                </select>
              </div>

              {paymentMethods.map((payment:any, index:number) => (
                <div key={payment.id} className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      defaultValue="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instr no</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    {paymentMethods.length > 1 && (
                      <button className="text-red-500 hover:text-red-700 p-2 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Validation Errors</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-600 mb-2">Customer</h3>
                <p className="text-sm text-red-500">• Customer required</p>
              </div>
              
              <div>
                <h3 className="font-medium text-red-600 mb-2">Items</h3>
                <div className="text-sm text-red-500 space-y-1">
                  <p>• Product code required</p>
                  <p>• Product details required</p>
                  <p>• HSN code required</p>
                  <p>• GST rate error</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-red-600 mb-2">Payments</h3>
                <div className="text-sm text-red-500 space-y-1">
                  <p>• Account code required</p>
                  <p>• Amount cannot be zero</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-red-600 mb-2">Ship to</h3>
                <p className="text-sm text-red-500">• Shipping address required</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ship To Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex items-center mb-4">
            <Truck className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Ship To</h2>
          </div>
          
          <textarea
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter shipping address..."
          />
          
          <div className="flex justify-between mt-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              CLEAR
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              NEW / EDIT
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            RESET
          </button>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            VIEW
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;