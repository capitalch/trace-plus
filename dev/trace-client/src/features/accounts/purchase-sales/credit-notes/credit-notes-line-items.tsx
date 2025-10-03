import { useFormContext } from "react-hook-form";
import { FormField } from "../../../../controls/widgets/form-field";
import { AccountPickerFlat } from "../../../../controls/redux-components/account-picker-flat/account-picker-flat";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { Messages } from "../../../../utils/messages";
import clsx from "clsx";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { DebitCreditNoteFormDataType } from "../debit-notes/debit-notes";
import { CreditNotesDetails } from "./credit-notes-details";

export function CreditNotesLineItems() {
  const instance = DataInstancesMap.creditNotes;
  const {
    setValue,
    watch,
    register,
    formState: { errors },
  } = useFormContext<DebitCreditNoteFormDataType>();
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
  const inputClassLeft =
    "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium text-sm w-full rounded-lg px-3 transition-all duration-200";

  return (
    <div
      className="grid mt-6 p-4 bg-red-50 rounded-lg shadow-sm gap-4 grid-cols-1 lg:grid-cols-12 md:grid-cols-6 sm:gap-6 sm:grid-cols-2 sm:p-6"
    >
      {/* Credit Account */}
      <FormField
        label="Credit (Debtor / Creditor)"
        required
        error={errors?.creditAccId?.message}
        className="col-span-1 md:col-span-3 sm:col-span-2"
      >
        <AccountPickerFlat
          accClassNames={["debtor", "creditor"]}
          instance={`${instance}-credit-account`}
          {...register("creditAccId", {
            required: Messages.errRequired,
          })}
          onChange={(val) => {
            setValue("creditAccId", val, {
              shouldValidate: true,
              shouldDirty: true,
            })
            getSetGstin(val)
          }}
          showAccountBalance
          value={watch("creditAccId") as string}
          className="w-full"
          showRefreshButton={false}
        />
      </FormField>

      {/* Credit Line ref no */}
      <FormField
        label="Line Ref No"
        className="col-span-1 md:col-span-2 sm:col-span-1"
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
        className="col-span-1 md:col-span-4 sm:col-span-2"
        label="Line Remarks"
      >
        <textarea
          rows={3}
          className={clsx(inputClassLeft, "resize-none")}
          placeholder="Enter remarks"
          {...register("creditRemarks")}
        />
      </FormField>

      {/* Credit Notes Details (spans more space on large screens) */}
      <div className="ml-auto max-w-64 col-span-2 lg:col-span-3 md:col-span-2 row-span-2 sm:col-span-2">
        <CreditNotesDetails />
      </div>

      {/* Debit Account */}
      <FormField
        label="Debit (Sale)"
        required
        error={errors?.debitAccId?.message}
        className="col-span-1 md:col-span-3 sm:col-span-2"
      >
        <AccountPickerFlat
          accClassNames={["sale"]}
          instance={`${instance}-debit-account`}
          {...register("debitAccId", {
            required: Messages.errRequired,
          })}
          onChange={(val) =>
            setValue("debitAccId", val, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          // showAccountBalance
          value={watch("debitAccId") as string}
          className="w-full"
          showRefreshButton={false}
          toSelectFirstOption={true}
        />
      </FormField>

      {/* Debit Line Ref No */}
      <FormField
        label="Line Ref No"
        className="col-span-1 md:col-span-2 sm:col-span-1"
      >
        <input
          type="text"
          className={clsx(inputClassLeft)}
          placeholder="Enter ref no"
          {...register("debitRefNo")}
        />
      </FormField>

      {/* Debit Remarks */}
      <FormField
        className="col-span-1 md:col-span-4 sm:col-span-2"
        label="Line Remarks"
      >
        <textarea
          rows={3}
          className={clsx(inputClassLeft, "resize-none")}
          placeholder="Enter remarks"
          {...register("debitRemarks")}
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