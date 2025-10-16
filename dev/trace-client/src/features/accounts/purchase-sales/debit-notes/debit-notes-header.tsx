import { useFormContext } from "react-hook-form";
import _ from 'lodash'
import { useValidators } from "../../../../utils/validators-hook";
import { DebitCreditNoteFormDataType } from "./debit-notes";
import { FormField } from "../../../../controls/widgets/form-field";
import clsx from "clsx";
import { Messages } from "../../../../utils/messages";
import { IconReset } from "../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../controls/icons/icon-submit";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconPreview1 } from "../../../../controls/icons/icon-preview1";
import { WidgetModeIndicatorBadge } from "../../../../controls/widgets/widget-mode-indicator-badge";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { RootStateType } from "../../../../app/store";
import { useSelector } from "react-redux";
import { DebitCreditNoteEditDataType } from "../../../../utils/global-types-interfaces-enums";
import { generateDebitCreditNotePDF } from "../common/debit-credit-note-jspdf";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";

export function DebitNotesHeader() {
    const activeTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[DataInstancesMap.debitNotes]?.activeTabIndex)
    const { checkAllowedDate } = useValidators();
    const { branchId, branchName, branchAddress, branchGstin, currentDateFormat } = useUtilsInfo()
    const {
        getValues,
        watch,
        register,
        setValue,
        trigger,
        formState: { errors, isSubmitting, isDirty, isValid }
    } = useFormContext<DebitCreditNoteFormDataType>();
    const isGstApplicable = watch('isGstApplicable')
    const { computeGst, resetAll }: any = useFormContext<DebitCreditNoteFormDataType>();
    const errorClass = 'border-red-500 bg-red-50';
    const inputClassLeft = "border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium text-sm w-full rounded-md px-3 transition-all duration-200 mt-1";

    return (
        <div className="relative mb-8 mt-4">
            {/* Mode Badge - Top Left Corner */}
            <div className="absolute -top-7 -left-5 z-10">
                <WidgetModeIndicatorBadge isEditMode={!!watch('id')} />
            </div>

            <div className="flex flex-wrap p-4 sm:p-6 shadow-sm gap-3 sm:gap-4">
                {/* Auto ref no */}
                <FormField label="Auto Ref No" className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        className={clsx(inputClassLeft, "bg-gray-200")}
                        readOnly
                        disabled
                        title="Auto reference number"
                        value={watch("autoRefNo") ?? ""}
                    />
                </FormField>

                {/* Tran date */}
                <FormField
                    label="Date"
                    required
                    error={errors?.tranDate?.message}
                    className="w-36"
                >
                    <input
                        type="date"
                        className={clsx(inputClassLeft, errors?.tranDate && errorClass)}
                        {...register("tranDate", {
                            required: Messages.errRequired,
                            validate: checkAllowedDate,
                        })}
                    />
                </FormField>

                {/* User ref no */}
                <FormField label="User Ref No" className="flex-1 min-w-[150px]">
                    <input
                        type="text"
                        className={clsx(inputClassLeft)}
                        placeholder="Enter user ref no"
                        {...register("userRefNo")}
                    />
                </FormField>

                {/* Remarks */}
                <FormField className="flex-1 min-w-[250px]" label="Remarks">
                    <textarea
                        rows={3}
                        className={clsx(inputClassLeft, "resize-none")}
                        placeholder="Enter remarks"
                        {...register("remarks")}
                    />
                </FormField>

                {/* isGstApplicable */}
                <div className="flex-col items-center min-w-[200px]">
                    <FormField label="Apply GST?" className="flex flex-col items-start text-sm gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                            <button
                                type="button"
                                className={clsx(
                                    "px-3 py-1 rounded border transition-all duration-200 text-sm",
                                    watch("isGstApplicable")
                                        ? "bg-blue-500 text-white border-blue-600"
                                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                                )}
                                onClick={() => {
                                    setValue("isGstApplicable", true, { shouldDirty: true })
                                    computeGst()
                                    setTimeout(() => {
                                        trigger() // Necessary to trigger validations
                                    }, 0)
                                }}
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                className={clsx(
                                    "px-3 py-1 rounded border transition-all duration-200 text-sm",
                                    !watch("isGstApplicable")
                                        ? "bg-red-500 text-white border-red-600"
                                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                                )}
                                onClick={() => { // record id of ExtGstTranD in deletedIds
                                    setValue("isGstApplicable", false, { shouldDirty: true });
                                    const editData = getValues('debitCreditNoteEditData')
                                    const id = editData?.extGstTranD?.id
                                    if (id) {
                                        const deletedIds = getValues('deletedIds') || []
                                        setValue('deletedIds', [...deletedIds, id])
                                        editData.extGstTranD = undefined
                                    }
                                }}
                            >
                                No
                            </button>
                            {/* igst inline */}
                            {isGstApplicable && <label className="flex items-center font-medium text-xs cursor-pointer gap-2">
                                <input
                                    type="checkbox"
                                    {...register("isIgst", {
                                        onChange: () => {
                                            computeGst()
                                        },
                                    })}
                                    className="text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                                />
                                IGST
                            </label>}
                        </div>
                    </FormField>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
                    {getPrintPreview()}
                    <button
                        onClick={resetAll}
                        type="button"
                        className="flex items-center justify-center px-4 py-2 font-medium text-white bg-amber-500 rounded-lg transition-all duration-200 hover:bg-amber-600 disabled:bg-amber-300"
                    >
                        <IconReset className="mr-2 w-5 h-5" />
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || !isValid}
                        className="flex items-center justify-center px-4 py-2 font-medium text-white bg-blue-500 rounded-lg transition-all duration-200 hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        <IconSubmit className="mr-2 w-5 h-5" />
                        Submit
                    </button>
                </div>

                {/* Edit / New label */}
                {/* <div className="flex absolute -top-10 sm:-top-12 gap-2 right-4 sm:right-0"> */}
                    
                    {/* <label className="font-medium text-amber-500 text-base sm:text-lg">
                        {watch("id") ? "Edit Debit Note" : "New Debit Note"}
                    </label> */}
                {/* </div> */}
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
                        <IconPreview1 className="w-8 h-8 text-blue-500" />
                    </button>
                </TooltipComponent>
            }
            return (Ret)
        }
    }

    function handleOnPreview() {
        const noteData: DebitCreditNoteEditDataType | undefined = getValues('debitCreditNoteEditData')
        if (_.isEmpty(noteData)) return
        generateDebitCreditNotePDF({
            noteData: noteData,
            branchId: branchId,
            branchName: branchName || '1',
            branchAddress: branchAddress,
            branchGstin: branchGstin,
            currentDateFormat: currentDateFormat,
            tranTypeId: Utils.getTranTypeId('DebitNote')
        })
    }
}