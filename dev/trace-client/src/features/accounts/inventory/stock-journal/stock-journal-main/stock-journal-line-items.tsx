import { useFieldArray, useFormContext } from "react-hook-form";
import { StockJournalType } from "./stock-journal-main";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";
import { NumericFormat } from "react-number-format";
import { Messages } from "../../../../../utils/messages";
import { IconDelete } from "../../../../../controls/icons/icon-delete";
import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import { useState } from "react";
import { Utils } from "../../../../../utils/utils";
import { ProductInfoType, ProductSelectFromGrid } from "../../../../../controls/components/product-select-from-grid";
// import { Messages } from "../../../../../utils/messages";

export function StockJournalLineItems({ name, instance, title }: StockJournalLineItemsType) {
    const [selectedIndex, setSeletedIndex] = useState(0)
    const {clearErrors, control, watch, register, setValue, } =
        useFormContext<StockJournalType>();

    // const { fields, append, remove, insert } = useFieldArray({
    //     control,
    //     name: name
    // });
    const sourceFields = useFieldArray({ control, name: 'sourceLineItems' });
    const destFields = useFieldArray({ control, name: 'destLineItems' });

    const { fields, append, insert, remove, } = name === 'sourceLineItems' ? sourceFields : destFields;

    return (<div className="flex flex-col">
        <label className="font-bold">{title || 'Source'}</label>
        <table className="border-separate border-spacing-0 border-2 border-gray-100 ">
            <thead>
                <tr className="bg-gray-100 text-primary-500 text-xs font-medium text-left">
                    <th className="p-2 w-10 ">#</th>
                    <th className="p-2 w-32">UPC / Product Code <WidgetAstrix /></th>
                    <th className="p-2 w-xs">Product Details <WidgetAstrix /></th>
                    <th className="p-2 w-36">Line Ref No</th>
                    <th className="p-2">Line Remarks</th>
                    <th className="p-2 w-28 text-right pr-4">Qty <WidgetAstrix /></th>
                    <th className="p-2 w-40 text-right pr-4">Price</th>
                    <th className="p-2">Serial Numbers</th>
                    <th className="p-2 w-36 text-right pr-4">Amount</th>
                    <th className=""></th>
                </tr>
            </thead>
            <tbody>
                {
                    fields.map((item, index) => {

                        return (
                            <tr key={index}
                                // className={clsx("hover:bg-gray-50 border-4", {  
                                //     'border-amber-500': index === selectedIndex,  
                                //     'border-gray-100': index !== selectedIndex  
                                // } )}
                                className={clsx(
                                    "hover:bg-gray-50 cursor-pointer",
                                    (index === selectedIndex) && "outline-1 outline-teal-500"
                                )}
                                onClick={() => setSeletedIndex(index)}
                            >

                                {/* index */}
                                <td className="p-2">
                                    <span>{index + 1}</span>
                                    <button
                                        aria-label="Clear Product"
                                        tabIndex={-1}
                                        type="button"
                                        onClick={() => handleProductClear(index)}
                                        className="text-blue-500">
                                        <IconClear />
                                    </button>
                                </td>

                                {/* product code */}
                                <td className="p-2 flex flex-col w-40">
                                    <span
                                        tabIndex={-1}
                                        className="text-xs mb-1 text-teal-500 text-center"
                                    >
                                        {watch(`${name}.${index}.upcCode`) ||
                                            "------------"}
                                    </span>
                                    <input type="text"
                                        {...register(`${name}.${index}.productCode`, {
                                            // onChange: (e) => onChangeProductCode(e, index),
                                            // validate: () => {
                                            //     return productId
                                            //         ? true
                                            //         : Messages.errProductNotSelected;
                                            // }
                                        })}
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        value={
                                            watch(`${name}.${index}.productCode`) ?? ""
                                        }
                                        className={clsx(
                                            "border p-2 rounded w-full",
                                            inputFormFieldStyles,
                                            // productId ? "" : "border-red-500 bg-red-100"
                                        )} />
                                    <button className="text-xs text-blue-600 flex items-center mt-1 ml-2"
                                        onClick={() => handleProductSearch(index)}
                                    >
                                        <IconSearch className="mr-1" />
                                        Search Product</button>
                                </td>

                                {/* product details */}
                                <td className="p-2 font-semibold">
                                    <textarea
                                        tabIndex={-1}
                                        rows={3}
                                        {...register(`${name}.${index}.productDetails`)}
                                        className={clsx(
                                            "border px-2 py-0.5 rounded w-full bg-gray-100 text-xs",
                                            inputFormFieldStyles
                                        )}
                                        readOnly
                                    />
                                </td>

                                {/* ref no */}
                                <td className="p-2">
                                    <input
                                        type="text"
                                        {...register(`${name}.${index}.lineRefNo`)}
                                        className={clsx(
                                            "border p-2 rounded w-full text-xs",
                                            inputFormFieldStyles
                                        )}
                                        value={
                                            watch(`${name}.${index}.lineRefNo`) ?? ""
                                        }
                                    // onChange={(e) => {
                                    //     setValue(
                                    //         `${name}.${index}.lineRefNo`,
                                    //         e.target.value,
                                    //         { shouldValidate: true, shouldDirty: true })
                                    // }}
                                    />
                                </td>

                                {/* line remarks */}
                                <td className="p-2">
                                    <textarea
                                        rows={3}
                                        {...register(`${name}.${index}.lineRemarks`)}
                                        className={clsx(
                                            "border p-2 rounded w-full text-xs",
                                            inputFormFieldStyles
                                        )}
                                        value={
                                            watch(`${name}.${index}.lineRemarks`) ?? ""
                                        }
                                    />
                                </td>

                                {/* qty */}
                                <td className="p-2 relative">
                                    <NumericFormat
                                        allowNegative={false}
                                        decimalScale={2}
                                        defaultValue={0}
                                        fixedDecimalScale={true}
                                        {...register(`${name}.${index}.qty`, {
                                            validate: (value) =>
                                                value !== 0 || Messages.errQtyCannotBeZero
                                        })}
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        onValueChange={(values) =>
                                            setValue(
                                                `${name}.${index}.qty`,
                                                values.floatValue ?? 0,
                                                { shouldValidate: true, shouldDirty: true }
                                            )
                                        }
                                        thousandSeparator={true}
                                        value={watch(`${name}.${index}.qty`)}
                                        className={clsx(
                                            "border p-2 rounded w-full text-right",
                                            inputFormFieldStyles,
                                            // qty === 0 ? "border-red-500 bg-red-100" : ""
                                        )}
                                    />
                                    {/* Error Indicator & Tooltip Button */}
                                    {/* {errorIndicatorAndTooltipForQty(index)} */}
                                </td>

                                {/* price */}
                                <td className="p-2">
                                    <NumericFormat
                                        allowNegative={false}
                                        decimalScale={2}
                                        defaultValue={0}
                                        fixedDecimalScale={true}
                                        {...register(`${name}.${index}.price`)}
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        onValueChange={(values) =>
                                            setValue(
                                                `${name}.${index}.price`,
                                                values.floatValue || 0,
                                                { shouldValidate: true, shouldDirty: true }
                                            )
                                        }
                                        thousandSeparator={true}
                                        value={watch(`${name}.${index}.price`)}
                                        className={clsx(
                                            "border p-2 rounded w-full text-right",
                                            inputFormFieldStyles
                                        )}
                                    />
                                </td>

                                {/* serial numbers */}
                                <td className="p-2 relative">
                                    <textarea
                                        {...register(`${name}.${index}.serialNumbers`, {
                                            // validate: (input: string | null) =>
                                            //     validateSerialNumbers(input, index)
                                        })}
                                        rows={3}
                                        value={
                                            watch(`${name}.${index}.serialNumbers`) ??
                                            ''
                                        }
                                        className={clsx(
                                            "border p-2 rounded w-full",
                                            inputFormFieldStyles,
                                            // getSnError(index) ? "border-red-500 bg-red-100" : ""
                                        )}
                                        placeholder="Give comma separated serial numbers"
                                    />
                                    {/* Error Indicator & Tooltip Button */}
                                    {/* {errorIndicatorAndTooltipForSerialNumber(index)} */}
                                </td>

                                {/* amount */}
                                <td className="p-2">
                                    <NumericFormat
                                        allowNegative={false}
                                        disabled
                                        readOnly
                                        decimalScale={2}
                                        defaultValue={0}
                                        fixedDecimalScale={true}
                                        onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                                        thousandSeparator={true}
                                        // value={amount}
                                        className="border p-2 rounded w-full text-right bg-gray-100"
                                    />
                                </td>

                                {/* delete */}
                                <td className="p-2">
                                    <button
                                        aria-label="Delete Row"
                                        tabIndex={-1}
                                        type="button"
                                        onClick={() => handleDeleteRow(index, remove)}
                                        className="text-red-500"
                                    >
                                        <IconDelete />
                                    </button>
                                </td>

                            </tr>
                        )
                    })
                }
            </tbody>
            <tfoot className="">
                <tr className="font-semibold text-primary-500">
                    <td colSpan={2}>
                        <button
                            type="button"
                            onClick={() => {
                                append({
                                    productId: undefined,
                                    productCode: "",
                                    productDetails: "",
                                    lineRefNo: "",
                                    qty: 1,
                                    price: 0,
                                    amount: 0,
                                    lineRemarks: "",
                                    serialNumbers: "",
                                    upcCode: ""
                                })
                                setSeletedIndex(fields.length)
                            }
                            }
                            className="px-2 py-2 bg-blue-500 text-white rounded w-36 flex items-center gap-2 mt-2"
                        >
                            <IconPlus />
                            Add Product
                        </button>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>)

    function handleDeleteRow(index: number, remove: any) {
        // const productLineItems = watch("productLineItems");
        // const id = watch(`productLineItems.${index}.id`);
        // if (productLineItems.length === 1) {
        //   Utils.showAlertMessage("Oops!", Messages.messMustKeepOneRow);
        //   return;
        // }
        // if (id) {
        //   console.log(id);
        //   if (!context.DataInstances?.[instance]) {
        //     context.DataInstances[instance] = { deletedIds: [] };
        //   }
        //   context.DataInstances[instance].deletedIds.push(id);
        // }
        remove(index);
    }

    function handleProductClear(index: number) {
        console.log(index)
    }

    function handleProductSearch(index: number) {
        Utils.showHideModalDialogA({
            isOpen: true,
            size: "lg",
            element: <ProductSelectFromGrid onSelect={onProductSelect} />,
            title: "Select a product"
        });

        function onProductSelect(args: ProductInfoType) {
              clearErrors(`${name}.${index}.productCode`);
              setValue(`${name}.${index}.productCode`, args.productCode);
              setValue(`${name}.${index}.productId`, args.id, {
                shouldValidate: true,
                shouldDirty: true
              });
              setValue(
                `${name}.${index}.productDetails`,
                `${args.brandName} ${args.catName} ${args.label} ${args.info ?? ""}`
              );
              setValue(`${name}.${index}.price`, args.lastPurchasePrice);
              setValue(`${name}.${index}.upcCode`, args.upcCode);
        }
    }
}

type StockJournalLineItemsType = {
    instance: string
    name: 'sourceLineItems' | 'destLineItems'
    title: string
}