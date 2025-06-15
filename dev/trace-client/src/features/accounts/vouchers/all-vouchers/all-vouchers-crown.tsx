import { useSelector } from "react-redux"
import { RootStateType } from "../../../../app/store/store"
import { Utils } from "../../../../utils/utils"
import clsx from "clsx"

export function AllVouchersCrown({ className }: AllVouchersCrownType) {
    const totalDebits = useSelector((state: RootStateType) => state.vouchers.totalDebits)
    const totalCredits = useSelector((state: RootStateType) => state.vouchers.totalCredits)
    const diff = totalDebits - totalCredits

    return (<div className={clsx("flex gap-2 text-sm font-medium text-amber-800", className)}>
        {/* Debits */}
        <div className="space-x-1">
            <label>Debits:</label>
            <span>{Utils.toDecimalFormat(totalDebits)}</span>
        </div>

        {/* Credits */}
        <div className="space-x-1">
            <label>Credits:</label>
            <span>{Utils.toDecimalFormat(totalCredits)}</span>
        </div>

        {/* Diff */}
        <div className={clsx("space-x-1", (diff >= 0) ? '' : 'text-red-500')}>
            <label>Diff:</label>
            <span>{Utils.toDecimalFormat(Math.abs(diff || 0) || 0)}</span>
            <label>{diff >= 0 ? 'Dr' : 'Cr'}</label>
        </div>
    </div>)
}

type AllVouchersCrownType = {
    className?: string
}