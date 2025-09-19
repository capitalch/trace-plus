import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SalesFormDataType } from '../all-sales';
import { Messages } from '../../../../../utils/messages';
import { CircleCheckBig } from 'lucide-react';
// import { Utils } from '../../../../../utils/utils';

const Validation: React.FC = () => {
    const { formState: { errors }, watch } = useFormContext<SalesFormDataType>();
    // const { getDebitCreditDifference }: any = useFormContext<SalesFormDataType>();

    const getFormErrorsBySection = () => {
        const sections: { [key: string]: string[] } = {};

        // Customer Details validation
        const customerErrors: string[] = [];
        if (errors.contactsData) {
            customerErrors.push(errors.contactsData.message || Messages.messRequiredCustomerDetails);
        }
        if (errors.gstin) {
            customerErrors.push(errors.gstin.message || Messages.messGstinValidationFailed);
        }
        if (customerErrors.length > 0) {
            sections['👤 Customer Details'] = customerErrors;
        }

        // Items & Services validation
        const itemErrors: string[] = [];
        const items = watch('salesLineItems') || [];
        items.forEach((item: any, index: number) => {
            if (!item.productCode || item.productCode.trim() === '') {
                itemErrors.push(`Row ${index + 1}: ${Messages.messRequiredProductCode}`);
            }
            if (!item.productDetails || item.productDetails.trim() === '') {
                itemErrors.push(`Row ${index + 1}: ${Messages.messRequiredProductDetails}`);
            }
            if (!item.hsn || item.hsn.trim() === '') {
                itemErrors.push(`Row ${index + 1}: ${Messages.messRequiredHsn}`);
            }
        });
        if (itemErrors.length > 0) {
            sections['📦 Items & Services'] = itemErrors;
        }

        // Payment Details validation
        const paymentErrors: (any)[] = [];
        const debitAccounts = watch('debitAccounts') || [];
        debitAccounts.forEach((account: any, index: number) => {
            if (!account.accId) {
                paymentErrors.push(`Row ${index + 1}: Payment account is required`);
            }
            if (!account.amount || account.amount <= 0) {
                paymentErrors.push(`Row ${index + 1}: Amount must be greater than zero`);
            }
        });

        // Amount balance validation (from form errors)
        if (errors.debitCreditDiffAmount) {
            paymentErrors.push(errors.debitCreditDiffAmount.message || Messages.errAmountSalePaymentMismatch);
        }

        if (paymentErrors.length > 0) {
            sections['💳 Payment Details'] = paymentErrors;
        }

        // Other field errors
        const otherErrors: string[] = [];
        Object.entries(errors).forEach(([field, error]) => {
            if (error && typeof error === 'object' && 'message' in error && !['contactsData', 'gstin', 'shippingInfo', 'debitAccounts', 'salesLineItems', 'debitCreditDiffAmount'].includes(field)) {
                otherErrors.push(error.message as string);
            }
        });
        if (otherErrors.length > 0) {
            sections['📋 Other Fields'] = otherErrors;
        }

        return sections;
    };

    return (
        <div className="p-4 bg-white border-l-4 border-amber-300 rounded-xl shadow-lg max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center mb-2">
                <div className="mr-2 p-2 bg-amber-200 rounded-lg">
                    <CircleCheckBig className="w-5 h-5 text-amber-700" />
                    {/* <span className="font-bold text-sm text-orange-500">🐞</span> */}
                </div>
                <h2 className="font-semibold text-gray-800 text-lg">Validation</h2>
            </div>

            {Object.keys(getFormErrorsBySection()).length > 0 && (
                <div className="max-h-[calc(100%-4rem)] overflow-y-auto space-y-4">
                    {Object.entries(getFormErrorsBySection()).map(([sectionName, sectionErrors]) => (
                        <div key={sectionName} className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <h3 className="font-semibold text-red-700 text-sm mb-2">{sectionName}</h3>
                            <div className="space-y-1">
                                {sectionErrors.map((error, index) => (
                                    <p key={index} className="text-red-600 text-sm pl-2">🚨 {error}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Validation;