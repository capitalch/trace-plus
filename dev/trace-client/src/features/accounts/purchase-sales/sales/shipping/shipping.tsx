import React from 'react';

const Shipping: React.FC = () => {
    return (
        <div className="p-4 bg-white border-l-4 border-orange-500 rounded-xl shadow-lg lg:col-span-3">
            <div className="flex items-center mb-3">
                <div className="mr-3 p-2 text-white bg-orange-500 rounded-lg">
                    <span className="font-bold text-sm">🚚</span>
                </div>
                <div>
                    <h2 className="font-bold text-gray-800 text-lg">Shipping</h2>
                    <p className="text-gray-600 text-sm">Delivery address</p>
                </div>
            </div>

            <div className="space-y-3">
                <textarea
                    rows={5}
                    className="px-3 py-2 w-full text-sm border-2 border-gray-200 rounded-lg transition-all duration-200 resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    placeholder="📍 Enter complete shipping address..."
                />

                <div className="flex justify-between">
                    <button className="px-3 py-1 font-semibold text-orange-600 text-xs bg-orange-100 border border-orange-300 rounded-lg transition-all duration-200 hover:bg-orange-200">
                        🧹 Clear
                    </button>
                    <button className="px-3 py-1 font-semibold text-white text-xs bg-orange-500 rounded-lg transition-all duration-200 hover:bg-orange-600">
                        ✏️ Edit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Shipping;