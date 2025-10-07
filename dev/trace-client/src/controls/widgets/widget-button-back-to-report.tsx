import { useLocation, useNavigate } from "react-router-dom";
import { IconChangeArrow } from "../icons/icon-change-arrow";
import { useDispatch } from "react-redux";
import { setAllTransactionFilter } from "../../features/accounts/accounts-slice";
import { AppDispatchType } from "../../app/store";
import clsx from "clsx";

export function WidgetButtonBackToReport({ className }: { className?: string }) {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch: AppDispatchType = useDispatch()

    // Only show button if navigated from report
    if (!location.state?.returnPath) {
        return null
    }

    const handleBackToReport = () => {
        const returnPath = location.state.returnPath
        const reportFilters = location.state.reportFilters
        const accountId = location.state.accountId
        const previousReturnPath = location.state.previousReturnPath

        // Restore report filters if available
        if (reportFilters) {
            dispatch(setAllTransactionFilter(reportFilters))
        }

        // Navigate back to report, preserving accountId and previousReturnPath if present
        const navigationState: any = {}
        if (accountId) {
            navigationState.accountId = accountId
        }
        if (previousReturnPath) {
            navigationState.returnPath = previousReturnPath
        }

        navigate(returnPath, {
            state: Object.keys(navigationState).length > 0 ? navigationState : undefined
        })
    }

    return (
        <span className={clsx("flex items-center", className)}>
            <a
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors duration-200"
                onClick={handleBackToReport}
                title="Back to All Transactions Report"
            >
                <IconChangeArrow className='w-5 h-5' />
                <span className="text-lg font-bold ">Back to Report</span>
            </a>
        </span>
    )
}
