import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ContactsType } from '../../../../../utils/global-types-interfaces-enums';
import { FormField } from '../../../../../controls/widgets/form-field';
import { useValidators } from '../../../../../utils/validators-hook';
import { Messages } from '../../../../../utils/messages';
import clsx from 'clsx';
import { IconSubmit } from '../../../../../controls/icons/icon-submit';
import { IconReset } from '../../../../../controls/icons/icon-reset';

interface CustomerNewEditModalProps {
    contactData?: ContactsType | null;
    onSubmit?: (data: ContactsType) => void;
    onClose?: () => void;
}

const CustomerNewEditModal: React.FC<CustomerNewEditModalProps> = ({ contactData, onSubmit, onClose }) => {
    const { isValidGstin, isValidEmail, isValidMobile } = useValidators();
    const {
        register,
        handleSubmit,
        reset,
        trigger,
        formState: { errors, isSubmitting, isDirty, isValid }
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
    const inputClass = "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium text-sm w-full rounded-lg px-2 py-1.5 transition-all duration-200";

    const onFormSubmit = (data: ContactsType) => {
        if (onSubmit) {
            onSubmit(data);
        }
        if (onClose) {
            onClose();
        }
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
        <div className="p-3 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {/* Contact Name */}
                    <FormField label="Contact Name" required className="md:col-span-3 lg:col-span-4" labelClassName="font-bold">
                        <input
                            type="text"
                            className={clsx(inputClass, errors?.contactName && errorClass, "h-8")}
                            placeholder="Enter contact name"
                            {...register('contactName', {
                                required: Messages.errRequired,
                                minLength: { value: 2, message: 'Contact name must be at least 2 characters' }
                            })}
                        />
                    </FormField>

                    {/* Mobile Number */}
                    <FormField label="Mobile" className="md:col-span-2" labelClassName="font-bold">
                        <input
                            type="tel"
                            className={clsx(inputClass, errors?.mobileNumber && errorClass, "h-8")}
                            placeholder="Mobile number"
                            {...register('mobileNumber', {
                                validate: (value) => !value || isValidMobile(value) || 'Invalid mobile number format'
                            })}
                        />
                    </FormField>

                    {/* Address 1 */}
                    <FormField label="Address 1" required className="md:col-span-3 lg:col-span-4" labelClassName="font-bold">
                        <input
                            type="text"
                            className={clsx(inputClass, errors?.address1 && errorClass, "h-8")}
                            placeholder="Primary address"
                            {...register('address1', {
                                required: Messages.errRequired
                            })}
                        />
                    </FormField>

                    {/* Address 2 */}
                    <FormField label="Address 2" className="md:col-span-3 lg:col-span-4" labelClassName="font-bold">
                        <input
                            type="text"
                            className={clsx(inputClass, "h-8")}
                            placeholder="Secondary address (optional)"
                            {...register('address2')}
                        />
                    </FormField>

                    {/* PIN */}
                    <FormField label="PIN Code" required labelClassName="font-bold">
                        <input
                            type="text"
                            className={clsx(inputClass, errors?.pin && errorClass, "h-8")}
                            placeholder="PIN"
                            {...register('pin', {
                                required: Messages.errRequired,
                                pattern: {
                                    value: /^[0-9]{6}$/,
                                    message: 'PIN must be 6 digits'
                                }
                            })}
                        />
                    </FormField>

                    {/* Email */}
                    <FormField label="Email" className="md:col-span-2" labelClassName="font-bold">
                        <input
                            type="email"
                            className={clsx(inputClass, errors?.email && errorClass, "h-8")}
                            placeholder="Email address"
                            {...register('email', {
                                validate: (value) => !value || isValidEmail(value) || 'Invalid email format'
                            })}
                        />
                    </FormField>

                    {/* GSTIN */}
                    <FormField label="GSTIN" labelClassName="font-bold">
                        <input
                            type="text"
                            className={clsx(inputClass, errors?.gstin && errorClass, "h-8")}
                            placeholder="GSTIN"
                            {...register('gstin', {
                                validate: (value) => !value || isValidGstin(value) || 'Invalid GSTIN format'
                            })}
                        />
                    </FormField>

                    {/* City */}
                    <FormField label="City" labelClassName="font-bold">
                        <input
                            type="text"
                            className={clsx(inputClass, errors?.city && errorClass, "h-8")}
                            placeholder="City"
                            {...register('city')}
                        />
                    </FormField>

                    {/* State */}
                    <FormField label="State" labelClassName="font-bold">
                        <input
                            type="text"
                            className={clsx(inputClass, errors?.state && errorClass, "h-8")}
                            placeholder="State"
                            {...register('state')}
                        />
                    </FormField>

                    {/* Country */}
                    <FormField label="Country" required labelClassName="font-bold">
                        <input
                            type="text"
                            className={clsx(inputClass, errors?.country && errorClass, "h-8")}
                            placeholder="Country"
                            {...register('country', {
                                required: Messages.errRequired
                            })}
                        />
                    </FormField>

                    {/* State Code */}
                    <FormField label="State Code" labelClassName="font-bold">
                        <input
                            type="number"
                            className={clsx(inputClass, errors?.stateCode && errorClass, "h-8")}
                            placeholder="Code"
                            {...register('stateCode', {
                                min: { value: 1, message: 'State code must be positive' },
                                max: { value: 99, message: 'State code must be less than 100' }
                            })}
                        />
                    </FormField>

                    {/* Other Mobile Number */}
                    <FormField label="Alt Mobile" labelClassName="font-bold">
                        <input
                            type="tel"
                            className={clsx(inputClass, errors?.otherMobileNumber && errorClass, "h-8")}
                            placeholder="Alternate mobile"
                            {...register('otherMobileNumber', {
                                validate: (value) => !value || isValidMobile(value) || 'Invalid mobile number format'
                            })}
                        />
                    </FormField>

                    {/* Land Phone */}
                    <FormField label="Landline" labelClassName="font-bold">
                        <input
                            type="tel"
                            className={clsx(inputClass, errors?.landPhone && errorClass, "h-8")}
                            placeholder="Landline"
                            {...register('landPhone')}
                        />
                    </FormField>

                    {/* Date of Birth */}
                    <FormField label="Date of Birth" labelClassName="font-bold">
                        <input
                            type="date"
                            className={clsx(inputClass, errors?.dateOfBirth && errorClass, "h-8")}
                            {...register('dateOfBirth')}
                        />
                    </FormField>

                    {/* Anniversary Date */}
                    <FormField label="Anniversary" labelClassName="font-bold">
                        <input
                            type="date"
                            className={clsx(inputClass, errors?.anniversaryDate && errorClass, "h-8")}
                            {...register('anniversaryDate')}
                        />
                    </FormField>

                    {/* Description */}
                    <FormField label="Description" className="md:col-span-3 lg:col-span-4" labelClassName="font-bold">
                        <textarea
                            rows={2}
                            className={clsx(inputClass, "resize-none")}
                            placeholder="Additional notes (optional)"
                            {...register('descr')}
                        />
                    </FormField>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 bg-gray-50 -mx-3 -mb-3 px-3 py-3 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
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
                        disabled={isSubmitting || !isValid}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md flex items-center transition-all duration-200 disabled:bg-blue-300"
                    >
                        <IconSubmit className="w-4 h-4 mr-1.5" />
                        {contactData ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerNewEditModal;