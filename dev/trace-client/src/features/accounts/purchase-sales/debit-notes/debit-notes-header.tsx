import { useFormContext } from "react-hook-form";
import _ from 'lodash'
// import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { useValidators } from "../../../../utils/validators-hook";
import { DebitNoteFormDataType } from "./debit-notes";
import { FormField } from "../../../../controls/widgets/form-field";
import clsx from "clsx";
import { inputFormFieldStyles } from "../../../../controls/widgets/input-form-field-styles";
import { Messages } from "../../../../utils/messages";
import { IconReset } from "../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../controls/icons/icon-submit";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconPreview1 } from "../../../../controls/icons/icon-preview1";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { RootStateType } from "../../../../app/store";
import { useSelector } from "react-redux";
// import { JSX } from "react";


export function DebitNotesHeader() {
    const activeTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[DataInstancesMap.debitNotes]?.activeTabIndex)
    // const { branchName, currentDateFormat } = useUtilsInfo();
    const { checkAllowedDate } = useValidators();
    const {
        // setValue,
        watch,
        register,
        // getValues,
        formState: { errors, isSubmitting, isDirty, isValid }
    } = useFormContext<DebitNoteFormDataType>();
    const { resetAll }: any = useFormContext<DebitNoteFormDataType>();
    // const inputClass = " border-gray-300 focus:outline-none text-right font-semibold text-[16px] w-[10rem] h-7 rounded-md";
    // const errorClass = 'bg-red-100 border-red-500 border-2'
    return (
        <div className="flex gap-6 flex-wrap relative">
            {/* Auto ref no */}
            <FormField label="Auto ref no" className="w-52 ">
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
            <FormField label="Date" required error={errors?.tranDate?.message}>
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
            <FormField label="User Ref No">
                <input
                    type="text"
                    className={clsx(inputFormFieldStyles, 'mt-1')}
                    placeholder="Enter user ref no"
                    {...register("userRefNo")}
                />
            </FormField>

            {/* Remarks */}
            <FormField className="w-lg" label="Remarks">
                <textarea
                    rows={4}
                    className={clsx(inputFormFieldStyles, "mt-1")}
                    placeholder="Enter remarks"
                    {...register("remarks")}
                />
            </FormField>

            {/* Reset submit */}
            <div className="flex gap-3 ml-auto mt-6 h-10">

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
        </div>
    )

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
}