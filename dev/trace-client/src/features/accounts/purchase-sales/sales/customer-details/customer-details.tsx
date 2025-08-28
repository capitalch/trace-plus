import { useState, useEffect } from 'react';
import { Search, User, Edit, Trash2, X } from 'lucide-react';
import { FormField } from '../../../../../controls/widgets/form-field';
import clsx from 'clsx';
import { useValidators } from '../../../../../utils/validators-hook';
import { SalesFormDataType } from '../all-sales';
import { useFormContext } from 'react-hook-form';
import { Messages } from '../../../../../utils/messages';
import { Utils } from '../../../../../utils/utils';
import CustomerSearch from './customer-search';

interface Customer {
    name: string;
    contact: string;
    email: string;
    address: string;
    gstin: string;
    // balance: number;
}

const CustomerDetails: React.FC = () => {
    const [selectedCustomer, /*setSelectedCustomer*/] = useState<Customer>({
        name: 'ABC Trading Company',
        contact: '+91 9876543210',
        email: 'abc@trading.com',
        address: '123 Business District, Salt Lake, Kolkata - 700091, West Bengal, India',
        gstin: '19ABCDE1234F1Z5',
        // balance: 115240.50
    });
    const inputFormFieldStyle = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const { isValidGstin } = useValidators();
    const {
        watch,
        register,
        setValue,
        formState: { errors, }
    } = useFormContext<SalesFormDataType>();
    const isGstInvoice = watch("isGstInvoice");
    const hasCustomerGstin = watch("hasCustomerGstin");
    const [searchQuery, setSearchQuery] = useState('');

    // Clear GSTIN when hasCustomerGstin or isGstInvoice is false
    useEffect(() => {
        if (!hasCustomerGstin || !isGstInvoice) {
            setValue("gstin", null);
        }
    }, [hasCustomerGstin, isGstInvoice, setValue]);

    return (
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-400 px-6 py-4 relative">
            <div className="flex items-center justify-between mb-4" style={{ height: '40px' }}>
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <User className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCustomerSearch(searchQuery);
                                    }
                                }}
                                className={clsx(
                                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    searchQuery ? "pr-20" : "pr-12"
                                )}
                                placeholder="Search customer..."
                            />

                            {/* Clear button - only show when there's text */}
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="absolute right-14 top-1.5 p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors duration-200"
                                    onClick={() => setSearchQuery('')}
                                    title="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            {/* Search button */}
                            <button
                                type="button"
                                className="absolute right-2 top-1.5 p-1.5 bg-blue-400 hover:bg-blue-500 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                onClick={() => handleCustomerSearch(searchQuery)}
                                title="Search customer"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <label className={clsx(
                                "flex items-center",
                                isGstInvoice ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                            )}>
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    {...register("hasCustomerGstin")}
                                    disabled={!isGstInvoice}
                                />
                                <div className={clsx(
                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200",
                                    !isGstInvoice
                                        ? "bg-gray-200"
                                        : watch("hasCustomerGstin") ? "bg-green-500" : "bg-gray-300"
                                )}>
                                    <span
                                        className={clsx(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                            isGstInvoice && watch("hasCustomerGstin") ? "translate-x-5" : "translate-x-0.5"
                                        )}
                                    />
                                </div>
                                <span className={clsx(
                                    "ml-2 text-sm font-medium",
                                    isGstInvoice ? "text-gray-700" : "text-gray-400"
                                )}>
                                    Customer has GSTIN
                                </span>
                            </label>
                        </div>

                        <FormField
                            label="Gstin No"
                            required={isGstInvoice && hasCustomerGstin}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    {...register('gstin', {
                                        validate: validateGstin,
                                    })}
                                    className={clsx(
                                        inputFormFieldStyle, 'mt-1',
                                        (!isGstInvoice || !hasCustomerGstin) && "bg-gray-100 cursor-not-allowed opacity-60",
                                        errors?.gstin && "border-red-500 bg-red-100"
                                    )}
                                    placeholder={hasCustomerGstin ? "Enter GSTIN No" : "Customer has no GSTIN"}
                                    disabled={!isGstInvoice || !hasCustomerGstin}
                                />
                            </div>
                        </FormField>
                    </div>

                </div>

                <div className="bg-gray-50 rounded-lg p-3 border min-h-full flex flex-col justify-between lg:-mt-13">
                    <div className="space-y-1.5 text-sm">
                        <div>
                            <span className="font-medium text-gray-900">{selectedCustomer.name}</span>
                        </div>
                        <div className="text-gray-600">
                            Contact: {selectedCustomer.contact}
                        </div>
                        <div className="text-gray-600">
                            Email: {selectedCustomer.email}
                        </div>
                        <div className="text-gray-600">
                            Address: {selectedCustomer.address}
                        </div>
                        <div className="text-gray-600 pt-1 border-t">
                            GSTIN: {selectedCustomer.gstin}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t mt-3">
                        <button className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm">
                            <Edit size={14} className="flex-shrink-0" />
                            <span>New / Edit</span>
                        </button>
                        <button className="flex items-center justify-center space-x-1 px-2 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm">
                            <Trash2 size={14} className="flex-shrink-0" />
                            <span>Clear</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    function handleCustomerSearch(query: string) {
        if (!query || query.trim().length === 0) {
            setTimeout(() => {
                Utils.showAlertMessage("Alert", Messages.messEnterSearchString);
            }, 0);
            return;
        }
        
        const searchString = query.toLowerCase()
            .split(/\s+/)  // Split on whitespace only (more predictable)
            .filter(term => term.length > 0)  // Remove empty terms
            .map(term => `(?=.*${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`)  // Escape special chars
            .join('');

        Utils.showHideModalDialogA({
            className: 'ml-2',
            title: `Select from existing customer - "${query}"`,
            isOpen: true,
            element: <CustomerSearch searchString={searchString} />,
        })

    }

    function validateGstin(): string | undefined {
        const gstin = watch('gstin');
        if ((!isGstInvoice) || (!hasCustomerGstin)) return;
        if (!gstin) {
            return `${Messages.errCustGstinRequired} in Customer Details`;
        }
        if (!isValidGstin(gstin)) {
            return `${Messages.errInvalidGstin} in Customer Details`;
        }
        return;
    }
};

export default CustomerDetails;