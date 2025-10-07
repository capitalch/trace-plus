import clsx from "clsx";
import { useFormContext, useWatch } from "react-hook-form";
import _ from "lodash";
import { IconReset } from "../../../../controls/icons/icon-reset";
import { IconSubmit } from "../../../../controls/icons/icon-submit";
import { VoucherFormDataType } from "../all-vouchers/all-vouchers";

export function FormActionButtons({ className }: FormActionButtonsType) {
    const {
        formState: {
            errors,
            isDirty,
            isSubmitting,
        }, control
    } = useFormContext<VoucherFormDataType>();
    const { resetAll }: any = useFormContext();

    const debitEntries = useWatch({ control, name: "debitEntries" }) || [];
    const creditEntries = useWatch({ control, name: "creditEntries" }) || [];
    const totalDebits = debitEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
    const totalCredits = creditEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
    const isBalanced = totalDebits === totalCredits;

    return (
        <div className={clsx("flex h-10 gap-4 mr-6", className)}>
            {/* <button type="button" onClick={handleOnTest}>Test</button> */}
            {/* Reset */}
            <button
                onClick={resetAll}
                type="button"
                className="inline-flex items-center px-5 font-medium text-center text-white bg-amber-500 rounded-lg transition hover:bg-amber-800 focus:outline-hidden focus:ring-4 focus:ring-amber-300 disabled:bg-amber-200 dark:bg-amber-600 dark:focus:ring-amber-800 dark:hover:bg-amber-700"
            >
                <IconReset className="mr-2 w-6 h-6 text-white" />
                Reset
            </button>

            <button
                type="submit"
                className="inline-flex items-center px-5 py-2 font-medium text-center text-white bg-teal-500 rounded-lg transition hover:bg-teal-800 focus:outline-hidden focus:ring-4 focus:ring-teal-300 disabled:bg-teal-200 dark:bg-teal-600 dark:focus:ring-teal-800 dark:hover:bg-teal-700"
                disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || !isBalanced}
            ><IconSubmit className="mr-2 w-6 h-6 text-white" />
                {isSubmitting ? "Submitting..." : "Submit"}
            </button>
        </div>)
}

type FormActionButtonsType = {
    className?: string
}