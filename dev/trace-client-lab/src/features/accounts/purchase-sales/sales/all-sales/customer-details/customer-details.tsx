import React from 'react';
import { Search, User, Edit, History, Trash2 } from 'lucide-react';

interface Customer {
    name: string;
    contact: string;
    email: string;
    address: string;
    gstin: string;
    balance: number;
}

interface CustomerDetailsProps {
    selectedCustomer: Customer;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ selectedCustomer, searchQuery, setSearchQuery }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-sky-500 p-6 transition-all duration-300 ease-in-out hover:shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-sky-100 rounded-full">
                    <User className="w-6 h-6 text-sky-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Customer Details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Search Customer <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                                placeholder="Name, email, or phone..."
                            />
                            <Search className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            GSTIN Number
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                            placeholder="e.g., 19ABCDE1234F1Z5"
                        />
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-full flex flex-col justify-between">
                    <div className="space-y-2 text-sm">
                        <div className="font-bold text-lg text-gray-800">{selectedCustomer.name}</div>
                        <div className="text-gray-600 flex items-center">
                            <span className="font-semibold w-20">Contact:</span> {selectedCustomer.contact}
                        </div>
                        <div className="text-gray-600 flex items-center">
                            <span className="font-semibold w-20">Email:</span> {selectedCustomer.email}
                        </div>
                        <div className="text-gray-600 flex items-start">
                            <span className="font-semibold w-20">Address:</span> 
                            <span className="flex-1">{selectedCustomer.address}</span>
                        </div>
                        <div className="text-gray-600 flex items-center pt-2 border-t mt-2">
                            <span className="font-semibold w-20">GSTIN:</span> {selectedCustomer.gstin}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t mt-4">
                        <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 hover:text-sky-800 transition-all duration-200 text-sm font-semibold">
                            <Edit size={16} />
                            <span>Edit</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-semibold">
                            <History size={16} />
                            <span>History</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-800 transition-all duration-200 text-sm font-semibold">
                            <Trash2 size={16} />
                            <span>Clear</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;