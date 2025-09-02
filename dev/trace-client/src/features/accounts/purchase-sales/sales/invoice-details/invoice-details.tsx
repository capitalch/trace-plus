import React from 'react';
import { FileText } from 'lucide-react';
import { useValidators } from '../../../../../utils/validators-hook';
import { useFormContext } from 'react-hook-form';
import { SalesFormDataType } from '../all-sales';
import { FormField } from '../../../../../controls/widgets/form-field';
import clsx from 'clsx';
import { Messages } from '../../../../../utils/messages';

const InvoiceDetails: React.FC = () => {
    const { checkAllowedDate } = useValidators();
    const {
        watch,
        register,
        formState: { errors, }
    } = useFormContext<SalesFormDataType>();
    const inputFormFieldStyle = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    
    return (
        <div className="px-6 py-4 bg-white border-indigo-400 border-l-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4" style={{height: '40px'}}>
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-gray-900 text-lg">Invoice Details</h2>
                </div>

                {/* GST Invoice Toggle */}
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only"
                        {...register("isGstInvoice")}
                    />
                    <div className={clsx(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200",
                        watch("isGstInvoice") ? "bg-blue-500" : "bg-gray-300"
                    )}>
                        <span
                            className={clsx(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                watch("isGstInvoice") ? "translate-x-5" : "translate-x-0.5"
                            )}
                        />
                    </div>
                    <span className="ml-2 font-medium text-gray-700 text-sm">
                        GST Invoice
                    </span>
                </label>

                {/* IGST Toggle */}
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only"
                        {...register("isIgst")}
                    />
                    <div className={clsx(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200",
                        watch("isIgst") ? "bg-green-500" : "bg-gray-300"
                    )}>
                        <span
                            className={clsx(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                watch("isIgst") ? "translate-x-5" : "translate-x-0.5"
                            )}
                        />
                    </div>
                    <span className="ml-2 font-medium text-gray-700 text-sm">
                        IGST
                    </span>
                </label>

                {/* Auto ref no */}
                <FormField label='' className="w-52">
                    <label className='ml-auto text-xs -mb-1'>Invoice No</label>
                    <input
                        type="text"
                        className={clsx("bg-gray-200 rounded mt-1")}
                        readOnly
                        disabled

                        title="Auto reference number"
                        value={watch("autoRefNo") ?? ''}
                    />
                </FormField>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-6">
                    {/* Tran date */}
                    <FormField label="Date" required>
                        <input
                            type="date"
                            className={clsx(
                                inputFormFieldStyle, 'mt-1',
                                errors?.tranDate && "border-red-500 bg-red-100"
                            )}
                            {...register("tranDate", {
                                required: Messages.errDateFieldRequired,
                                validate: checkAllowedDate
                            })}
                        />
                    </FormField>

                    {/* User ref no */}
                    <FormField label="Reference No" error={errors?.userRefNo?.message}>
                        <input
                            type="text"
                            className={clsx(inputFormFieldStyle, 'mt-1')}
                            placeholder="Enter reference no"
                            {...register("userRefNo")}
                        />
                    </FormField>
                </div>

                {/* Remarks */}
                <FormField className="w-auto min-w-60" label="Remarks">
                    <textarea
                        rows={5}
                        className={clsx(inputFormFieldStyle, "mt-1")}
                        placeholder="Add any special instructions or notes..."
                        {...register("remarks")}
                    />
                </FormField>
            </div>
        </div>
    );
};

export default InvoiceDetails;