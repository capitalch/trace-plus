import React from 'react';
import _ from 'lodash'
import { Eye, Send, RefreshCw, RotateCcw } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { SalesReturnFormDataType } from '../all-sales-return';
import Decimal from 'decimal.js';
import { Utils } from '../../../../../utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatchType, RootStateType } from '../../../../../app/store';
import { setSalesReturnViewMode } from '../sales-return-slice';
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconPreview1 } from "../../../../../controls/icons/icon-preview1";
import { generateSalesReturnInvoicePDF } from '../all-sales-return-invoice-jspdf';
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { WidgetModeIndicatorBadge } from "../../../../../controls/widgets/widget-mode-indicator-badge";

const SalesReturnStatusBar: React.FC = () => {
    const dispatch: AppDispatchType = useDispatch();
    const lastSalesReturnEditData = useSelector((state: RootStateType) => state.salesReturn.lastSalesReturnEditData);
    const { getValues, formState: { errors, isSubmitting, isDirty, isValid } } = useFormContext<SalesReturnFormDataType>();
    const { populateFormOverId, resetAll }: any = useFormContext<SalesReturnFormDataType>();
    const { branchId, branchName, branchAddress, branchGstin, currentDateFormat } = useUtilsInfo();
    const totalInvoiceAmount = getValues('totalInvoiceAmount') || new Decimal(0);
    const creditAccount = getValues('creditAccount') || {};
    const totalRefundAmount = new Decimal(creditAccount?.amount || 0);

    const returnAmount = totalInvoiceAmount instanceof Decimal ? totalInvoiceAmount.toNumber() : totalInvoiceAmount;
    const refundAmount = totalRefundAmount instanceof Decimal ? totalRefundAmount.toNumber() : totalRefundAmount;
    const diff = returnAmount - refundAmount;

    const handleView = () => {
        dispatch(setSalesReturnViewMode(true));
        resetAll();
    };

    const handleRefresh = async () => {
        const id = getValues('id');
        if (id) {
            await populateFormOverId(id);
        } else {
            resetAll();
        }
    };

    const handleReset = () => {
        resetAll();
    };

    const getPrintPreview = () => {
        const id = getValues('id');
        const salesReturnEditData = getValues('salesReturnEditData');

        // Show preview if we have either current form data or last saved data
        if (id || salesReturnEditData || lastSalesReturnEditData) {
            return (
                <TooltipComponent content='Print Preview' className="flex">
                    <button type='button' onClick={handleOnPreview}>
                        <IconPreview1 className="w-8 h-8 text-blue-500 hover:text-blue-600" />
                    </button>
                </TooltipComponent>
            );
        }
        return null;
    };

    const handleOnPreview = () => {
        // Prioritize last saved data, fallback to current form data
        let salesReturnEditData: any = lastSalesReturnEditData || {};

        if (_.isEmpty(salesReturnEditData)) {
            salesReturnEditData = getValues('salesReturnEditData') || {};
        }

        if (_.isEmpty(salesReturnEditData)) return;
        generateSalesReturnInvoicePDF(salesReturnEditData, branchId, branchName || '', branchAddress, branchGstin, currentDateFormat);
    };

    return (
        <div className="relative mr- px-4 py-3 text-gray-800 bg-gray-100 border rounded-lg">
            {/* Mode Badge - Top Left Corner */}
            <div className="absolute -top-4 -left-5 z-10">
                <WidgetModeIndicatorBadge isEditMode={!!getValues('id')} />
            </div>

            <div className="grid items-center gap-4 grid-cols-1 md:gap-8 md:grid-cols-[auto_1fr]">
                {/* Status Indicators */}
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
                        <span className="text-md whitespace-nowrap">Return Amount: {Utils.toDecimalFormat(returnAmount)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0"></div>
                        <span className="text-md whitespace-nowrap">Refund Amount: {Utils.toDecimalFormat(refundAmount)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${diff !== 0 ? 'bg-red-500' : 'bg-amber-500'} rounded-full flex-shrink-0`}></div>
                        <span className={`text-md whitespace-nowrap ${diff !== 0 ? 'text-red-600' : ''}`}>Diff (Return - Refund): {Utils.toDecimalFormat(diff)}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-start gap-3 md:justify-end">
                    {getPrintPreview()}
                    {/* Refresh */}
                    <button
                        type='button'
                        onClick={handleRefresh}
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-cyan-500 rounded-md shadow-sm transition-colors hover:bg-cyan-600 space-x-2"
                    >
                        <RefreshCw size={16} className="flex-shrink-0" />
                        <span>REFRESH</span>
                    </button>
                    {/* Reset */}
                    <button
                        type='button'
                        onClick={handleReset}
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-orange-500 rounded-md shadow-sm transition-colors hover:bg-orange-600 space-x-2"
                    >
                        <RotateCcw size={16} className="flex-shrink-0" />
                        <span>RESET</span>
                    </button>
                    {/* View */}
                    <button
                        onClick={handleView}
                        type='button'
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-purple-500 rounded-md shadow-sm transition-colors hover:bg-purple-600 space-x-2"
                    >
                        <Eye size={16} className="flex-shrink-0" />
                        <span>VIEW</span>
                    </button>
                    {/* Submit */}
                    <button
                        type='submit'
                        disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || (!isValid) || diff !== 0}
                        className={`flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap rounded-md shadow-sm transition-colors space-x-2 ${isSubmitting || !_.isEmpty(errors) || !isDirty || (!isValid) || diff !== 0
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

export default SalesReturnStatusBar;
