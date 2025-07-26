import { useFieldArray, useFormContext } from "react-hook-form";
// import { useRef, useState } from "react";
import clsx from "clsx";
import Decimal from "decimal.js";
import { NumericFormat } from "react-number-format";
// import { IconDelete } from "../../../../../controls/icons/icon-delete";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import { IconClear1 } from "../../../../../controls/icons/icon-clear1";
// import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../../utils/messages";
import { IconCross } from "../../../../../controls/icons/icon-cross";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconSearch } from "../../../../../controls/icons/icon-search";
// import { Utils } from "../../../../../utils/utils";

export function PurchaseLineItems({ name, title }: PurchaseLineItemsProps) {
    // const [, setRefresh] = useState({});
    // const meta = useRef<MetaType>({ [name]: 0 });

    const {
        control,
        register,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<any>();

    const { fields, remove, insert } = useFieldArray({ control, name });
    console.log("Errors:", errors);
    const errorClass = 'bg-red-200 border-red-500'
    const handleAddRow = (index: number) => {
        insert(index + 1,
            {
                prCode: "",
                prDetails: "",
                hsn: "",
                qty: 1,
                gstRate: 0,
                price: 0,
                discount: 0,
                priceGst: 0,
                subTotal: 0,
                cgst: 0,
                sgst: 0,
                igst: 0,
                lineRemarks: "",
                serialNumbers: "",
            },
            { shouldFocus: false }
        );
        // meta.current[name] = index + 1;
        // setRefresh({});
    };

    const handleClearAll = () => {
        for (let i = fields.length - 1; i >= 1; i--) {
            remove(i);
        }
    };

    return (
        <div className="flex flex-col gap-4 -mt-4">
            <label className="font-medium mb-2">{title || "Line Items"}</label>
            {fields.map((_, index) => {
                const qty = new Decimal(watch(`${name}.${index}.qty`) || 0);
                const price = new Decimal(watch(`${name}.${index}.price`) || 0);
                const discount = new Decimal(watch(`${name}.${index}.discount`) || 0);
                const gstRate = new Decimal(watch(`${name}.${index}.gstRate`) || 0);
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
                        className="flex flex-wrap items-start border border-gray-300 rounded-md p-3 shadow-sm bg-white gap-3"
                    >
                        {/* Index */}
                        <div className="flex flex-col text-xs w-10">
                            <label className="font-semibold">#</label>
                            <span>{index + 1}</span>
                            <TooltipComponent content="Clear Product" position="TopCenter">
                                <button
                                    aria-label="Clear Product"
                                    tabIndex={-1}
                                    type="button"
                                    onClick={() => handleProductClear(index)}
                                    className="text-blue-500"
                                >
                                    <IconClear className="w-5 h-5" />
                                </button>
                            </TooltipComponent>
                        </div>

                        {/* Product Code | UPC */}
                        <div className="flex flex-col text-xs w-28">
                            <label className="font-semibold">Product Code | UPC</label>
                            <input {...register(`${name}.${index}.productCode`, {
                                required: Messages.errRequired,
                            })}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                className={clsx(inputFormFieldStyles, 'h-8',
                                    (errors[name] as any[] | undefined)?.[index]?.productCode ? errorClass : ''
                                )} />
                            {/* Search Product Button */}
                            <button
                                tabIndex={-1}
                                type="button"
                                className="text-sm text-blue-600 flex items-center mt-2 "
                                onClick={() => handleProductSearch(index)}
                            >
                                <IconSearch className="mr-1" />
                                Search Product
                            </button>
                            {/* UPC Code Display */}
                            <span
                                tabIndex={-1}
                                className="text-xs mt-1 text-teal-500 "
                            >
                                {watch(`${name}.${index}.upcCode`) || "------------"}
                            </span>
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-col text-xs w-40">
                            <label className="font-semibold">Details</label>
                            <textarea
                                rows={4}
                                tabIndex={-1}
                                {...register(`${name}.${index}.productDetails`, {
                                    required: Messages.errRequired
                                })}
                                readOnly
                                className={clsx("bg-gray-100 text-sm", inputFormFieldStyles,
                                    (errors[name] as any[] | undefined)?.[index]?.productDetails ? errorClass : '')} />
                        </div>

                        {/* Remarks */}
                        <div className="flex flex-col text-xs w-36">
                            <label className="font-semibold">Remarks</label>
                            <textarea {...register(`${name}.${index}.lineRemarks`)}
                                rows={4}
                                className={clsx("text-sm", inputFormFieldStyles)} />
                        </div>

                        {/* Hsn | Gst Rate */}
                        <div className="flex flex-col gap-2.5">
                            <div className="flex flex-col text-xs w-24">
                                <label className="font-semibold">HSN</label>
                                <input {...register(`${name}.${index}.hsn`)}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    className={clsx(inputFormFieldStyles, 'h-8')} />
                            </div>
                            <div className="flex flex-col text-xs w-20">
                                <label className="font-semibold">GST %</label>
                                <NumericFormat
                                    value={gstRate.toNumber()}
                                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                    thousandSeparator
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={clsx("text-right h-8",
                                        inputFormFieldStyles)}
                                    onValueChange={({ floatValue }) => setValue(`${name}.${index}.gstRate`, floatValue ?? 0, { shouldDirty: true })}
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
                                className={clsx("text-right h-8", inputFormFieldStyles)}
                                onValueChange={({ floatValue }) => setValue(`${name}.${index}.qty`, floatValue ?? 0, { shouldDirty: true })}
                            />
                        </div>

                        {/* Price */}
                        <div className="flex flex-col text-xs w-24">
                            <label className="font-semibold">Price</label>
                            <NumericFormat
                                value={price.toNumber()}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                thousandSeparator
                                decimalScale={2}
                                fixedDecimalScale
                                className={clsx("text-right h-8", inputFormFieldStyles)}
                                onValueChange={({ floatValue }) => setValue(`${name}.${index}.price`, floatValue ?? 0, { shouldDirty: true })}
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
                                className={clsx("text-right h-8", inputFormFieldStyles)}
                                onValueChange={({ floatValue }) => setValue(`${name}.${index}.discount`, floatValue ?? 0, { shouldDirty: true })}
                            />
                        </div>

                        {/* Price Gst*/}
                        <div className="flex flex-col text-xs w-24">
                            <label className="font-semibold">Price Gst</label>
                            <NumericFormat
                                value={priceGst.toNumber()}
                                onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                thousandSeparator
                                decimalScale={2}
                                fixedDecimalScale
                                className={clsx("text-right h-8", inputFormFieldStyles)}
                                onValueChange={({ floatValue }) => setValue(`${name}.${index}.priceGst`, floatValue ?? 0, { shouldDirty: true })}
                            />
                        </div>

                        {/* Serials */}
                        <div className="flex flex-col text-xs w-40">
                            <label className="font-semibold">Serials</label>
                            <textarea
                                {...register(`${name}.${index}.serialNumbers`)}
                                rows={4} className={clsx("text-sm", inputFormFieldStyles)} />
                        </div>

                        {/* Totals */}
                        <div className="flex flex-col text-[12px] w-26 rounded">
                            <div className="font-semibold text-xs">Totals</div>
                            <div>SubT: {subTotal.toFixed(2)}</div>
                            <div>CGST: {cgst.toFixed(2)}</div>
                            <div>SGST: {sgst.toFixed(2)}</div>
                            <div>IGST: {igst.toFixed(2)}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col w-40 ml-auto">
                            <NumericFormat
                                value={amount.toNumber()}
                                // {...register(`${name}.${index}.amount`)}
                                fixedDecimalScale
                                thousandSeparator
                                decimalScale={2}
                                disabled
                                readOnly
                                onValueChange={({ floatValue }) => setValue(`${name}.${index}.amount`, floatValue ?? 0, { shouldDirty: true })}
                                className={clsx("text-center font-bold border-0 bg-gray-100 text-gray-900 text-right", inputFormFieldStyles)}
                            />
                            <div className="flex items-center justify-center gap-8 mt-6 ml-auto">
                                <button
                                    type="button"
                                    className="text-red-500"
                                    onClick={() => remove(index)}
                                >
                                    <IconCross className="w-7 h-7" />
                                </button>
                                <button
                                    type="button"
                                    className="text-green-600"
                                    onClick={() => handleAddRow(index)}
                                >
                                    <IconPlus className="w-6 h-6" />
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

    function handleProductClear(index: number) {
        setValue(`${name}.${index}.productId`, null, { shouldDirty: true });
        setValue(`${name}.${index}.productCode`, null, { shouldDirty: true });
        setValue(`${name}.${index}.upcCode`, null, { shouldDirty: true })
        setValue(`${name}.${index}.productDetails`, null, { shouldDirty: true });
        setValue(`${name}.${index}.hsn`, null, { shouldDirty: true });
        setValue(`${name}.${index}.gstRate`, 0, { shouldDirty: true });
        setValue(`${name}.${index}.qty`, 1, { shouldDirty: true });
        setValue(`${name}.${index}.price`, 0, { shouldDirty: true });
        setValue(`${name}.${index}.discount`, 0, { shouldDirty: true });

        setValue(`${name}.${index}.subTotal`, 0, { shouldDirty: true });
        setValue(`${name}.${index}.cgst`, 0, { shouldDirty: true });
        setValue(`${name}.${index}.sgst`, 0, { shouldDirty: true });
        setValue(`${name}.${index}.igst`, 0, { shouldDirty: true });
        setValue(`${name}.${index}.lineRemarks`, null, { shouldDirty: true });
        setValue(`${name}.${index}.serialNumbers`, null, { shouldDirty: true });
    }

    function handleProductSearch(index: number) {
        // Logic to open product search modal and set values
        // For now, just logging the index
        console.log("Search Product at index:", index);
        // You can implement a modal or dialog to search and select products
    }
}

type PurchaseLineItemsProps = {
    name: string; // e.g., 'purchaseLineItems'
    title: string;
};

// type MetaType = {
//     [key: string]: number;
// };
