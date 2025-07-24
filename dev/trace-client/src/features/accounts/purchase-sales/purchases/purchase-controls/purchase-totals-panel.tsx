import { useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import clsx from "clsx";
import { PurchaseFormDataType } from "../all-purchases/all-purchases";

export function PurchaseTotalsPanel({ className }: { className?: string }) {
  const { setValue, watch } = useFormContext<PurchaseFormDataType>();

  const totalInvoiceAmount = watch("totalInvoiceAmount");
  const totalQty = watch("totalQty");
  const totalCgst = watch("totalCgst");
  const totalSgst = watch("totalSgst");
  const totalIgst = watch("totalIgst");

  const clearTotals = () => {
    setValue("totalInvoiceAmount", 0);
    setValue("totalQty", 0);
    setValue("totalCgst", 0);
    setValue("totalSgst", 0);
    setValue("totalIgst", 0);
  };

  const inputClass = "border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent text-right font-semibold text-[16px] w-[10rem] h-7 rounded-md";

  return (
    <div className={clsx(className, "grid grid-cols-2 gap-x-4 text-[12px]")}>
      {/* Left Column */}
      <div className="flex flex-col gap-1">
        <div>
          <label className="text-gray-600 text-[11px] block">Invoice amount</label>
          <NumericFormat
            value={totalInvoiceAmount}
            thousandSeparator
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
            className={inputClass}
            onValueChange={(v) =>
              setValue("totalInvoiceAmount", parseFloat(v.value || "0"), {
                shouldDirty: true,
              })
            }
          />
        </div>

        <div>
          <label className="text-gray-600 text-[11px] block">Total qty</label>
          <NumericFormat
            value={totalQty}
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
            className={inputClass}
            onValueChange={(v) =>
              setValue("totalQty", parseFloat(v.value || "0"), {
                shouldDirty: true,
              })
            }
          />
        </div>

        <div className="mt-[2px]">
          <button
            type="button"
            onClick={clearTotals}
            className="text-blue-600 text-[11px] underline"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-1">
        <div>
          <label className="text-gray-600 text-[11px] block">Cgst</label>
          <NumericFormat
            value={totalCgst}
            decimalScale={2}
            thousandSeparator
            fixedDecimalScale
            allowNegative={false}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
            className={inputClass}
            onValueChange={(v) =>
              setValue("totalCgst", parseFloat(v.value || "0"), {
                shouldDirty: true,
              })
            }
          />
        </div>

        <div>
          <label className="text-gray-600 text-[11px] block">Sgst</label>
          <NumericFormat
            value={totalSgst}
            decimalScale={2}
            thousandSeparator
            fixedDecimalScale
            allowNegative={false}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
            className={inputClass}
            onValueChange={(v) =>
              setValue("totalSgst", parseFloat(v.value || "0"), {
                shouldDirty: true,
              })
            }
          />
        </div>

        <div>
          <label className="text-gray-600 text-[11px] block">Igst</label>
          <NumericFormat
            value={totalIgst}
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
            className={inputClass}
            onValueChange={(v) =>
              setValue("totalIgst", parseFloat(v.value || "0"), {
                shouldDirty: true,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}



// import { useFormContext } from "react-hook-form";
// import { NumericFormat } from "react-number-format";
// import clsx from "clsx";
// import { PurchaseFormDataType } from "../all-purchases/all-purchases";
// // import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";
// import { FormField } from "../../../../../controls/widgets/form-field";
// // import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";

// export function PurchaseTotalsPanel({ className }: { className?: string }) {
//     const { setValue, watch, formState:{errors} } = useFormContext<PurchaseFormDataType>();

//     const totalInvoiceAmount = watch("totalInvoiceAmount");
//     const totalQty = watch("totalQty");
//     const totalCgst = watch("totalCgst");
//     const totalSgst = watch("totalSgst");
//     const totalIgst = watch("totalIgst");

//     const clearTotals = () => {
//         setValue("totalInvoiceAmount", 0);
//         setValue("totalQty", 0);
//         setValue("totalCgst", 0);
//         setValue("totalSgst", 0);
//         setValue("totalIgst", 0);
//     };

//     const inputLeft = "input input-sm input-bordered h-7 w-[10rem] px-2 text-right text-[16px] font-medium rounded-lg border border-gray-200 hover:border-gray-400";
//     const inputRight = "input input-sm input-bordered h-7 w-[9rem] px-2 text-right text-[16px] font-medium rounded-lg border border-gray-200 hover:border-gray-400";

//     return (
//         <div
//             className={clsx(
//                 className,
//                 "grid grid-cols-2 gap-x-4 items-start  bg-gray-100 pl-2 py-1 border-2 border-gray-400 rounded-lg"
//             )}
//         >
//             {/* Left Column */}
//             <div className="flex flex-col justify-between gap-2 pt-[1px] pb-[2px]">

//                 {/* Invoice Amount*/}
//                 <FormField required label="Invoice Amount" error={errors?.totalInvoiceAmount?.message} className="mb-0">
//                     <NumericFormat
//                         value={totalInvoiceAmount}
//                         decimalScale={2}
//                         onFocus={(e) => setTimeout(() => e.target.select(), 0)}
//                         fixedDecimalScale
//                         allowNegative={false}
//                         thousandSeparator
//                         className={inputLeft}
//                         onValueChange={(v) =>
//                             setValue("totalInvoiceAmount", parseFloat(v.value || "0"), {
//                                 shouldDirty: true,
//                             })
//                         }
//                     />
//                 </FormField>

//                 {/* Qty */}
//                 <FormField required label="Total Qty" error={errors?.totalQty?.message}>
//                     <NumericFormat
//                         value={totalQty}
//                         onFocus={(e) => setTimeout(() => e.target.select(), 0)}
//                         decimalScale={2}
//                         fixedDecimalScale
//                         allowNegative={false}
//                         className={inputLeft}
//                         onValueChange={(v) =>
//                             setValue("totalQty", parseFloat(v.value || "0"), {
//                                 shouldDirty: true,
//                             })
//                         }
//                     />
//                 </FormField>

//                 {/* Clear Button */}
//                 <div className="flex-grow flex ">
//                     <button
//                         type="button"
//                         onClick={clearTotals}
//                         className="text-blue-600 text-[14px] mt-8 underline"
//                     >
//                         CLEAR
//                     </button>
//                 </div>
//             </div>

//             {/* Right Column */}
//             <div className="flex flex-col justify-between gap-2 pt-[1px] pb-[2px]">
//                 {/* CGST */}
//                 <FormField required label="CGST" className="">
//                     <NumericFormat
//                         value={totalCgst}
//                         onFocus={(e) => setTimeout(() => e.target.select(), 0)}
//                         decimalScale={2}
//                         fixedDecimalScale
//                         thousandSeparator
//                         allowNegative={false}
//                         className={inputRight}
//                         onValueChange={(v) =>
//                             setValue("totalCgst", parseFloat(v.value || "0"), {
//                                 shouldDirty: true,
//                             })
//                         }
//                     />
//                 </FormField>

//                 {/* SGST */}
//                 <FormField required label="SGST" className="">
//                     <NumericFormat
//                         value={totalSgst}
//                         thousandSeparator
//                         onFocus={(e) => setTimeout(() => e.target.select(), 0)}
//                         decimalScale={2}
//                         fixedDecimalScale
//                         allowNegative={false}
//                         className={inputRight}
//                         onValueChange={(v) =>
//                             setValue("totalSgst", parseFloat(v.value || "0"), {
//                                 shouldDirty: true,
//                             })
//                         }
//                     />
//                 </FormField>

//                 {/* IGST */}
//                 <FormField required label="IGST" className="">
//                     <NumericFormat
//                         value={totalIgst}
//                         onFocus={(e) => setTimeout(() => e.target.select(), 0)}
//                         decimalScale={2}
//                         fixedDecimalScale
//                         allowNegative={false}
//                         className={inputRight}
//                         onValueChange={(v) =>
//                             setValue("totalIgst", parseFloat(v.value || "0"), {
//                                 shouldDirty: true,
//                             })
//                         }
//                     />
//                 </FormField>
//             </div>
//         </div>
//     );
// }
