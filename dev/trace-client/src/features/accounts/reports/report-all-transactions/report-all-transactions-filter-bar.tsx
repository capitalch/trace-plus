import { useDispatch, useSelector } from "react-redux"
import { AppDispatchType, RootStateType } from "../../../../app/store"
import { openSlidingPane } from "../../../../controls/redux-components/comp-slice"
import { SlidingPaneEnum } from "../../../../controls/redux-components/sliding-pane/sliding-pane-map"
import { AllTransactionsFilterType } from "../../accounts-slice"
import { useUtilsInfo } from "../../../../utils/utils-info-hook"
import { format } from "date-fns"
import { currentFinYearSelectorFn, FinYearType } from "../../../login/login-slice"
import { Utils } from "../../../../utils/utils"

export function ReportAllTransactionsFilterBar() {
    const dispatch: AppDispatchType = useDispatch()
    const { currentDateFormat } = useUtilsInfo()
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn) || Utils.getRunningFinYear()
    const selectedAllTransactionsFilter: AllTransactionsFilterType = useSelector((state: RootStateType) => state.accounts.allTransactionsFilter)
    const { startDate, endDate, dateType, transactionType } = selectedAllTransactionsFilter

    const formattedStartDate = startDate ? format(new Date(startDate), currentDateFormat) : format(new Date(currentFinYear.startDate), currentDateFormat)
    const formattedEndDate = endDate ? format(new Date(endDate), currentDateFormat) : format(new Date(currentFinYear.endDate), currentDateFormat)

    return (<div className="flex items-center">

        <div className="flex flex-wrap items-center p-1 text-xs bg-white border border-gray-300 rounded-lg shadow-md gap-3">
            <button onClick={handleSetFilter} className="px-4 py-1 text-white bg-violet-600 rounded-md">Set filter</button>

            {/* Transaction Type */}
            <div className="flex items-center px-2 py-1 bg-gray-100 rounded gap-1">
                <span className="text-gray-500">Transaction Type:</span>
                <span className="font-medium text-indigo-600">{transactionType.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}</span>
            </div>

            {/* Filter By */}
            <div className="flex items-center px-2 py-1 bg-gray-100 rounded gap-1">
                <span className="text-gray-500">Date Type:</span>
                <span className="font-medium text-indigo-600">{(dateType == 'entryDate') ? 'Entry Date' : 'Transaction Date'}</span>
            </div>

            {/* Start Date */}
            <div className="flex items-center px-2 py-1 bg-gray-100 rounded gap-1">
                <span className="text-gray-500">Start Date:</span>
                <span className="font-medium text-indigo-600">{formattedStartDate || "N/A"}</span>
            </div>

            {/* End Date */}
            <div className="flex items-center px-2 py-1 bg-gray-100 rounded gap-1">
                <span className="text-gray-500">End Date:</span>
                <span className="font-medium text-indigo-600">{formattedEndDate || "N/A"}</span>
            </div>
        </div>
    </div>)

    function handleSetFilter() {
        dispatch(openSlidingPane({
            identifier: SlidingPaneEnum.reportAllTransactionsFilter,
            title: 'Set transactions filter',
            width: '700px'
        }))
    }
}

