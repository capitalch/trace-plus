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
import Decimal from "decimal.js";
import { useStockJournalLineItems } from "./stock-journal-line-items-hook";
import { IconClear1 } from "../../../../../controls/icons/icon-clear1";

export function StockJournalLineItems({
  name,
  instance,
  title
}: StockJournalLineItemsType) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { clearErrors, control, watch, register, setValue, trigger, formState: { errors } } =
    useFormContext<StockJournalType>();

  const sourceFields = useFieldArray({ control, name: "inputLineItems" });
  const outputFields = useFieldArray({ control, name: "outputLineItems" });

  const { fields, append, remove } =
    name === "inputLineItems" ? sourceFields : outputFields;

  const {
    errorIndicatorAndTooltipForSerialNumber,
    getSnError,
    handleClearAllRows,
    handleDeleteRow,
    handleProductClear,
    handleProductSearch,
    onChangeProductCode,
  } = useStockJournalLineItems(
    name,
    instance,
    clearErrors,
    fields,
    remove,
    setValue,
    trigger,
    watch)

  return (
    <div className="flex flex-col">
      <label className="font-medium">{title || "Source"}</label>
      <table className="border-2 border-gray-100 border-separate border-spacing-0">
        <thead>
          <tr className="font-medium text-left text-primary-500 text-sm bg-gray-100">
            <th className="p-2 w-10">#</th>
            <th className="p-2 w-32">
              UPC | Product Code <WidgetAstrix />
            </th>
            <th className="p-2 w-xs">
              Details <WidgetAstrix />
            </th>
            <th className="p-2 w-36">Line Ref No</th>
            <th className="p-2">Line Remarks</th>
            <th className="p-2 pr-4 w-28 text-right">
              Qty <WidgetAstrix />
            </th>
            <th className="p-2 pr-4 w-40 text-right">Price</th>
            <th className="p-2">Serial Numbers</th>
            <th className="p-2 pr-4 w-36 text-right">Amount</th>
            <th className=""></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((_, index) => {
            const qty = watch(`${name}.${index}.qty`);
            const price = watch(`${name}.${index}.price`);
            const amount = qty * price;
            return (
              <tr
                key={index}
                className={clsx(
                  "hover:bg-gray-50 cursor-pointer",
                  index === selectedIndex && "outline outline-teal-500"
                )}
                onClick={() => {
                  setSelectedIndex(index);
                }}
              >

                {/* index */}
                <td className="p-2 align-top">
                  <span>{index + 1}</span>
                  <button
                    aria-label="Clear Product"
                    tabIndex={-1}
                    type="button"
                    onClick={() => handleProductClear(index)}
                    className="text-blue-500"
                  >
                    <IconClear />
                  </button>
                </td>

                {/* product code */}
                <td className="flex flex-col p-2 w-40 align-top">

                  <input
                    type="text"
                    {...register(`${name}.${index}.productCode`, {
                      onChange: (e) => onChangeProductCode(e, index),
                      required: Messages.errRequired
                    })}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    value={watch(`${name}.${index}.productCode`) ?? ""}
                    className={clsx(
                      "border p-2 rounded w-full",
                      inputFormFieldStyles, errors[name]?.[index]?.productCode ? 'bg-red-200 border-red-500' : ''
                    )}
                  />
                  <button
                    tabIndex={-1}
                    type="button"
                    className="flex items-center mt-2 text-blue-600 text-sm"
                    onClick={() => handleProductSearch(index)}
                  >
                    <IconSearch className="mr-1" />
                    Search Product
                  </button>
                  <span
                    tabIndex={-1}
                    className="mt-1 text-teal-500 text-xs"
                  >
                    {watch(`${name}.${index}.upcCode`) || "------------"}
                  </span>
                </td>

                {/* product details */}
                <td className="p-2 font-semibold align-top">
                  <textarea
                    tabIndex={-1}
                    rows={3}
                    {...register(`${name}.${index}.productDetails`, {
                      required: Messages.errRequired
                    })}
                    className={clsx(
                      "border px-2 py-0.5 rounded w-full bg-gray-100 text-xs",
                      inputFormFieldStyles,
                    )}
                    value={watch(`${name}.${index}.productDetails`) ?? ""}
                    readOnly
                  />
                </td>

                {/* ref no */}
                <td className="p-2 align-top">
                  <input
                    type="text"
                    {...register(`${name}.${index}.lineRefNo`)}
                    className={clsx(
                      "border p-2 rounded w-full text-xs h-10",
                      inputFormFieldStyles
                    )}
                    value={watch(`${name}.${index}.lineRefNo`) ?? ""}
                  />
                </td>

                {/* line remarks */}
                <td className="p-2 align-top">
                  <textarea
                    rows={3}
                    {...register(`${name}.${index}.lineRemarks`)}
                    className={clsx(
                      "border p-2 rounded w-full text-xs",
                      inputFormFieldStyles
                    )}
                    value={watch(`${name}.${index}.lineRemarks`) ?? ""}
                  />
                </td>

                {/* qty */}
                <td className="p-2 align-top">
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
                      setValue(`${name}.${index}.qty`, values.floatValue ?? 0, {
                        shouldValidate: true,
                        shouldDirty: true
                      })}
                    thousandSeparator={true}
                    value={watch(`${name}.${index}.qty`)}
                    className={clsx(
                      "border p-2 rounded w-full text-right",
                      inputFormFieldStyles, errors[name]?.[index]?.qty ? 'bg-red-200 border-red-500' : ''
                    )}
                  />
                </td>

                {/* price */}
                <td className="p-2 align-top">
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
                <td className="relative p-2 align-top">
                  <textarea
                    {...register(`${name}.${index}.serialNumbers`, {
                      validate: () =>
                        getSnError(index)
                    })}
                    rows={3}
                    value={watch(`${name}.${index}.serialNumbers`) ?? ""}
                    className={clsx(
                      "border p-2 rounded w-full",
                      inputFormFieldStyles,
                      getSnError(index) ? "bg-red-100 border-red-500" : ""
                    )}
                    placeholder="Comma-separated serials"
                  />
                  {/* Error Indicator & Tooltip Button */}
                  {errorIndicatorAndTooltipForSerialNumber(index)}
                </td>

                {/* amount */}
                <td className="p-2 align-top">
                  <NumericFormat
                    allowNegative={false}
                    disabled
                    readOnly
                    decimalScale={2}
                    defaultValue={0}
                    fixedDecimalScale={true}
                    thousandSeparator={true}
                    value={amount}
                    className={clsx("p-2 rounded w-full text-right bg-gray-100", inputFormFieldStyles)}
                  />
                </td>

                {/* delete */}
                <td className="p-2 align-top">
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
            );
          })}
        </tbody>

        <tfoot className="">
          <tr className="font-semibold text-primary-500 bg-gray-100">

            {/* Add item */}
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
                  });
                  setSelectedIndex(fields.length);
                }}
                className="flex items-center my-2 px-2 py-2 w-36 text-white bg-blue-500 rounded hover:bg-blue-700 gap-2"
              >
                <IconPlus />
                Add Item
              </button>
            </td>

            <td className="flex">
              <button
                type="button"
                onClick={handleClearAllRows}
                className="flex items-center my-2 ml-2 px-2 py-2 w-28 text-white bg-amber-500 rounded hover:bg-amber-700 gap-2"
              >
                <IconClear1 />
                Clear All
              </button>
            </td>

            <td className="text-right" colSpan={2}>
              Total
            </td>

            {/* Total Qty */}
            <td className="pr-4 text-right">
              <NumericFormat
                value={fields.reduce(
                  (sum, _, index) =>
                    new Decimal(sum)
                      .plus(watch(`${name}.${index}.qty`) || 0)
                      .toNumber(),
                  0
                )}
                displayType="text"
                thousandSeparator
                decimalScale={2}
                fixedDecimalScale
              />
            </td>
            <td colSpan={2}></td>
            
            {/* Total Amount */}
            <td className="pr-2 text-right" colSpan={2}>
              <NumericFormat
                value={fields
                  .reduce((sum, _, index) => {
                    const qty = new Decimal(
                      watch(`${name}.${index}.qty`) || 0
                    );
                    const price = new Decimal(
                      watch(`${name}.${index}.price`) || 0
                    );
                    return sum.plus(qty.times(price));
                  }, new Decimal(0))
                  .toNumber()}
                displayType="text"
                thousandSeparator
                decimalScale={2}
                fixedDecimalScale
              />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

}

type StockJournalLineItemsType = {
  instance: string;
  name: "inputLineItems" | "outputLineItems";
  title: string;
};
