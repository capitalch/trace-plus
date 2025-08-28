import React from 'react';

const Shipping: React.FC = () => {
    return (
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
                    rows={5}
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
    );
};

export default Shipping;