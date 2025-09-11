import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
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
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { AnimatePresence, motion } from "framer-motion";
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SalesFormDataType } from '../all-sales';
import { useValidators } from '../../../../../utils/validators-hook';
import { WidgetAstrix } from '../../../../../controls/widgets/widget-astrix';
import { Messages } from '../../../../../utils/messages';
import { ControlledNumericInput } from '../../../../../controls/components/controlled-numeric-input';
import { WidgetFormErrorMessage } from '../../../../../controls/widgets/widget-form-error-message';
import ItemsAndServicesSummary from './items-and-services-summary';
import Decimal from 'decimal.js';

const ItemsAndServices: React.FC = () => {

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
    } = useFormContext<SalesFormDataType>();
    const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
    const { getDefaultSalesLineItem }: any = useFormContext<SalesFormDataType>()
    const { fields, remove, insert, append } = useFieldArray({ 
        control, 
        name: 'salesLineItems'
    });

    const isGstInvoice = watch("isGstInvoice");
    const errorClass = 'bg-red-200 border-red-500';
    const lineItems = watch("salesLineItems") || [];
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
        if (fields.length === 0 && getDefaultSalesLineItem) {
            console.log('Appending default line item');
            append(getDefaultSalesLineItem());
        }
    }, [fields.length, append, getDefaultSalesLineItem]);


    return (
        <AnimatePresence>
            <div className="flex flex-col -mt-4" key={1}>
                <label className="font-medium">Items & Services</label>

                {/* Summary */}
                <ItemsAndServicesSummary remove={remove} />

                {fields.map((_, index) => {
                    const age: number = watch(`salesLineItems.${index}.age`) || 0;
                    const stock = watch(`salesLineItems.${index}.stock`) || 0;
                    const qty = watch(`salesLineItems.${index}.qty`) || 0;
                    const cost = watch(`salesLineItems.${index}.lastPurchasePrice`) || 0;
                    const profit = watch(`salesLineItems.${index}.profit`) || 0;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className={
                                clsx(
                                    "flex flex-wrap items-start mt-2 p-2 gap-2 border rounded-md",
                                    currentRowIndex === index ? "bg-green-50 border-l-4 border-l-teal-600" : "bg-white"
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
                            <div className="flex flex-col w-28">
                                <label className="font-semibold text-[13px]">Prod Code | UPC {<WidgetAstrix />}</label>
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
                            <div className="flex flex-col w-40">
                                <label className="font-semibold text-[13px]">Details {<WidgetAstrix />}</label>
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
                            <div className="flex flex-col w-36">
                                <label className="font-semibold text-[13px]">Remarks</label>
                                <textarea
                                    {...register(`salesLineItems.${index}.lineRemarks`)}
                                    rows={4}
                                    className={clsx("mt-1 text-sm", inputFormFieldStyles)}
                                />
                            </div>

                            {/* HSN | GST Rate */}
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-col w-24">
                                    <label className="font-semibold text-[13px]">HSN {isGstInvoice && <WidgetAstrix />}</label>
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

                                {/* gst rate */}
                                <div className="flex flex-col w-24">
                                    <label className="font-semibold text-[13px]">GST % {isGstInvoice && <WidgetAstrix />}</label>
                                    <ControlledNumericInput
                                        className={clsx("text-right h-8 mt-1",
                                            inputFormFieldStyles, errors.salesLineItems?.[index]?.gstRate ? errorClass : '')}
                                        fieldName={`salesLineItems.${index}.gstRate`}
                                        onValueChange={(floatValue) => {
                                            setValue(`salesLineItems.${index}.gstRate`, floatValue ?? 0, { shouldDirty: true, shouldValidate: true })
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
                                <label className="font-semibold text-[13px]">Qty</label>
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
                                        setStockAndProfit(index);
                                    }}
                                    validate={(value) => {
                                        const ret = value > 0 ? true : Messages.errQtyCannotBeZero;
                                        return (ret)
                                    }}
                                />
                                {/* Age Display */}
                                <div className="mt-7 py-1 pr-2 rounded-md text-sm text-right">
                                    <span className={age > 360 ? "text-orange-600 font-semibold" : "text-gray-500"}>
                                        Age: {age}
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col w-30">
                                <label className="font-semibold text-[13px]">Price</label>
                                <NumericFormat
                                    value={watch(`salesLineItems.${index}.price`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    onChange={(e) => {
                                        const numericValue = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                                        setValue(`salesLineItems.${index}.price`, numericValue, { shouldDirty: true })
                                        setPriceGst(index)
                                        computeLineItemValues(index)
                                        setStockAndProfit(index);
                                    }}
                                    // onValueChange={({ floatValue }) => {
                                    //     setValue(`salesLineItems.${index}.price`, floatValue || 0, { shouldDirty: true })
                                    //     setPriceGst(index)
                                    //     computeLineItemValues(index)
                                    //     setStockAndProfit(index);
                                    // }}
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                />
                                {/* Cost Display */}
                                <div className="mt-7 py-1 pr-2 rounded-md text-sm text-right">
                                    <span className={"text-gray-500"}>
                                        Cost: {Utils.toDecimalFormat(cost)}
                                    </span>
                                </div>
                            </div>

                            {/* Discount */}
                            <div className="flex flex-col w-24">
                                <label className="font-semibold text-[13px]">Discount(unit)</label>
                                <NumericFormat
                                    value={watch(`salesLineItems.${index}.discount`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onChange={(e) => {
                                        const numericValue = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                                        setValue(`salesLineItems.${index}.discount`, numericValue, { shouldDirty: true })
                                        setPriceGst(index)
                                        computeLineItemValues(index)
                                        setStockAndProfit(index);
                                    }}
                                    // onValueChange={({ floatValue }) => {
                                        // setValue(`salesLineItems.${index}.discount`, floatValue || 0, { shouldDirty: true })
                                        // setPriceGst(index)
                                        // computeLineItemValues(index)
                                        // setStockAndProfit(index);
                                    // }}
                                />
                                {/* Stock Display */}
                                <div className={clsx("mt-7 py-1 pr-2 rounded-md text-sm text-right")}>
                                    <span
                                        className={clsx(
                                            (stock - qty) < 0 ? "text-amber-800 font-medium animate-pulse" : "text-gray-500"
                                        )}
                                    >
                                        Stock: {stock - qty}
                                    </span>
                                </div>
                            </div>

                            {/* Price GST */}
                            <div className="flex flex-col w-30">
                                <label className="font-semibold text-[13px]">Price Gst</label>
                                <NumericFormat
                                    value={watch(`salesLineItems.${index}.priceGst`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onChange={(e) => {
                                        // this code executes only when value is changed by user using keyboard
                                        const numericValue = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                                        setValue(`salesLineItems.${index}.priceGst`, numericValue, { shouldDirty: true })
                                        setPrice(index)
                                        computeLineItemValues(index)
                                        setStockAndProfit(index);
                                    }}
                                    onValueChange={() => {
                                        // this code is necessary and it executes when priceGst is changed programmatically
                                        setPrice(index)
                                        computeLineItemValues(index)
                                        setStockAndProfit(index);
                                    }}
                                />

                                {/* Profit Display */}
                                <div className={clsx("mt-7 py-1 pr-2 rounded-md text-sm text-right")}>
                                    <span
                                        className={clsx(
                                            Number(profit) < 0 ? "text-amber-700 font-medium animate-pulse" : "text-gray-500"
                                        )}
                                    >
                                        Prft: {Utils.toDecimalFormat(profit)}
                                    </span>
                                </div>
                            </div>

                            {/* Serials */}
                            <div className="flex flex-col w-40">
                                <label className="font-semibold text-[13px]">Serials</label>
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
                                    className={clsx("border-0 text-right font-black text-gray-900", inputFormFieldStyles)}
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
                <ItemsAndServicesSummary remove={remove} />
            </div>
        </AnimatePresence>
    );

    // Event handlers
    function handleAddRow(index: number) {
        insert(index + 1,
            getDefaultSalesLineItem(),
            { shouldFocus: true }
        );
        setTimeout(() => setCurrentRowIndex(index + 1), 0);
    }



    function handleClearLineItem(index: number) {
        setValue(`salesLineItems.${index}.productId`, null, { shouldDirty: true });
        setValue(`salesLineItems.${index}.productCode`, '', { shouldDirty: true });
        setValue(`salesLineItems.${index}.upcCode`, null, { shouldDirty: true })
        setValue(`salesLineItems.${index}.productDetails`, '', { shouldDirty: true });
        setValue(`salesLineItems.${index}.hsn`, '', { shouldDirty: true });
        setValue(`salesLineItems.${index}.gstRate`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.qty`, 1, { shouldDirty: true });
        setValue(`salesLineItems.${index}.price`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.priceGst`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.discount`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.lineRemarks`, null, { shouldDirty: true });
        setValue(`salesLineItems.${index}.serialNumbers`, null, { shouldDirty: true });

        setValue(`salesLineItems.${index}.lastPurchasePrice`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.age`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.stock`, 0, { shouldDirty: true });
        setValue(`salesLineItems.${index}.profit`, 0, { shouldDirty: true });
        trigger();
    }

    function handleProductSearch(itemId: number) {
        Utils.showHideModalDialogA({
            isOpen: true,
            size: "lg",
            element: <ProductSelectFromGrid onSelect={(product: any) => setLineItem(product, itemId)} />,
            title: "Select a product"
        });
    }


    // Helper functions

    function computeLineItemValues(index: number) {
        const qty = new Decimal(getValues(`salesLineItems.${index}.qty`) || 0);
        const priceGst = new Decimal(getValues(`salesLineItems.${index}.priceGst`) || 0);
        const gstRate = new Decimal(getValues(`salesLineItems.${index}.gstRate`) || 0);
        const price = priceGst.dividedBy(gstRate.dividedBy(new Decimal(100)).plus(1)).toDecimalPlaces(2);
        const subTotal = qty.times(price).toDecimalPlaces(2);

        const amount = qty.times(priceGst).toDecimalPlaces(2);
        const gst = amount.minus(subTotal).toDecimalPlaces(2);

        if (isIgst) {
            setValue(`salesLineItems.${index}.cgst`, 0);
            setValue(`salesLineItems.${index}.sgst`, 0);
            setValue(`salesLineItems.${index}.igst`, gst.toNumber());
        } else {
            const halfGst = gst.dividedBy(2).toDecimalPlaces(2);
            setValue(`salesLineItems.${index}.cgst`, halfGst.toNumber());
            setValue(`salesLineItems.${index}.sgst`, halfGst.toNumber());
            setValue(`salesLineItems.${index}.igst`, 0);
        }

        setValue(`salesLineItems.${index}.subTotal`, subTotal.toNumber());
        setValue(`salesLineItems.${index}.amount`, amount.toNumber());
        setSummaryValues()
        trigger()
    }

    // function getDefaultLineItem() {
    //     const lineItem = getDefaultSalesLineItem();
    //     lineItem.gstRate = defaultGstRate || 0;
    //     return lineItem;
    // }

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
        const age = product.age || 0;
        const lastPurchasePrice = product.lastPurchasePrice || 0;
        const stock = product.clos || 0;

        setValue(`salesLineItems.${index}.age`, age);
        setValue(`salesLineItems.${index}.lastPurchasePrice`, lastPurchasePrice);

        setValue(`salesLineItems.${index}.productId`, product.productId, { shouldDirty: true });
        setValue(`salesLineItems.${index}.productCode`, product.productCode, { shouldDirty: true, shouldValidate: true });
        setValue(`salesLineItems.${index}.productDetails`, `${product.brandName} ${product.catName} ${product.label}}`, { shouldDirty: true });
        setValue(`salesLineItems.${index}.hsn`, product.hsn ? product.hsn.toString() : '', { shouldDirty: true });
        setValue(`salesLineItems.${index}.gstRate`, product.gstRate, { shouldDirty: true });
        setValue(`salesLineItems.${index}.priceGst`, product.calculatedSalePriceGst, { shouldDirty: true });
        setValue(`salesLineItems.${index}.upcCode`, product.upcCode, { shouldDirty: true });
        setValue(`salesLineItems.${index}.stock`, stock, { shouldDirty: true });
        setTimeout(() => {
            setPrice(index);
            computeLineItemValues(index);
            setStockAndProfit(index);
            // setSummaryValues()
            // trigger()
        }, 0);
    }

    function setPrice(index: number) {
        const priceGst = new Decimal(getValues(`salesLineItems.${index}.priceGst`) || 0);
        const gstRate = new Decimal(getValues(`salesLineItems.${index}.gstRate`) || 0);
        const discount = new Decimal(getValues(`salesLineItems.${index}.discount`) || 0);

        const divisor = gstRate.dividedBy(100).plus(1);
        const price = divisor.gt(0) ? priceGst.dividedBy(divisor).add(discount) : new Decimal(0);

        setValue(`salesLineItems.${index}.price`, price.toDecimalPlaces(2).toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

    function setPriceGst(index: number) {
        const price = new Decimal(getValues(`salesLineItems.${index}.price`) || 0);
        const gstRate = new Decimal(getValues(`salesLineItems.${index}.gstRate`) || 0);
        const discount = new Decimal(getValues(`salesLineItems.${index}.discount`) || 0);

        const multiplier = gstRate.dividedBy(100).plus(1);
        const priceGst = multiplier.times(price.minus(discount));

        setValue(`salesLineItems.${index}.priceGst`, priceGst.toDecimalPlaces(2).toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

    function setStockAndProfit(index: number) {
        const price = new Decimal(getValues(`salesLineItems.${index}.price`) || 0);
        const qty = new Decimal(getValues(`salesLineItems.${index}.qty`) || 0);
        const discount = new Decimal(getValues(`salesLineItems.${index}.discount`) || 0);
        const lastPurchasePrice = new Decimal(getValues(`salesLineItems.${index}.lastPurchasePrice`) || 0);
        const stock = new Decimal(getValues(`salesLineItems.${index}.stock`) || 0);
        // const stock = previousStock.minus(qty);
        const profit = lastPurchasePrice.gt(0) ? qty.times(price.minus(lastPurchasePrice).minus(discount)) : new Decimal(0);
        // const pric = price.toNumber();
        // const qt = qty.toNumber();
        // const disc = discount.toNumber();
        // const lpp = lastPurchasePrice.toNumber();
        // const ps = previousStock.toNumber();
        // const st = stock.toNumber();
        // const pr = profit.toNumber();
        // console.log(`setStockAndProfit: index=${index}, price=${pric}, qty=${qt}, discount=${disc}, lastPurchasePrice=${lpp}, previousStock=${ps} => stock=${st}, profit=${pr}`);
        setValue(`salesLineItems.${index}.stock`, stock.toNumber(), { shouldDirty: true });
        setValue(`salesLineItems.${index}.profit`, profit.toDecimalPlaces(2).toNumber(), { shouldDirty: true });
    }

    function setSummaryValues() {
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
            setValue('totalInvoiceAmount', summary.amount.toDecimalPlaces(2))
            setValue('totalQty', summary.qty)
            setValue('totalCgst', summary.cgst.toDecimalPlaces(2))
            setValue('totalSgst', summary.sgst.toDecimalPlaces(2))
            setValue('totalIgst', summary.igst.toDecimalPlaces(2))
            setValue('totalSubTotal', summary.subTotal.toDecimalPlaces(2))
        }

};

export default ItemsAndServices;