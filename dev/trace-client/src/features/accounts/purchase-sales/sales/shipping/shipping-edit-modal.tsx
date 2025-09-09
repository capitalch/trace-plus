import React, { useEffect } from 'react';
import _ from 'lodash';
import { useForm, useFormContext } from 'react-hook-form';
import { ShippingInfoType, SalesFormDataType } from '../all-sales';
import { FormField } from '../../../../../controls/widgets/form-field';
import { useValidators } from '../../../../../utils/validators-hook';
import { Messages } from '../../../../../utils/messages';
import clsx from 'clsx';
import { IconSubmit } from '../../../../../controls/icons/icon-submit';
import { IconReset } from '../../../../../controls/icons/icon-reset';
import { Utils } from '../../../../../utils/utils';
import { IconCross } from '../../../../../controls/icons/icon-cross';
import axios from 'axios';

interface ShippingEditModalProps {
    shippingData?: ShippingInfoType | null;
}

const getDefaultShippingData = (): ShippingInfoType => {
    return {
        name: '',
        mobileNumber: null,
        email: null,
        address1: '',
        address2: null,
        country: 'India',
        state: null,
        city: null,
        pin: '',
        otherInfo: null
    };
};

const ShippingEditModal: React.FC<ShippingEditModalProps> = ({ shippingData }) => {
    const { isValidEmail, checkMobileNo } = useValidators();
    const parentFormContext = useFormContext<SalesFormDataType>();

    const {
        register,
        handleSubmit,
        reset,
        trigger,
        getValues,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty, isValid }
    } = useForm<ShippingInfoType>({
        mode: 'all',
        criteriaMode: 'all',
        defaultValues: shippingData || getDefaultShippingData()
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
                        } else {
                            // No data found, blank the fields
                            setValue('country', '');
                            setValue('state', '');
                            setValue('city', '');
                        }
                    } else {
                        // API returned error status, blank the fields
                        setValue('country', '');
                        setValue('state', '');
                        setValue('city', '');
                    }
                } catch (error) {
                    console.error('Error fetching pincode data:', error);
                    // API error, blank the fields
                    setValue('country', '');
                    setValue('state', '');
                    setValue('city', '');
                }
                trigger(['country', 'state', 'city']);
            }
        };

        if (pinValue) {
            lookupPincode(pinValue);
        }
    }, [pinValue, setValue, trigger]);

    const errorClass = 'border-red-500 bg-red-50';
    const inputClass = "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 rounded-sm px-2 py-1.5 transition-all duration-200";

    const handleOnClose = () => {
        Utils.showHideModalDialogA({ isOpen: false });
    };

    const handleReset = () => {
        reset(getDefaultShippingData());
    };

    const handleOnSubmit = () => {
        if (!parentFormContext) {
            console.error('Parent form context not available');
            return;
        }
        
        const formData = getValues();
        // Transfer data back to shipping.tsx by updating parent form
        parentFormContext.setValue('shippingInfo', formData);
        handleOnClose();
    };

    if (!parentFormContext) {
        console.warn('ShippingEditModal: Parent form context is not available');
        return (
            <div className="flex fixed items-center justify-center bg-gray-300 bg-opacity-60 inset-0 z-50">
                <div className="mx-4 w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">Form context not available. Please try again.</p>
                        <button 
                            onClick={() => Utils.showHideModalDialogA({ isOpen: false })}
                            className="mt-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex fixed items-center justify-center bg-gray-300 bg-opacity-60 inset-0 z-50">
            <div className="mx-4 w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900 text-lg">
                        {shippingData ? 'Edit Shipping Information' : 'New Shipping Information'}
                    </h2>
                    <button
                        type="button"
                        onClick={handleOnClose}
                        className="ml-2 p-1.5 text-gray-400 rounded-full transition-colors hover:bg-red-300 hover:text-gray-600"
                    >
                        <IconCross className='w-6 h-6' />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="px-6 py-4 max-h-[75vh] bg-gray-100 overflow-y-auto">
                    <form id="shipping-form" onSubmit={handleSubmit(handleOnSubmit)} className="space-y-2">
                        <div className="grid gap-x-4 gap-y-2 grid-cols-1 md:grid-cols-2">

                            {/* Name */}
                            <FormField label="Name" required className="font-bold">
                                <input
                                    type="text"
                                    className={clsx(inputClass, errors?.name && errorClass)}
                                    placeholder="Enter recipient name"
                                    {...register('name', {
                                        required: true,
                                        minLength: 1,
                                        maxLength: 100
                                    })}
                                />
                            </FormField>

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
                                <div className='ml-4 w-full'>
                                    <FormField label="Address 1" required className="font-bold">
                                        <input
                                            type="text"
                                            className={clsx(inputClass, errors?.address1 && errorClass)}
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

                            {/* Other Info */}
                            <FormField label="Other Info" className="font-bold">
                                <textarea
                                    rows={2}
                                    className={clsx(inputClass, errors?.otherInfo && errorClass, "resize-none")}
                                    placeholder="Additional notes (optional)"
                                    maxLength={500}
                                    {...register('otherInfo', {
                                        maxLength: { value: 500, message: 'Other info cannot exceed 500 characters' }
                                    })}
                                />
                            </FormField>

                        </div>

                        {/* Location fields in single row */}
                        <div className="grid gap-x-4 gap-y-2 grid-cols-1 md:grid-cols-3">

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
                        </div>

                        {/* Action buttons row */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleOnClose}
                                className="px-4 py-2 font-medium text-base text-slate-700 bg-slate-200 rounded-md transition-all duration-200 hover:bg-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center px-4 py-2 font-medium text-base text-white bg-amber-500 rounded-md transition-all duration-200 hover:bg-amber-600"
                            >
                                <IconReset className="mr-2 w-5 h-5" />
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || (!isDirty) || (!isValid) || (!_.isEmpty(errors))}
                                className="flex items-center px-4 py-2 font-medium text-base text-white bg-cyan-500 rounded-md transition-all duration-200 hover:bg-cyan-600 disabled:bg-cyan-300 disabled:cursor-not-allowed"
                            >
                                <IconSubmit className="mr-2 w-5 h-5" />
                                {isSubmitting ? 'Saving...' : 'OK'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShippingEditModal;