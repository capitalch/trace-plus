import clsx from "clsx";
import { FormField } from "../../../../../controls/widgets/form-field";
import { Messages } from "../../../../../utils/messages";
import Select from "react-select";
import { IconReset } from "../../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../../controls/icons/icon-submit";
import { useFormContext } from "react-hook-form";
import { useValidators } from "../../../../../utils/validators-hook";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import {
  allBranchesSelectorFn,
  BranchType
} from "../../../../login/login-slice";
import { useSelector } from "react-redux";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { BranchTransferType } from "./products-branch-transfer-main";
import _ from "lodash";
import { Utils } from "../../../../../utils/utils";
import { useBranchTransferPermissions } from "../../../../../utils/permissions/permissions-hooks";
import { useBranchTransferContext } from "../branch-transfer-context";

export function ProductsBranchTransferHeader() {
  const { branchId } = useUtilsInfo();
  const { canCreate, canEdit } = useBranchTransferPermissions();
  const allBranches: BranchType[] = useSelector(allBranchesSelectorFn) || [];
  const availableDestBranches = allBranches.filter(
    (branch: BranchType) => branch.branchId !== branchId
  );

  const { checkAllowedDate } = useValidators();
  const {
    watch,
    clearErrors,
    register,
    setValue,
    formState: { errors, isSubmitting, isDirty },

  } = useFormContext<BranchTransferType>();
  const { xReset } = useBranchTransferContext();

  return (
    <div className="flex flex-wrap items-center align-middle gap-2">

      {/* Auto ref no */}
      <FormField label="Auto ref no" className="w-52">
        <input
          type="text"
          className={clsx("mt-1 bg-gray-200 rounded-lg")}
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
          className={clsx("text-right rounded-lg h-10", inputFormFieldStyles)}
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

      {/* Dest branch */}
      <FormField
        label="Destination branch"
        required
        error={errors.destBranchId?.message}
      >
        <Select
          className="mt-1 w-full"
          menuPlacement="auto"
          getOptionLabel={(option: any) => option.branchName}
          getOptionValue={(option: any) => option.branchId}
          placeholder='Select dest branch ...'
          {...register("destBranchId", { required: Messages.errRequired })}
          onChange={handleOnChangeDestBranch}
          options={availableDestBranches || []}
          styles={Utils.getReactSelectStyles()}
          value={selectedBranch()}
        />
      </FormField>

      {/* Remarks */}
      <FormField className="w-auto min-w-60" label="Remarks">
        <textarea
          rows={3}
          className={clsx(inputFormFieldStyles, "text-xs")}
          placeholder="Enter remarks"
          {...register("remarks")}
        />
      </FormField>

      {/* Reset submit */}
      <div className="flex mt-8 ml-auto gap-3">
        {/* Reset */}
        <button
          onClick={xReset}
          type="button"
          className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-amber-500 rounded-lg hover:bg-amber-800 focus:outline-hidden focus:ring-4 focus:ring-amber-300 disabled:bg-amber-200 dark:bg-amber-600 dark:focus:ring-amber-800 dark:hover:bg-amber-700"
        >
          <IconReset className="mr-2 w-6 h-6 text-white" />
          Reset
        </button>
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

  function handleOnChangeDestBranch(selectedBranch: any) {
    if (selectedBranch) {
      setValue("destBranchId", selectedBranch?.branchId, { shouldDirty: true });
      clearErrors("destBranchId");
    }
  }

  function selectedBranch() {
    const destBranchId = watch("destBranchId")
    const sb = availableDestBranches.find((branch: BranchType) => branch.branchId === destBranchId)
    return (sb)
  }
}
