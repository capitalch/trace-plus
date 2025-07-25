import { useFieldArray, useFormContext } from "react-hook-form";
// import { useRef, useState } from "react";
import clsx from "clsx";
import Decimal from "decimal.js";
import { NumericFormat } from "react-number-format";
// import { IconDelete } from "../../../../../controls/icons/icon-delete";
import { IconPlus } from "../../../../../controls/icons/icon-plus";
import { IconClear1 } from "../../../../../controls/icons/icon-clear1";
import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../../utils/messages";
import { IconCross } from "../../../../../controls/icons/icon-cross";
import { IconClear } from "../../../../../controls/icons/icon-clear";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconSearch } from "../../../../../controls/icons/icon-search";

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
    <div className="flex flex-col -mt-4">
      <label className="font-medium">{title}</label>

      <table className="border border-gray-300 w-full">
        <thead className="bg-gray-100">
          <tr className="text-sm text-left">
            <th className="p-2 w-10">#</th>
            <th className="p-2 w-36">Pr Code | UPC</th>
            <th className="p-2 w-56">Details <WidgetAstrix /></th>
            <th className="p-2">Remarks</th>
            <th className="p-2 w-30">HSN | Gst %</th>
            <th className="p-2 text-right w-24">Qty <WidgetAstrix /></th>
            <th className="p-2 text-right w-36">Price</th>
            <th className="p-2 text-right w-32">Discount</th>
            {/* <th className="p-2 text-right">GST%</th> */}
            {/* <th className="p-2 text-right">SubTotal</th> */}
            <th className="p-2 text-right">Misc</th>
            {/* <th className="p-2 text-right">CGST</th>
            <th className="p-2 text-right">SGST</th>
            <th className="p-2 text-right">IGST</th> */}
            
            <th className="p-2">Serials</th>
            <th className="p-2 text-center">Add</th>
            <th className="p-2 text-center">Del</th>
          </tr>
        </thead>

        <tbody>
          {fields.map((_, index) => {
            const qty = new Decimal(watch(`${name}.${index}.qty`) || 0);
            const price = new Decimal(watch(`${name}.${index}.price`) || 0);
            const discount = new Decimal(watch(`${name}.${index}.discount`) || 0);
            const gstRate = new Decimal(watch(`${name}.${index}.gstRate`) || 0);

            // const subTotal = qty.times(price.minus(discount));
            // const gstValue = subTotal.times(gstRate.div(100));
            // const halfGst = gstValue.div(2);

            return (
              <tr key={index} className="text-sm border-t">

                {/* Index */}
                <td className="p-2 align-top">
                  <span>  {index + 1}</span>
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
                </td>

                {/* Product code */}
                <td className="p-2 flex flex-col align-top">
                  <input type="text"
                    {...register(`${name}.${index}.productCode`, {
                      required: Messages.errRequired,
                    })}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    className={clsx(
                      "w-full",
                      inputFormFieldStyles,
                      (errors[name] as any[] | undefined)?.[index]?.productCode ? 'bg-red-200 border-red-500' : ''
                    )}
                  />
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
                </td>

                {/* Details */}
                <td className="p-2 font-semibold align-top">
                  <textarea
                    tabIndex={-1}
                    rows={5}
                    {...register(`${name}.${index}.productDetails`, {
                      required: Messages.errRequired
                    })}
                    className={clsx(
                      "border px-2 py-0.5 rounded w-full bg-gray-100 text-xs",
                      inputFormFieldStyles,
                    )}
                    readOnly
                  />
                </td>

                {/* Remarks */}
                <td className="p-2 align-top">
                  <textarea
                    rows={5}
                    {...register(`${name}.${index}.lineRemarks`)}
                    className={clsx(
                      "w-full text-xs",
                      inputFormFieldStyles
                    )}
                    value={watch(`${name}.${index}.lineRemarks`) ?? ""}
                  />
                </td>
                {/* Hsn | Gst Rate */}
                <td className="p-2 align-top">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold"><input
                      {...register(`${name}.${index}.hsn`)}
                      placeholder="HSN"
                      className={clsx(inputFormFieldStyles, "h-8 text-sm font-normal")}
                      onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    /></label>

                    <label className="text-[10px] font-semibold"><NumericFormat
                      value={gstRate.toNumber()}
                      thousandSeparator
                      onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                      decimalScale={2}
                      fixedDecimalScale
                      className={clsx(inputFormFieldStyles, "text-right w-full h-8 font-normal")}
                      placeholder="GST %"
                      onValueChange={(val) =>
                        setValue(`${name}.${index}.gstRate`, val.floatValue || 0, {
                          shouldDirty: true,
                        })
                      }
                    /></label>

                  </div>
                </td>

                {/* Qty */}
                <td className="p-2 text-right align-top">
                  <NumericFormat
                    {...register(`${name}.${index}.qty`, {
                      required: Messages.errRequired,
                    })}
                    value={qty.toNumber()}
                    onValueChange={({ floatValue }) =>
                      setValue(`${name}.${index}.qty`, floatValue ?? 0, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    thousandSeparator
                    decimalScale={2}
                    fixedDecimalScale
                    className={clsx(inputFormFieldStyles, "w-full text-right")}
                  />
                </td>

                {/* Price */}
                <td className="p-2 text-right align-top">
                  <NumericFormat
                    {...register(`${name}.${index}.price`)}
                    value={price.toNumber()}
                    onValueChange={({ floatValue }) =>
                      setValue(`${name}.${index}.price`, floatValue ?? 0, {
                        shouldDirty: true,
                      })
                    }
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    fixedDecimalScale
                    thousandSeparator
                    decimalScale={2}
                    className={clsx(inputFormFieldStyles, "w-full text-right")}
                  />
                </td>

                {/* Discount */}
                <td className="p-2 text-right align-top">
                  <NumericFormat
                    {...register(`${name}.${index}.discount`)}
                    value={discount.toNumber()}
                    onValueChange={({ floatValue }) =>
                      setValue(`${name}.${index}.discount`, floatValue ?? 0, {
                        shouldDirty: true,
                      })
                    }
                    thousandSeparator
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    fixedDecimalScale
                    decimalScale={2}
                    className={clsx(inputFormFieldStyles, "w-full text-right")}
                  />
                </td>

                {/* Misc */}
                <td className="p-2 text-right">
                  <NumericFormat
                    {...register(`${name}.${index}.gstRate`)}
                    value={gstRate.toNumber()}
                    onValueChange={({ floatValue }) =>
                      setValue(`${name}.${index}.gstRate`, floatValue ?? 0, {
                        shouldDirty: true,
                      })
                    }
                    decimalScale={2}
                    className="w-full text-right"
                  />
                </td>

                {/* <td className="p-2 text-right">{subTotal.toFixed(2)}</td>
                <td className="p-2 text-right">{halfGst.toFixed(2)}</td>
                <td className="p-2 text-right">{halfGst.toFixed(2)}</td>
                <td className="p-2 text-right">{gstValue.toFixed(2)}</td> */}

                {/* Serials */}
                <td className="p-2 align-top">
                  <textarea
                    {...register(`${name}.${index}.serialNumbers`, {
                      // validate: () =>
                      //   getSnError(index)
                    })}
                    rows={3}
                    value={watch(`${name}.${index}.serialNumbers`) ?? ""}
                    className={clsx(
                      "border p-2 rounded w-full",
                      inputFormFieldStyles,
                      // getSnError(index) ? "bg-red-100 border-red-500" : ""
                    )}
                    placeholder="Comma-separated serials"
                  />
                </td>

                <td className="p-2 text-center">
                  <button
                    type="button"
                    className="text-green-600"
                    onClick={() => handleAddRow(index)}
                  >
                    <IconPlus className="w-6 h-6" />
                  </button>
                </td>

                <td className="p-2 text-center">
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => remove(index)}
                  >
                    <IconCross className="w-6 h-6" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-gray-50 font-semibold text-sm">
            <td colSpan={16}>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1 bg-amber-500 text-white rounded flex items-center gap-2 hover:bg-amber-700"
              >
                <IconClear1 />
                Clear All Rows
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
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
