import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SalesReturnFormDataType } from '../all-sales-return';
import { Utils } from '../../../../../utils/utils';

const SalesReturnItemsSummary: React.FC = () => {
    const { watch }: any = useFormContext<SalesReturnFormDataType>();

    const lineItems = watch("salesReturnLineItems") || [];

    return (
        <div className="flex flex-wrap items-center mt-2 py-2 w-full font-medium bg-gray-50 border border-gray-200 rounded pl-2">
            {/* Left side - Stats */}
            <div className="flex flex-wrap items-center flex-1 gap-4">
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">Items:</span>
                    <span>{lineItems.length}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">Qty:</span>
                    <span>{Utils.toDecimalFormat(watch('totalQty').toNumber())}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">SubTotal:</span>
                    <span>{watch('totalSubTotal')?.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">CGST:</span>
                    <span>{Utils.toDecimalFormat(watch('totalCgst').toNumber())}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">SGST:</span>
                    <span>{Utils.toDecimalFormat(watch('totalSgst').toNumber())}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">IGST:</span>
                    <span>{Utils.toDecimalFormat(watch('totalIgst').toNumber())}</span>
                </div>
            </div>

            {/* Right side - Total Amount */}
            <div className="flex items-center ml-2 px-3 py-1 bg-teal-50 border-l-2 border-teal-300 rounded gap-1">
                <span className="text-gray-500 text-md">Total:</span>
                <strong className="font-black text-lg ">{Utils.toDecimalFormat(watch('totalInvoiceAmount').toNumber())}</strong>
            </div>
        </div>
    );
};

export default SalesReturnItemsSummary;