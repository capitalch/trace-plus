import { useState, useEffect } from 'react';
import { Search, User, Edit, Trash2, X } from 'lucide-react';
import { FormField } from '../../../../../controls/widgets/form-field';
import clsx from 'clsx';
import { useValidators } from '../../../../../utils/validators-hook';
import { SalesFormDataType } from '../all-sales';
import { useFormContext } from 'react-hook-form';
import { Messages } from '../../../../../utils/messages';
import { Utils } from '../../../../../utils/utils';
import ContactSearch from './customer-search';
import { ContactsType } from '../../../../../utils/global-types-interfaces-enums';
import CustomerNewEditModal from './customer-new-edit-modal';
import { set } from 'lodash';

const CustomerDetails: React.FC = () => {
    const inputFormFieldStyle = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const { isValidGstin } = useValidators();
    const {
        watch,
        getValues,
        register,
        setValue,
        trigger,
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
                    <div className="space-y-1.5 text-md">
                        <div>
                            <span className="font-medium text-gray-900">{watch('contactDisplayData.name')}</span>
                        </div>
                        <div className="text-gray-600">
                            <span className="font-medium">Phone: </span>
                            {watch('contactDisplayData.mobile')}
                        </div>
                        <div className="text-gray-600 text-sm">
                            <span className="font-medium">Email: </span>
                            <span>{watch('contactDisplayData.email')}</span>
                        </div>
                        <div className="text-gray-600 text-sm">
                            <div className="line-clamp-3">
                                <span className="font-medium">Address: </span>
                                <span className="break-words">{watch('contactDisplayData.address')}</span>
                            </div>
                        </div>
                        <div className="text-gray-600 pt-1 border-t">
                            <span className="font-medium">GSTIN: </span>
                            {watch('contactDisplayData.gstin')}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t mt-3">
                        {/* New / Edit */}
                        <button
                            onClick={handleEditCustomer}
                            className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm">
                            <Edit size={16} className="flex-shrink-0" />
                            <span>New / Edit</span>
                        </button>
                        {/* Clear */}
                        <button
                            onClick={handleClearCustomer}
                            className="flex items-center justify-center space-x-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors text-sm">
                            <Trash2 size={16} className="flex-shrink-0" />
                            <span>Clear</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    function handleClearCustomer() {
        setValue('contactDisplayData', null);
        setValue('contactData', null);
        setValue('hasCustomerGstin', false);
        setValue('gstin', null);
    }

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
            title: `Select from existing contact - "${query}"`,
            isOpen: true,
            element: <ContactSearch
                searchString={searchString}
                setValue={setValue}
                trigger={trigger}
                selectedId={watch('contactDisplayData.id') || null} />,
            size: 'md'
        })

    }

    function handleEditCustomer() {
        const contactData: ContactsType | null = getValues('contactData');
        Utils.showHideModalDialogA({
            title: `Edit Customer - ${contactData?.contactName || ''}`,
            isOpen: true,
            element: <CustomerNewEditModal contactData={contactData} />,
            size: 'md'
        });
        console.log("Edit customer clicked", contactData);
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