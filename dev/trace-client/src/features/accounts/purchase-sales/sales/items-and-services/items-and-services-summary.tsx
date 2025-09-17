import React, { useState } from 'react';
import { NumericFormat } from "react-number-format";
import { useFormContext, UseFieldArrayRemove } from 'react-hook-form';
import Decimal from 'decimal.js';
import _ from "lodash";
import { Utils } from "../../../../../utils/utils";
import { IconClear1 } from "../../../../../controls/icons/icon-clear1";
import { SalesFormDataType } from '../all-sales';

interface ItemsAndServicesSummaryProps {
    remove: UseFieldArrayRemove;
}

const ItemsAndServicesSummary: React.FC<ItemsAndServicesSummaryProps> = ({remove}) => {
    const [backCalcTarget, setBackCalcTarget] = useState<number>(0);

    const {
        getValues,
        setValue,
        watch,
    }: any = useFormContext<SalesFormDataType>();

    const lineItems = watch("salesLineItems") || [];

    return (
        <div className="flex flex-wrap items-center mt-2 py-2 w-full font-medium bg-gray-50 border border-gray-200 rounded">
            {/* Left side - Controls and stats */}
            <div className="flex flex-wrap items-center flex-1 gap-4">
                {/* Clear All Button */}
                <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex items-center ml-2 px-4 py-1 text-gray-500 text-sm bg-amber-100 rounded-sm hover:bg-amber-200 gap-1"
                >
                    <IconClear1 className="w-3 h-3" />
                    Clear All Rows
                </button>

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

            {/* Center - Controls */}
            <div className="flex items-center gap-1">
                {/* Round Off Button */}
                <button
                    type="button"
                    onClick={handleRoundOff}
                    className="px-2 py-1 font-semibold text-blue-700 text-sm bg-blue-100 rounded transition-colors hover:bg-blue-200"
                >
                    Round Off
                </button>

                {/* Back Calc Section */}
                <div className="flex items-center px-2 py-1 bg-white border border-gray-200 rounded gap-1">
                    <button
                        type="button"
                        onClick={handleBackCalc}
                        className="px-2 py-1 font-semibold text-sm text-white bg-teal-500 rounded transition-colors hover:bg-teal-600"
                    >
                        Back Cal
                    </button>
                    <NumericFormat
                        value={backCalcTarget}
                        thousandSeparator
                        decimalScale={2}
                        fixedDecimalScale
                        placeholder="Amount"
                        className="px-1 py-0.5 w-30 font-normal text-right text-x border border-gray-300 rounded focus:border-teal-500 focus:outline-none"
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleBackCalc();
                            }
                        }}
                        onValueChange={({ floatValue }) => {
                            setBackCalcTarget(floatValue ?? 0);
                        }}
                    />
                </div>
            </div>

            {/* Right side - Total Amount */}
            <div className="flex items-center ml-2 px-3 py-1 bg-green-50 border-l-2 border-teal-300 rounded gap-1">
                <span className="text-gray-500 text-md">Total:</span>
                <strong className="font-black text-lg ">{Utils.toDecimalFormat(watch('totalInvoiceAmount').toNumber())}</strong>
            </div>
        </div>
    );

    function handleBackCalc() {
        if (backCalcTarget <= 0) {
            setBackCalcTarget(0)
            return;
        }
        // setSummaryValues()
        const totalAmount: Decimal = getValues('totalInvoiceAmount')
        const factor: Decimal = new Decimal(backCalcTarget).div(totalAmount)
        adjustPricesWithFactor(factor)
    }

    function adjustPricesWithFactor(factor: Decimal) {
        lineItems.forEach((_: any, index: number) => {
            const priceGst: Decimal = new Decimal(getValues(`salesLineItems.${index}.priceGst`) || 0)
            const newPriceGst = priceGst.times(factor).toDecimalPlaces(2)
            setValue(`salesLineItems.${index}.priceGst`, newPriceGst.toNumber(), { shouldDirty: true })
        })
        setBackCalcTarget(0)
    }

    function handleClearAll() {
        const deletedIds = getValues('deletedIds') || []
        for (let i = lineItems.length - 1; i >= 0; i--) {
            const id = getValues(`salesLineItems.${i}.id`)
            if (id) {
                deletedIds.push(id)
            }
            remove(i);
        }
        if (!_.isEmpty(deletedIds)) {
            setValue('deletedIds', [...deletedIds])
        }
    }

    function handleRoundOff() {
        // setSummaryValues()
        const totalAmount: Decimal = getValues('totalInvoiceAmount')
        const newTotalAmount: Decimal = totalAmount.round()
        const factor: Decimal = newTotalAmount.div(totalAmount)
        adjustPricesWithFactor(factor)
    }

};

export default ItemsAndServicesSummary;