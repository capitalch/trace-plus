import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ContactsType } from '../../../../../utils/global-types-interfaces-enums';
import { FormField } from '../../../../../controls/widgets/form-field';
import { useValidators } from '../../../../../utils/validators-hook';
import { Messages } from '../../../../../utils/messages';
import clsx from 'clsx';
import { IconSubmit } from '../../../../../controls/icons/icon-submit';
import { IconReset } from '../../../../../controls/icons/icon-reset';
import { Utils } from '../../../../../utils/utils';

interface CustomerNewEditModalProps {
    contactData?: ContactsType | null;
}

const CustomerNewEditModal: React.FC<CustomerNewEditModalProps> = ({ contactData }) => {
    const { isValidGstin, isValidEmail, checkMobileNo } = useValidators();

    const {
        register,
        handleSubmit,
        reset,
        trigger,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<ContactsType>({
        mode: 'all',
        criteriaMode: 'all',
        defaultValues: contactData || {
            contactName: '',
            address1: '',
            country: 'India',
            pin: ''
        }
    });

    // Trigger validation on component mount to highlight errors immediately
    useEffect(() => {
        trigger();
    }, [trigger]);

    const errorClass = 'border-red-500 bg-red-50';
    const inputClass = "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-sm px-2 py-1.5 transition-all duration-200 h-9 mt-1";
    const inputClassBase = "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-sm px-2 py-1.5 transition-all duration-200 h-9 mt-1";

    const handleOnSubmit = (data: ContactsType) => {
        console.log('Submitting customer data:', data);
        alert(`Customer ${contactData ? 'updated' : 'created'} successfully!`);
        handleOnClose();
    };

    const handleOnClose = () => {
        Utils.showHideModalDialogA({ isOpen: false })
    };

    const handleReset = () => {
        reset(contactData || {
            contactName: '',
            address1: '',
            country: 'India',
            pin: ''
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-60" >
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()} >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {contactData ? 'Edit Customer' : 'New Customer'}
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Top Action Buttons */}
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-md flex items-center transition-all duration-200"
                        >
                            <IconReset className="w-4 h-4 mr-1.5" />
                            Reset
                        </button>
                        <button
                            type="submit"
                            form="customer-form"
                            disabled={isSubmitting || !isDirty}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md flex items-center transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            <IconSubmit className="w-4 h-4 mr-1.5" />
                            {isSubmitting ? 'Saving...' : (contactData ? 'Update' : 'Create')}
                        </button>
                        <button
                            type="button"
                            onClick={handleOnClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="px-6 py-4 overflow-y-auto max-h-[75vh] bg-gray-100">
                    <form id="customer-form" onSubmit={handleSubmit(handleOnSubmit)} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {/* Mobile Number */}
                            <FormField label="Mobile" error={errors?.mobileNumber?.message} className="font-bold">
                                <input
                                    type="tel"
                                    className={clsx(inputClassBase, errors?.mobileNumber && errorClass, "h-8 w-42")}
                                    placeholder="Enter 10-digit mobile"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    onKeyDown={(e) => {
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register('mobileNumber', {
                                        validate: (value) => !value || !checkMobileNo(value) || Messages.errInvalidMobileNo
                                    })}
                                />
                            </FormField>

                            {/* Other Mobile Number */}
                            <FormField label="Alt Mobile" error={errors?.otherMobileNumber?.message} className="font-bold">
                                <input
                                    type="tel"
                                    className={clsx(inputClassBase, errors?.otherMobileNumber && errorClass, "h-8 w-40")}
                                    placeholder="Alternate mobile"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    onKeyDown={(e) => {
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register('otherMobileNumber', {
                                        validate: (value) => !value || !checkMobileNo(value) || Messages.errInvalidMobileNo
                                    })}
                                />
                            </FormField>

                            {/* Contact Name */}
                            <FormField label="Contact Name" required className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClass, errors?.contactName && errorClass, 'w-80' )}
                                    placeholder="Enter contact name"
                                    {...register('contactName', {
                                        required: true,
                                        minLength: 1,
                                        maxLength: 100
                                    })}
                                />
                            </FormField>

                            {/* Land Phone */}
                            <FormField label="Landline" error={errors?.landPhone?.message} className="font-bold">
                                <input
                                    type="tel"
                                    className={clsx(inputClass, errors?.landPhone && errorClass, "w-64")}
                                    placeholder="Landline number"
                                    {...register('landPhone', {
                                        pattern: {
                                            value: /^[0-9-+()\s]{6,15}$/,
                                            message: 'Invalid landline number format'
                                        }
                                    })}
                                />
                            </FormField>

                            {/* Address 1 */}
                            <FormField label="Address 1" required className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClass, errors?.address1 && errorClass, "w-80")}
                                    placeholder="Enter primary address"
                                    {...register('address1', {
                                        required: true,
                                        maxLength: 200
                                    })}
                                />
                            </FormField>

                            {/* Address 2 */}
                            <FormField label="Address 2" className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClass, "h-8")}
                                    placeholder="Secondary address (optional)"
                                    {...register('address2')}
                                />
                            </FormField>

                            {/* PIN */}
                            <FormField label="PIN Code" required error={errors?.pin?.message} className="font-bold">
                                <input
                                    type="tel"
                                    className={clsx(inputClassBase, errors?.pin && errorClass, "h-8 w-24")}
                                    placeholder="6-digit PIN"
                                    maxLength={6}
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register('pin', {
                                        required: Messages.errRequired,
                                        pattern: {
                                            value: /^[0-9]{6}$/,
                                            message: Messages.errInvalidPinCode
                                        }
                                    })}
                                />
                            </FormField>

                            {/* Email */}
                            <FormField label="Email" error={errors?.email?.message} className="font-bold">
                                <input
                                    type="email"
                                    className={clsx(inputClass, errors?.email && errorClass, "h-8")}
                                    placeholder="Enter email address"
                                    {...register('email', {
                                        validate: (value) => !value || isValidEmail(value) || 'Invalid email format'
                                    })}
                                />
                            </FormField>

                            {/* GSTIN */}
                            <FormField label="GSTIN" error={errors?.gstin?.message} className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClassBase, errors?.gstin && errorClass, "h-8 w-40")}
                                    placeholder="Enter GSTIN"
                                    maxLength={15}
                                    {...register('gstin', {
                                        validate: (value) => !value || isValidGstin(value) || 'Invalid GSTIN format'
                                    })}
                                />
                            </FormField>

                            {/* Country */}
                            <FormField label="Country" required error={errors?.country?.message} className="font-bold">
                                <select
                                    className={clsx(inputClassBase, errors?.country && errorClass, "h-8 w-32")}
                                    {...register('country', {
                                        required: Messages.errRequired
                                    })}
                                >
                                    <option value="">Select country</option>
                                    <option value="India">India</option>
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Australia">Australia</option>
                                </select>
                            </FormField>

                            {/* State */}
                            <FormField label="State" error={errors?.state?.message} className="font-bold">
                                <select
                                    className={clsx(inputClassBase, errors?.state && errorClass, "h-8 w-36")}
                                    {...register('state')}
                                >
                                    <option value="">Select state</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                </select>
                            </FormField>

                            {/* City */}
                            <FormField label="City" error={errors?.city?.message} className="font-bold">
                                <select
                                    className={clsx(inputClassBase, errors?.city && errorClass, "h-8 w-32")}
                                    {...register('city')}
                                >
                                    <option value="">Select city</option>
                                    <option value="Mumbai">Mumbai</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Bangalore">Bangalore</option>
                                    <option value="Chennai">Chennai</option>
                                    <option value="Kolkata">Kolkata</option>
                                    <option value="Hyderabad">Hyderabad</option>
                                    <option value="Pune">Pune</option>
                                    <option value="Ahmedabad">Ahmedabad</option>
                                </select>
                            </FormField>

                            {/* State Code */}
                            <FormField label="State Code" error={errors?.stateCode?.message} className="font-bold">
                                <input
                                    type="number"
                                    className={clsx(inputClassBase, errors?.stateCode && errorClass, "h-8 w-20")}
                                    placeholder="State code"
                                    min={1}
                                    max={99}
                                    {...register('stateCode', {
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'State code must be positive' },
                                        max: { value: 99, message: 'State code must be less than 100' }
                                    })}
                                />
                            </FormField>

                            {/* Date of Birth */}
                            <FormField label="Date of Birth" error={errors?.dateOfBirth?.message} className="font-bold">
                                <input
                                    type="date"
                                    className={clsx(inputClassBase, errors?.dateOfBirth && errorClass, "h-8 w-36")}
                                    max={new Date().toISOString().split('T')[0]}
                                    {...register('dateOfBirth', {
                                        validate: (value) => {
                                            if (!value) return true;
                                            const selectedDate = new Date(value);
                                            const today = new Date();
                                            return selectedDate <= today || 'Date of birth cannot be in the future';
                                        }
                                    })}
                                />
                            </FormField>

                            {/* Anniversary Date */}
                            <FormField label="Anniversary" error={errors?.anniversaryDate?.message} className="font-bold">
                                <input
                                    type="date"
                                    className={clsx(inputClassBase, errors?.anniversaryDate && errorClass, "h-8 w-36")}
                                    max={new Date().toISOString().split('T')[0]}
                                    {...register('anniversaryDate', {
                                        validate: (value) => {
                                            if (!value) return true;
                                            const selectedDate = new Date(value);
                                            const today = new Date();
                                            return selectedDate <= today || 'Anniversary date cannot be in the future';
                                        }
                                    })}
                                />
                            </FormField>

                            {/* Description */}
                            <FormField label="Description" error={errors?.descr?.message} className="font-bold">
                                <textarea
                                    rows={2}
                                    className={clsx(inputClass, errors?.descr && errorClass, "resize-none")}
                                    placeholder="Additional notes (optional)"
                                    maxLength={500}
                                    {...register('descr', {
                                        maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
                                    })}
                                />
                            </FormField>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 bg-gray-50 -mx-3 -mb-3 px-3 py-3 rounded-b-lg">
                            <button
                                type="button"
                                onClick={handleOnClose}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-md flex items-center transition-all duration-200"
                            >
                                <IconReset className="w-4 h-4 mr-1.5" />
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !isDirty}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md flex items-center transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                <IconSubmit className="w-4 h-4 mr-1.5" />
                                {isSubmitting ? 'Saving...' : (contactData ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerNewEditModal;