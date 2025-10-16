import { useEffect } from 'react';
import { Search, User, Edit, Trash2, X } from 'lucide-react';
import { FormField } from '../../../../../controls/widgets/form-field';
import clsx from 'clsx';
import { useValidators } from '../../../../../utils/validators-hook';
import { ContactDisplayDataType, SalesFormDataType } from '../all-sales';
import { useFormContext } from 'react-hook-form';
import { Messages } from '../../../../../utils/messages';
import { Utils } from '../../../../../utils/utils';
import ContactSearch from './customer-search';
import { ContactsType } from '../../../../../utils/global-types-interfaces-enums';
import CustomerNewEditModal from './customer-new-edit-modal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatchType, RootStateType } from '../../../../../app/store';
import { setSearchQuery } from '../sales-slice';

const CustomerDetails: React.FC = () => {
    const inputFormFieldStyle = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const { isValidGstin } = useValidators();
    const dispatch: AppDispatchType = useDispatch();
    const searchQuery = useSelector((state: RootStateType) => state.sales.searchQuery);
    const {
        watch,
        getValues,
        register,
        setValue,
        trigger,
        formState: { errors, }
    } = useFormContext<SalesFormDataType>();

    // Register contactsData field for validation
    register('contactsData', {
        validate: validateContactsData
    });
    const isGstInvoice = watch("isGstInvoice");
    const hasCustomerGstin = watch("hasCustomerGstin");

    // Clear GSTIN when hasCustomerGstin or isGstInvoice is false
    useEffect(() => {
        if (!hasCustomerGstin || !isGstInvoice) {
            setValue("gstin", null);
        }
    }, [hasCustomerGstin, isGstInvoice, setValue]);

    const contactsData = watch('contactsData');
    useEffect(() => {
        // Copies contactsData to contactDisplayData for display
        if (contactsData) {
            const displayData = formatContactDisplay(contactsData);
            setValue('contactDisplayData', displayData, { shouldDirty: true });
            if (contactsData.gstin) {
                setValue('hasCustomerGstin', true, { shouldDirty: true });
                setValue('gstin', contactsData.gstin, { shouldDirty: true });
            } else {
                // Clear GSTIN when new customer has no GSTIN
                setValue('hasCustomerGstin', false, { shouldDirty: true });
                setValue('gstin', null, { shouldDirty: true });
            }
            trigger('contactDisplayData');
        }
        // Trigger validation for contactsData whenever it changes
        trigger('contactsData');
    }, [contactsData, setValue, trigger]);

    return (
        <div className="relative px-4 py-4 bg-white border-blue-400 border-l-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4" >
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-gray-900 text-lg">Customer Details</h2>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                {/* Left Column - Customer Fields (vertically stacked) */}
                <div className="space-y-4">
                    {/* Customer Search */}
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <User className="w-4 h-4 text-blue-600" />
                            <label className="block font-semibold text-gray-700 text-sm">
                                Customer
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault(); // prevent default behavior of form submission
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
                                    className="absolute p-1.5 text-gray-400 rounded-full transition-colors duration-200 hover:text-gray-600 right-14 top-1.5"
                                    onClick={() => dispatch(setSearchQuery(''))}
                                    title="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            {/* Search button */}
                            <button
                                type="button"
                                className="absolute p-1.5 text-white bg-blue-400 rounded-md transition-colors duration-200 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 right-2 top-1.5"
                                onClick={() => handleCustomerSearch(searchQuery)}
                                title="Search customer"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Customer has GSTIN Toggle */}
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

                    {/* GSTIN No Field */}
                    <FormField
                        label="GSTIN No"
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

                {/* Right Column - Customer Display (spanning full height) */}
                <div className={clsx(
                    "flex flex-col justify-between p-3 min-h-full bg-gray-50 border rounded-lg",
                    errors?.contactsData && "border-red-500 bg-red-100"
                )}>
                    <div className="text-sm space-y-1">
                        <div>
                            <span className="font-medium text-gray-900">{watch('contactDisplayData.name')}</span>
                        </div>
                        <div className="text-gray-600">
                            <span className="font-medium">Phone: </span>
                            {watch('contactDisplayData.mobile')}
                        </div>
                        <div className="text-gray-600">
                            <span className="font-medium">Email: </span>
                            <span>{watch('contactDisplayData.email')}</span>
                        </div>
                        <div className="text-gray-600">
                            <div className="line-clamp-2">
                                <span className="font-medium">Address: </span>
                                <span className="break-words">{watch('contactDisplayData.address')}</span>
                            </div>
                        </div>
                        <div className="pt-1 text-gray-600 text-xs border-t">
                            <span className="font-medium">GSTIN: </span>
                            {watch('contactDisplayData.gstin')}
                        </div>
                    </div>

                    <div className="grid mt-2 pt-2 border-t gap-2 grid-cols-2">
                        {/* New / Edit */}
                        <button
                            type='button'
                            onClick={handleNewEditCustomer}
                            className="flex items-center justify-center px-2 py-1 text-blue-700 text-md bg-blue-100 rounded-md transition-colors hover:bg-blue-200 space-x-1">
                            <Edit size={14} className="flex-shrink-0" />
                            <span>New / Edit</span>
                        </button>
                        {/* Clear */}
                        <button
                            type='button'
                            onClick={handleClearCustomer}
                            className="flex items-center justify-center px-2 py-1 text-amber-700 text-md bg-amber-100 rounded-md transition-colors hover:bg-amber-200 space-x-1">
                            <Trash2 size={14} className="flex-shrink-0" />
                            <span>Clear</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    function formatContactDisplay(contact: ContactsType): ContactDisplayDataType {
        return {
            id: contact.id || 0,
            name: contact.contactName || 'Unnamed Contact',
            mobile: [contact.mobileNumber, contact.otherMobileNumber, contact.landPhone].filter(Boolean).join(', '),
            email: contact.email || '',
            address: [contact.address1, contact.address2, contact.city, contact.state, contact.country].filter(Boolean).join(', '),
            gstin: contact.gstin || ''
        };
    }

    function handleClearCustomer() {
        setValue('contactDisplayData', null);
        setValue('contactsData', null);
        setValue('hasCustomerGstin', false);
        setValue('gstin', null);
        // Trigger validation to show error when contact is cleared
        trigger('contactsData');
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

    function handleNewEditCustomer() {
        const contactsData: ContactsType | null = getValues('contactsData');
        Utils.showHideModalDialogA({
            title: `Edit Customer - ${contactsData?.contactName || ''}`,
            isOpen: true,
            element: <CustomerNewEditModal contactsData={contactsData} setParentValue={setValue} triggerParent={trigger} />,
            size: 'sm'
        });
    }

    function validateContactsData(): string | undefined {
        const contactsData = getValues('contactsData');
        if (!contactsData) {
            return "Customer Details are required";
        }
        return;
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