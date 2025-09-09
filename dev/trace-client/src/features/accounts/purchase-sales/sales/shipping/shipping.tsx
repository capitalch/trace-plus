import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SalesFormDataType, ShippingInfoType } from '../all-sales';
import { Utils } from '../../../../../utils/utils';
import ShippingEditModal from './shipping-edit-modal';

const Shipping: React.FC = () => {
    const formContext = useFormContext<SalesFormDataType>();
    
    if (!formContext) {
        console.warn('Shipping: Form context is not available');
        return (
            <div className="p-4 bg-white border-l-4 border-cyan-500 rounded-xl shadow-lg lg:col-span-3">
                <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Loading shipping information...</p>
                </div>
            </div>
        );
    }

    const { setValue, watch } = formContext;
    const shippingInfo: ShippingInfoType | null = watch('shippingInfo') ?? null;

    const handleClear = () => {
        setValue('shippingInfo', null);
    };

    const handleEditNew = () => {
        Utils.showHideModalDialogA({ 
            isOpen: true, 
            title: 'Shipping Information',
            element: <ShippingEditModal shippingData={shippingInfo} />
        });
    };

    const renderShippingData = () => {
        if (!shippingInfo) {
            return (
                <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No shipping information available</p>
                    <p className="text-xs mt-1">Click "Edit / New" to add shipping details</p>
                </div>
            );
        }

        const displayData = [
            { label: 'Name', value: shippingInfo.name },
            { label: 'Mobile', value: shippingInfo.mobileNumber },
            { label: 'Email', value: shippingInfo.email },
            { label: 'Address 1', value: shippingInfo.address1 },
            { label: 'Address 2', value: shippingInfo.address2 },
            { label: 'Country', value: shippingInfo.country },
            { label: 'State', value: shippingInfo.state },
            { label: 'City', value: shippingInfo.city },
            { label: 'PIN', value: shippingInfo.pin },
            { label: 'Other Info', value: shippingInfo.otherInfo }
        ].filter(item => item.value);

        return (
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                {displayData.map(({ label, value }, index) => (
                    <div key={index} className="flex">
                        <span className="font-medium text-gray-600 text-sm min-w-24 mr-2">{label}:</span>
                        <span className="text-gray-800 text-sm flex-1">{value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 bg-white border-l-4 border-cyan-500 rounded-xl shadow-lg lg:col-span-3">
            <div className="flex items-center mb-3">
                <div className="mr-3 p-2 text-white bg-cyan-500 rounded-lg">
                    <span className="font-bold text-sm">🚚</span>
                </div>
                <div>
                    <h2 className="font-bold text-gray-800 text-lg">Shipping</h2>
                    <p className="text-gray-600 text-sm">Delivery address</p>
                </div>
            </div>

            <div className="space-y-3">
                {renderShippingData()}

                <div className="flex justify-between">
                    <button 
                        type="button"
                        onClick={handleClear}
                        className="px-3 py-1 font-semibold text-cyan-600 text-xs bg-cyan-100 border border-cyan-300 rounded-lg transition-all duration-200 hover:bg-cyan-200"
                    >
                        🧹 Clear
                    </button>
                    <button 
                        type="button"
                        onClick={handleEditNew}
                        className="px-3 py-1 font-semibold text-white text-xs bg-cyan-500 rounded-lg transition-all duration-200 hover:bg-cyan-600"
                    >
                        ✏️ Edit / New
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Shipping;