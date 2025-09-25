import React, { useEffect } from 'react';
import { useForm, UseFormSetValue } from 'react-hook-form';
import { SalesFormDataType, ShippingInfoType } from '../all-sales';
import { FormField } from '../../../../../controls/widgets/form-field';
import { useValidators } from '../../../../../utils/validators-hook';
import { Messages } from '../../../../../utils/messages';
import clsx from 'clsx';
import { IconSubmit } from '../../../../../controls/icons/icon-submit';
import { IconReset } from '../../../../../controls/icons/icon-reset';
import { Utils } from '../../../../../utils/utils';
import { IconCross } from '../../../../../controls/icons/icon-cross';
import axios from 'axios';
import urlJoin from 'url-join';

interface ShippingEditModalProps {
    shippingData: ShippingInfoType | null;
    setParentValue: UseFormSetValue<SalesFormDataType>;
}

const getDefaultShippingData = (): ShippingInfoType => {
    return {
        name: '',
        mobileNumber: null,
        email: null,
        address1: '',
        address2: null,
        country: null,
        state: null,
        city: null,
        pin: '',
        otherInfo: null
    };
};

const ShippingEditModal: React.FC<ShippingEditModalProps> = ({ shippingData, setParentValue }) => {
    const { isValidEmail, checkMobileNo } = useValidators();

    const {
        register,
        handleSubmit,
        reset,
        trigger,
        setValue,
        getValues,
        watch,
        formState: { errors, isSubmitting, isDirty, isValid }
    } = useForm<ShippingInfoType>({
        mode: 'all',
        criteriaMode: 'all',
        defaultValues: shippingData || getDefaultShippingData()
    });

    // Watch PIN code changes
    const pinValue = watch('pin');

    // Trigger validation on component mount
    useEffect(() => {
        trigger();
    }, [trigger]);

    // PIN code lookup functionality
    useEffect(() => {
        const lookupPincode = async (pincode: string) => {
            if (pincode && pincode.length === 6 && /^[0-9]{6}$/.test(pincode)) {
                try {
                    const hostUrl = Utils.getHostUrl()
                    const pincodeUrl = urlJoin(hostUrl, `api/pincode/${pincode}`)
                    const response = await axios.get(pincodeUrl);

                    if (response.data && response.data.country) {
                        // Set country, state, city from new API format
                        setValue('country', response.data.country || 'India');
                        setValue('state', response.data.state || '');
                        setValue('city', response.data.city || '');
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
            }
        };

        if (pinValue) {
            lookupPincode(pinValue);
        }
    }, [pinValue, setValue]);

    const errorClass = 'border-red-500 bg-red-50';
    const inputClass = "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 rounded-sm px-2 py-1.5 transition-all duration-200";

    const handleOnClose = () => {
        Utils.showHideModalDialogA({ isOpen: false });
    };

    const handleReset = () => {
        reset(getDefaultShippingData());
    };

    const handleOnSubmit = async () => {
        try {
            const formData = getValues();
            // Copy shipping data to parent form using setParentValue
            setParentValue('shippingInfo', formData, {shouldDirty: true});
            handleOnClose();
        } catch (error) {
            console.error('Error in submitting shipping data:', error);
        }
    };

    return (
        <div className="flex fixed items-center justify-center bg-gray-300 bg-opacity-60 inset-0 z-50">
            <div className="mx-4 w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900 text-lg">
                        {shippingData?.name ? 'Edit Shipping Information' : 'New Shipping Information'}
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
                            <FormField label="Name" required>
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

                            <div className='flex'>
                                {/* PIN */}
                                <FormField label="PIN Code" required error={errors?.pin?.message}>
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
                                    <FormField label="Address 1" required>
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
                            <FormField label="Address 2">
                                <input
                                    type="text"
                                    className={clsx(inputClass)}
                                    placeholder="Secondary address (optional)"
                                    {...register('address2')}
                                />
                            </FormField>

                            {/* Mobile Number */}
                            <FormField label="Mobile" error={errors?.mobileNumber?.message} >
                                <input
                                    type="tel"
                                    className={clsx(inputClass, errors?.mobileNumber && errorClass, "max-w-45")}
                                    placeholder="Enter 10-digit mobile"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    onKeyDown={(e) => {
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                            e.preventDefault();
                                        }
                                    }}
                                    {...register('mobileNumber', {
                                        validate: (value) => {
                                            if (!value) return (true)
                                            const ret = checkMobileNo(value)
                                            if (!ret) return (true)
                                            return (ret)
                                        }
                                    })}
                                />
                            </FormField>

                            {/* Email */}
                            <FormField label="Email" error={errors?.email?.message} >
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

                            {/* Other Info */}
                            <FormField label="Other Info" >
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
                            <FormField label="Country" >
                                <input
                                    type="text"
                                    className={clsx(inputClass, errors?.country && errorClass)}
                                    placeholder="Enter country"
                                    {...register('country', {
                                        // required: true,
                                        maxLength: 100
                                    })}
                                />
                            </FormField>

                            {/* State */}
                            <FormField label="State" error={errors?.state?.message} >
                                <input
                                    type="text"
                                    className={clsx(inputClass, errors?.state && errorClass)}
                                    placeholder="Enter state"
                                    {...register('state')}
                                />
                            </FormField>

                            {/* City */}
                            <FormField label="City" error={errors?.city?.message} >
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
                                disabled={isSubmitting || !isDirty || !isValid}
                                className="flex items-center px-4 py-2 font-medium text-base text-white bg-cyan-500 rounded-md transition-all duration-200 hover:bg-cyan-600 disabled:bg-cyan-300 disabled:cursor-not-allowed"
                            >
                                <IconSubmit className="mr-2 w-5 h-5" />
                                {isSubmitting ? 'Saving...' : 'Submit'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShippingEditModal;