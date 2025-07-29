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
import { ProductInfoType, ProductSelectFromGrid } from "../../../../../controls/components/product-select-from-grid";

export function PurchaseLineItems({ title }: PurchaseLineItemsProps) {
    const { isValidHsn } = useValidators();
    const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
    const { buCode, dbName, decodedDbParamsObject, defaultGstRate } = useUtilsInfo();
    const {
        control,
        register,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<PurchaseFormDataType>();
    const { getDefaultPurchaseLineItem }: any = useFormContext()
    const { fields, remove, insert, append } = useFieldArray({ control, name: 'purchaseLineItems' });
    const isGstInvoice = watch("isGstInvoice");
    const errorClass = 'bg-red-200 border-red-500'
    const lineItems = watch("purchaseLineItems") || [];
    const isIgst = watch('isIgst')

    const getDefaultLineItem = useCallback(() => {
        const lineItem = getDefaultPurchaseLineItem();
        lineItem.gstRate = defaultGstRate || 0;
        return lineItem;
    }, [defaultGstRate, getDefaultPurchaseLineItem]);

    const handleAddRow = (index: number) => {
        insert(index + 1,
            getDefaultLineItem(),
            { shouldFocus: true }
        );
        setTimeout(() => setCurrentRowIndex(index + 1), 0);
    };

    const handleClearAll = () => {
        for (let i = fields.length - 1; i >= 0; i--) {
            remove(i);
        }
        setTimeout(() => setCurrentRowIndex(0), 0);
    };

    const onChangeProductCode = useMemo(
        () =>
            _.debounce((e: ChangeEvent<HTMLInputElement>, index: number) => {
                populateProductOnProductCode(e.target.value, index);
            }, 2000), []
    );

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


    return (
        <div className="flex flex-col -mt-4">
            <label className="font-medium">{title || "Line Items"}</label>

            {/* Summary */}
            {getSummaryMarkup()}

            {fields.map((_, index) => {
                // computeLineItemValues(index)
                return (
                    <div
                        key={index}
                        className={
                            clsx(
                                "flex flex-wrap items-start border border-gray-200 rounded-md p-2 gap-2 cursor-pointer mt-2",
                                currentRowIndex === index ? "bg-green-50 border-2 border-teal-600" : "bg-white"
                            )}
                        onClick={() => setCurrentRowIndex(index)}
                    >
                        {/* Index */}
                        <div className="flex flex-col text-xs w-10">
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
                        <div className="flex flex-col text-xs w-28">
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
                                className="text-sm text-blue-600 flex items-center mt-2 "
                                onClick={() => handleProductSearch(index)}
                            >
                                <IconSearch className="mr-1 h-5 w-5" />
                                Search
                            </button>
                            {/* UPC Code Display */}
                            <span
                                tabIndex={-1}
                                className="text-xs mt-1 text-teal-500 "
                            >
                                {watch(`purchaseLineItems.${index}.upcCode`) || "-----------------------"}
                            </span>
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-col text-xs w-40">
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
                        <div className="flex flex-col text-xs w-36">
                            <label className="font-semibold">Remarks</label>
                            <textarea {...register(`purchaseLineItems.${index}.lineRemarks`)}
                                rows={4}
                                className={clsx("text-sm mt-1", inputFormFieldStyles)} />
                        </div>

                        {/* Hsn | Gst Rate */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex flex-col text-xs w-24">
                                <label className="font-semibold">HSN {isGstInvoice && <WidgetAstrix />}</label>
                                <input {...register(`purchaseLineItems.${index}.hsn`, {
                                    required: isGstInvoice ? Messages.errRequired : undefined,
                                    validate: (val) => {
                                        if (!val) return true; // required already handled above
                                        if (!isValidHsn(val)) return Messages.errInvalidHsn;
                                        return true;
                                    },
                                })}
                                    type="text"
                                    pattern="[0-9]*"
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    className={clsx(inputFormFieldStyles, 'h-8 mt-1 text-right', errors.purchaseLineItems?.[index]?.hsn ? errorClass : '')} />
                            </div>
                            <div className="flex flex-col text-xs w-24">
                                <label className="font-semibold">GST % {isGstInvoice && <WidgetAstrix />}</label>
                                <NumericFormat
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    defaultValue={0}
                                    {...register(`purchaseLineItems.${index}.gstRate`, {
                                        validate: () => {
                                            const val = watch(`purchaseLineItems.${index}.gstRate`)
                                            if (isGstInvoice && (val === undefined || val === null || isNaN(val))) {
                                                return Messages.errRequired;
                                            }
                                            return true;
                                        },
                                    })}
                                    value={watch(`purchaseLineItems.${index}.gstRate`)}
                                    className={clsx("text-right h-8 mt-1",
                                        inputFormFieldStyles, errors.purchaseLineItems?.[index]?.gstRate ? errorClass : '')}
                                    onValueChange={({ floatValue }) => {
                                        setValue(`purchaseLineItems.${index}.gstRate`, floatValue ?? 0, { shouldDirty: true, shouldValidate: true })
                                        computeLineItemValues(index)
                                    }}
                                />
                            </div>
                        </div>

                        {/* Qty */}
                        <div className="flex flex-col text-xs w-20">
                            <label className="font-semibold">Qty</label>
                            <NumericFormat
                                allowNegative={false}
                                decimalScale={2}
                                defaultValue={0}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                thousandSeparator
                                fixedDecimalScale
                                className={clsx("text-right h-8 mt-1",
                                    inputFormFieldStyles, errors.purchaseLineItems?.[index]?.qty ? errorClass : '')}
                                {...register(`purchaseLineItems.${index}.qty`, {
                                    validate: (value) =>
                                        value !== undefined && value !== null && !isNaN(value) && value > 0 ? true : Messages.errQtyCannotBeZero,
                                })}
                                value={watch(`purchaseLineItems.${index}.qty`) || 0}
                                onValueChange={({ floatValue }) => {
                                    setValue(`purchaseLineItems.${index}.qty`, floatValue ?? 0, { shouldDirty: true })
                                    computeLineItemValues(index)
                                }}
                            />
                        </div>

                        {/* Price */}
                        <div className="flex flex-col text-xs w-30">
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
                        <div className="flex flex-col text-xs w-24">
                            <label className="font-semibold">Discount</label>
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
                        <div className="flex flex-col text-xs w-30">
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
                        <div className="flex flex-col text-xs w-40">
                            <label className="font-semibold">Serials</label>
                            <textarea
                                {...register(`purchaseLineItems.${index}.serialNumbers`)}
                                rows={4}
                                className={clsx("text-sm mt-1", inputFormFieldStyles)} />
                        </div>

                        {/* Totals */}
                        <div className="flex flex-col text-[11px] w-24 rounded">
                            <div className="font-semibold text-xs">Totals</div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span>SubT:</span>
                                    <span className="text-right bg-gray-50 w-16">{watch(`purchaseLineItems.${index}.subTotal`).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>CGST:</span>
                                    <span className="text-right w-16 bg-gray-50">{watch(`purchaseLineItems.${index}.cgst`).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>SGST:</span>
                                    <span className="text-right w-16 bg-gray-50">{watch(`purchaseLineItems.${index}.sgst`).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IGST:</span>
                                    <span className="text-right w-16 bg-gray-50">{watch(`purchaseLineItems.${index}.igst`).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col w-32 ml-auto">
                            <NumericFormat
                                value={watch(`purchaseLineItems.${index}.amount`)}
                                fixedDecimalScale
                                thousandSeparator
                                decimalScale={2}
                                disabled
                                readOnly
                                className={clsx("font-bold border-0 bg-gray-100 text-gray-900 text-right text-sm", inputFormFieldStyles)}
                            />
                            <div className="flex items-center justify-center gap-8 mt-6 ml-auto">
                                <button
                                    type="button"
                                    className={clsx("text-red-500", fields.length === 1 && "opacity-30 cursor-not-allowed")}
                                    onClick={() => {
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
                                <button
                                    type="button"
                                    className="text-green-600"
                                    onClick={() => handleAddRow(index)}
                                >
                                    <IconPlus className="w-6 h-6 disabled:text-red-100" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Summary */}
            {getSummaryMarkup()}
        </div>
    );

    function computeLineItemValues(index: number) {
        const qty = new Decimal(watch(`purchaseLineItems.${index}.qty`) || 0);
        const price = new Decimal(watch(`purchaseLineItems.${index}.price`) || 0);
        const discount = new Decimal(watch(`purchaseLineItems.${index}.discount`) || 0);
        const gstRate = new Decimal(watch(`purchaseLineItems.${index}.gstRate`) || 0);

        const base = price.minus(discount);
        const subTotal = qty.times(base);
        const multiplier = gstRate.dividedBy(new Decimal(100)).plus(1);
        // const multi = multiplier.toNumber()
        const amount = subTotal.times(multiplier)
        const gst = subTotal.times(gstRate.dividedBy(new Decimal(100)))
        // const sgst = gst.dividedBy(new Decimal(2).toNumber())
        if (isIgst) {
            setValue(`purchaseLineItems.${index}.cgst`, 0)
            setValue(`purchaseLineItems.${index}.sgst`, 0)
            setValue(`purchaseLineItems.${index}.igst`, gst.toNumber())
        } else {
            setValue(`purchaseLineItems.${index}.cgst`, gst.dividedBy(2).toNumber())
            setValue(`purchaseLineItems.${index}.sgst`, gst.dividedBy(2).toNumber())
            setValue(`purchaseLineItems.${index}.igst`, 0)
        }

        setValue(`purchaseLineItems.${index}.subTotal`, subTotal.toNumber())
        setValue(`purchaseLineItems.${index}.amount`, amount.toNumber())
        setPriceGst(index)

    }

    function getSummary() {
        const summary = lineItems.reduce(
            (acc, item) => {
                // const qty = new Decimal(item.qty || 0);
                // const price = new Decimal(item.price || 0);
                // const discount = new Decimal(item.discount || 0);
                // const gstRate = new Decimal(item.gstRate || 0);
                // const base = price.minus(discount);
                // const subTotal = qty.times(base);
                // const gst = subTotal.times(gstRate.dividedBy(new Decimal(100)))
                // const cgst = gst.div(2);
                // const sgst = gst.div(2);
                // const igst = new Decimal(0);

                acc.count += 1;
                acc.qty = acc.qty.plus(new Decimal(item.qty));
                acc.subTotal = acc.subTotal.plus(new Decimal(item.subTotal));
                acc.cgst = acc.cgst.plus(new Decimal(item.cgst));
                acc.sgst = acc.sgst.plus(new Decimal(item.sgst));
                acc.igst = acc.igst.plus(new Decimal(item.igst));
                acc.amount = acc.amount.plus(new Decimal(item.amount));
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

    function getSummaryMarkup() {
        const summary = getSummary()
        return (<div className="flex justify-between items-center flex-wrap gap-4 mt-2 text-sm font-medium bg-gray-50 p-2 rounded border border-gray-200 w-full">

            {/* Clear All Button */}

            <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1 bg-amber-100 text-gray-500 rounded flex items-center gap-2 hover:bg-amber-200"
            >
                <IconClear1 />
                Clear All Rows
            </button>

            <div className="text-right min-w-[100px] flex gap-1">
                <span className="text-gray-500">Items:</span>
                {summary.count}
            </div>
            <div className="text-right min-w-[120px] flex gap-1">
                <span className="text-gray-500">Qty:</span>
                {summary.qty.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-right min-w-[150px] flex gap-1">
                <span className="text-gray-500">SubTotal:</span>
                {summary.subTotal.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-right min-w-[120px] flex gap-1">
                <span className="text-gray-500">CGST:</span>
                {summary.cgst.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-right min-w-[120px] flex gap-1">
                <span className="text-gray-500">SGST:</span>
                {summary.sgst.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-right min-w-[120px] flex gap-1">
                <span className="text-gray-500">IGST:</span>
                {summary.igst.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-right min-w-[120px] flex gap-1">
                <span className="text-gray-500">Amount:</span>
                {summary.amount.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        </div>)
    }

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
        // setValue(`purchaseLineItems.${index}.subTotal`, 0, { shouldDirty: true });
        // setValue(`purchaseLineItems.${index}.cgst`, 0, { shouldDirty: true });
        // setValue(`purchaseLineItems.${index}.sgst`, 0, { shouldDirty: true });
        // setValue(`purchaseLineItems.${index}.igst`, 0, { shouldDirty: true });
    }

    function handleProductSearch(index: number) {
        Utils.showHideModalDialogA({
            isOpen: true,
            size: "lg",
            element: <ProductSelectFromGrid onSelect={(product) => setLineItem(product, index)} />,
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
        // Set fetched values
        setLineItem(product, index);
    }

    function setLineItem(product: ProductInfoType, index: number) {
        setValue(`purchaseLineItems.${index}.productId`, product.id, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.productCode`, product.productCode, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.productDetails`, `${product.brandName} ${product.catName} ${product.label} ${product.info ?? ""}`, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.hsn`, product.hsn ? product.hsn.toString() : '', { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.gstRate`, product.gstRate, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.price`, product.lastPurchasePrice, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.upcCode`, product.upcCode, { shouldDirty: true });
    }

    function setPrice(index: number) {
        const priceGst = new Decimal(watch(`purchaseLineItems.${index}.priceGst`) || 0);
        const gstRate = new Decimal(watch(`purchaseLineItems.${index}.gstRate`) || 0);

        const divisor = gstRate.dividedBy(100).plus(1);
        const price = divisor.gt(0) ? priceGst.dividedBy(divisor) : new Decimal(0);

        setValue(`purchaseLineItems.${index}.price`, price.toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

    function setPriceGst(index: number) {
        const price = new Decimal(watch(`purchaseLineItems.${index}.price`) || 0);
        const gstRate = new Decimal(watch(`purchaseLineItems.${index}.gstRate`) || 0);

        const multiplier = gstRate.dividedBy(100).plus(1);
        const priceGst = multiplier.times(price);

        setValue(`purchaseLineItems.${index}.priceGst`, priceGst.toNumber(), {
            shouldDirty: true,
            shouldValidate: true
        });
    }


}

type PurchaseLineItemsProps = {
    // name: 'purchaseLineItems'; // e.g., 'purchaseLineItems'
    title: string;
};

// type MetaType = {
//     [key: string]: number;
// };
