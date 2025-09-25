import React from 'react';
import _ from 'lodash'
import { Eye, Send, RefreshCw } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SalesFormDataType } from '../all-sales';
import Decimal from 'decimal.js';
import { Utils } from '../../../../../utils/utils';
import { useDispatch } from 'react-redux';
import { AppDispatchType } from '../../../../../app/store';
import { setSalesViewMode } from '../sales-slice';

const StatusBar: React.FC = () => {
    const dispatch: AppDispatchType = useDispatch();
    const { control, getValues, formState: { errors, isSubmitting, isDirty, isValid } } = useFormContext<SalesFormDataType>();
    const { getDebitCreditDifference, populateFormOverId, resetAll }: any = useFormContext<SalesFormDataType>();
    // const { resetAll }: any = useFormContext<SalesFormDataType>()
    // Using useWatch is more effecient
    const totalInvoiceAmount = useWatch({
        control,
        name: 'totalInvoiceAmount',
        defaultValue: new Decimal(0)
    });

    const totalDebitAmount = useWatch({
        control,
        name: 'totalDebitAmount',
        defaultValue: new Decimal(0)
    });

    const debits = totalDebitAmount instanceof Decimal ? totalDebitAmount.toNumber() : totalDebitAmount;
    const credits = totalInvoiceAmount instanceof Decimal ? totalInvoiceAmount.toNumber() : totalInvoiceAmount;
    const diff = getDebitCreditDifference()

    const handleView = () => {
        dispatch(setSalesViewMode(true));
    };

    const handleRefresh = async () => {
        const id = getValues('id');
        if (id) {
            await populateFormOverId(id);
        } else {
            resetAll();
        }
    };

    return (
        <div className="mr- px-4 py-3 text-gray-800 bg-gray-100 border rounded-lg">
            <div className="grid items-center gap-4 grid-cols-1 md:gap-8 md:grid-cols-[auto_1fr]">
                {/* Status Indicators */}
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-md whitespace-nowrap">Debits: {debits.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-md whitespace-nowrap">Credits: {credits.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${diff !== 0 ? 'bg-red-500' : 'bg-amber-500'} rounded-full flex-shrink-0`}></div>
                        <span className={`text-md whitespace-nowrap ${diff !== 0 ? 'text-red-600' : ''}`}>Diff (Credits - Debits): {Utils.toDecimalFormat(diff)}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-start gap-3 md:justify-end">
                    <button
                        type='button'
                        onClick={handleRefresh}
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-cyan-500 rounded-md shadow-sm transition-colors hover:bg-cyan-600 space-x-2"
                    >
                        <RefreshCw size={16} className="flex-shrink-0" />
                        <span>REFRESH</span>
                    </button>
                    <button
                        onClick={handleView}
                        type='button'
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-purple-500 rounded-md shadow-sm transition-colors hover:bg-purple-600 space-x-2"
                    >
                        <Eye size={16} className="flex-shrink-0" />
                        <span>VIEW</span>
                    </button>
                    <button
                        type='submit'
                        disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || (!isValid)}
                        className={`flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap rounded-md shadow-sm transition-colors space-x-2 ${isSubmitting || !_.isEmpty(errors) || !isDirty || (!isValid)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        <Send size={16} className="flex-shrink-0" />
                        <span>SUBMIT</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;