import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SalesReturnFormDataType } from '../all-sales-return';
import { Messages } from '../../../../../utils/messages';
import { CircleCheckBig } from 'lucide-react';
import Decimal from 'decimal.js';

const SalesReturnValidation: React.FC = () => {
    const { formState: { errors }, watch } = useFormContext<SalesReturnFormDataType>();

    const getFormErrorsBySection = () => {
        const sections: { [key: string]: string[] } = {};

        // Sales Return Details validation
        const headerErrors: string[] = [];
        const headerFields = ['tranDate', 'userRefNo', 'gstin', 'contactsData', 'contactDisplayData'];
        Object.entries(errors).forEach(([field, error]) => {
            if (headerFields.includes(field) && error && typeof error === 'object' && 'message' in error) {
                headerErrors.push(error.message as string);
            }
        });
        if (headerErrors.length > 0) {
            sections['📝 Sales Return Details'] = headerErrors;
        }

        // Return Items & Services validation
        const itemErrors: string[] = [];
        const items = watch('salesReturnLineItems') || [];
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
            sections['📦 Return Items & Services'] = itemErrors;
        }

        // Accounting Details validation
        const accountingErrors: (any)[] = [];

        // Debit account validation
        if (!watch('debitAccId')) {
            accountingErrors.push('Debit account (Sale) is required');
        }

        // Credit account validation
        const creditAccount = watch('creditAccount') || {};
        if (!creditAccount.accId) {
            accountingErrors.push(`Refund account is required`);
        }
        if (!creditAccount.amount || creditAccount.amount <= 0) {
            accountingErrors.push(`Refund amount must be greater than zero`);
        }

        // Amount mismatch validation
        const totalInvoiceAmount = watch('totalInvoiceAmount') || new Decimal(0);
        const creditAccountAmount = new Decimal(creditAccount?.amount || 0);
        const returnAmount = totalInvoiceAmount instanceof Decimal ? totalInvoiceAmount.toNumber() : totalInvoiceAmount;
        const refundAmount = creditAccountAmount instanceof Decimal ? creditAccountAmount.toNumber() : creditAccountAmount;
        const diff = returnAmount - refundAmount;

        if (diff !== 0) {
            accountingErrors.push(`Amount mismatch: Return Amount (${returnAmount.toFixed(2)}) must equal Refund Amount (${refundAmount.toFixed(2)}). Difference: ${diff.toFixed(2)}`);
        }

        if (accountingErrors.length > 0) {
            sections['💳 Accounting Details'] = accountingErrors;
        }

        // Other field errors
        const otherErrors: string[] = [];
        const excludedFields = ['debitAccId', 'creditAccount', 'salesReturnLineItems', 'root', ...headerFields];
        Object.entries(errors).forEach(([field, error]) => {
            if (error && typeof error === 'object' && 'message' in error && !excludedFields.includes(field)) {
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
                </div>
                <h2 className="font-semibold text-gray-800 text-lg">Validation Errors</h2>
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

export default SalesReturnValidation;
