import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SalesFormDataType } from '../all-sales';
import { Messages } from '../../../../../utils/messages';
import { CircleCheckBig } from 'lucide-react';

const Validation: React.FC = () => {
    const { formState: { errors }, watch } = useFormContext<SalesFormDataType>();
    
    const getFormErrors = () => {
        const errorMessages: string[] = [];
        
        // Convert form errors to readable messages
        if (errors.contactData) {
            errorMessages.push(errors.contactData.message || Messages.messRequiredCustomerDetails);
        }
        
        if (errors.gstin) {
            errorMessages.push(errors.gstin.message || Messages.messGstinValidationFailed);
        }
        
        // Product/Items validation
        const items = watch('salesLineItems') || [];
        items.forEach((item: any, index: number) => {
            if (!item.productCode || item.productCode.trim() === '') {
                errorMessages.push(`Item ${index + 1}: ${Messages.messRequiredProductCode}`);
            }
            if (!item.productDetails || item.productDetails.trim() === '') {
                errorMessages.push(`Item ${index + 1}: ${Messages.messRequiredProductDetails}`);
            }
            if (!item.hsn || item.hsn.trim() === '') {
                errorMessages.push(`Item ${index + 1}: ${Messages.messRequiredHsn}`);
            }
        });
        
        // Add other field errors as needed
        Object.entries(errors).forEach(([field, error]) => {
            if (error && typeof error === 'object' && 'message' in error && !['contactData', 'gstin', 'shippingInfo'].includes(field)) {
                errorMessages.push(error.message as string);
            }
        });
        
        return errorMessages;
    };

    return (
        <div className="py-4 pl-4  bg-white border-l-4 border-amber-300 rounded-xl shadow-lg h-full">
            <div className="flex items-center mb-2">
                <div className="mr-2 p-2 bg-amber-200 rounded-lg">
                    <CircleCheckBig className="w-5 h-5 text-amber-700" />
                    {/* <span className="font-bold text-sm text-orange-500">🐞</span> */}
                </div>
                <h2 className="font-semibold text-gray-800 text-lg">Validation</h2>
            </div>

            {getFormErrors().length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-3">
                    {getFormErrors().map((error, index) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="font-semibold text-red-600 text-sm">🚨 {error}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Validation;