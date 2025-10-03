import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SalesFormDataType, ShippingInfoType } from '../all-sales';
import { Utils } from '../../../../../utils/utils';
import ShippingEditModal from './shipping-edit-modal';
import { Truck } from 'lucide-react';

const Shipping: React.FC = () => {
    const formContext = useFormContext<SalesFormDataType>();

    const { setValue, watch } = formContext;
    const shippingInfo: ShippingInfoType | null = watch('shippingInfo') ?? null;

    const handleClear = () => {
        setValue('shippingInfo', null);
    };

    const handleEditNew = () => {
        Utils.showHideModalDialogA({ 
            isOpen: true, 
            title: 'Shipping Information',
            element: <ShippingEditModal setParentValue={setValue} shippingData={shippingInfo} />
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
        ];

        const renderValue = (value: string | null | undefined, className = '') => {
            if (!value) {
                return <span className={`text-gray-400 text-sm italic ${className}`}>Not provided</span>;
            }
            return <span className={`text-gray-800 text-sm ${className}`}>{value}</span>;
        };

        return (
            <div className="grid gap-y-0.5 gap-x-4 grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto_1fr] items-start p-2 bg-gray-50 rounded-lg">
                {/* Name - Full width span */}
                <span className="font-medium text-gray-600 text-sm">{displayData[0].label}:</span>
                {renderValue(displayData[0].value, 'font-medium break-words md:col-span-3')}
                
                {/* Email - Full width span */}
                <span className="font-medium text-gray-600 text-sm">{displayData[2].label}:</span>
                {renderValue(displayData[2].value, 'break-all md:col-span-3')}

                {/* Mobile */}
                <span className="font-medium text-gray-600 text-sm">{displayData[1].label}:</span>
                {renderValue(displayData[1].value, 'break-words')}
                
                {/* PIN */}
                <span className="font-medium text-gray-600 text-sm">{displayData[8].label}:</span>
                {renderValue(displayData[8].value, 'break-words')}

                {/* Country */}
                <span className="font-medium text-gray-600 text-sm">{displayData[5].label}:</span>
                {renderValue(displayData[5].value, 'break-words')}
                
                {/* State */}
                <span className="font-medium text-gray-600 text-sm">{displayData[6].label}:</span>
                {renderValue(displayData[6].value, 'break-words')}

                {/* City - Full width span */}
                <span className="font-medium text-gray-600 text-sm">{displayData[7].label}:</span>
                {renderValue(displayData[7].value, 'break-words md:col-span-3')}

                {/* Address 1 - Full width span */}
                <span className="font-medium text-gray-600 text-sm">{displayData[3].label}:</span>
                {renderValue(displayData[3].value, 'break-words md:col-span-3')}
                
                {/* Address 2 - Full width span */}
                <span className="font-medium text-gray-600 text-sm">{displayData[4].label}:</span>
                {renderValue(displayData[4].value, 'break-words md:col-span-3')}

                {/* Other Info - Full width span */}
                <span className="font-medium text-gray-600 text-sm">{displayData[9].label}:</span>
                {renderValue(displayData[9].value, 'break-words whitespace-pre-wrap md:col-span-3')}
            </div>
        );
    };

    return (
        <div className="p-4 bg-white border-l-4 border-cyan-500 rounded-xl shadow-lg lg:col-span-3 overflow-hidden h-full">
            <div className="flex items-center mb-2">
                <div className="mr-3 p-2 text-white bg-cyan-100 rounded-lg">
                    <Truck className='h-5 w-5 text-cyan-600' />
                    {/* <span className="font-bold text-sm">🚚</span> */}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-800 text-lg truncate">Shipping</h2>
                </div>
            </div>

            <div className="space-y-3">
                <div className="min-h-0 overflow-y-auto">
                    {renderShippingData()}
                </div>

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