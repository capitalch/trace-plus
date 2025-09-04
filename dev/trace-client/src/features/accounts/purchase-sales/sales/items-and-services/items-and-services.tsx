import React, { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import clsx from "clsx";
import _ from "lodash";
import { NumericFormat } from "react-number-format";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { ProductInfoType, ProductSelectFromGrid } from "../../../../../controls/components/product-select-from-grid";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import { IconCross } from "../../../../../controls/icons/icon-cross";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { IconClear1 } from "../../../../../controls/icons/icon-clear1";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { AnimatePresence, motion } from "framer-motion";
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SalesFormDataType } from '../all-sales';
import { useValidators } from '../../../../../utils/validators-hook';
import { WidgetAstrix } from '../../../../../controls/widgets/widget-astrix';
import { Messages } from '../../../../../utils/messages';
import { ControlledNumericInput } from '../../../../../controls/components/controlled-numeric-input';
import { WidgetFormErrorMessage } from '../../../../../controls/widgets/widget-form-error-message';
import Decimal from 'decimal.js';

const ItemsAndServices: React.FC = () => {
    // React hooks
    const { isValidHsn } = useValidators();
    const { buCode, dbName, decodedDbParamsObject, defaultGstRate, maxGstRate } = useUtilsInfo();
    const {
        control,
        register,
        setValue,
        getValues,
        watch,
        trigger,
        formState: { errors },
    } = useFormContext<SalesFormDataType>();
    const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
    const [roundOff, /*setRoundOff*/] = useState<number>(0);
    const [backCalcTarget, setBackCalcTarget] = useState<number>(0);
    const { getDefaultSalesLineItem }: any = useFormContext<SalesFormDataType>()
    const { fields, remove, insert, append } = useFieldArray({ control, name: 'salesLineItems' });
    const isGstInvoice = watch("isGstInvoice");
    const errorClass = 'bg-red-200 border-red-500';
    const lineItems = watch("salesLineItems") || [];
    const isIgst = watch('isIgst');

    const getDefaultLineItem = useCallback(() => {
        const lineItem = getDefaultSalesLineItem();
        lineItem.gstRate = defaultGstRate || 0;
        return lineItem;
    }, [defaultGstRate, getDefaultSalesLineItem]);

    const handleClearLineItem = useCallback((index: number) => {
        setValue(`salesLineItems.${index}.productId`, null, { shouldDirty: true });
        setValue(`salesLineItems.${index}.productCode`, '', { shouldDirty: true });
        setValue(`salesLineItems.${index}.upcCode`, null, { shouldDirty: true })
        setValue(`salesLineItems.${index}.productDetails`, '', { shouldDirty: true });
        setValue(`salesLineItems.${index}.hsn`, '', { shouldDirty: true });
        setValue(`salesLineItems.${index}.gstRate`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.qty`, 1, { shouldDirty: true });
        setValue(`salesLineItems.${index}.price`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.discount`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.lineRemarks`, null, { shouldDirty: true });
        setValue(`salesLineItems.${index}.serialNumbers`, null, { shouldDirty: true });
        trigger();
    }, [setValue, trigger]);

    const setLineItem = useCallback((product: ProductInfoType & { calculatedSalePriceGst: number }, index: number) => {
        setValue(`salesLineItems.${index}.productId`, product.productId, { shouldDirty: true });
        setValue(`salesLineItems.${index}.productCode`, product.productCode, { shouldDirty: true, shouldValidate: true });
        setValue(`salesLineItems.${index}.productDetails`, `${product.brandName} ${product.catName} ${product.label}}`, { shouldDirty: true });
        setValue(`salesLineItems.${index}.hsn`, product.hsn ? product.hsn.toString() : '', { shouldDirty: true });
        setValue(`salesLineItems.${index}.gstRate`, product.gstRate, { shouldDirty: true });
        setValue(`salesLineItems.${index}.priceGst`, product.calculatedSalePriceGst, { shouldDirty: true });
        setValue(`salesLineItems.${index}.upcCode`, product.upcCode, { shouldDirty: true });
        setTimeout(() => {
            trigger()
        }, 0);
    }, [setValue, trigger]);

    const populateProductOnProductCode = useCallback(async (productCode: string, itemId: number) => {
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
                productCodeOrUpc: productCode
            }
        });
        const product = products?.[0];
        if (_.isEmpty(product)) {
            handleClearLineItem(itemId);
            return;
        }
        setLineItem(product, itemId);
    }, [buCode, dbName, decodedDbParamsObject, handleClearLineItem, setLineItem]);

    const onChangeProductCode = useMemo(
        () =>
            _.debounce((e: ChangeEvent<HTMLInputElement>, index: number) => {
                populateProductOnProductCode(e.target.value, index);
            }, 2000), [populateProductOnProductCode]
    );

    const setPriceGst = useCallback((index: number) => {
        const price = new Decimal(watch(`salesLineItems.${index}.price`) || 0);
        const gstRate = new Decimal(watch(`salesLineItems.${index}.gstRate`) || 0);

        const multiplier = gstRate.dividedBy(100).plus(1);
        const priceGst = multiplier.times(price);

        setValue(`salesLineItems.${index}.priceGst`, priceGst.toDecimalPlaces(2).toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }, [watch, setValue]);

    const computeLineItemValues = useCallback((index: number) => {
        const qty = new Decimal(watch(`salesLineItems.${index}.qty`) || 0);
        const price = new Decimal(watch(`salesLineItems.${index}.price`) || 0);
        const discount = new Decimal(watch(`salesLineItems.${index}.discount`) || 0);
        const gstRate = new Decimal(watch(`salesLineItems.${index}.gstRate`) || 0);
        const base = price.minus(discount);
        const subTotal = qty.times(base).toDecimalPlaces(2);
        const multiplier = gstRate.dividedBy(new Decimal(100)).plus(1);
        const amount = subTotal.times(multiplier).toDecimalPlaces(2)
        const gst = subTotal.times(gstRate.dividedBy(new Decimal(100)))
        if (isIgst) {
            setValue(`salesLineItems.${index}.cgst`, 0)
            setValue(`salesLineItems.${index}.sgst`, 0)
            setValue(`salesLineItems.${index}.igst`, gst.toDecimalPlaces(2).toNumber())
        } else {
            const halfGst = gst.dividedBy(2).toDecimalPlaces(2);
            setValue(`salesLineItems.${index}.cgst`, halfGst.toNumber())
            setValue(`salesLineItems.${index}.sgst`, halfGst.toNumber())
            setValue(`salesLineItems.${index}.igst`, 0)
        }

        setValue(`salesLineItems.${index}.subTotal`, subTotal.toNumber())
        setValue(`salesLineItems.${index}.amount`, amount.toNumber())
        setPriceGst(index)
        trigger()
    }, [watch, isIgst, setValue, setPriceGst, trigger]);

    function getSnError(index: number) {
        const serialNumbers = watch(`salesLineItems.${index}.serialNumbers`);
        const sn = serialNumbers ? serialNumbers.replace(/[,;]$/, "") : "";
        const snCount = sn ? sn.split(/[,;]/).length : 0;
        const qty = watch(`salesLineItems.${index}.qty`);
        let snError = undefined;
        if (snCount !== 0 && snCount !== qty) {
            snError = Messages.errQtySrNoNotMatch;
        }
        return snError;
    }

    function setPrice(index: number) {
        const priceGst = new Decimal(watch(`salesLineItems.${index}.priceGst`) || 0);
        const gstRate = new Decimal(watch(`salesLineItems.${index}.gstRate`) || 0);

        const divisor = gstRate.dividedBy(100).plus(1);
        const price = divisor.gt(0) ? priceGst.dividedBy(divisor) : new Decimal(0);

        setValue(`salesLineItems.${index}.price`, price.toDecimalPlaces(2).toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

    useEffect(() => {
        return () => onChangeProductCode.cancel();
    }, [onChangeProductCode]);

    useEffect(() => {
        if (lineItems.length === 0) {
            append(getDefaultLineItem());
        }
    }, [lineItems.length, append, getDefaultLineItem]);

    useEffect(() => {
        fields.forEach((_, index) => {
            computeLineItemValues(index)
        })
    }, [fields, isIgst, computeLineItemValues])

    // Event handlers
    const handleAddRow = (index: number) => {
        insert(index + 1,
            getDefaultLineItem(),
            { shouldFocus: true }
        );
        setTimeout(() => setCurrentRowIndex(index + 1), 0);
    };

    const handleClearAll = () => {
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
        setTimeout(() => setCurrentRowIndex(0), 0);
    };

    const handleRoundOff = () => {
        // const totals = calculateTotals();
        // const totalBeforeRoundOff = parseFloat(totals.totalBeforeRoundOff);
        // const roundedTotal = Math.round(totalBeforeRoundOff);
        // const roundOffValue = roundedTotal - totalBeforeRoundOff;
        // setRoundOff(roundOffValue);
    };

    const handleBackCalc = () => {
        // if (backCalcTarget <= 0) {
        //     Utils.showErrorMessage("Please enter a valid target amount");
        //     return;
        // }

        // const currentTotals = calculateTotals();
        // const currentTotal = parseFloat(currentTotals.totalBeforeRoundOff);

        // if (currentTotal <= 0) {
        //     Utils.showErrorMessage("No items to calculate backwards from");
        //     return;
        // }

        // // Calculate the adjustment factor
        // const adjustmentFactor = (backCalcTarget - roundOff) / currentTotal;

        // // Adjust prices proportionally
        // const updatedItems = items.map(item => {
        //     if (item.price > 0) {
        //         return {
        //             ...item,
        //             price: parseFloat((item.price * adjustmentFactor).toFixed(2))
        //         };
        //     }
        //     return item;
        // });

        // setItems(updatedItems);
        // // Clear the input after successful calculation
        // setBackCalcTarget(0);
    };

    function handleProductSearch(itemId: number) {
        Utils.showHideModalDialogA({
            isOpen: true,
            size: "lg",
            element: <ProductSelectFromGrid onSelect={(product: any) => setLineItem(product, itemId)} />,
            title: "Select a product"
        });
    }

    // Render helper methods
    function getSummaryMarkup() {
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

                    {/* <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">Items:</span>
                        <span>{items.length}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">Qty:</span>
                        <span>{Utils.toDecimalFormat(items.reduce((sum, item) => sum + (item.qty || 0), 0))}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">SubT:</span>
                        <span>{parseFloat(totals.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">CGST:</span>
                        <span>{Utils.toDecimalFormat(parseFloat(totals.cgst))}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">SGST:</span>
                        <span>{Utils.toDecimalFormat(parseFloat(totals.sgst))}</span>
                    </div>
                    <div className="flex text-right text-xs gap-1">
                        <span className="text-gray-500">IGST:</span>
                        <span>{Utils.toDecimalFormat(parseFloat(totals.igst))}</span>
                    </div> */}

                    {/* Round Off Display */}
                    {roundOff !== 0 && (
                        <div className="flex text-right text-xs gap-1">
                            <span className="text-gray-500">RndOff:</span>
                            <span className={roundOff >= 0 ? "text-green-600" : "text-blue-600"}>
                                {roundOff >= 0 ? '+' : ''}{Utils.toDecimalFormat(roundOff)}
                            </span>
                        </div>
                    )}
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
                    {roundOff !== 0 && (
                        <button
                            type="button"
                            // onClick={handleRemoveRoundOff}
                            className="px-2 py-1 font-semibold text-gray-700 bg-gray-100 rounded transition-colors hover:bg-gray-200"
                        >
                            Remove
                        </button>
                    )}

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
                            onValueChange={({ floatValue }) => {
                                setBackCalcTarget(floatValue ?? 0);
                            }}
                        />
                    </div>
                </div>

                {/* Right side - Total Amount */}
                <div className="flex items-center ml-2 px-3 py-1 bg-green-50 border-l-2 border-teal-300 rounded gap-1">
                    <span className="font-black text-gray-700 text-sm">Total:</span>
                    {/* <strong className="font-black text-base text-green-700">{Utils.toDecimalFormat(parseFloat(totals.total))}</strong> */}
                </div>
            </div>
        );
    }

    // const totals = calculateTotals();

    return (
        <AnimatePresence>
            <div className="flex flex-col -mt-4">
                <label className="font-medium">Items & Services</label>

                {/* Summary */}
                {getSummaryMarkup()}

                {fields.map((item, index) => {
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className={
                                clsx(
                                    "flex flex-wrap items-start mt-2 p-2 gap-2 border rounded-md",
                                    currentRowIndex === index ? "bg-green-100 border-l-4 border-l-teal-600" : "bg-white"
                                )}
                            onClick={() => setCurrentRowIndex(index)}
                        >
                            {/* Index */}
                            <div className="flex flex-col w-10 text-xs">
                                <label className="font-semibold">#</label>
                                <span className="mt-2">{index + 1}</span>
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
                            <div className="flex flex-col w-28 text-xs">
                                <label className="font-semibold">Prod Code | UPC {<WidgetAstrix />}</label>
                                <input {...register(`salesLineItems.${index}.productCode`, {
                                    required: Messages.errRequired,
                                    onChange(event) {
                                        onChangeProductCode(event, index);
                                    },
                                })}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    className={clsx(inputFormFieldStyles, 'h-8 mt-1',
                                        errors.salesLineItems?.[index]?.productCode ? errorClass : '')
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
                                    {watch(`salesLineItems.${index}.upcCode`) || "-----------------------"}
                                </span>
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col w-40 text-xs">
                                <label className="font-semibold">Details {<WidgetAstrix />}</label>
                                <textarea
                                    rows={4}
                                    tabIndex={-1}
                                    {...register(`salesLineItems.${index}.productDetails`, {
                                        required: Messages.errRequired
                                    })}
                                    readOnly
                                    className={clsx("bg-gray-100 text-sm mt-1", inputFormFieldStyles,
                                        (errors.salesLineItems?.[index]?.productDetails ? errorClass : ''))} />
                            </div>

                            {/* Remarks */}
                            <div className="flex flex-col w-36 text-xs">
                                <label className="font-semibold">Remarks</label>
                                <textarea
                                    {...register(`salesLineItems.${index}.lineRemarks`)}
                                    rows={4}
                                    className={clsx("mt-1 text-sm", inputFormFieldStyles)}
                                />
                            </div>

                            {/* HSN | GST Rate */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex flex-col w-24 text-xs">
                                    <label className="font-semibold">HSN {isGstInvoice && <WidgetAstrix />}</label>
                                    <input {...register(`salesLineItems.${index}.hsn`, {
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
                                        className={clsx(inputFormFieldStyles, 'h-8 mt-1 text-right', errors.salesLineItems?.[index]?.hsn ? errorClass : '')} />
                                </div>
                                <div className="flex flex-col w-24 text-xs">
                                    <label className="font-semibold">GST % {isGstInvoice && <WidgetAstrix />}</label>
                                    <ControlledNumericInput
                                        className={clsx("text-right h-8 mt-1",
                                            inputFormFieldStyles, errors.salesLineItems?.[index]?.gstRate ? errorClass : '')}
                                        fieldName={`salesLineItems.${index}.gstRate`}
                                        onValueChange={(floatValue) => {
                                            setValue(`salesLineItems.${index}.gstRate`, floatValue ?? 0, { shouldDirty: true, shouldValidate: true })
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
                            <div className="flex flex-col w-20 text-xs">
                                <label className="font-semibold">Qty</label>
                                <ControlledNumericInput
                                    className={clsx("text-right h-8 mt-1",
                                        inputFormFieldStyles, errors.salesLineItems?.[index]?.qty ? errorClass : '')}
                                    fieldName={`salesLineItems.${index}.qty`}
                                    onValueChange={(floatValue) => {
                                        setValue(`salesLineItems.${index}.qty`, floatValue || 0, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                            shouldTouch: true
                                        })
                                        computeLineItemValues(index)
                                    }}
                                    validate={(value) => {
                                        const ret = value > 0 ? true : Messages.errQtyCannotBeZero;
                                        return (ret)
                                    }}
                                />
                            </div>

                            {/* Price */}
                            <div className="flex flex-col w-30 text-xs">
                                <label className="font-semibold">Price</label>
                                <NumericFormat
                                    value={watch(`salesLineItems.${index}.price`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    onChange={() => {
                                        setPriceGst(index)
                                    }}
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onValueChange={({ floatValue }) => {
                                        setValue(`salesLineItems.${index}.price`, floatValue ?? 0, { shouldDirty: true })
                                        computeLineItemValues(index)
                                    }}
                                />
                            </div>

                            {/* Discount */}
                            <div className="flex flex-col w-24 text-xs">
                                <label className="font-semibold">Discount(unit)</label>
                                <NumericFormat
                                    value={watch(`salesLineItems.${index}.discount`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onValueChange={({ floatValue }) => {
                                        setValue(`salesLineItems.${index}.discount`, floatValue ?? 0, { shouldDirty: true })
                                        computeLineItemValues(index)
                                    }}
                                />
                            </div>

                            {/* Price GST */}
                            <div className="flex flex-col w-30 text-xs">
                                <label className="font-semibold">Price Gst</label>
                                <NumericFormat
                                    value={watch(`salesLineItems.${index}.priceGst`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onChange={() => {
                                        setPrice(index)
                                    }}
                                    onValueChange={({ floatValue }) => {
                                        setValue(`salesLineItems.${index}.priceGst`, floatValue ?? 0, { shouldDirty: true })
                                    }}
                                />
                            </div>

                            {/* Serials */}
                            <div className="flex flex-col w-40 text-xs">
                                <label className="font-semibold">Serials</label>
                                <textarea
                                    {...register(`salesLineItems.${index}.serialNumbers`, {
                                        validate: () =>
                                            getSnError(index)
                                    })}
                                    rows={4}
                                    placeholder="Comma-separated serials"
                                    className={
                                        clsx("text-sm mt-1",
                                            inputFormFieldStyles,
                                            errors.salesLineItems?.[index]?.serialNumbers ? errorClass : ''
                                        )} />
                                {errors?.salesLineItems?.[index]?.serialNumbers && <WidgetFormErrorMessage errorMessage={errors?.salesLineItems?.[index]?.serialNumbers?.message} />}
                            </div>

                            {/* Amount and Actions */}
                            <div className="flex flex-col ml-auto w-32">
                                <NumericFormat
                                    value={watch(`salesLineItems.${index}.amount`)}
                                    fixedDecimalScale
                                    thousandSeparator
                                    decimalScale={2}
                                    disabled
                                    readOnly
                                    className={clsx("border-0 text-right font-bold text-gray-900 bg-green-50 ", inputFormFieldStyles)}
                                />
                                <div className="flex items-center justify-center mt-4 ml-auto gap-8">
                                    {/* delete */}
                                    <button
                                        type="button"
                                        className={clsx("text-red-500", fields.length === 1 && "cursor-not-allowed opacity-30")}
                                        onClick={() => {
                                            const id = getValues(`salesLineItems.${index}.id`)
                                            if (id) {
                                                const deletedIds = getValues('deletedIds') || []
                                                setValue('deletedIds', [...deletedIds, id])
                                            }
                                            // console.log(id)
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
                                        className="p-2.5 text-white ring-2 ring-emerald-200 rounded-full shadow-lg transition-all duration-300 hover:from-emerald-600 hover:ring-emerald-300 hover:scale-105 hover:shadow-xl hover:to-teal-700 bg-gradient-to-r from-emerald-500 to-teal-600"
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
                {getSummaryMarkup()}
            </div>
        </AnimatePresence>
    );
};

export default ItemsAndServices;