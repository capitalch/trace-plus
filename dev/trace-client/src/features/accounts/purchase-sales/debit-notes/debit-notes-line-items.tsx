import { useFormContext } from "react-hook-form";
import { FormField } from "../../../../controls/widgets/form-field";
import { DebitNoteFormDataType } from "./debit-notes";
import { AccountPickerFlat } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { Messages } from "../../../../utils/messages";
// import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import clsx from "clsx";
import { DebitNotesDetails } from "./debit-notes-details";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
// import { ControlledNumericInput } from "../../../../controls/components/controlled-numeric-input";
// import { WidgetAstrix } from "../../../../controls/widgets/widget-astrix";

export function DebitNotesLineItems() {
  const instance = DataInstancesMap.debitNotes;
  const {
    setValue,
    watch,
    register,
    formState: { errors },
  } = useFormContext<DebitNoteFormDataType>();
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
  const inputClassLeft =
    "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium text-sm w-full rounded-lg px-3 transition-all duration-200";

  return (
    <div
      className="
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-12
        gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm mt-6
      "
    >
      {/* Debit Account */}
      <FormField
        label="Debit (Debtor / Creditor)"
        required
        error={errors?.debitAccId?.message}
        className="col-span-1 sm:col-span-2 md:col-span-3"
      >
        <AccountPickerFlat
          accClassNames={["debtor", "creditor"]}
          instance={`${instance}-debit-account`}
          {...register("debitAccId", {
            required: Messages.errRequired,
          })}
          onChange={(val) => {
            setValue("debitAccId", val, {
              shouldValidate: true,
              shouldDirty: true,
            })
            getSetGstin(val)
          }}
          showAccountBalance
          value={watch("debitAccId") as string}
          className="w-full"
          showRefreshButton={false}
        />
      </FormField>

      {/* Line ref no */}
      <FormField
        label="Line Ref No"
        className="col-span-1 sm:col-span-1 md:col-span-2"
      >
        <input
          type="text"
          className={clsx(inputClassLeft)}
          placeholder="Enter ref no"
          {...register("debitRefNo")}
        />
      </FormField>

      {/* Remarks */}
      <FormField
        className="col-span-1 sm:col-span-2 md:col-span-4"
        label="Line Remarks"
      >
        <textarea
          rows={3}
          className={clsx(inputClassLeft, "resize-none")}
          placeholder="Enter remarks"
          {...register("debitRemarks")}
        />
      </FormField>

      {/* Debit Notes Details (spans more space on large screens) */}
      <div className="col-span-2 row-span-2 sm:col-span-2 md:col-span-2 lg:col-span-3 max-w-64 ml-auto">
        <DebitNotesDetails />
      </div>

      {/* Credit Account */}
      <FormField
        label="Credit (Purchase)"
        required
        error={errors?.creditAccId?.message}
        className="col-span-1 sm:col-span-2 md:col-span-3"
      >
        <AccountPickerFlat
          accClassNames={["purchase"]}
          instance={`${instance}-credit-account`}
          {...register("creditAccId", {
            required: Messages.errRequired,
          })}
          onChange={(val) =>
            setValue("creditAccId", val, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          showAccountBalance
          value={watch("creditAccId") as string}
          className="w-full"
          showRefreshButton={false}
        />
      </FormField>

      {/* Credit Line Ref No */}
      <FormField
        label="Line Ref No"
        className="col-span-1 sm:col-span-1 md:col-span-2"
      >
        <input
          type="text"
          className={clsx(inputClassLeft)}
          placeholder="Enter ref no"
          {...register("creditRefNo")}
        />
      </FormField>

      {/* Credit Remarks */}
      <FormField
        className="col-span-1 sm:col-span-2 md:col-span-4"
        label="Line Remarks"
      >
        <textarea
          rows={3}
          className={clsx(inputClassLeft, "resize-none")}
          placeholder="Enter remarks"
          {...register("creditRemarks")}
        />
      </FormField>
    </div>
  );

  async function getSetGstin(accId: string | null) {
    if (!accId) {
      setValue('gstin', null, { shouldDirty: true });
      return;
    }
    try {
      const result = await Utils.doGenericQuery({
        buCode: buCode || '',
        sqlId: SqlIdsMap.getGstin,
        sqlArgs: { accId: accId },
        dbName: dbName || '',
        dbParams: decodedDbParamsObject
      });
      const gstin = result?.[0]?.gstin || null;
      setValue('gstin', gstin, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      console.error("Error fetching GSTIN:", error);
    }
  }
}