import { BranchTransferType } from "./products-branch-transfer-main";
import { useFieldArray, useFormContext } from "react-hook-form";
import { IconSearch } from "../../../../../controls/icons/icon-search";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { NumericFormat } from "react-number-format";
import { Messages } from "../../../../../utils/messages";
import clsx from "clsx";
import { IconDelete } from "../../../../../controls/icons/icon-delete";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import Decimal from "decimal.js";
import _ from "lodash";
import { ChangeEvent, useEffect, useMemo } from "react";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { useProductsBranchTransferLineItems } from "./products-branch-transfer-line-items-hook";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";

export function ProductsBranchTransferLineItems({
  instance
}: {
  instance: string;
}) {
  const {
    errorIndicatorAndTooltipForProductId,
    errorIndicatorAndTooltipForQty,
    errorIndicatorAndTooltipForSerialNumber,
    getSnError,
    handleDeleteRow,
    handleProductClear,
    handleProductSearch,
    populateProductOnProductCode,
    validateSerialNumbers
  } = useProductsBranchTransferLineItems(instance);
  const { control, watch, register, setValue } =
    useFormContext<BranchTransferType>();
  const { context } = useUtilsInfo();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "productLineItems"
  });

  const onChangeProductCode = useMemo(
    // For debounce
    () =>
      _.debounce((e: ChangeEvent<HTMLInputElement>, index: number) => {
        populateProductOnProductCode(e.target.value, index);
      }, 2000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(() => {
    return () => onChangeProductCode.cancel();
  }, [onChangeProductCode]);

  useEffect(() => {
    return () => {
      if (context.DataInstances?.[instance]) {
        // eslint-disable-next-line react-hooks/immutability
        context.DataInstances[instance].deletedIds = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="">
      <label className="font-medium">Products</label>
      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr className="text-primary-500 bg-gray-100">
            <th className="p-2 w-10 border">#</th>
            <th className="p-2 w-32 font-medium text-xs border">
              UPC / Product Code
            </th>
            <th className="p-2 w-xs border">Product Details</th>
            <th className="p-2 w-36 border">Line Ref No</th>
            <th className="p-2 border">Line Remarks</th>
            <th className="p-2 w-28 text-right border">Qty</th>
            <th className="p-2 w-40 text-right border">Price</th>
            <th className="p-2 border">Serial Numbers</th>
            <th className="p-2 w-36 text-right border">Amount</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((item, index) => {
            const qty = watch(`productLineItems.${index}.qty`);
            const price = watch(`productLineItems.${index}.price`);
            const productId = watch(`productLineItems.${index}.productId`);
            const amount = qty * price;

            return (
              <tr key={item.id} className="border hover:bg-gray-50">
                {/* index */}
                <td className="p-2 border">{index + 1}</td>

                {/* product code */}
                <td className="flex relative flex-col p-2 w-40">
                  <span
                    tabIndex={-1}
                    className="mb-1 text-center text-teal-500 text-xs"
                  >
                    {watch(`productLineItems.${index}.upcCode`) ||
                      "------------"}
                  </span>
                  <div className="flex items-center justify-center align-middle">
                    <input
                      type="text"
                      {...register(`productLineItems.${index}.productCode`, {
                        onChange: (e) => onChangeProductCode(e, index),
                        validate: () => {
                          return productId
                            ? true
                            : Messages.errProductNotSelected;
                        }
                      })}
                      onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                      value={
                        watch(`productLineItems.${index}.productCode`) ?? ""
                      }
                      className={clsx(
                        "border p-2 rounded w-full",
                        inputFormFieldStyles,
                        productId ? "" : "border-red-500 bg-red-100"
                      )}
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        aria-label="Search Product"
                        tabIndex={-1}
                        type="button"
                        onClick={() => handleProductSearch(index)}
                        className="ml-2 text-blue-500"
                      >
                        <IconSearch />
                      </button>
                      <button
                        aria-label="Clear Product"
                        tabIndex={-1}
                        type="button"
                        onClick={() => handleProductClear(index)}
                        className="ml-2 text-blue-500"
                      >
                        <IconClear />
                      </button>
                    </div>
                  </div>
                  {/* Error Indicator & Tooltip Button */}
                  {errorIndicatorAndTooltipForProductId(index)}
                </td>

                {/* product details */}
                <td className="p-2 font-semibold border">
                  <textarea
                    tabIndex={-1}
                    rows={3}
                    {...register(`productLineItems.${index}.productDetails`)}
                    className={clsx(
                      "border px-2 py-0.5 rounded w-full bg-gray-100 text-xs",
                      inputFormFieldStyles
                    )}
                    readOnly
                  />
                </td>

                {/* ref no */}
                <td className="p-2 border">
                  <input
                    type="text"
                    {...register(`productLineItems.${index}.lineRefNo`)}
                    className={clsx(
                      "border p-2 rounded w-full text-xs",
                      inputFormFieldStyles
                    )}
                  />
                </td>

                {/* line remarks */}
                <td className="p-2 border">
                  <textarea
                    rows={3}
                    {...register(`productLineItems.${index}.lineRemarks`)}
                    className={clsx(
                      "border p-2 rounded w-full text-xs",
                      inputFormFieldStyles
                    )}
                  />
                </td>

                {/* qty */}
                <td className="relative p-2 border">
                  <NumericFormat
                    allowNegative={false}
                    decimalScale={2}
                    defaultValue={0}
                    fixedDecimalScale={true}
                    {...register(`productLineItems.${index}.qty`, {
                      validate: (value) =>
                        value !== 0 || Messages.errQtyCannotBeZero
                    })}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    onValueChange={(values) =>
                      setValue(
                        `productLineItems.${index}.qty`,
                        values.floatValue ?? 0,
                        { shouldValidate: true, shouldDirty: true }
                      )
                    }
                    thousandSeparator={true}
                    value={watch(`productLineItems.${index}.qty`)}
                    className={clsx(
                      "border p-2 rounded w-full text-right",
                      inputFormFieldStyles,
                      qty === 0 ? "border-red-500 bg-red-100" : ""
                    )}
                  />
                  {/* Error Indicator & Tooltip Button */}
                  {errorIndicatorAndTooltipForQty(index)}
                </td>

                {/* price */}
                <td className="p-2 border">
                  <NumericFormat
                    allowNegative={false}
                    decimalScale={2}
                    defaultValue={0}
                    fixedDecimalScale={true}
                    {...register(`productLineItems.${index}.price`)}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    onValueChange={(values) =>
                      setValue(
                        `productLineItems.${index}.price`,
                        values.floatValue || 0,
                        { shouldValidate: true, shouldDirty: true }
                      )
                    }
                    thousandSeparator={true}
                    value={watch(`productLineItems.${index}.price`)}
                    className={clsx(
                      "border p-2 rounded w-full text-right",
                      inputFormFieldStyles
                    )}
                  />
                </td>

                {/* serial numbers */}
                <td className="relative p-2 border">
                  <textarea
                    {...register(`productLineItems.${index}.serialNumbers`, {
                      validate: (input: string | null) =>
                        validateSerialNumbers(input, index)
                    })}
                    rows={3}
                    value={
                      watch(`productLineItems.${index}.serialNumbers`) ??
                      undefined
                    }
                    className={clsx(
                      "border p-2 rounded w-full",
                      inputFormFieldStyles,
                      getSnError(index) ? "border-red-500 bg-red-100" : ""
                    )}
                    placeholder="Give comma separated serial numbers"
                  />
                  {/* Error Indicator & Tooltip Button */}
                  {errorIndicatorAndTooltipForSerialNumber(index)}
                </td>

                {/* amount */}
                <td className="p-2 border">
                  <NumericFormat
                    allowNegative={false}
                    disabled
                    readOnly
                    decimalScale={2}
                    defaultValue={0}
                    fixedDecimalScale={true}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    thousandSeparator={true}
                    value={amount}
                    className="p-2 w-full text-right bg-gray-100 border rounded"
                  />
                </td>

                {/* delete */}
                <td className="p-2 border">
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

        {/* Footer Row */}
        <tfoot>
          <tr className="font-semibold text-primary-500 bg-gray-200">
            <td colSpan={2}>
              <button
                type="button"
                onClick={() =>
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
                }
                className="flex items-center px-2 py-2 w-36 text-white bg-blue-500 rounded gap-2"
              >
                <IconPlus />
                Add Product
              </button>
            </td>
            <td className="p-2 text-right border" colSpan={3}>
              Total
            </td>

            {/* Total Qty */}
            <td className="p-2 text-right border">
              <NumericFormat
                value={fields.reduce(
                  (sum, _, index) =>
                    new Decimal(sum)
                      .plus(watch(`productLineItems.${index}.qty`) || 0)
                      .toNumber(),
                  0
                )}
                displayType="text"
                thousandSeparator
                decimalScale={2}
                fixedDecimalScale
              />
            </td>
            <td className="p-2 border"></td>
            <td className="p-2 border"></td>

            {/* Total Amount */}
            <td className="p-2 text-right border">
              <NumericFormat
                value={fields
                  .reduce((sum, _, index) => {
                    const qty = new Decimal(
                      watch(`productLineItems.${index}.qty`) || 0
                    );
                    const price = new Decimal(
                      watch(`productLineItems.${index}.price`) || 0
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
            <td className="p-2 border" colSpan={3}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
