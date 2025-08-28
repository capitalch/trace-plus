import React, { useState } from 'react';
import { Calendar, FileText } from 'lucide-react';

interface InvoiceData {
    date: string;
    reference: string;
    remarks: string;
}

const InvoiceDetails: React.FC = () => {
    const [invoiceData, setInvoiceData] = useState<InvoiceData>({
        date: '2025-08-25',
        reference: 'REF-001',
        remarks: ''
    });
    return (
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-indigo-400 p-6">
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
    );
};

export default InvoiceDetails;