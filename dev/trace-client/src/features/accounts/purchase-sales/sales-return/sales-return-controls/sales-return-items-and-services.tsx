import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import clsx from "clsx";
import _ from "lodash";
import { NumericFormat } from "react-number-format";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { ProductInfoType } from "../../../../../controls/components/product-select-from-grid";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import { IconCross } from "../../../../../controls/icons/icon-cross";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { AnimatePresence, motion } from "framer-motion";
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SalesReturnFormDataType } from '../all-sales-return';
import { useValidators } from '../../../../../utils/validators-hook';
import { WidgetAstrix } from '../../../../../controls/widgets/widget-astrix';
import { Messages } from '../../../../../utils/messages';
import { ControlledNumericInput } from '../../../../../controls/components/controlled-numeric-input';
import { WidgetFormErrorMessage } from '../../../../../controls/widgets/widget-form-error-message';
import SalesReturnItemsSummary from './sales-return-items-summary';
import Decimal from 'decimal.js';
import { ShoppingBag } from 'lucide-react';

const SalesReturnItemsAndServices: React.FC = () => {

    // React hooks
    const { isValidHsn } = useValidators();
    const { buCode, branchId, currentFinYear, dbName, decodedDbParamsObject, maxGstRate } = useUtilsInfo();
    const {
        control,
        register,
        setValue,
        getValues,
        watch,
        trigger,
        formState: { errors },
    } = useFormContext<SalesReturnFormDataType>();
    const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
    const { getDefaultSalesReturnLineItem }: any = useFormContext<SalesReturnFormDataType>()
    const { fields, remove, insert, append } = useFieldArray({
        control,
        name: 'salesReturnLineItems'
    });

    const isGstInvoice = watch("isGstInvoice");
    const errorClass = 'bg-red-200 border-red-500';
    const isIgst = watch('isIgst');

    const debouncedPopulateProduct = useMemo(
        () => _.debounce((productCode: string, itemId: number) => {
            populateProductOnProductCode(productCode, itemId);
        }, 2000),
        []
    );

    const onChangeProductCode = useCallback((e: ChangeEvent<HTMLInputElement>, index: number) => {
        debouncedPopulateProduct(e.target.value, index);
    }, [debouncedPopulateProduct]);

    // UseEffect hooks
    useEffect(() => {
        return () => debouncedPopulateProduct.cancel();
    }, [debouncedPopulateProduct]);

    useEffect(() => {
        fields.forEach((_, index) => {
            computeLineItemValues(index)
        })
    }, [fields, isIgst])

    // Ensure we always have at least one item
    useEffect(() => {
        if (fields.length === 0 && getDefaultSalesReturnLineItem) {
            append(getDefaultSalesReturnLineItem());
        }
    }, [fields.length, append, getDefaultSalesReturnLineItem]);

    return (
        <AnimatePresence>
            <div className="relative px-4 py-4 bg-white border-teal-400 border-l-4 rounded-lg shadow-sm mb-4" key={1}>
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-teal-600" />
                    </div>
                    <h2 className="font-semibold text-gray-900 text-lg">Return Items and Services</h2>
                </div>
                {/* Summary */}
                <SalesReturnItemsSummary />

                {fields.map((_, index) => {
                    const lineItemId = watch(`salesReturnLineItems.${index}.id`);
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className={
                                clsx(
                                    "flex flex-wrap items-start mt-2 p-2 gap-2 border rounded-md transition-all duration-200",
                                    currentRowIndex === index ? "bg-green-50 border-l-4 border-l-teal-600" : "bg-white",
                                    lineItemId ? "bg-amber-50 shadow-sm ring-1 ring-amber-200" : ""
                                )}
                            onClick={() => setCurrentRowIndex(index)}
                        >
                            {/* Index */}
                            <div className="flex flex-col w-10 text-xs">
                                <label className="font-semibold">#</label>
                                <div className="flex items-center mt-2 gap-1">
                                    <span>{index + 1}</span>
                                    {lineItemId && (
                                        <div
                                            className="w-2 h-2 bg-amber-500 rounded-full"
                                            title="Existing item"
                                        />
                                    )}
                                </div>
                                <button
                                    aria-label="Clear Line Item"
                                    tabIndex={-1}
                                    type="button"
                                    onClick={() => handleClearLineItem(index)}
                                    className="mt-5.5 text-blue-500"
                                >
                                    <IconClear className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Prod Code | UPC */}
                            <div className="flex flex-col w-28">
                                <label className="font-semibold text-[13px]">Prod Code | UPC {<WidgetAstrix />}</label>
                                <input {...register(`salesReturnLineItems.${index}.productCode`, {
                                    required: Messages.errRequired,
                                    onChange(event) {
                                        onChangeProductCode(event, index);
                                    },
                                })}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    className={clsx(inputFormFieldStyles, 'h-8 mt-1',
                                        errors.salesReturnLineItems?.[index]?.productCode ? errorClass : '')
                                    } />
                                {/* Search Product Button */}
                                <button
                                    tabIndex={-1}
                                    type="button"
                                    className="flex items-center mt-2 text-blue-600 text-sm"
                                    onClick={() => handleProductSearch(index)}
                                >
                                    <IconSearch className="mr-1 w-5 h-5" />
                                    Search
                                </button>
                                {/* UPC Code Display */}
                                <span
                                    tabIndex={-1}
                                    className="mt-1 text-teal-500 text-xs"
                                >
                                    {watch(`salesReturnLineItems.${index}.upcCode`) || "-----------------------"}
                                </span>
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col w-40">
                                <label className="font-semibold text-[13px]">Details {<WidgetAstrix />}</label>
                                <textarea
                                    rows={4}
                                    tabIndex={-1}
                                    {...register(`salesReturnLineItems.${index}.productDetails`, {
                                        required: Messages.errRequired
                                    })}
                                    readOnly
                                    className={clsx("bg-gray-100 text-sm mt-1 font-medium", inputFormFieldStyles,
                                        (errors.salesReturnLineItems?.[index]?.productDetails ? errorClass : ''))} />
                            </div>

                            {/* Remarks */}
                            <div className="flex flex-col w-36">
                                <label className="font-semibold text-[13px]">Remarks</label>
                                <textarea
                                    {...register(`salesReturnLineItems.${index}.lineRemarks`)}
                                    rows={4}
                                    className={clsx("mt-1 text-sm", inputFormFieldStyles)}
                                />
                            </div>

                            {/* HSN | GST Rate */}
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-col w-24">
                                    <label className="font-semibold text-[13px]">HSN {isGstInvoice && <WidgetAstrix />}</label>
                                    <input {...register(`salesReturnLineItems.${index}.hsn`, {
                                        validate: (val) => {
                                            const isRequired = watch("isGstInvoice");
                                            if (isRequired && (!val || val.trim() === "")) {
                                                return Messages.errRequired;
                                            }
                                            if (val && !isValidHsn(val)) {
                                                return Messages.errInvalidHsn;
                                            }
                                            return true;
                                        },
                                    })}
                                        type="text"
                                        pattern="[0-9]*"
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        className={clsx(inputFormFieldStyles, 'h-8 mt-1 text-right', errors.salesReturnLineItems?.[index]?.hsn ? errorClass : '')} />
                                </div>

                                {/* gst rate */}
                                <div className="flex flex-col w-24">
                                    <label className="font-semibold text-[13px]">GST % {isGstInvoice && <WidgetAstrix />}</label>
                                    <ControlledNumericInput
                                        className={clsx("text-right h-8 mt-1 font-medium",
                                            inputFormFieldStyles, errors.salesReturnLineItems?.[index]?.gstRate ? errorClass : '')}
                                        fieldName={`salesReturnLineItems.${index}.gstRate`}
                                        onValueChange={(floatValue) => {
                                            setValue(`salesReturnLineItems.${index}.gstRate`, floatValue ?? 0, { shouldDirty: true, shouldValidate: true })
                                            setPrice(index)
                                            computeLineItemValues(index)
                                        }}
                                        validate={(value) => {
                                            if (isGstInvoice) {
                                                if (value === undefined || value === null || isNaN(value)) {
                                                    return Messages.errRequired
                                                }
                                            }
                                            if (maxGstRate && (value > maxGstRate)) {
                                                return Messages.errGstRateTooHigh;
                                            }
                                            return true;
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Qty */}
                            <div className="flex flex-col w-20">
                                <label className="font-semibold text-[13px]">
                                    Qty
                                    {watch(`salesReturnLineItems.${index}.originalSaleQty`) !== undefined && (
                                        <span className="text-xs text-gray-500 ml-1">
                                            (Max: {watch(`salesReturnLineItems.${index}.originalSaleQty`)})
                                        </span>
                                    )}
                                </label>
                                <ControlledNumericInput
                                    className={clsx("text-right h-8 mt-1",
                                        inputFormFieldStyles, errors.salesReturnLineItems?.[index]?.qty ? errorClass : '')}
                                    fieldName={`salesReturnLineItems.${index}.qty`}
                                    onValueChange={(floatValue) => {
                                        setValue(`salesReturnLineItems.${index}.qty`, floatValue || 0, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                            shouldTouch: true
                                        })
                                        computeLineItemValues(index)
                                    }}
                                    validate={(value) => {
                                        if (value <= 0) {
                                            return Messages.errQtyCannotBeZero;
                                        }
                                        const originalQty = watch(`salesReturnLineItems.${index}.originalSaleQty`);
                                        if (originalQty !== undefined && value > originalQty) {
                                            return `${Messages.errReturnQtyExceedsSaleQty} (${originalQty})`;
                                        }
                                        return true;
                                    }}
                                />
                            </div>

                            {/* Price */}
                            <div className="flex flex-col w-30">
                                <label className="font-semibold text-[13px]">Price</label>
                                <NumericFormat
                                    value={watch(`salesReturnLineItems.${index}.price`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    onChange={(e) => {
                                        const numericValue = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                                        setValue(`salesReturnLineItems.${index}.price`, numericValue, { shouldDirty: true })
                                        setPriceGst(index)
                                        computeLineItemValues(index)
                                    }}
                                    className={clsx("text-right h-8 mt-1 font-medium", inputFormFieldStyles)}
                                />
                            </div>

                            {/* Discount */}
                            <div className="flex flex-col w-24">
                                <label className="font-semibold text-[13px]">Discount(unit)</label>
                                <NumericFormat
                                    value={watch(`salesReturnLineItems.${index}.discount`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onChange={(e) => {
                                        const numericValue = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                                        setValue(`salesReturnLineItems.${index}.discount`, numericValue, { shouldDirty: true })
                                        setPriceGst(index)
                                        computeLineItemValues(index)
                                    }}
                                />
                            </div>

                            {/* Price GST */}
                            <div className="flex flex-col w-30">
                                <label className="font-semibold text-[13px]">Price Gst</label>
                                <NumericFormat
                                    value={watch(`salesReturnLineItems.${index}.priceGst`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    allowNegative={false}
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1 font-medium", inputFormFieldStyles)}
                                    onChange={(e) => {
                                        const numericValue = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                                        setValue(`salesReturnLineItems.${index}.priceGst`, numericValue, { shouldDirty: true })
                                        setPrice(index)
                                        computeLineItemValues(index)
                                    }}
                                    onValueChange={() => {
                                        setPrice(index)
                                        computeLineItemValues(index)
                                    }}
                                />
                            </div>

                            {/* Serials */}
                            <div className="flex flex-col w-40">
                                <label className="font-semibold text-[13px]">Serials</label>
                                <textarea
                                    {...register(`salesReturnLineItems.${index}.serialNumbers`, {
                                        validate: () =>
                                            getSnError(index)
                                    })}
                                    rows={4}
                                    placeholder="Comma-separated serials"
                                    className={
                                        clsx("text-sm mt-1",
                                            inputFormFieldStyles,
                                            errors.salesReturnLineItems?.[index]?.serialNumbers ? errorClass : ''
                                        )} />
                                {errors?.salesReturnLineItems?.[index]?.serialNumbers && <WidgetFormErrorMessage errorMessage={errors?.salesReturnLineItems?.[index]?.serialNumbers?.message} />}
                            </div>

                            {/* Amount and Actions */}
                            <div className="flex flex-col ml-auto w-32">
                                <NumericFormat
                                    value={watch(`salesReturnLineItems.${index}.amount`)}
                                    fixedDecimalScale
                                    thousandSeparator
                                    decimalScale={2}
                                    disabled
                                    readOnly
                                    className={clsx("border-0 text-right font-black text-gray-900", inputFormFieldStyles)}
                                />
                                <div className="flex items-center justify-center mt-4 ml-auto gap-8">
                                    {/* delete */}
                                    <button
                                        type="button"
                                        className={clsx("text-red-500", fields.length === 1 && "cursor-not-allowed opacity-30")}
                                        onClick={() => {
                                            const id = getValues(`salesReturnLineItems.${index}.id`)
                                            if (id) {
                                                const deletedIds = getValues('salePurchDetailsDeletedIds') || []
                                                setValue('salePurchDetailsDeletedIds', [...deletedIds, id])
                                            }
                                            if (fields.length > 1) {
                                                remove(index)
                                                setTimeout(() => {
                                                    if (index === 0) {
                                                        setCurrentRowIndex(0);
                                                    } else {
                                                        setCurrentRowIndex(index - 1);
                                                    }
                                                }, 0);
                                            }
                                        }}
                                        disabled={fields.length === 1}
                                    >
                                        <IconCross className="w-7 h-7" />
                                    </button>
                                    {/* add */}
                                    <button
                                        type="button"
                                        className="p-2.5 text-white ring-2 ring-teal-200 rounded-full shadow-lg transition-all duration-300 hover:from-teal-600 hover:ring-teal-300 hover:scale-105 hover:shadow-xl hover:to-cyan-700 bg-gradient-to-r from-teal-500 to-cyan-600"
                                        onClick={() => handleAddRow(index)}
                                        title="Add new row"
                                    >
                                        <IconPlus className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Summary */}
                <SalesReturnItemsSummary />
            </div>
        </AnimatePresence>
    );

    // Event handlers
    function handleAddRow(index: number) {
        insert(index + 1,
            getDefaultSalesReturnLineItem(),
            { shouldFocus: true }
        );
        setTimeout(() => setCurrentRowIndex(index + 1), 0);
    }

    function handleClearLineItem(index: number) {
        setValue(`salesReturnLineItems.${index}.productId`, null, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.productCode`, '', { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.upcCode`, null, { shouldDirty: true })
        setValue(`salesReturnLineItems.${index}.productDetails`, '', { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.hsn`, '', { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.gstRate`, 0, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.qty`, 1, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.price`, 0, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.priceGst`, 0, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.discount`, 0, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.lineRemarks`, null, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.serialNumbers`, null, { shouldDirty: true });
        trigger();
    }

    function handleProductSearch(itemId: number) {
        Utils.showProductSearch((product: any) => {
            setLineItem(product, itemId);
        });
    }

    // Helper functions

    function computeLineItemValues(index: number) {
        const qty = new Decimal(getValues(`salesReturnLineItems.${index}.qty`) || 0);
        const priceGst = new Decimal(getValues(`salesReturnLineItems.${index}.priceGst`) || 0);
        const gstRate = new Decimal(getValues(`salesReturnLineItems.${index}.gstRate`) || 0);
        const price = priceGst.dividedBy(gstRate.dividedBy(new Decimal(100)).plus(1)).toDecimalPlaces(2);
        const subTotal = qty.times(price).toDecimalPlaces(2);

        const amount = qty.times(priceGst).toDecimalPlaces(2);
        const gst = amount.minus(subTotal).toDecimalPlaces(2);

        if (isIgst) {
            setValue(`salesReturnLineItems.${index}.cgst`, 0);
            setValue(`salesReturnLineItems.${index}.sgst`, 0);
            setValue(`salesReturnLineItems.${index}.igst`, gst.toNumber());
        } else {
            const halfGst = gst.dividedBy(2).toDecimalPlaces(2);
            setValue(`salesReturnLineItems.${index}.cgst`, halfGst.toNumber());
            setValue(`salesReturnLineItems.${index}.sgst`, halfGst.toNumber());
            setValue(`salesReturnLineItems.${index}.igst`, 0);
        }

        setValue(`salesReturnLineItems.${index}.subTotal`, subTotal.toNumber());
        setValue(`salesReturnLineItems.${index}.amount`, amount.toNumber());
        setSummaryValues()
        trigger()
    }

    function getSnError(index: number) {
        const serialNumbers = watch(`salesReturnLineItems.${index}.serialNumbers`);
        const sn = serialNumbers ? serialNumbers.replace(/[,;]$/, "") : "";
        const snCount = sn ? sn.split(/[,;]/).length : 0;
        const qty = watch(`salesReturnLineItems.${index}.qty`);
        let snError = undefined;
        if (snCount !== 0 && snCount !== qty) {
            snError = Messages.errQtySrNoNotMatch;
        }
        return snError;
    }

    async function populateProductOnProductCode(productCode: string, itemId: number) {
        if (!productCode) {
            handleClearLineItem(itemId);
            return;
        }
        const products: (ProductInfoType & { calculatedSalePriceGst: number })[] = await Utils.doGenericQuery({
            buCode: buCode || "",
            dbName: dbName || "",
            dbParams: decodedDbParamsObject,
            sqlId: SqlIdsMap.getProductOnProductCodeUpc,
            sqlArgs: {
                productCodeOrUpc: productCode,
                branchId: branchId || 0,
                finYearId: currentFinYear?.finYearId || 0,
            }
        });
        const product = products?.[0];
        if (_.isEmpty(product)) {
            handleClearLineItem(itemId);
            return;
        }
        setLineItem(product, itemId);
    }

    function setLineItem(product: ProductInfoType & { calculatedSalePriceGst: number }, index: number) {
        setValue(`salesReturnLineItems.${index}.productId`, product.productId, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.productCode`, product.productCode, { shouldDirty: true, shouldValidate: true });
        setValue(`salesReturnLineItems.${index}.productDetails`, `${product.brandName} ${product.catName} ${product.label}}`, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.hsn`, product.hsn ? product.hsn.toString() : '', { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.gstRate`, product.gstRate, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.priceGst`, product.calculatedSalePriceGst, { shouldDirty: true });
        setValue(`salesReturnLineItems.${index}.upcCode`, product.upcCode, { shouldDirty: true });
        setTimeout(() => {
            setPrice(index);
            computeLineItemValues(index);
        }, 0);
    }

    function setPrice(index: number) {
        const priceGst = new Decimal(getValues(`salesReturnLineItems.${index}.priceGst`) || 0);
        const gstRate = new Decimal(getValues(`salesReturnLineItems.${index}.gstRate`) || 0);
        const discount = new Decimal(getValues(`salesReturnLineItems.${index}.discount`) || 0);

        const divisor = gstRate.dividedBy(100).plus(1);
        const price = divisor.gt(0) ? priceGst.dividedBy(divisor).add(discount) : new Decimal(0);

        setValue(`salesReturnLineItems.${index}.price`, price.toDecimalPlaces(2).toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

    function setPriceGst(index: number) {
        const price = new Decimal(getValues(`salesReturnLineItems.${index}.price`) || 0);
        const gstRate = new Decimal(getValues(`salesReturnLineItems.${index}.gstRate`) || 0);
        const discount = new Decimal(getValues(`salesReturnLineItems.${index}.discount`) || 0);

        const multiplier = gstRate.dividedBy(100).plus(1);
        const priceGst = multiplier.times(price.minus(discount));

        setValue(`salesReturnLineItems.${index}.priceGst`, priceGst.toDecimalPlaces(2).toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

    function setSummaryValues() {
        const currentLineItems = getValues("salesReturnLineItems") || [];

        const summary = currentLineItems.reduce(
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
        setValue('totalInvoiceAmount', summary.amount.toDecimalPlaces(2))
        setValue('totalQty', summary.qty)
        setValue('totalCgst', summary.cgst.toDecimalPlaces(2))
        setValue('totalSgst', summary.sgst.toDecimalPlaces(2))
        setValue('totalIgst', summary.igst.toDecimalPlaces(2))
        setValue('totalSubTotal', summary.subTotal.toDecimalPlaces(2))
    }
};

export default SalesReturnItemsAndServices;