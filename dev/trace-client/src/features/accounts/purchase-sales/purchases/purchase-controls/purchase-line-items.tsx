import { useFieldArray, useFormContext } from "react-hook-form";
import clsx from "clsx";
import _ from "lodash";
import Decimal from "decimal.js";
import { NumericFormat } from "react-number-format";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import { IconClear1 } from "../../../../../controls/icons/icon-clear1";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../../utils/messages";
import { IconCross } from "../../../../../controls/icons/icon-cross";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";
import { useValidators } from "../../../../../utils/validators-hook";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { PurchaseFormDataType } from "../all-purchases/all-purchases";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { ProductInfoType } from "../../../../../controls/components/product-select-from-grid";
import { WidgetFormErrorMessage } from "../../../../../controls/widgets/widget-form-error-message";
import { AnimatePresence, motion } from "framer-motion";
import { ControlledNumericInput } from "../../../../../controls/components/controlled-numeric-input";
import { PurchaseProductSelectFromGrid } from "./purchase-product-select-from-grid";

export function PurchaseLineItems({ title }: PurchaseLineItemsProps) {
    // Hooks setup
    const { isValidHsn } = useValidators();
    const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
    const { buCode, dbName, decodedDbParamsObject, defaultGstRate , maxGstRate} = useUtilsInfo();
    const {
        control,
        register,
        setValue,
        getValues,
        watch,
        trigger,
        formState: { errors },
    } = useFormContext<PurchaseFormDataType>();
    const { getDefaultPurchaseLineItem }: any = useFormContext()
    const { fields, remove, insert, append } = useFieldArray({ control, name: 'purchaseLineItems' });
    const isGstInvoice = watch("isGstInvoice");
    const errorClass = 'bg-red-200 border-red-500'
    const lineItems = watch("purchaseLineItems") || [];
    const isIgst = watch('isIgst')

    // Helper functions
    const getDefaultLineItem = useCallback(() => {
        const lineItem = getDefaultPurchaseLineItem();
        lineItem.gstRate = defaultGstRate || 0;
        return lineItem;
    }, [defaultGstRate, getDefaultPurchaseLineItem]);

    const onChangeProductCode = useMemo(
        () =>
            _.debounce((e: ChangeEvent<HTMLInputElement>, index: number) => {
                populateProductOnProductCode(e.target.value, index);
            }, 2000), []
    );

    function computeLineItemValues(index: number) {
        const qty = new Decimal(watch(`purchaseLineItems.${index}.qty`) || 0);
        const price = new Decimal(watch(`purchaseLineItems.${index}.price`) || 0);
        const discount = new Decimal(watch(`purchaseLineItems.${index}.discount`) || 0);
        const gstRate = new Decimal(watch(`purchaseLineItems.${index}.gstRate`) || 0);

        const base = price.minus(discount);
        const subTotal = qty.times(base).toDecimalPlaces(2);
        const multiplier = gstRate.dividedBy(new Decimal(100)).plus(1);
        const amount = subTotal.times(multiplier).toDecimalPlaces(2)
        const gst = subTotal.times(gstRate.dividedBy(new Decimal(100)))
        if (isIgst) {
            setValue(`purchaseLineItems.${index}.cgst`, 0)
            setValue(`purchaseLineItems.${index}.sgst`, 0)
            setValue(`purchaseLineItems.${index}.igst`, gst.toDecimalPlaces(2).toNumber())
        } else {
            const halfGst = gst.dividedBy(2).toDecimalPlaces(2);
            setValue(`purchaseLineItems.${index}.cgst`, halfGst.toNumber())
            setValue(`purchaseLineItems.${index}.sgst`, halfGst.toNumber())
            setValue(`purchaseLineItems.${index}.igst`, 0)
        }

        setValue(`purchaseLineItems.${index}.subTotal`, subTotal.toNumber())
        setValue(`purchaseLineItems.${index}.amount`, amount.toNumber())
        setPriceGst(index)
        trigger()
    }

    function getSnError(index: number) {
        const serialNumbers = watch(`purchaseLineItems.${index}.serialNumbers`);
        const sn = serialNumbers ? serialNumbers.replace(/[,;]$/, "") : "";
        const snCount = sn ? sn.split(/[,;]/).length : 0;
        const qty = watch(`purchaseLineItems.${index}.qty`);
        let snError = undefined;
        if (snCount !== 0 && snCount !== qty) {
            snError = Messages.errQtySrNoNotMatch;
        }
        return snError;
    }

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
                amount: new Decimal(0)
            }
        );
        return (summary)
    }

    function setPrice(index: number) {
        const priceGst = new Decimal(watch(`purchaseLineItems.${index}.priceGst`) || 0);
        const gstRate = new Decimal(watch(`purchaseLineItems.${index}.gstRate`) || 0);

        const divisor = gstRate.dividedBy(100).plus(1);
        const price = divisor.gt(0) ? priceGst.dividedBy(divisor) : new Decimal(0);

        setValue(`purchaseLineItems.${index}.price`, price.toDecimalPlaces(2).toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

    function setPriceGst(index: number) {
        const price = new Decimal(watch(`purchaseLineItems.${index}.price`) || 0);
        const gstRate = new Decimal(watch(`purchaseLineItems.${index}.gstRate`) || 0);

        const multiplier = gstRate.dividedBy(100).plus(1);
        const priceGst = multiplier.times(price);

        setValue(`purchaseLineItems.${index}.priceGst`, priceGst.toDecimalPlaces(2).toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

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
            const id = getValues(`purchaseLineItems.${i}.id`)
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

    function handleClearLineItem(index: number) {
        setValue(`purchaseLineItems.${index}.productId`, null, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.productCode`, '', { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.upcCode`, null, { shouldDirty: true })
        setValue(`purchaseLineItems.${index}.productDetails`, '', { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.hsn`, '', { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.gstRate`, 0, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.qty`, 1, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.price`, 0, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.discount`, 0, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.lineRemarks`, null, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.serialNumbers`, null, { shouldDirty: true });
    }

    function handleProductSearch(index: number) {
        Utils.showHideModalDialogA({
            isOpen: true,
            size: "lg",
            element: <PurchaseProductSelectFromGrid onSelect={(product) => setLineItem(product, index)} />,
            title: "Select a product"
        });
    }

    async function populateProductOnProductCode(productCode: string, index: number) {
        if (!productCode) {
            handleClearLineItem(index);
            return;
        }
        const products: ProductInfoType[] = await Utils.doGenericQuery({
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
            handleClearLineItem(index);
            return;
        }
        setLineItem(product, index);
    }

    function setLineItem(product: ProductInfoType, index: number) {
        setValue(`purchaseLineItems.${index}.productId`, product.productId, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.productCode`, product.productCode, { shouldDirty: true, shouldValidate: true });
        setValue(`purchaseLineItems.${index}.productDetails`, `${product.brandName} ${product.catName} ${product.label}}`, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.hsn`, product.hsn ? product.hsn.toString() : '', { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.gstRate`, product.gstRate, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.price`, product.lastPurchasePrice, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.upcCode`, product.upcCode, { shouldDirty: true });
        setTimeout(() => {
            trigger()
        }, 0);
    }

    // Effects
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
    }, [fields, isIgst])

    // Render helpers
    function getSummaryMarkup() {
        const summary = getSummary()
        return (<div className="flex flex-wrap items-center justify-between mt-2 py-2 w-full font-medium text-sm bg-gray-50 border border-gray-200 rounded">

            <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex items-center px-3 py-1 text-gray-500 bg-amber-100 rounded hover:bg-amber-200 gap-2"
                >
                    <IconClear1 />
                    Clear All Rows
                </button>

                <div className="flex min-w-[100px] text-right gap-1">
                    <span className="text-gray-500">Items:</span>
                    {summary.count}
                </div>
                <div className="flex min-w-[120px] text-right gap-1">
                    <span className="text-gray-500">Qty:</span>
                    {Utils.toDecimalFormat(summary.qty.toNumber())}
                </div>
                <div className="flex min-w-[150px] text-right gap-1">
                    <span className="text-gray-500">SubTotal:</span>
                    {summary.subTotal.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex min-w-[120px] text-right gap-1">
                    <span className="text-gray-500">CGST:</span>
                    {Utils.toDecimalFormat(summary.cgst.toNumber())}
                </div>
                <div className="flex min-w-[120px] text-right gap-1">
                    <span className="text-gray-500">SGST:</span>
                    {Utils.toDecimalFormat(summary.sgst.toNumber())}
                </div>
                <div className="flex min-w-[120px] text-right gap-1">
                    <span className="text-gray-500">IGST:</span>
                    {Utils.toDecimalFormat(summary.igst.toNumber())}
                </div>
            </div>
            <div className="flex mr-4 text-right gap-1">
                <span className="text-gray-500">Total Amount:</span>
                <strong>{Utils.toDecimalFormat(summary.amount.toNumber())}</strong>
            </div>
        </div>)
    }


    return (
        <AnimatePresence>
            <div className="flex flex-col -mt-4">
                <label className="font-medium">{title || "Line Items"}</label>
                {/* <AnimatePresence initial={false}> */}

                {/* Summary */}
                {getSummaryMarkup()}

                {fields.map((_, index) => {
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className={
                                clsx(
                                    "flex flex-wrap items-start border border-gray-200 rounded-md p-2 gap-2 cursor-pointer mt-2",
                                    currentRowIndex === index ? "bg-green-50 border-2 border-teal-600" : "bg-white"
                                )}
                            onClick={() => setCurrentRowIndex(index)}
                        >
                            {/* Index */}
                            <div className="flex flex-col w-10 text-xs">
                                <label className="font-semibold">#</label>
                                <span className="mt-2">{index + 1}</span>
                                <TooltipComponent content="Clear Line Item" position="TopCenter" className="mt-5.5">
                                    <button
                                        aria-label="Clear Product"
                                        tabIndex={-1}
                                        type="button"
                                        onClick={() => handleClearLineItem(index)}
                                        className="text-blue-500"
                                    >
                                        <IconClear className="w-5 h-5" />
                                    </button>
                                </TooltipComponent>
                            </div>

                            {/* Product Code | UPC */}
                            <div className="flex flex-col w-28 text-xs">
                                <label className="font-semibold">Prod Code | UPC {<WidgetAstrix />}</label>
                                <input {...register(`purchaseLineItems.${index}.productCode`, {
                                    required: Messages.errRequired,
                                    onChange(event) {
                                        onChangeProductCode(event, index);
                                    },
                                })}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    className={clsx(inputFormFieldStyles, 'h-8 mt-1',
                                        errors.purchaseLineItems?.[index]?.productCode ? errorClass : '')
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
                                    {watch(`purchaseLineItems.${index}.upcCode`) || "-----------------------"}
                                </span>
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col w-40 text-xs">
                                <label className="font-semibold">Details {<WidgetAstrix />}</label>
                                <textarea
                                    rows={5}
                                    tabIndex={-1}
                                    {...register(`purchaseLineItems.${index}.productDetails`, {
                                        required: Messages.errRequired
                                    })}
                                    readOnly
                                    className={clsx("bg-gray-100 text-xs mt-1", inputFormFieldStyles,
                                        (errors.purchaseLineItems?.[index]?.productDetails ? errorClass : ''))} />
                            </div>

                            {/* Remarks */}
                            <div className="flex flex-col w-36 text-xs">
                                <label className="font-semibold">Remarks</label>
                                <textarea {...register(`purchaseLineItems.${index}.lineRemarks`)}
                                    rows={4}
                                    className={clsx("text-sm mt-1", inputFormFieldStyles)} />
                            </div>

                            {/* Hsn | Gst Rate */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex flex-col w-24 text-xs">
                                    <label className="font-semibold">HSN {isGstInvoice && <WidgetAstrix />}</label>
                                    <input {...register(`purchaseLineItems.${index}.hsn`, {
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
                                        className={clsx(inputFormFieldStyles, 'h-8 mt-1 text-right', errors.purchaseLineItems?.[index]?.hsn ? errorClass : '')} />
                                </div>
                                <div className="flex flex-col w-24 text-xs">
                                    <label className="font-semibold">GST % {isGstInvoice && <WidgetAstrix />}</label>
                                    <ControlledNumericInput
                                        className={clsx("text-right h-8 mt-1",
                                            inputFormFieldStyles, errors.purchaseLineItems?.[index]?.gstRate ? errorClass : '')}
                                        fieldName={`purchaseLineItems.${index}.gstRate`}
                                        onValueChange={(floatValue) => {
                                            setValue(`purchaseLineItems.${index}.gstRate`, floatValue ?? 0, { shouldDirty: true, shouldValidate: true })
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
                                        inputFormFieldStyles, errors.purchaseLineItems?.[index]?.qty ? errorClass : '')}
                                    fieldName={`purchaseLineItems.${index}.qty`}
                                    onValueChange={(floatValue) => {
                                        setValue(`purchaseLineItems.${index}.qty`, floatValue || 0, {
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
                                    value={watch(`purchaseLineItems.${index}.price`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    onChange={() => {
                                        setPriceGst(index)
                                    }}
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onValueChange={({ floatValue }) => {
                                        setValue(`purchaseLineItems.${index}.price`, floatValue ?? 0, { shouldDirty: true })
                                        computeLineItemValues(index)
                                    }}
                                />
                            </div>

                            {/* Discount */}
                            <div className="flex flex-col w-24 text-xs">
                                <label className="font-semibold">Discount(unit)</label>
                                <NumericFormat
                                    value={watch(`purchaseLineItems.${index}.discount`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onValueChange={({ floatValue }) => {
                                        setValue(`purchaseLineItems.${index}.discount`, floatValue ?? 0, { shouldDirty: true })
                                        computeLineItemValues(index)
                                    }}
                                />
                            </div>

                            {/* Price Gst*/}
                            <div className="flex flex-col w-30 text-xs">
                                <label className="font-semibold">Price Gst</label>
                                <NumericFormat
                                    value={watch(`purchaseLineItems.${index}.priceGst`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                    onChange={() => {
                                        setPrice(index)
                                    }}
                                    onValueChange={({ floatValue }) => {
                                        setValue(`purchaseLineItems.${index}.priceGst`, floatValue ?? 0, { shouldDirty: true })
                                    }}
                                />
                            </div>

                            {/* Serials */}
                            <div className="flex flex-col w-40 text-xs">
                                <label className="font-semibold">Serials</label>
                                <textarea
                                    {...register(`purchaseLineItems.${index}.serialNumbers`, {
                                        validate: () =>
                                            getSnError(index)
                                    })}
                                    rows={4}
                                    placeholder="Comma-separated serials"
                                    className={
                                        clsx("text-sm mt-1",
                                            inputFormFieldStyles,
                                            errors.purchaseLineItems?.[index]?.serialNumbers ? errorClass : ''
                                        )} />
                                {errors?.purchaseLineItems?.[index]?.serialNumbers && <WidgetFormErrorMessage errorMessage={errors?.purchaseLineItems?.[index]?.serialNumbers?.message} />}
                            </div>

                            {/* Totals */}
                            <div className="flex flex-col w-26 text-xs rounded">
                                <div className="font-semibold text-xs">Totals</div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between">
                                        <span>SubT:</span>
                                        <span className="w-16 text-right bg-gray-50">{watch(`purchaseLineItems.${index}.subTotal`)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>CGST:</span>
                                        <span className="w-16 text-right bg-gray-50">{watch(`purchaseLineItems.${index}.cgst`)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>SGST:</span>
                                        <span className="w-16 text-right bg-gray-50">{watch(`purchaseLineItems.${index}.sgst`)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>IGST:</span>
                                        <span className="w-16 text-right bg-gray-50">{watch(`purchaseLineItems.${index}.igst`)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col ml-auto w-32">
                                <NumericFormat
                                    value={watch(`purchaseLineItems.${index}.amount`)}
                                    fixedDecimalScale
                                    thousandSeparator
                                    decimalScale={2}
                                    disabled
                                    readOnly
                                    className={clsx("font-bold border-0 bg-gray-100 text-gray-900 text-right text-sm", inputFormFieldStyles)}
                                />
                                <div className="flex items-center justify-center mt-6 ml-auto gap-8">
                                    {/* delete */}
                                    <button
                                        type="button"
                                        className={clsx("text-red-500", fields.length === 1 && "opacity-30 cursor-not-allowed")}
                                        onClick={() => {
                                            const id = getValues(`purchaseLineItems.${index}.id`)
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
                                        className="text-green-600"
                                        onClick={() => handleAddRow(index)}
                                    >
                                        <IconPlus className="w-6 h-6 disabled:text-red-100" />
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
}

type PurchaseLineItemsProps = {
    title: string;
};
