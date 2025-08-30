import React, { useEffect } from 'react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { ContactsType } from '../../../../../utils/global-types-interfaces-enums';
import { FormField } from '../../../../../controls/widgets/form-field';
import { useValidators } from '../../../../../utils/validators-hook';
import { Messages } from '../../../../../utils/messages';
import clsx from 'clsx';
import { IconSubmit } from '../../../../../controls/icons/icon-submit';
import { IconReset } from '../../../../../controls/icons/icon-reset';
import { Utils } from '../../../../../utils/utils';
import { IconCross } from '../../../../../controls/icons/icon-cross';
import axios from 'axios';
import statesWithCodes from './india-states-with-codes-gst.json';

interface CustomerNewEditModalProps {
    contactData?: ContactsType | null;
}

const getDefaultContactData = (): ContactsType => {
    return {
        contactName: '',
        mobileNumber: null,
        otherMobileNumber: null,
        landPhone: null,
        email: null,
        descr: null,
        jData: null,
        anniversaryDate: null,
        address1: '',
        address2: null,
        country: 'India',
        state: null,
        city: null,
        gstin: null,
        pin: '',
        dateOfBirth: null,
        stateCode: null
    };
};

const CustomerNewEditModal: React.FC<CustomerNewEditModalProps> = ({ contactData }) => {
    const { isValidGstin, isValidEmail, checkMobileNo } = useValidators();

    const {
        register,
        handleSubmit,
        reset,
        trigger,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty, isValid }
    } = useForm<ContactsType>({
        mode: 'all',
        criteriaMode: 'all',
        defaultValues: contactData || getDefaultContactData()
    });

    // Watch PIN code changes
    const pinValue = watch('pin');

    // Trigger validation on component mount to highlight errors immediately
    useEffect(() => {
        trigger();
    }, [trigger]);

    // PIN code lookup functionality
    useEffect(() => {
        const lookupPincode = async (pincode: string) => {
            if (pincode && pincode.length === 6 && /^[0-9]{6}$/.test(pincode)) {
                try {
                    const pinCodeUrl = import.meta.env.VITE_PIN_CODE_URL || 'https://api.postalpincode.in/pincode/';
                    const response = await axios.get(`${pinCodeUrl}${pincode}`);

                    if (response.data && response.data[0] && response.data[0].Status === 'Success') {
                        const firstResult = response.data[0].PostOffice[0];

                        if (firstResult) {
                            // Set country, state, city
                            setValue('country', firstResult.Country || 'India');
                            setValue('state', firstResult.State || '');
                            setValue('city', firstResult.District || '');

                            // Find and set state code
                            const stateName = firstResult.State;
                            if (stateName) {
                                const stateCode = Object.keys(statesWithCodes).find(
                                    code => statesWithCodes[code as keyof typeof statesWithCodes].toLowerCase() === stateName.toLowerCase()
                                );
                                if (stateCode) {
                                    setValue('stateCode', parseInt(stateCode));
                                } else {
                                    setValue('stateCode', null);
                                }
                            } else {
                                setValue('stateCode', null);
                            }
                        } else {
                            // No data found, blank the fields
                            setValue('country', '');
                            setValue('state', '');
                            setValue('city', '');
                            setValue('stateCode', null);
                        }
                    } else {
                        // API returned error status, blank the fields
                        setValue('country', '');
                        setValue('state', '');
                        setValue('city', '');
                        setValue('stateCode', null);
                    }
                } catch (error) {
                    console.error('Error fetching pincode data:', error);
                    // API error, blank the fields
                    setValue('country', '');
                    setValue('state', '');
                    setValue('city', '');
                    setValue('stateCode', null);
                }
                trigger(['country']);
            }
        };

        if (pinValue) {
            lookupPincode(pinValue);
        }
    }, [pinValue, setValue]);

    const errorClass = 'border-red-500 bg-red-50';
    const inputClass = "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-sm px-2 py-1.5 transition-all duration-200";
    // const inputClassBase = "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-sm px-2 py-1.5 transition-all duration-200";

    const handleOnSubmit = (data: ContactsType) => {
        console.log('Submitting customer data:', data);
        alert(`Customer ${contactData ? 'updated' : 'created'} successfully!`);
        handleOnClose();
    };

    const handleOnClose = () => {
        Utils.showHideModalDialogA({ isOpen: false })
    };

    const handleReset = () => {
        reset(getDefaultContactData());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-60" >
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()} >

                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {contactData ? 'Edit Customer' : 'New Customer'}
                    </h2>
                    <button
                        type="button"
                        onClick={handleOnClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-2 hover:bg-red-300 rounded-full p-1.5">
                        <IconCross className='w-6 h-6' />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="px-6 py-4 overflow-y-auto max-h-[75vh] bg-gray-100">
                    <form id="customer-form" onSubmit={handleSubmit(handleOnSubmit)} className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">

                            {/* Mobile Number */}
                            <FormField label="Mobile" error={errors?.mobileNumber?.message} className="font-bold">
                                <input
                                    type="tel"
                                    className={clsx(inputClass, errors?.mobileNumber && errorClass, "max-w-42")}
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

                            {/* Contact Name */}
                            <FormField label="Contact Name" required className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClass, errors?.contactName && errorClass,)}
                                    placeholder="Enter contact name"
                                    {...register('contactName', {
                                        required: true,
                                        minLength: 1,
                                        maxLength: 100
                                    })}
                                />
                            </FormField>

                            <div className='flex'>
                                {/* PIN */}
                                <FormField label="PIN Code" required error={errors?.pin?.message} className="font-bold">
                                    <input
                                        type="tel"
                                        className={clsx(inputClass, errors?.pin && errorClass, "max-w-24")}
                                        placeholder="6-digit PIN"
                                        maxLength={6}
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        onKeyDown={(e) => {
                                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                                e.preventDefault();
                                            }
                                        }}
                                        {...register('pin', {
                                            required: true,
                                            pattern: {
                                                value: /^[0-9]{6}$/,
                                                message: Messages.errInvalidPinCode
                                            }
                                        })}
                                    />
                                </FormField>

                                {/* Address 1 */}
                                <div className='w-full ml-4'>
                                    <FormField label="Address 1" required className="font-bold">
                                        <input
                                            type="text"
                                            className={clsx(inputClass, errors?.address1 && errorClass,)}
                                            placeholder="Enter primary address"
                                            {...register('address1', {
                                                required: true,
                                                maxLength: 200
                                            })}
                                        />
                                    </FormField>
                                </div>
                            </div>

                            {/* Address 2 */}
                            <FormField label="Address 2" className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClass)}
                                    placeholder="Secondary address (optional)"
                                    {...register('address2')}
                                />
                            </FormField>

                            {/* Email */}
                            <FormField label="Email" error={errors?.email?.message} className="font-bold">
                                <input
                                    type="email"
                                    className={clsx(inputClass, errors?.email && errorClass)}
                                    placeholder="Enter email address"
                                    {...register('email', {
                                        validate: (value) => {
                                            if (!value) return true;
                                            if (isValidEmail(value)) return true;
                                            return Messages.errInvalidEmail;
                                        }
                                    })}
                                />
                            </FormField>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2'>
                                {/* GSTIN */}
                                <FormField label="GSTIN" error={errors?.gstin?.message} className="font-bold">
                                    <input
                                        type="text"
                                        className={clsx(inputClass, errors?.gstin && errorClass)}
                                        placeholder="Enter GSTIN"
                                        maxLength={15}
                                        {...register('gstin', {
                                            validate: (value) => {
                                                if (!value) return true;
                                                if (isValidGstin(value)) return true;
                                                return Messages.errInvalidGstin;
                                            }
                                        })}
                                    />
                                </FormField>

                                {/* Alt Mobile */}
                                <FormField label="Alt Mobile" error={errors?.otherMobileNumber?.message} className="font-bold">
                                    <input
                                        type="tel"
                                        className={clsx(inputClass, errors?.otherMobileNumber && errorClass)}
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
                            </div>

                            {/* Land Phone */}
                            <FormField label="Landline" error={errors?.landPhone?.message} className="font-bold">
                                <input
                                    type="tel"
                                    className={clsx(inputClass, errors?.landPhone && errorClass, "max-w-42")}
                                    placeholder="Landline number"
                                    onKeyDown={(e) => {
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register('landPhone', {
                                        pattern: {
                                            value: /^[0-9-+()\s]{6,15}$/,
                                            message: Messages.errInvalidIpAddress
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

                        {/* Location fields in single row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2">

                            {/* Country */}
                            <FormField label="Country" required className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClass, errors?.country && errorClass)}
                                    placeholder="Enter country"
                                    {...register('country', {
                                        required: true,
                                        maxLength: 100
                                    })}
                                />
                            </FormField>

                            {/* State */}
                            <FormField label="State" error={errors?.state?.message} className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClass, errors?.state && errorClass)}
                                    placeholder="Enter state"
                                    {...register('state')}
                                />
                            </FormField>

                            {/* City */}
                            <FormField label="City" error={errors?.city?.message} className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClass, errors?.city && errorClass)}
                                    placeholder="Enter city"
                                    {...register('city')}
                                />
                            </FormField>

                            {/* State Code */}
                            <FormField label="State Code" error={errors?.stateCode?.message} className="font-bold">
                                <input
                                    type="number"
                                    className={clsx(inputClass, errors?.stateCode && errorClass)}
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
                        </div>

                        {/* Date fields and action buttons row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2 items-end">
                            {/* Date of Birth */}
                            <FormField label="Date of Birth" error={errors?.dateOfBirth?.message} className="font-bold">
                                <input
                                    type="date"
                                    className={clsx(inputClass, errors?.dateOfBirth && errorClass)}
                                    max={new Date().toISOString().split('T')[0]}
                                    {...register('dateOfBirth', {
                                        validate: (value) => {
                                            if (!value) return true;
                                            const selectedDate = new Date(value);
                                            const today = new Date();
                                            return selectedDate <= today || Messages.errDateOfBirthInFuture;
                                        }
                                    })}
                                />
                            </FormField>

                            {/* Anniversary Date */}
                            <FormField label="Anniversary" error={errors?.anniversaryDate?.message} className="font-bold">
                                <input
                                    type="date"
                                    className={clsx(inputClass, errors?.anniversaryDate && errorClass)}
                                    max={new Date().toISOString().split('T')[0]}
                                    {...register('anniversaryDate', {
                                        validate: (value) => {
                                            if (!value) return true;
                                            const selectedDate = new Date(value);
                                            const today = new Date();
                                            return selectedDate <= today || Messages.errAnniversaryDateInFuture;
                                        }
                                    })}
                                />
                            </FormField>

                            {/* Empty column */}
                            <div></div>

                            {/* Action buttons */}
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleOnClose}
                                    className="px-4 py-2 text-base font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2 text-base font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-md flex items-center transition-all duration-200"
                                >
                                    <IconReset className="w-5 h-5 mr-2" />
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || (!isDirty) || (!isValid) || (!_.isEmpty(errors))}
                                    className="px-4 py-2 text-base font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md flex items-center transition-all duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                >
                                    <IconSubmit className="w-5 h-5 mr-2" />
                                    {isSubmitting ? 'Saving...' : 'Submit'}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerNewEditModal;