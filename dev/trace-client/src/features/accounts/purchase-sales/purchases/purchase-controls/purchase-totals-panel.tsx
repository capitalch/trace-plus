import { useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import clsx from "clsx";
import { PurchaseFormDataType } from "../all-purchases/all-purchases";
import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";

export function PurchaseTotalsPanel({ className }: { className?: string }) {
  const { setValue, watch, register, formState: { errors } } = useFormContext<PurchaseFormDataType>();
  const errorClass = 'bg-red-200 border-red-500 border-2'
  const totalInvoiceAmount = watch("totalInvoiceAmount");
  const totalQty = watch("totalQty");
  const totalCgst = watch("totalCgst");
  const totalSgst = watch("totalSgst");
  const totalIgst = watch("totalIgst");
  const isIgst = watch("isIgst");

  const clearTotals = () => {
    setValue("totalInvoiceAmount", 0);
    setValue("totalQty", 0);
    setValue("totalCgst", 0);
    setValue("totalSgst", 0);
    setValue("totalIgst", 0);
  };

  const inputClass = " border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent text-right font-semibold text-[16px] w-[10rem] h-7 rounded-md";

  return (
    <div className={clsx(className, "grid grid-cols-2 gap-x-4 text-[12px]")}>
      {/* Left Column */}
      <div className="flex flex-col gap-1">
        <div>
          <label className="text-gray-600 text-[11px] block">Invoice amount <WidgetAstrix /></label>
          {/* Invoice amount */}
          <NumericFormat
            thousandSeparator
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)}
            className={clsx(inputClass, errors?.totalInvoiceAmount ? errorClass : '')}
            {...register(`totalInvoiceAmount`, {
              validate: (value) => {
                let ret = undefined
                if (value) {
                  if (value !== 1000) {
                    ret = 'Error'
                  }
                } else {
                  ret = "Error"
                }
                return (ret)
              }
            })}
            value={totalInvoiceAmount}
            onValueChange={(v) =>
              setValue("totalInvoiceAmount", parseFloat(v.value || "0"), {
                shouldDirty: true,
              })
            }
          />
        </div>

        <div>
          <label className="text-gray-600 text-[11px] block">Total qty <WidgetAstrix /></label>
          {/* Qty */}
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
          <label className="text-gray-600 text-[11px] block">Cgst {!isIgst && <WidgetAstrix />}</label>
          {/* cgst */}
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
          <label className="text-gray-600 text-[11px] block">Sgst {!isIgst && <WidgetAstrix />}</label>
          {/* sgst */}
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
          <label className="text-gray-600 text-[11px] block">Igst {isIgst && <WidgetAstrix />}</label>
          {/* igst */}
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