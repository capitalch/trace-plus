import { FileText, } from 'lucide-react';
import { FormField } from '../../../../../controls/widgets/form-field';
import clsx from 'clsx';
import { useValidators } from '../../../../../utils/validators-hook';
import { SalesFormDataType } from '../all-sales';
import { useFormContext } from 'react-hook-form';
import { Messages } from '../../../../../utils/messages';
import { useEffect } from 'react';
import { useUtilsInfo } from '../../../../../utils/utils-info-hook';

const InvoiceDetails: React.FC = () => {
    const inputFormFieldStyle = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const { checkAllowedDate } = useValidators();
    const { defaultGstRate } = useUtilsInfo();
    const {
        watch,
        register,
        setValue,
        getValues,
        formState: { errors, }
    } = useFormContext<SalesFormDataType>();

    const isGstInvoice = watch('isGstInvoice');

    // Clear IGST when GST Invoice is disabled
    useEffect(() => {
        if (!isGstInvoice) {
            setValue('isIgst', false);
        }
    }, [isGstInvoice, setValue]);

    useEffect(() => {
        const salesLineItems = getValues('salesLineItems');
        if (salesLineItems && salesLineItems.length > 0) {
            let hasChanges = false;
            const updatedLineItems = salesLineItems.map(item => {
                if (!isGstInvoice) {
                    // When GST is unchecked, set all gstRate to 0
                    if (item.gstRate !== 0) {
                        hasChanges = true;
                        return { ...item, gstRate: 0 };
                    }
                } else {
                    // When GST is checked, set gstRate to defaultGstRate for any rows with gstRate 0
                    if (item.gstRate === 0) {
                        hasChanges = true;
                        return { ...item, gstRate: defaultGstRate };
                    }
                }
                return item;
            });

            if (hasChanges) {
                setValue('salesLineItems', updatedLineItems);
            }
        }
    }, [isGstInvoice, setValue, getValues, defaultGstRate]);

    return (
        <div className="relative px-4 py-4 bg-white border-purple-400 border-l-4 rounded-lg shadow-sm">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-4 flex-wrap" >
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="font-semibold text-gray-900 text-lg">Invoice Details</h2>
                </div>

                {/* Toggle Controls */}
                <div className="flex items-center space-x-4">
                    {/* GST Invoice Toggle */}
                    <label className="flex items-center cursor-pointer flex-wrap gap-y-2">
                        <input
                            type="checkbox"
                            className="sr-only"
                            {...register("isGstInvoice")}
                            disabled
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
                    <label className={clsx(
                        "flex items-center",
                        isGstInvoice ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    )}>
                        <input
                            type="checkbox"
                            className="sr-only"
                            {...register("isIgst")}
                            disabled={!isGstInvoice}
                        />
                        <div className={clsx(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200",
                            !isGstInvoice
                                ? "bg-gray-200"
                                : watch("isIgst") ? "bg-green-500" : "bg-gray-300"
                        )}>
                            <span
                                className={clsx(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                    isGstInvoice && watch("isIgst") ? "translate-x-5" : "translate-x-0.5"
                                )}
                            />
                        </div>
                        <span className={clsx(
                            "ml-2 font-medium text-sm",
                            isGstInvoice ? "text-gray-700" : "text-gray-400"
                        )}>
                            IGST
                        </span>
                    </label>

                    {/* Auto ref no */}
                    <FormField label='' className="w-44">
                        {/* <label className='ml-auto text-xs -mb-1'>Invoice No</label> */}
                        <input
                            type="text"
                            className={clsx("bg-gray-100 rounded text-sm h-8")}
                            readOnly
                            disabled
                            title="Auto reference number"
                            value={watch("autoRefNo") ?? ''}
                        />
                    </FormField>
                </div>
            </div>

            {/* Main Content Grid - Invoice Only Fields */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Left Column - Invoice Fields */}
                <div className="space-y-4">
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

                {/* Right Column - Remarks */}
                <div className="space-y-4">
                    {/* Remarks */}
                    <FormField label="Remarks">
                        <textarea
                            rows={4}
                            className={clsx(inputFormFieldStyle, "mt-1 text-sm")}
                            placeholder="Add any special instructions or notes..."
                            {...register("remarks")}
                        />
                    </FormField>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetails;