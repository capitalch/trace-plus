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
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { PurchaseFormDataType } from "../all-purchases/all-purchases";
import { ProductType } from "../../../inventory/shared-definitions";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { ProductInfoType, ProductSelectFromGrid } from "../../../../../controls/components/product-select-from-grid";

export function PurchaseLineItems({ title }: PurchaseLineItemsProps) {
    const { isValidHsn } = useValidators();
    const [currentRowIndex, setCurrentRowIndex] = useState<number>(0);
    const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
    const {
        control,
        register,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<PurchaseFormDataType>();
    const { getDefaultPurchaseLineItem }: any = useFormContext()
    const { fields, remove, insert } = useFieldArray({ control, name: 'purchaseLineItems' });
    const isGstInvoice = watch("isGstInvoice");
    const errorClass = 'bg-red-200 border-red-500'
    const handleAddRow = (index: number) => {
        insert(index + 1,
            getDefaultPurchaseLineItem(),
            { shouldFocus: true }
        );
        setTimeout(() => setCurrentRowIndex(index + 1), 0);
    };

    const handleClearAll = () => {
        for (let i = fields.length - 1; i >= 1; i--) {
            remove(i);
        }
    };

    const onChangeProductCode = useMemo(
        // For debounce
        () =>
            _.debounce((e: ChangeEvent<HTMLInputElement>, index: number) => {
                populateProductOnProductCode(e.target.value, index);
            }, 2000), []
    );
    useEffect(() => {
        return () => onChangeProductCode.cancel();
    }, [onChangeProductCode]);

    return (
        <div className="flex flex-col gap-2 -mt-4">
            <label className="font-medium mb-2">{title || "Line Items"}</label>
            {fields.map((_, index) => {
                const qty = new Decimal(watch(`purchaseLineItems.${index}.qty`) || 0);
                const price = new Decimal(watch(`purchaseLineItems.${index}.price`) || 0);
                const discount = new Decimal(watch(`purchaseLineItems.${index}.discount`) || 0);
                const gstRate = new Decimal(watch(`purchaseLineItems.${index}.gstRate`) || 0);
                // const gRate = watch(`purchaseLineItems.${index}.gstRate`)
                const base = price.minus(discount);
                const gstAmount = base.times(gstRate).div(100);
                const priceGst = base.plus(gstAmount);
                const subTotal = qty.times(priceGst);
                const cgst = gstAmount.div(2);
                const sgst = gstAmount.div(2);
                const igst = new Decimal(0);
                const amount = new Decimal(0);
                return (
                    <div
                        key={index}
                        className={
                            clsx(
                                "flex flex-wrap items-start border border-gray-200 rounded-md p-3 gap-3 cursor-pointer",
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
                                <IconSearch className="mr-1 h-6 w-6" />
                                Search
                            </button>
                            {/* UPC Code Display */}
                            <span
                                tabIndex={-1}
                                className="text-xs mt-1 text-teal-500 "
                            >
                                {watch(`purchaseLineItems.${index}.upcCode`) || "------------"}
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
                                    {...register(`purchaseLineItems.${index}.gstRate`, {
                                        validate: (val) => {
                                            if (isGstInvoice && (val === undefined || val === null)) {
                                                return Messages.errRequired;
                                            }
                                            return true;
                                        },
                                    })}
                                    value={watch(`purchaseLineItems.${index}.gstRate`)}
                                    className={clsx("text-right h-8 mt-1",
                                        inputFormFieldStyles, errors.purchaseLineItems?.[index]?.gstRate ? errorClass : '')}
                                    onValueChange={({ floatValue }) => setValue(`purchaseLineItems.${index}.gstRate`, floatValue ?? 0, { shouldDirty: true })}
                                />
                            </div>
                        </div>

                        {/* Qty */}
                        <div className="flex flex-col text-xs w-20">
                            <label className="font-semibold">Qty</label>
                            <NumericFormat
                                value={qty.toNumber()}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                thousandSeparator
                                decimalScale={2}
                                fixedDecimalScale
                                className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                onValueChange={({ floatValue }) => setValue(`purchaseLineItems.${index}.qty`, floatValue ?? 0, { shouldDirty: true })}
                            />
                        </div>

                        {/* Price */}
                        <div className="flex flex-col text-xs w-30">
                            <label className="font-semibold">Price</label>
                            <NumericFormat
                                value={price.toNumber()}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                thousandSeparator
                                decimalScale={2}
                                fixedDecimalScale
                                className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                onValueChange={({ floatValue }) => setValue(`purchaseLineItems.${index}.price`, floatValue ?? 0, { shouldDirty: true })}
                            />
                        </div>

                        {/* Discount */}
                        <div className="flex flex-col text-xs w-24">
                            <label className="font-semibold">Discount</label>
                            <NumericFormat
                                value={discount.toNumber()}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                thousandSeparator
                                decimalScale={2}
                                fixedDecimalScale
                                className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                onValueChange={({ floatValue }) => setValue(`purchaseLineItems.${index}.discount`, floatValue ?? 0, { shouldDirty: true })}
                            />
                        </div>

                        {/* Price Gst*/}
                        <div className="flex flex-col text-xs w-30">
                            <label className="font-semibold">Price Gst</label>
                            <NumericFormat
                                value={priceGst.toNumber()}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                thousandSeparator
                                decimalScale={2}
                                fixedDecimalScale
                                className={clsx("text-right h-8 mt-1", inputFormFieldStyles)}
                                onValueChange={({ floatValue }) => setValue(`purchaseLineItems.${index}.priceGst`, floatValue ?? 0, { shouldDirty: true })}
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
                        <div className="flex flex-col text-[12px] w-26 rounded">
                            <div className="font-semibold text-xs">Totals</div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span>SubT:</span>
                                    <span className="text-right w-16">{subTotal.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>CGST:</span>
                                    <span className="text-right w-16">{cgst.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>SGST:</span>
                                    <span className="text-right w-16">{sgst.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IGST:</span>
                                    <span className="text-right w-16">{igst.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col w-40 ml-auto">
                            <NumericFormat
                                value={amount.toNumber()}
                                fixedDecimalScale
                                thousandSeparator
                                decimalScale={2}
                                disabled
                                readOnly
                                // onValueChange={({ floatValue }) => setValue(`purchaseLineItems.${index}.amount`, floatValue ?? 0, { shouldDirty: true })}
                                className={clsx("font-bold border-0 bg-gray-100 text-gray-900 text-right", inputFormFieldStyles)}
                            />
                            <div className="flex items-center justify-center gap-8 mt-6 ml-auto">
                                <button
                                    type="button"
                                    className={clsx("text-red-500", fields.length === 1 && "opacity-30 cursor-not-allowed")}
                                    onClick={() => {
                                        if (fields.length > 1) {
                                            remove(index)
                                            setTimeout(() => setCurrentRowIndex(index), 0);
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
            <div className="flex justify-end mt-4">
                <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-3 py-1 bg-amber-500 text-white rounded flex items-center gap-2 hover:bg-amber-700"
                >
                    <IconClear1 />
                    Clear All Rows
                </button>
            </div>
        </div>
    );

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
            element: <ProductSelectFromGrid onSelect={onProductSelect} />,
            title: "Select a product"
        });

        function onProductSelect(args: ProductInfoType) {
            // clearErrors(`${name}.${index}.productCode`);
            setValue(`purchaseLineItems.${index}.productCode`, args.productCode);
            setValue(`purchaseLineItems.${index}.productId`, args.id, {
                shouldValidate: true,
                shouldDirty: true
            });
            setValue(
                `purchaseLineItems.${index}.productDetails`,
                `${args.brandName} ${args.catName} ${args.label} ${args.info ?? ""}`
            );
            setValue(`purchaseLineItems.${index}.price`, args.lastPurchasePrice);
            setValue(`purchaseLineItems.${index}.upcCode`, args.upcCode);
            setValue(`purchaseLineItems.${index}.gstRate`, args.gstRate);
            setValue(`purchaseLineItems.${index}.hsn`, args.hsn ? args.hsn.toString() : '', { shouldDirty: true });
        }
    }

    async function populateProductOnProductCode(productCode: string, index: number) {
        if (!productCode) {
            handleClearLineItem(index);
            return;
        }
        const products: ProductType[] = await Utils.doGenericQuery({
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
        setValue(`purchaseLineItems.${index}.productId`, product.productId, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.productDetails`, `${product.brandName} ${product.catName} ${product.label} ${product.info ?? ""
            }`, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.hsn`, product.hsn ? product.hsn.toString() : '', { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.gstRate`, product.gstRate, { shouldDirty: true });
        setValue(`purchaseLineItems.${index}.price`, product.lastPurchasePrice);
        setValue(`purchaseLineItems.${index}.upcCode`, product.upcCode, { shouldDirty: true });
    }
}

type PurchaseLineItemsProps = {
    // name: 'purchaseLineItems'; // e.g., 'purchaseLineItems'
    title: string;
};

// type MetaType = {
//     [key: string]: number;
// };
