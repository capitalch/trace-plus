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
        <div className="mr- px-4 py-3 text-gray-800 bg-gray-100 border rounded-lg">
            <div className="grid items-center gap-4 grid-cols-1 md:gap-8 md:grid-cols-[auto_1fr]">
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
                <div className="flex flex-wrap justify-start gap-3 md:justify-end">
                    <button 
                        onClick={handleReset}
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-blue-500 rounded-md shadow-sm transition-colors hover:bg-blue-600 space-x-2"
                    >
                        <RotateCcw size={16} className="flex-shrink-0" />
                        <span>RESET</span>
                    </button>
                    <button 
                        onClick={handleView}
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-purple-500 rounded-md shadow-sm transition-colors hover:bg-purple-600 space-x-2"
                    >
                        <Eye size={16} className="flex-shrink-0" />
                        <span>VIEW</span>
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-green-500 rounded-md shadow-sm transition-colors hover:bg-green-600 space-x-2"
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