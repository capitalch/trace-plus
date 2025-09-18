import React, { useEffect } from 'react';
import _ from 'lodash';
import { useForm, UseFormSetValue, UseFormTrigger } from 'react-hook-form';
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
import { useUtilsInfo } from '../../../../../utils/utils-info-hook';
import { AllTables } from '../../../../../app/maps/database-tables-map';
import { SalesFormDataType } from '../all-sales';
import { SqlIdsMap } from '../../../../../app/maps/sql-ids-map';
import urlJoin from 'url-join';

interface CustomerNewEditModalProps {
    contactsData?: ContactsType | null;
    setParentValue: UseFormSetValue<SalesFormDataType>;
    triggerParent: UseFormTrigger<SalesFormDataType>;
}

const getDefaultContactsData = (): ContactsType => {
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

const CustomerNewEditModal: React.FC<CustomerNewEditModalProps> = ({ contactsData, setParentValue, triggerParent }) => {
    const { isValidGstin, isValidEmail, checkMobileNo } = useValidators();
    const { dbName, buCode, decodedDbParamsObject } = useUtilsInfo();

    const checkMobileNoForUpdate = async (mobile: string, currentContactId?: number) => {
        if (!mobile || mobile.length !== 10 || !/^[0-9]{10}$/.test(mobile)) {
            return undefined;
        }

        try {
            const result: ContactsType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject,
                sqlId: SqlIdsMap.getContactForMobile,
                sqlArgs: { mobileNumber: mobile }
            });

            if (result && result.length === 1) {
                const existingContact = result[0];
                if (existingContact.id !== currentContactId) {
                    return Messages.errMobileAlreadyExists;
                }
            }
        } catch (error) {
            console.error('Error checking mobile for duplicate:', error);
        }
        return undefined;
    };

    const checkEmailForUpdate = async (email: string, currentContactId?: number) => {
        if (!email || !isValidEmail(email)) {
            return undefined;
        }

        try {
            const result: ContactsType[] = await Utils.doGenericQuery({
                buCode: buCode || '',
                dbName: dbName || '',
                dbParams: decodedDbParamsObject,
                sqlId: SqlIdsMap.getContactForEmail,
                sqlArgs: { email: email }
            });

            if (result && result.length === 1) {
                const existingContact = result[0];
                if (existingContact.id !== currentContactId) {
                    return Messages.errEmailAlreadyExists;
                }
            }
        } catch (error) {
            console.error('Error checking email for duplicate:', error);
        }
        return undefined;
    };

    const {
        register,
        handleSubmit,
        reset,
        trigger,
        getValues,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty, isValid }
    } = useForm<ContactsType>({
        mode: 'all',
        criteriaMode: 'all',
        defaultValues: contactsData || getDefaultContactsData()
    });

    // Watch PIN code changes
    const pinValue = watch('pin');
    // Watch mobile number changes  
    const mobileValue = watch('mobileNumber');
    // Watch email changes
    const emailValue = watch('email');

    // Trigger validation on component mount to highlight errors immediately
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
                    // const response = await axios.get(`/api/pincode/${pincode}`);

                    if (response.data && response.data.country) {
                        // Set country, state, city from new API format
                        setValue('country', response.data.country || 'India');
                        setValue('state', response.data.state || '');
                        setValue('city', response.data.city || '');

                        // Find and set state code
                        const stateName = response.data.state;
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
    }, [pinValue, setValue, trigger]);

    // Mobile number validation for existing contacts (only for new entries)
    useEffect(() => {
        const checkMobileForExistingContact = async (mobile: string) => {
            // Only check for new entries (not edit mode) and when mobile is valid
            if (!contactsData && mobile && mobile.length === 10 && /^[0-9]{10}$/.test(mobile)) {
                try {
                    const result: ContactsType[] = await Utils.doGenericQuery({
                        buCode: buCode || '',
                        dbName: dbName || '',
                        dbParams: decodedDbParamsObject,
                        sqlId: SqlIdsMap.getContactForMobile,
                        sqlArgs: {
                            mobileNumber: mobile
                        }
                    });

                    if (result && (result.length === 1)) {
                        const existingContact = result[0];
                        // Show message and auto-select the contact
                        Utils.showSuccessAlertMessage({
                            title: 'Contact Found!',
                            message: `Selecting contact: ${existingContact.contactName || 'Unnamed Contact'}`
                        });

                        // Set the contact data in parent and close modal
                        setParentValue('contactsData', existingContact);
                        triggerParent();
                        handleOnClose();
                    }
                } catch (error) {
                    console.error('Error checking mobile for existing contact:', error);
                }
            }
        };

        if (mobileValue) {
            checkMobileForExistingContact(mobileValue);
        }
    }, [mobileValue, contactsData, buCode, dbName, setParentValue, triggerParent, decodedDbParamsObject]);

    // Email validation for existing contacts (only for new entries) - with debouncing
    useEffect(() => {
        const checkEmailForExistingContact = async (email: string) => {
            // Only check for new entries (not edit mode) and when email is valid
            if (!contactsData && email && isValidEmail(email)) {
                try {
                    const result: ContactsType[] = await Utils.doGenericQuery({
                        buCode: buCode || '',
                        dbName: dbName || '',
                        dbParams: decodedDbParamsObject,
                        sqlId: SqlIdsMap.getContactForEmail,
                        sqlArgs: {
                            email: email
                        }
                    });

                    if (result && (result.length === 1)) {
                        const existingContact = result[0];
                        // Show message and auto-select the contact
                        Utils.showSuccessAlertMessage({
                            title: 'Contact Found!',
                            message: `This contact already exists. Selecting: ${existingContact.contactName || 'Unnamed Contact'}`
                        });

                        // Set the contact data in parent and close modal
                        setParentValue('contactsData', existingContact);
                        triggerParent();
                        handleOnClose();
                    }
                } catch (error) {
                    console.error('Error checking email for existing contact:', error);
                }
            }
        };

        // Debounce email validation to prevent multiple API calls while typing
        const timeoutId = setTimeout(() => {
            if (emailValue) {
                checkEmailForExistingContact(emailValue);
            }
        }, 3000); // Wait 800ms after user stops typing

        return () => clearTimeout(timeoutId);
    }, [emailValue, contactsData, buCode, dbName, setParentValue, triggerParent, decodedDbParamsObject, isValidEmail]);

    const errorClass = 'border-red-500 bg-red-50';
    const inputClass = "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-sm px-2 py-1.5 transition-all duration-200";

    const handleOnClose = () => {
        Utils.showHideModalDialogA({ isOpen: false })
    };

    const handleReset = () => {
        reset(getDefaultContactsData());
    };

    return (
        <div className="flex fixed items-center justify-center bg-gray-300 bg-opacity-60 inset-0 z-50" >
            <div className="mx-4 w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()} >

                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900 text-lg">
                        {contactsData ? 'Edit Customer' : 'New Customer'}
                    </h2>
                    <button
                        type="button"
                        onClick={handleOnClose}
                        className="ml-2 p-1.5 text-gray-400 rounded-full transition-colors hover:bg-red-300 hover:text-gray-600">
                        <IconCross className='w-6 h-6' />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="px-6 py-4 max-h-[75vh] bg-gray-100 overflow-y-auto">
                    <form id="customer-form" onSubmit={handleSubmit(handleOnSubmit)} className="space-y-2">
                        <div className="grid gap-x-4 gap-y-2 grid-cols-1 md:grid-cols-2">

                            {/* Mobile Number */}
                            <FormField label="Mobile" error={errors?.mobileNumber?.message} >
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
                                        validate: (value) => !value || !checkMobileNo(value) || Messages.errInvalidMobileNo,
                                        onChange: async (e) => {
                                            const value = e.target.value;
                                            if (contactsData && value && value.length === 10 && /^[0-9]{10}$/.test(value)) {
                                                const duplicateError = await checkMobileNoForUpdate(value, contactsData.id);
                                                if (duplicateError) {
                                                    Utils.showWarningMessage(duplicateError);
                                                    setValue('mobileNumber', '');
                                                }
                                            }
                                        }
                                    })}
                                />
                            </FormField>

                            {/* Contact Name */}
                            <FormField label="Contact Name" required >
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
                                <FormField label="PIN Code" required error={errors?.pin?.message} >
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
                                    <FormField label="Address 1" required >
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
                            <FormField label="Address 2" >
                                <input
                                    type="text"
                                    className={clsx(inputClass)}
                                    placeholder="Secondary address (optional)"
                                    {...register('address2')}
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
                                        },
                                        onChange: async (e) => {
                                            const value = e.target.value;
                                            if (contactsData && value && isValidEmail(value)) {
                                                const duplicateError = await checkEmailForUpdate(value, contactsData.id);
                                                if (duplicateError) {
                                                    Utils.showWarningMessage(duplicateError);
                                                    setValue('email', '');
                                                }
                                            }
                                        }
                                    })}
                                />
                            </FormField>

                            <div className='grid gap-x-4 gap-y-2 grid-cols-1 md:grid-cols-2'>
                                {/* GSTIN */}
                                <FormField label="GSTIN" error={errors?.gstin?.message} >
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
                                <FormField label="Alt Mobile" error={errors?.otherMobileNumber?.message} >
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
                                            validate: (value) => !value || !checkMobileNo(value) || Messages.errInvalidMobileNo,
                                            onChange: async (e) => {
                                                const value = e.target.value;
                                                if (contactsData && value && value.length === 10 && /^[0-9]{10}$/.test(value)) {
                                                    const duplicateError = await checkMobileNoForUpdate(value, contactsData.id);
                                                    if (duplicateError) {
                                                        Utils.showErrorMessage(duplicateError);
                                                        setValue('otherMobileNumber', '');
                                                    }
                                                }
                                            }
                                        })}
                                    />
                                </FormField>
                            </div>

                            {/* Land Phone */}
                            <FormField label="Landline" error={errors?.landPhone?.message} >
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
                            <FormField label="Description" error={errors?.descr?.message} >
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
                        <div className="grid gap-x-4 gap-y-2 grid-cols-1 md:grid-cols-4">

                            {/* Country */}
                            <FormField label="Country" required >
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

                            {/* State Code */}
                            <FormField label="State Code" error={errors?.stateCode?.message} >
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
                        <div className="grid items-end gap-x-4 gap-y-2 grid-cols-1 md:grid-cols-4">
                            {/* Date of Birth */}
                            <FormField label="Date of Birth" error={errors?.dateOfBirth?.message} >
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
                            <FormField label="Anniversary" error={errors?.anniversaryDate?.message} >
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
                                    className="flex items-center px-4 py-2 font-medium text-base text-white bg-blue-500 rounded-md transition-all duration-200 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                >
                                    <IconSubmit className="mr-2 w-5 h-5" />
                                    {isSubmitting ? 'Saving...' : 'Submit'}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );

    function copyDataToParent(customerId: number) {
        const formData = getValues();
        // Copy contact data to parent form
        setParentValue('contactsData', {
            ...formData,
            id: customerId
        });
    }

    async function handleOnSubmit() {
        try {
            const xData: ContactsType = {
                id: getValues('id') || undefined,
                contactName: getValues('contactName'),
                mobileNumber: getValues('mobileNumber') || null,
                otherMobileNumber: getValues('otherMobileNumber') || null,
                landPhone: getValues('landPhone') || null,
                email: getValues('email') || null,
                descr: getValues('descr') || null,
                anniversaryDate: getValues('anniversaryDate') || null,
                address1: getValues('address1'),
                address2: getValues('address2') || null,
                country: getValues('country'),
                state: getValues('state') || null,
                city: getValues('city') || null,
                gstin: getValues('gstin') || null,
                pin: getValues('pin'),
                dateOfBirth: getValues('dateOfBirth') || null,
                stateCode: getValues('stateCode') || null,
            }
            console.log("Submitting customer data:", xData);
            const result = await Utils.doGenericUpdate({
                buCode: buCode || '',
                dbName: dbName || '',
                tableName: AllTables.Contacts.name,
                xData: xData,
            })
            const id = result?.data?.genericUpdate;
            if (id) {
                copyDataToParent(id)
                triggerParent();
                handleOnClose();
            }
        } catch (error) {
            console.error("Error in submitting customer data:", error);
        }
    }
};

export default CustomerNewEditModal;