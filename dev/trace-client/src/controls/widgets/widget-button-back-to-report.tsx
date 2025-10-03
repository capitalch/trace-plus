import { useLocation, useNavigate } from "react-router-dom";
import { IconChangeArrow } from "../icons/icon-change-arrow";
import { useDispatch } from "react-redux";
import { setAllTransactionFilter } from "../../features/accounts/accounts-slice";
import { AppDispatchType } from "../../app/store";

export function WidgetButtonBackToReport() {
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

        // Restore report filters if available
        if (reportFilters) {
            dispatch(setAllTransactionFilter(reportFilters))
        }

        // Navigate back to report
        navigate(returnPath)
    }

    return (
        <span className="flex items-center">→&nbsp;
            <button
                type="button"
                className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg border border-primary-600"
                onClick={handleBackToReport}
                title="Back to All Transactions Report"
            >
                <IconChangeArrow className='w-5 h-5 text-white' />
                <span className="text-s font-medium text-white">Back to Report</span>
            </button>
        </span>
    )
}
