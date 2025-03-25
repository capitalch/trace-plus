import clsx from "clsx";
import { FormField } from "../../../../../controls/widgets/form-field";
import { Messages } from "../../../../../utils/messages";
import { CompReactSelect } from "../../../../../controls/components/comp-react-select";
import { IconReset } from "../../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../../controls/icons/icon-submit";
import { useFormContext } from "react-hook-form";
import { useValidators } from "../../../../../utils/validators-hook";
import { inputFormFieldStyles } from "../../../../../controls/widgets/input-form-field-styles";
import { format } from "date-fns";
import {
  allBranchesSelectorFn,
  BranchType
} from "../../../../login/login-slice";
import { useSelector } from "react-redux";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { BranchTransferType } from "./products-branch-transfer-main";
import _ from "lodash";

export function ProductsBrancheTransferHeader() {
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
    formState: { errors, isSubmitting, isDirty }
  } = useFormContext<BranchTransferType>();

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
          value={watch("autoRefNo")}
        />
        {/* <label className="border-b-2 mt-10 border-gray-200">
          {watch("autoRefNo")}
        </label> */}
      </FormField>

      {/* tran date */}
      <FormField label="Date" required error={errors?.tranDate?.message}>
        <input
          type="date"
          className="text-right rounded-lg h-10"
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
      <FormField className="min-w-60 w-auto" label="Remarks">
        <textarea
          rows={3}
          className={clsx(inputFormFieldStyles, "text-xs")}
          placeholder="Enter remarks"
          {...register("remarks")}
        />
      </FormField>

      {/* Dest branch */}
      <FormField
        label="Destination branch"
        required
        error={errors.destBranchId?.message}
      >
        <CompReactSelect
          menuPlacement="auto"
          optionLabelName="branchName"
          optionValueName="branchId"
          placeHolder="Select dest branch ..."
          {...register("destBranchId", { required: Messages.errRequired })}
          onChange={handleOnChangeDestBranch}
          ref={null}
          staticOptions={availableDestBranches || []}
          selectedValue={watch("destBranchId")}
        />
      </FormField>

      {/* Reset submit */}
      <div className="flex gap-3 ml-auto mt-8">
        {/* Reset */}
        <button
          onClick={handleReset}
          type="button"
          className="px-5 py-2 font-medium text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-200"
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
      </div>
    </div>
  );

  function handleReset() {
    setValue("id", undefined);
    setValue("autoRefNo", '');
    setValue("tranDate", format(new Date(), "yyyy-MM-dd"));
    setValue("userRefNo", undefined);
    setValue("remarks", undefined);
    setValue("destBranchId", undefined);
    setValue("productLineItems", [
      {
        productCode: undefined,
        productDetails: undefined,
        lineRefNo: undefined,
        qty: 1,
        price: 0,
        lineRemarks: undefined,
        tranHeaderId: undefined,
        serialNumbers: "",
        upcCode: undefined
      }
    ]);
  }

  function handleOnChangeDestBranch(selectedBranch: any) {
    if (selectedBranch) {
      setValue("destBranchId", selectedBranch?.branchId, { shouldDirty: true });
      clearErrors("destBranchId");
    }
  }
}
