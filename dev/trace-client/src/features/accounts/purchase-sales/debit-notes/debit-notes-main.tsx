import { useSelector } from "react-redux";
import _ from 'lodash'
import { FormField } from "../../../../controls/widgets/form-field";
// import { DebitNotesHeader } from "./debit-notes-header";
// import { DebitNotesLineItems } from "./debit-notes-line-items";
// import { DebitNotesSubHeader } from "./debit-notes-sub-header";
import { RootStateType } from "../../../../app/store";
import { useValidators } from "../../../../utils/validators-hook";
import { useFormContext } from "react-hook-form";
import { DebitNoteFormDataType } from "./debit-notes";
import clsx from "clsx";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../utils/messages";
import { IconReset } from "../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../controls/icons/icon-submit";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconPreview1 } from "../../../../controls/icons/icon-preview1";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { ControlledNumericInput } from "../../../../controls/components/controlled-numeric-input";
import { AccountPickerFlat } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";

export function DebitNotesMain() {
  const instance = DataInstancesMap.debitNotes;
  const activeTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[DataInstancesMap.debitNotes]?.activeTabIndex)
  // const { branchName, currentDateFormat } = useUtilsInfo();
  const { checkAllowedDate, isValidGstin } = useValidators();
  const {
    watch,
    register,
    setValue,
    trigger,
    formState: { errors, isSubmitting, isDirty, isValid }
  } = useFormContext<DebitNoteFormDataType>();
  const { resetAll }: any = useFormContext<DebitNoteFormDataType>();
  const errorClass = 'bg-red-100 border-red-500 border-2'
  const inputClass = " border-gray-300 focus:outline-none text-right font-semibold text-[16px] w-[10rem] h-7 rounded-md";
  // const isGstApplicable = watch('isGstApplicable')
  const isIgst = watch('igst')
  return (
    <div className="bg-white p-6 rounded  grid grid-cols-12 gap-6 relative">

      {/* header */}
      {/* Auto ref no */}
      <FormField label="Auto ref no" className="col-span-2 row-start-1">
        <input
          type="text"
          className={clsx("bg-gray-200 rounded mt-1")}
          readOnly
          disabled
          title="Auto reference number"
          value={watch("autoRefNo") ?? ''}
        />
      </FormField>

      {/* tran date */}
      <FormField label="Date" required error={errors?.tranDate?.message} className=" col-span-2">
        <input
          type="date"
          className={clsx(
            inputFormFieldStyles, 'mt-1',
            errors?.tranDate && "border-red-500 bg-red-100"
          )}
          {...register("tranDate", {
            required: Messages.errRequired,
            validate: checkAllowedDate
          })}
        />
      </FormField>

      {/* User ref no */}
      <FormField label="User Ref No" className="col-span-2">
        <input
          type="text"
          className={clsx(inputFormFieldStyles, 'mt-1')}
          placeholder="Enter user ref no"
          {...register("userRefNo")}
        />
      </FormField>

      {/* Remarks */}
      <FormField className=" col-span-4" label="Remarks" >
        <textarea
          rows={3}
          className={clsx(inputFormFieldStyles, "mt-1")}
          placeholder="Enter remarks"
          {...register("remarks")}
        />
      </FormField>

      {/* Reset submit */}
      <div className="flex gap-3 ml-auto mt-6 h-10 col-span-2">

        {/* Reset */}
        <button
          onClick={resetAll}
          type="button"
          className="px-5 font-medium text-white inline-flex items-center bg-amber-500 hover:bg-amber-800 focus:ring-4 focus:outline-hidden focus:ring-amber-300 rounded-lg text-center dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800 disabled:bg-amber-200"
        >
          <IconReset className="text-white w-6 h-6 mr-2" />
          Reset
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || (!isValid)}
          className="px-5 py-2 font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-hidden focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200"
        >
          <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit
        </button>
      </div>

      {/* Edit / New label */}
      <div className="flex absolute right-0 -top-13 gap-2">
        {getPrintPreview()}
        <label className=" text-amber-500 font-medium text-lg">{watch('id') ? 'Edit Debit Note' : 'New Debit Note'}</label>
      </div>

      {/* sub header */}
      <FormField label="Amount" required={true} error={errors?.amount?.message} className="row-start-2 col-span-2">
        <ControlledNumericInput
          className={clsx(inputFormFieldStyles, errors?.amount && errorClass, 'mt-1.5 text-right')}
          fieldName="amount"
          required={true}
          onValueChange={(floatValue) => {
            setValue('amount', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }}
          validate={
            (val: number) =>
              val !== null && val !== undefined && !isNaN(val) && val > 0
                ? true
                : Messages.errRequired
          }
        />
      </FormField>

      {/* Is GST Applicable */}
      <FormField label="GST Applicable ?" className="items-center flex flex-col col-span-2">
        <div className="flex items-center gap-2 mt-1.5">
          <button
            type="button"
            className={clsx(
              "px-4 py-1 text-sm rounded-full border",
              watch("isGstApplicable")
                ? "bg-green-500 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300"
            )}
            onClick={() => setValue("isGstApplicable", true, { shouldDirty: true })}
          >
            Yes
          </button>
          <button
            type="button"
            className={clsx(
              "px-4 py-1 text-sm rounded-full border",
              !watch("isGstApplicable")
                ? "bg-red-500 text-white border-red-600"
                : "bg-white text-gray-600 border-gray-300"
            )}
            onClick={() => setValue("isGstApplicable", false, { shouldDirty: true })}
          >
            No
          </button>
        </div>
      </FormField>

      {/* GSTIN No + isIgst Checkbox */}
      <FormField
        label="Gstin No"
        error={errors?.gstin?.message}
        className="mt-0.5 col-span-2"
        required={watch('isGstApplicable')}
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            {...register('gstin', {
              validate: validateGstin,
            })}
            // className={clsx(inputFormFieldStyles, 'mt-0.5 w-40')}
            className={clsx(inputFormFieldStyles, errors?.amount && errorClass, 'mt-1.5')}
            placeholder="Enter GSTIN No"
          />

          {/* isIgst Checkbox */}
          <label className="flex items-center gap-2 text-xs mt-[2px] cursor-pointer font-medium ml-3">
            <input
              type="checkbox"
              {...register('isIgst', {
                onChange: () => {
                  trigger();
                },
              })}
              className="checkbox checkbox-xs cursor-pointer"
            />
            IGST
          </label>
        </div>
      </FormField>

      {/* Line items row 1 */}
      {/* Debit Account */}
      <FormField
        label='Debit (Debtor / Creditor)'
        required
        error={errors?.debitAccId?.message}
        className="row-start-3 col-span-3"
      >
        <AccountPickerFlat
          accClassNames={['debtor', 'creditor']}
          instance={`${instance}-debit-account`}
          {...register('debitAccId', {
            required: Messages.errRequired,
          })}
          onChange={(val) =>
            setValue('debitAccId', val, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          showAccountBalance
          value={watch('debitAccId') as string}
          className="max-w-100 w-full mt-1"
          showRefreshButton={false}
        />
      </FormField>

      {/* Line ref no */}
      <FormField label="Line Ref No" className="col-span-3 row-start-3">
        <input
          type="text"
          className={clsx(inputFormFieldStyles, 'mt-1')}
          placeholder="Enter ref no"
          {...register("debitRefNo")}
        />
      </FormField>

      {/* Remarks */}
      <FormField className="row-start-3 col-span-4" label="Line Remarks">
        <textarea
          rows={3}
          className={clsx(inputFormFieldStyles, "mt-1")}
          placeholder="Enter remarks"
          {...register("debitRemarks")}
        />
      </FormField>

      {/* gst input */}
      <div className="row-start-3 row-span-2  col-span-3 flex flex-col gap-6">
        {/* cgst */}
        <div>
          <label className="text-gray-600 text-xs block">Cgst {!isIgst && <WidgetAstrix />}</label>
          <ControlledNumericInput
            className={clsx(inputClass, errors?.cgst && errorClass, 'mt-2')}
            fieldName="cgst"
            onValueChange={(floatValue) => {
              setValue('sgst', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
              trigger(['cgst', 'igst'])
            }}
            // validate={(value) =>
            //   isValidCgst(value || 0) && isValidCgstSgstIgst()
            //     ? true
            //     : `Mismatch: should be ${calcTotal.cgst.toFixed(2)}`}
          />
        </div>

        <div>
          <label className="text-gray-600 text-xs block">Sgst {!isIgst && <WidgetAstrix />}</label>
          {/* sgst */}
          <ControlledNumericInput
            className={clsx(inputClass, errors?.sgst && errorClass, 'mt-2')}
            fieldName="totalSgst"
            onValueChange={(floatValue) => {
              setValue('cgst', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
              trigger(['sgst', 'igst'])
            }}
            // validate={(value) =>
            //   isValidSgst(value || 0) && isValidCgstSgstIgst()
            //     ? true
            //     : `Mismatch: should be ${calcTotal.sgst.toFixed(2)}`}
          />
        </div>

        <div>
          <label className="text-gray-600 text-xs block">Igst {isIgst && <WidgetAstrix />}</label>
          {/* igst */}
          <ControlledNumericInput
            className={clsx(inputClass, errors?.igst && errorClass, 'mt-2')}
            fieldName="totalIgst"
            onValueChange={(floatValue) => {
              setValue('igst', floatValue || 0, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
              trigger(['cgst', 'sgst'])
            }}
            // validate={(value) =>
            //   isValidIgst(value || 0) && isValidCgstSgstIgst()
            //     ? true
            //     : `Mismatch: should be ${calcTotal.igst.toFixed(2)}`}
          />
        </div>
      </div>

      {/* 2nd row */}
      {/* Credit Account */}
      <FormField
        label='Credit (Purchase)'
        required
        error={errors?.creditAccId?.message}
        className="row-start-4 col-span-3"
      >
        <AccountPickerFlat
          accClassNames={['purchase',]}
          instance={`${instance}-credit-account`}
          {...register('creditAccId', {
            required: Messages.errRequired,
          })}
          onChange={(val) =>
            setValue('creditAccId', val, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          showAccountBalance
          value={watch('creditAccId') as string}
          className="w-full mt-1"
          showRefreshButton={false}
        />
      </FormField>

      {/* Line ref no */}
      <FormField label="Line Ref No" className="row-start-4 col-span-3">
        <input
          type="text"
          className={clsx(inputFormFieldStyles, 'mt-1')}
          placeholder="Enter ref no"
          {...register("creditRefNo")}
        />
      </FormField>

      {/* Remarks */}
      <FormField className="row-start-4 col-span-4" label="Line Remarks">
        <textarea
          rows={3}
          className={clsx(inputFormFieldStyles, "mt-1")}
          placeholder="Enter remarks"
          {...register("creditRemarks")}
        />
      </FormField>

    </div>)

  function getPrintPreview() {
    let Ret = <></>
    if (activeTabIndex === 0) {
      const id = watch('id');
      if (id) {
        Ret = <TooltipComponent content='Print Preview' className="flex">
          <button type='button' onClick={() => handleOnPreview()}>
            <IconPreview1 className="text-blue-500 h-8 w-8" />
          </button>
        </TooltipComponent>
      }
      return (Ret)
    }
  }

  function handleOnPreview() {
    // const purchaseEditData: any = getValues('purchaseEditData') || {}
    // if (_.isEmpty(purchaseEditData)) return
    // generatePurchaseInvoicePDF(purchaseEditData, branchName || '', currentDateFormat)
  }

  function validateGstin(): string | undefined {
    const gstin = watch('gstin');
    const isGstApplicable = watch('isGstApplicable');

    if (!isGstApplicable) return;

    if (!gstin) {
      return Messages.errRequired;
    }

    if (!isValidGstin(gstin)) {
      return Messages.errInvalidGstin;
    }

    return;
  }
}