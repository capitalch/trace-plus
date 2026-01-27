import React, { useState, useEffect } from 'react';
import _ from 'lodash'
import { Eye, Send, RefreshCw, RotateCcw } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SalesFormDataType } from '../all-sales';
import Decimal from 'decimal.js';
import { Utils } from '../../../../../utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatchType, RootStateType } from '../../../../../app/store';
import { setSalesViewMode } from '../sales-slice';
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconPreview1 } from "../../../../../controls/icons/icon-preview1";
import { generateSalesInvoicePDF } from '../all-sales-invoice-jspdf';
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { WidgetModeIndicatorBadge } from "../../../../../controls/widgets/widget-mode-indicator-badge";
import { useSalesPermissions } from "../../../../../utils/permissions/permissions-hooks";
import { PDFViewerModal } from "../pdf-viewer-modal";
import { useSalesContext } from "../sales-context";

const StatusBar: React.FC = () => {
    const dispatch: AppDispatchType = useDispatch();
    const lastSalesEditData = useSelector((state: RootStateType) => state.sales.lastSalesEditData);
    const { control, getValues, formState: { errors, isSubmitting, isDirty, isValid } } = useFormContext<SalesFormDataType>();
    const { getDebitCreditDifference, populateFormOverId, resetAll } = useSalesContext();
    const { branchId, branchName, branchAddress, branchGstin, currentDateFormat } = useUtilsInfo();

    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    // ✅ Get sales permissions
    const { canCreate, canEdit, canView, canPreview } = useSalesPermissions()
    const salesId = getValues("id")
    const isEditMode = !!salesId
    const canSubmit = isEditMode ? canEdit : canCreate
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
        const salesEditData = getValues('salesEditData');

        // ✅ Only show if user has preview permission and we have data
        // Show preview if we have either:
        // 1. Current form data (id or salesEditData)
        // 2. Last saved sales data from Redux
        if (canPreview && (id || salesEditData || lastSalesEditData)) {
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
        let salesEditData: any = lastSalesEditData || {};

        if (_.isEmpty(salesEditData)) {
            salesEditData = getValues('salesEditData') || {};
        }

        if (_.isEmpty(salesEditData)) return;
        const blobUrl = generateSalesInvoicePDF(salesEditData, branchId, branchName || '', branchAddress, branchGstin, currentDateFormat);
        setPdfBlobUrl(blobUrl);
        setPdfModalOpen(true);
    };

    useEffect(() => {
        return () => {
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [pdfBlobUrl]);

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
                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                        <span className="text-md whitespace-nowrap">Debits: {debits.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                        <span className="text-md whitespace-nowrap">Credits: {credits.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${diff !== 0 ? 'bg-red-500' : 'bg-amber-500'} rounded-full shrink-0`}></div>
                        <span className={`text-md whitespace-nowrap ${diff !== 0 ? 'text-red-600' : ''}`}>Diff (Credits - Debits): {Utils.toDecimalFormat(diff)}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-start gap-3 md:justify-end">
                    {getPrintPreview()}
                    <button
                        type='button'
                        onClick={handleRefresh}
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-cyan-500 rounded-md shadow-sm transition-colors hover:bg-cyan-600 space-x-2"
                    >
                        <RefreshCw size={16} className="shrink-0" />
                        <span>REFRESH</span>
                    </button>
                    <button
                        type='button'
                        onClick={handleReset}
                        className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-orange-500 rounded-md shadow-sm transition-colors hover:bg-orange-600 space-x-2"
                    >
                        <RotateCcw size={16} className="shrink-0" />
                        <span>RESET</span>
                    </button>
                    {/* ✅ View button - Only show if user has permission */}
                    {canView && (
                        <button
                            onClick={handleView}
                            type='button'
                            className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-purple-500 rounded-md shadow-sm transition-colors hover:bg-purple-600 space-x-2"
                        >
                            <Eye size={16} className="shrink-0" />
                            <span>VIEW</span>
                        </button>
                    )}
                    {/* ✅ Submit button - Only show if user has permission */}
                    {canSubmit && (
                        <button
                            type='submit'
                            disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || (!isValid)}
                            className={`flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap rounded-md shadow-sm transition-colors space-x-2 ${isSubmitting || !_.isEmpty(errors) || !isDirty || (!isValid)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                                }`}
                        >
                            <Send size={16} className="shrink-0" />
                            <span>{isEditMode ? "UPDATE" : "SUBMIT"}</span>
                        </button>
                    )}
                </div>
            </div>

            <PDFViewerModal
                isOpen={pdfModalOpen}
                onClose={() => setPdfModalOpen(false)}
                pdfBlobUrl={pdfBlobUrl}
                title="Sales Invoice"
            />
        </div>
    );
};

export default StatusBar;