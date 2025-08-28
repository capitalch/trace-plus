import React, { useState } from 'react';
import { Search, User, Edit, History, Trash2 } from 'lucide-react';

interface Customer {
    name: string;
    contact: string;
    email: string;
    address: string;
    gstin: string;
    balance: number;
}

const CustomerDetails: React.FC = () => {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>({
        name: 'ABC Trading Company',
        contact: '+91 9876543210',
        email: 'abc@trading.com',
        address: '123 Business District, Salt Lake, Kolkata - 700091, West Bengal, India',
        gstin: '19ABCDE1234F1Z5',
        balance: 115240.50
    });

    const [searchQuery, setSearchQuery] = useState('');
    return (
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-400 p-4 relative">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <User className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
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

                <div className="bg-gray-50 rounded-lg p-3 border min-h-full flex flex-col justify-between lg:-mt-13">
                    <div className="space-y-1.5 text-sm">
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

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t mt-3">
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
    );
};

export default CustomerDetails;