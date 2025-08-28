import React, { useState } from 'react';
import { RotateCcw, Eye, Send } from 'lucide-react';

const StatusBar: React.FC = () => {
    const [debits] = useState(0.00);
    const [credits] = useState(0.00);
    const [diff] = useState(0.00);

    const handleReset = () => {
        console.log('Reset clicked');
    };

    const handleView = () => {
        console.log('View clicked');
    };

    const handleSubmit = () => {
        console.log('Submit clicked');
    };

    return (
        <div className="bg-gray-100 text-gray-800 py-3 px-4 mr- rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-8 items-center">
                {/* Status Indicators */}
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span className="text-md whitespace-nowrap">Debits: ₹{debits.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-md whitespace-nowrap">Credits: ₹{credits.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                        <span className="text-md whitespace-nowrap">Diff: ₹{diff.toFixed(2)}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-start md:justify-end gap-3">
                    <button 
                        onClick={handleReset}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
                    >
                        <RotateCcw size={16} className="flex-shrink-0" />
                        <span>RESET</span>
                    </button>
                    <button 
                        onClick={handleView}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
                    >
                        <Eye size={16} className="flex-shrink-0" />
                        <span>VIEW</span>
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
                    >
                        <Send size={16} className="flex-shrink-0" />
                        <span>SUBMIT</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;