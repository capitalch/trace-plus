import clsx from "clsx"
import { VoucherFormDataType } from "./all-vouchers-main"
import { useFormContext } from "react-hook-form"
import Decimal from "decimal.js";
import { Utils } from "../../../../utils/utils";

export function AllVouchersCrown({ className }: AllVouchersCrownType) {
    const {
        watch,
    } = useFormContext<VoucherFormDataType>();

    const debitEntries = watch("debitEntries") ?? [];
    const creditEntries = watch("creditEntries") ?? [];

    const totalDebits = debitEntries.reduce(
        (acc, entry) => acc.plus(new Decimal(entry.amount || 0)),
        new Decimal(0)
    );
    const totalCredits = creditEntries.reduce(
        (acc, entry) => acc.plus(new Decimal(entry.amount || 0)),
        new Decimal(0)
    );

    const gstDebits = debitEntries.reduce((acc, entry) => {
        if (entry.isIgst) {
            return acc.plus(new Decimal(entry.igst || 0));
        } else {
            return acc.plus(new Decimal(entry.cgst || 0)).plus(new Decimal(entry.sgst || 0));
        }
    }, new Decimal(0));

    const gstCredits = creditEntries.reduce((acc, entry) => {
        if (entry.isIgst) {
            return acc.plus(new Decimal(entry.igst || 0));
        } else {
            return acc.plus(new Decimal(entry.cgst || 0)).plus(new Decimal(entry.sgst || 0));
        }
    }, new Decimal(0));

    const diff = totalDebits.minus(totalCredits);
    const diffAbs = diff.abs().toDecimalPlaces(2);
    const diffSide = diff.isPositive() ? "Dr" : "Cr";

    return (
        <div className={clsx("flex flex-wrap gap-4 text-sm font-semibold", className)}>
            <div className="space-x-1 text-indigo-700">
                <label>GST Debits:</label>
                <span>{Utils.toDecimalFormat(gstDebits.toFixed(2))}</span>
            </div>

            <div className="space-x-1 text-indigo-700">
                <label>GST Credits:</label>
                <span>{Utils.toDecimalFormat(gstCredits.toFixed(2))}</span>
            </div>

            <div className="space-x-1 text-amber-700">
                <label>Debits:</label>
                <span>{Utils.toDecimalFormat(totalDebits.toFixed(2))}</span>
            </div>

            <div className="space-x-1 text-amber-700">
                <label>Credits:</label>
                <span>{Utils.toDecimalFormat(totalCredits.toFixed(2))}</span>
            </div>

            <div
                className={clsx(
                    "space-x-1",
                    diff.isZero() ? "text-green-600" : "text-red-600"
                )}
            >
                <label>Diff:</label>
                <span>{Utils.toDecimalFormat(diffAbs.toString())}</span>
                {!diff.isZero() && <label>{diffSide}</label>}
            </div>
        </div>
    );

    // return (
    //     <div className={clsx("flex gap-4 text-sm font-medium text-amber-800", className)}>
    //         <div className="space-x-1">
    //             <label>GST Debits:</label>
    //             <span>{Utils.toDecimalFormat(gstDebits.toFixed(2))}</span>
    //         </div>

    //         <div className="space-x-1">
    //             <label>GST Credits:</label>
    //             <span>{Utils.toDecimalFormat(gstCredits.toFixed(2))}</span>
    //         </div>

    //         {/* Debits */}
    //         <div className="space-x-1">
    //             <label>Debits:</label>
    //             <span>{Utils.toDecimalFormat(totalDebits.toFixed(2))}</span>
    //         </div>

    //         {/* Credits */}
    //         <div className="space-x-1">
    //             <label>Credits:</label>
    //             <span>{Utils.toDecimalFormat(totalCredits.toFixed(2))}</span>
    //         </div>

    //         {/* Diff */}
    //         <div className={clsx("space-x-1", diff.isZero() ? "text-green-600" : "text-red-600")}>
    //             <label>Diff:</label>
    //             <span>{Utils.toDecimalFormat(diffAbs.toString())}</span>
    //             <label>{diff.isZero() ? null : diffSide}</label>
    //         </div>
    //     </div>
    // );
}

type AllVouchersCrownType = {
    className?: string
}