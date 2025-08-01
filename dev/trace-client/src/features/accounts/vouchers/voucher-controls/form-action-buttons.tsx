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

    // console.log('bal:',isBalanced)
    // console.log('dirty:', isDirty)
    return (
        <div className={clsx("flex h-10 gap-4 mr-6", className)}>
            {/* <button type="button" onClick={handleOnTest}>Test</button> */}
            {/* Reset */}
            <button
                onClick={resetAll}
                type="button"
                className="px-5 font-medium text-white inline-flex items-center bg-amber-500 hover:bg-amber-800 focus:ring-4 focus:outline-hidden focus:ring-amber-300 rounded-lg text-center dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800 disabled:bg-amber-200 transition"
            >
                <IconReset className="text-white w-6 h-6 mr-2" />
                Reset
            </button>

            <button
                type="submit"
                className="px-5 py-2 font-medium text-white inline-flex items-center bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:outline-hidden focus:ring-teal-300 rounded-lg text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800 disabled:bg-teal-200 transition"
                disabled={isSubmitting || !_.isEmpty(errors) || !isDirty || !isBalanced}
            ><IconSubmit className="text-white w-6 h-6 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit"}
            </button>
        </div>)

        // function handleOnTest(){
        //     alert(`isDirty:${isDirty} isBalanced:${isBalanced}`)
        // }
}

type FormActionButtonsType = {
    className?: string
}