import React from 'react';
import { Truck, Edit, Trash2 } from 'lucide-react';

const Shipping: React.FC = () => {
    return (
        <div className="lg:col-span-3 bg-white rounded-lg shadow-lg border-l-4 border-orange-500 p-6 transition-all duration-300 ease-in-out hover:shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-orange-100 rounded-full">
                    <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Shipping Details</h2>
                    <p className="text-sm text-gray-600">Manage delivery address</p>
                </div>
            </div>

            <div className="space-y-4">
                <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-shadow"
                    placeholder="Enter the full shipping address..."
                />

                <div className="flex justify-end space-x-3">
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-semibold">
                        <Trash2 size={16} />
                        <span>Clear</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                        <Edit size={16} />
                        <span>Edit</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Shipping;