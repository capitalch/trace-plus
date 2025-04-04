import { useFormContext } from "react-hook-form";
import { StockJournalType } from "./stock-journal-main";
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

export function StockJournalHeader({ instance }: { instance: string }) {
    const { checkAllowedDate } = useValidators();
    const {
        watch,
        register,
        formState: { errors, isSubmitting, isDirty },

    } = useFormContext<StockJournalType>();
    const { xReset }: any = useFormContext(); // normal reset does not work. xReset is custom reset method defined in .._stock_journal_main.tsx

    return (
        <div className="flex gap-2 flex-wrap">

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

            {/* Remarks */}
            <FormField className="min-w-60 w-auto" label="Remarks">
                <textarea
                    rows={3}
                    className={clsx(inputFormFieldStyles, "text-xs mt-1")}
                    placeholder="Enter remarks"
                    {...register("remarks")}
                />
            </FormField>

            {/* Reset view submit */}
            <div className="flex gap-3 ml-auto mt-6 h-10">
                {/* Reset */}
                <button
                    onClick={xReset}
                    type="button"
                    className="px-5 font-medium text-white inline-flex items-center bg-amber-500 hover:bg-amber-800 focus:ring-4 focus:outline-hidden focus:ring-amber-300 rounded-lg text-center dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800 disabled:bg-amber-200"
                >
                    <IconReset className="text-white w-6 h-6 mr-2" />
                    Reset
                </button>

                {/* View */}
                <button
                    type="button"
                    onClick={handleViewStockJournal}
                    className="px-5 py-2 font-medium text-white inline-flex items-center bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-200"
                >
                    <IconView className="text-white w-6 h-6 mr-2" /> View
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

    function handleViewStockJournal() {
        Utils.showHideModalDialogA({
            title: '',
            isOpen: true,
            size: 'xl',
            element: <StockJournalView instance={instance} />
        })
    }
}