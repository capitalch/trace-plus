import { useFormContext } from "react-hook-form";
// import { NumericFormat } from "react-number-format";
import clsx from "clsx";
import { PurchaseFormDataType } from "../all-purchases/all-purchases";
import { WidgetAstrix } from "../../../../../controls/widgets/widget-astrix";
import Decimal from "decimal.js";
import { Utils } from "../../../../../utils/utils";
import { useEffect } from "react";
import { ControlledNumericInput } from "../../../../../controls/components/controlled-numeric-input";
// import { Messages } from "../../../../../utils/messages";

export function PurchaseTotalsPanel({ className }: { className?: string }) {
  const { setValue, watch, trigger, formState: { errors } } = useFormContext<PurchaseFormDataType>();

  const lineItems = watch("purchaseLineItems") || [];
  const totalInvoiceAmount = watch("totalInvoiceAmount");
  // const totalQty = watch("totalQty");
  const totalCgst = watch("totalCgst");
  const totalSgst = watch("totalSgst");
  const totalIgst = watch("totalIgst");
  const isIgst = watch("isIgst");
  const isGstInvoice = watch('isGstInvoice');

  const errorClass = 'bg-red-100 border-red-500 border-2'
  const inputClass = " border-gray-300 focus:outline-none text-right font-semibold text-[16px] w-[10rem] h-7 rounded-md";
  const calcTotal = {
    amount: new Decimal(0),
    qty: new Decimal(0),
    cgst: new Decimal(0),
    sgst: new Decimal(0),
    igst: new Decimal(0),
  };

  for (const item of lineItems) {
    calcTotal.amount = calcTotal.amount.plus(item.amount || 0);
    calcTotal.qty = calcTotal.qty.plus(item.qty || 0);
    calcTotal.cgst = calcTotal.cgst.plus(item.cgst || 0);
    calcTotal.sgst = calcTotal.sgst.plus(item.sgst || 0);
    calcTotal.igst = calcTotal.igst.plus(item.igst || 0);
  }
  const clearTotals = () => {
    setValue("totalInvoiceAmount", 0);
    setValue("totalQty", 0);
    setValue("totalCgst", 0);
    setValue("totalSgst", 0);
    setValue("totalIgst", 0);
  };

  useEffect(() => {
    if (isIgst) {
      setValue("totalCgst", 0, { shouldValidate: true });
      setValue("totalSgst", 0, { shouldValidate: true });
    } else {
      setValue("totalIgst", 0, { shouldValidate: true });
    }
  }, [isIgst, setValue]);

  return (
    <div className={clsx(className, "grid grid-cols-2 gap-x-4 text-[12px]")}>
      {/* Left Column */}
      <div className="flex flex-col gap-1">
        <div>
          <label className="text-gray-600 text-xs block">Invoice amount <WidgetAstrix /></label>
          {/* Invoice amount */}
          <ControlledNumericInput
            className={clsx(inputClass, errors?.totalInvoiceAmount && errorClass, 'mt-0.5')}
            fieldName="totalInvoiceAmount"
            onValueChange={(floatValue) => {
              setValue('totalInvoiceAmount', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
            }}
            validate={(value) => {
              return Utils.isAlmostEqual(value, calcTotal.amount.toNumber(), .15, .99) //Decimal(value).equals(calcTotal.amount)
                ? true
                : `Mismatch: should be ${calcTotal.amount.toFixed(2)}`;
            }}
          />
        </div>

        <div>
          <label className="text-gray-600 text-xs block">Total qty <WidgetAstrix /></label>
          {/* Qty */}
          <ControlledNumericInput
            className={clsx(inputClass, errors?.totalQty && errorClass, 'mt-0.5')}
            fieldName="totalQty"
            onValueChange={(floatValue) => {
              setValue('totalQty', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
            }}
            validate={(value) => {
              return Decimal(value || 0).equals(calcTotal.qty)
                ? true
                : `Mismatch: should be ${calcTotal.qty.toFixed(2)}`;
            }}
          />
        </div>

        <div className="mt-4">
          <button
            type="button"
            tabIndex={-1}
            onClick={clearTotals}
            className="text-blue-600 text-[11px] underline"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-1">
        {/* cgst */}
        <div>
          <label className="text-gray-600 text-xs block">Cgst {!isIgst && <WidgetAstrix />}</label>
          <ControlledNumericInput
            className={clsx(inputClass, errors?.totalCgst && errorClass, 'mt-0.5')}
            fieldName="totalCgst"
            onValueChange={(floatValue) => {
              setValue('totalSgst', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
              trigger(['totalSgst', 'totalIgst'])
            }}
            validate={(value) =>
              isValidCgst(value || 0) && isValidCgstSgstIgst()
                ? true
                : `Mismatch: should be ${calcTotal.cgst.toFixed(2)}`}
          />
        </div>

        <div>
          <label className="text-gray-600 text-xs block">Sgst {!isIgst && <WidgetAstrix />}</label>
          {/* sgst */}
          <ControlledNumericInput
            className={clsx(inputClass, errors?.totalSgst && errorClass, 'mt-0.5')}
            fieldName="totalSgst"
            onValueChange={(floatValue) => {
              setValue('totalCgst', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
              trigger(['totalCgst', 'totalIgst'])
            }}
            validate={(value) =>
              isValidSgst(value || 0) && isValidCgstSgstIgst()
                ? true
                : `Mismatch: should be ${calcTotal.sgst.toFixed(2)}`}
          />
        </div>

        <div>
          <label className="text-gray-600 text-xs block">Igst {isIgst && <WidgetAstrix />}</label>
          {/* igst */}
          <ControlledNumericInput
            className={clsx(inputClass, errors?.totalIgst && errorClass, 'mt-0.5')}
            fieldName="totalIgst"
            onValueChange={(floatValue) => {
              setValue('totalIgst', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
              trigger(['totalCgst', 'totalSgst'])
            }}
            validate={(value) =>
              isValidIgst(value || 0) && isValidCgstSgstIgst()
                ? true
                : `Mismatch: should be ${calcTotal.igst.toFixed(2)}`}
          />
        </div>
      </div>
    </div>
  );

  function isValidCgst(val: number) {
    if ((!Utils.isAlmostEqual(val, calcTotal.cgst.toNumber(), .01, .99)) && (!isIgst)) {
      return (false)
    }
    return true
  }

  function isValidSgst(val: number) {
    if ((!Utils.isAlmostEqual(val, calcTotal.sgst.toNumber(), .01, .99)) && (!isIgst)) {
      return (false)
    }
    return true
  }

  function isValidIgst(val: number) {
    if ((!Utils.isAlmostEqual(val, calcTotal.igst.toNumber(), .01, .99)) && isIgst) {
      return (false)
    }
    return true
  }

  function isValidCgstSgstIgst() {
    if ((totalCgst !== 0) && (totalIgst !== 0)) {
      return false
    }
    if ((isGstInvoice) && (totalInvoiceAmount !== 0)) {
      if ((totalCgst === 0) && (totalSgst === 0) && (totalIgst === 0)) {
        return false
      }
    }
    if ((isGstInvoice) && (totalCgst !== 0) && (totalSgst !== 0) && (totalIgst !== 0)) {
      return false
    }
    return true
  }
}