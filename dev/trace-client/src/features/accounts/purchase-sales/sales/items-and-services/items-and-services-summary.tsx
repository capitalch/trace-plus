import React, { useState } from 'react';
import { NumericFormat } from "react-number-format";
import { useFormContext, useFieldArray } from 'react-hook-form';
import Decimal from 'decimal.js';
import _ from "lodash";
import { Utils } from "../../../../../utils/utils";
import { IconClear1 } from "../../../../../controls/icons/icon-clear1";
import { SalesFormDataType } from '../all-sales';

const ItemsAndServicesSummary: React.FC = () => {
    const [backCalcTarget, setBackCalcTarget] = useState<number>(0);
    
    const {
        getValues,
        setValue,
        watch,
        control
    } = useFormContext<SalesFormDataType>();
    
    const { fields, remove } = useFieldArray({ control, name: 'salesLineItems' });
    const lineItems = watch("salesLineItems") || [];

    function getSummary() {
        const summary = lineItems.reduce(
            (acc, item) => {
                acc.count += 1;
                acc.qty = acc.qty.plus(new Decimal(item.qty || 0));
                acc.subTotal = acc.subTotal.plus(new Decimal(item.subTotal || 0));
                acc.cgst = acc.cgst.plus(new Decimal(item.cgst || 0));
                acc.sgst = acc.sgst.plus(new Decimal(item.sgst || 0));
                acc.igst = acc.igst.plus(new Decimal(item.igst || 0));
                acc.amount = acc.amount.plus(new Decimal(item.amount || 0));
                return acc;
            },
            {
                count: 0,
                qty: new Decimal(0),
                subTotal: new Decimal(0),
                cgst: new Decimal(0),
                sgst: new Decimal(0),
                igst: new Decimal(0),
                amount: new Decimal(0),
            }
        );
        return (summary)
    }

    function handleBackCalc() {
        if (backCalcTarget <= 0) {
            setBackCalcTarget(0)
            return;
        }
        const summary = getSummary()
        const totalAmount: Decimal = summary.amount
        const factor: Decimal = new Decimal(backCalcTarget).div(totalAmount)
        adjustPricesWithFactor(factor)
    }

    function adjustPricesWithFactor(factor: Decimal) {
        fields.forEach((_, index) => {
            const priceGst: Decimal = new Decimal(getValues(`salesLineItems.${index}.priceGst`) || 0)
            const newPriceGst = priceGst.times(factor).toDecimalPlaces(2)
            setValue(`salesLineItems.${index}.priceGst`, newPriceGst.toNumber(), { shouldDirty: true })
            // Note: setPrice and computeLineItemValues would need to be called here
            // but since we're not passing functions as props, parent component will handle this
        })
        setBackCalcTarget(0)
    }

    function handleClearAll() {
        const deletedIds = getValues('deletedIds') || []
        for (let i = fields.length - 1; i >= 0; i--) {
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
        const summary = getSummary()
        const totalAmount: Decimal = summary.amount
        const newTotalAmount: Decimal = totalAmount.round()
        const factor: Decimal = newTotalAmount.div(totalAmount)
        adjustPricesWithFactor(factor)
    }

    const summary = getSummary();

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
                    <span>{summary.count}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">Qty:</span>
                    <span>{Utils.toDecimalFormat(summary.qty.toNumber())}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">SubTotal:</span>
                    <span>{summary.subTotal.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">CGST:</span>
                    <span>{Utils.toDecimalFormat(summary.cgst.toNumber())}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">SGST:</span>
                    <span>{Utils.toDecimalFormat(summary.sgst.toNumber())}</span>
                </div>
                <div className="flex text-right text-sm gap-1">
                    <span className="text-gray-500">IGST:</span>
                    <span>{Utils.toDecimalFormat(summary.igst.toNumber())}</span>
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
                <strong className="font-black text-lg ">{Utils.toDecimalFormat(summary.amount.toNumber())}</strong>
            </div>
        </div>
    );
};

export default ItemsAndServicesSummary;