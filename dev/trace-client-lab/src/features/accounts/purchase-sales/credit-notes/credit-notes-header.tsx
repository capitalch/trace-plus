import { useFormContext } from "react-hook-form";
import _ from 'lodash'
import { useValidators } from "../../../../utils/validators-hook";
import { FormField } from "../../../../controls/widgets/form-field";
import clsx from "clsx";
import { Messages } from "../../../../utils/messages";
import { IconReset } from "../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../controls/icons/icon-submit";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { IconPreview1 } from "../../../../controls/icons/icon-preview1";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { RootStateType } from "../../../../app/store";
import { useSelector } from "react-redux";
import { DebitCreditNoteEditDataType } from "../../../../utils/global-types-interfaces-enums";
import { generateDebitCreditNotePDF } from "../common/debit-credit-note-jspdf";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { Utils } from "../../../../utils/utils";
import { DebitCreditNoteFormDataType } from "../debit-notes/debit-notes";

export function CreditNotesHeader() {
    const activeTabIndex = useSelector((state: RootStateType) => state.reduxComp.compTabs[DataInstancesMap.creditNotes]?.activeTabIndex)
    const { checkAllowedDate } = useValidators();
    const { branchName, currentDateFormat } = useUtilsInfo()
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
    const inputClassLeft = "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium text-sm w-full rounded-lg px-3 transition-all duration-200";

    return (
        <div className="mb-8 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 xl:grid-cols-12 gap-6 bg-red-50 p-6 rounded-lg shadow-sm">

                {/* Auto ref no */}
                <FormField label="Auto Ref No" className="col-span-1 lg:col-span-2">
                    <input
                        type="text"
                        className={clsx("bg-gray-100 rounded-lg h-10 px-3 text-sm", inputClassLeft)}
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
                    className="col-span-1 lg:col-span-2"
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
                <FormField label="User Ref No" className="col-span-1 lg:col-span-2">
                    <input
                        type="text"
                        className={clsx(inputClassLeft)}
                        placeholder="Enter user ref no"
                        {...register("userRefNo")}
                    />
                </FormField>

                {/* Remarks */}
                <FormField className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3" label="Remarks">
                    <textarea
                        rows={3}
                        className={clsx(inputClassLeft, "resize-none")}
                        placeholder="Enter remarks"
                        {...register("remarks")}
                    />
                </FormField>

                {/* isGstApplicable */}
                <div className="flex-col col-span-1 items-center">
                    <FormField label="Apply GST?" className="flex flex-col gap-3 items-start text-sm">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className={clsx(
                                    "px-3 py-1 rounded border transition-all duration-200",
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
                                    "px-3 py-1 rounded border transition-all duration-200",
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
                        </div>
                    </FormField>
                    {/* igst */}
                    {isGstApplicable && <label className="flex items-center gap-2 text-xs cursor-pointer font-medium mt-4">
                        <input
                            type="checkbox"
                            {...register("isIgst", {
                                onChange: () => {
                                    computeGst()
                                },
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        IGST
                    </label>}
                </div>

                {/* Action Buttons */}
                <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2 flex items-center gap-3 ml-auto">
                    <button
                        onClick={resetAll}
                        type="button"
                        className="px-4 py-2 font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg flex items-center transition-all duration-200 disabled:bg-amber-300"
                    >
                        <IconReset className="w-5 h-5 mr-2" />
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || !isValid}
                        className="px-4 py-2 font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center transition-all duration-200 disabled:bg-blue-300"
                    >
                        <IconSubmit className="w-5 h-5 mr-2" />
                        Submit
                    </button>
                </div>

                {/* Edit / New label */}
                <div className="flex absolute right-0 -top-12 gap-2">
                    {/* <button type="submit" >Test</button> */}
                    {getPrintPreview()}
                    <label className="text-amber-500 font-medium text-lg">
                        {watch("id") ? "Edit Credit Note" : "New Credit Note"}
                    </label>
                </div>
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
        const noteData: DebitCreditNoteEditDataType | undefined = getValues('debitCreditNoteEditData')
        if (_.isEmpty(noteData)) return
        generateDebitCreditNotePDF({
            branchName: branchName || '1',
            currentDateFormat: currentDateFormat,
            noteData:noteData,
            tranTypeId: Utils.getTranTypeId('CreditNote')
        })
    }
}