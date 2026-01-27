import { useFormContext } from "react-hook-form";
import { StockJournalType } from "./stock-journal-main";
import { useStockJournalContext } from "../stock-journal-context";
import { FormField } from "../../../../../controls/widgets/form-field";
import clsx from "clsx";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../../utils/messages";
import { IconReset } from "../../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../../controls/icons/icon-submit";
import { useValidators } from "../../../../../utils/validators-hook";
import _ from "lodash";
import { IconView } from "../../../../../controls/icons/icon-view";
import { Utils } from "../../../../../utils/utils";
import { StockJournalView } from "../stock-journal-view";
import { useStockJournalPermissions } from "../../../../../utils/permissions/permissions-hooks";

export function StockJournalHeader({ instance }: { instance: string }) {
  const { checkAllowedDate } = useValidators();
  const { canView, canCreate, canEdit } = useStockJournalPermissions();
  const {
    watch,
    register,
    formState: { errors, isSubmitting, isDirty }
  } = useFormContext<StockJournalType>();
  const { xReset } = useStockJournalContext();

  return (
    <div className="flex flex-wrap gap-2">
      {/* Auto ref no */}
      <FormField label="Auto ref no" className="w-52">
        <input
          type="text"
          className={clsx("bg-gray-200 rounded-lg")}
          readOnly
          disabled
          title="Auto reference number"
          value={watch("autoRefNo") ?? undefined}
        />
      </FormField>

      {/* tran date */}
      <FormField label="Date" required error={errors?.tranDate?.message}>
        <input
          type="date"
          className={clsx(
            "text-right rounded-lg h-10",
            inputFormFieldStyles,
            errors?.tranDate && "border-red-500 bg-red-100"
          )}
          {...register("tranDate", {
            required: Messages.errRequired,
            validate: checkAllowedDate
          })}
        />
      </FormField>

      {/* User ref no */}
      <FormField label="User ref no">
        <input
          type="text"
          className={clsx(inputFormFieldStyles, "mt-1")}
          placeholder="Enter user ref no"
          {...register("userRefNo")}
        />
      </FormField>

      {/* Remarks */}
      <FormField className="w-auto min-w-60" label="Remarks">
        <textarea
          rows={3}
          className={clsx(inputFormFieldStyles, "text-xs mt-1")}
          placeholder="Enter remarks"
          {...register("remarks")}
        />
      </FormField>

      {/* Reset view submit */}
      <div className="flex mt-6 ml-auto h-10 gap-3">
        {/* Reset */}
        <button
          onClick={xReset}
          type="button"
          className="inline-flex items-center px-5 font-medium text-center text-white bg-amber-500 rounded-lg hover:bg-amber-800 focus:outline-hidden focus:ring-4 focus:ring-amber-300 disabled:bg-amber-200 dark:bg-amber-600 dark:focus:ring-amber-800 dark:hover:bg-amber-700"
        >
          <IconReset className="mr-2 w-6 h-6 text-white" />
          Reset
        </button>

        {/* View */}
        {canView && (
          <button
            type="button"
            onClick={handleViewStockJournal}
            className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-800 focus:outline-hidden focus:ring-4 focus:ring-blue-300 disabled:bg-blue-200 dark:bg-blue-600 dark:focus:ring-blue-800 dark:hover:bg-blue-700"
          >
            <IconView className="mr-2 w-6 h-6 text-white" /> View
          </button>
        )}

        {/* Submit */}
        {(canCreate || canEdit) && (
          <button
            type="submit"
            disabled={isSubmitting || !_.isEmpty(errors) || !isDirty}
            className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-teal-500 rounded-lg hover:bg-teal-800 focus:outline-hidden focus:ring-4 focus:ring-teal-300 disabled:bg-teal-200 dark:bg-teal-600 dark:focus:ring-teal-800 dark:hover:bg-teal-700"
          >
            <IconSubmit className="mr-2 w-6 h-6 text-white" /> Submit
          </button>
        )}
      </div>
    </div>
  );

  function handleViewStockJournal() {
    Utils.showHideModalDialogA({
      title: "",
      isOpen: true,
      size: "xl",
      element: <StockJournalView instance={instance} />
    });
  }
}
