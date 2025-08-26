import React from 'react';
import { FileText, Calendar } from 'lucide-react';

interface InvoiceDetailsProps {
    invoiceData: {
        date: string;
        reference: string;
        remarks: string;
    };
    setInvoiceData: React.Dispatch<React.SetStateAction<{
        date: string;
        reference: string;
        remarks: string;
    }>>;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoiceData, setInvoiceData }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-500 p-6 transition-all duration-300 ease-in-out hover:shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-full">
                    <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Invoice Details</h2>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={invoiceData.date}
                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                                />
                                <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Reference No.
                            </label>
                            <input
                                type="text"
                                value={invoiceData.reference}
                                onChange={(e) => setInvoiceData(prev => ({ ...prev, reference: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                                placeholder="e.g., INV-2025-001"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Remarks
                        </label>
                        <textarea
                            rows={4}
                            value={invoiceData.remarks}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, remarks: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow"
                            placeholder="Enter any notes or special instructions here..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetails;