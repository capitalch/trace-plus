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

export function ProductsBranchTransferHeader() {
  const { branchId } = useUtilsInfo();
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
  const { xReset }: any = useFormContext(); // normal reset does not work. xReset is custom reset method defined in .._branch_transfer_main.tsx

  return (
    <div className="flex items-center align-middle gap-2 flex-wrap">

      {/* Auto ref no */}
      <FormField label="Auto ref no" className="w-52 ">
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
      <FormField className="min-w-60 w-auto" label="Remarks">
        <textarea
          rows={3}
          className={clsx(inputFormFieldStyles, "text-xs")}
          placeholder="Enter remarks"
          {...register("remarks")}
        />
      </FormField>

      {/* Reset submit */}
      <div className="flex gap-3 ml-auto mt-8">
        {/* Reset */}
        <button
          onClick={xReset}
          type="button"
          className="px-5 py-2 font-medium text-white inline-flex items-center bg-amber-500 hover:bg-amber-800 focus:ring-4 focus:outline-hidden focus:ring-amber-300 rounded-lg text-center dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800 disabled:bg-amber-200"
        >
          <IconReset className="text-white w-6 h-6 mr-2" />
          Reset
        </button>
        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !_.isEmpty(errors) || !isDirty}
          className="px-5 py-2 font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-hidden focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200"
        >
          <IconSubmit className="text-white w-6 h-6 mr-2" /> Submit
        </button>
        {/* <button
          onClick={() => {
            console.log(isDirty);
            console.log(isSubmitting);
            console.log(errors);
          }}
          type="button"
        >
          Test
        </button> */}
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
