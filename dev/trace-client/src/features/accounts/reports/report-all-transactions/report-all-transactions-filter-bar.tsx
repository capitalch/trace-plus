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

        <div className="flex flex-wrap items-center gap-3 bg-white p-1 rounded-lg shadow-md border border-gray-300 text-xs">
            <button onClick={handleSetFilter} className="bg-violet-600 text-white rounded-md px-4 py-1">Set filter</button>

            {/* Transaction Type */}
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <span className="text-gray-500">Transaction Type:</span>
                <span className="text-indigo-600 font-medium">{transactionType.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}</span>
            </div>

            {/* Filter By */}
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <span className="text-gray-500">Date Type:</span>
                <span className="text-indigo-600 font-medium">{(dateType == 'entryDate') ? 'Entry Date' : 'Transaction Date'}</span>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <span className="text-gray-500">Start Date:</span>
                <span className="text-indigo-600 font-medium">{formattedStartDate || "N/A"}</span>
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <span className="text-gray-500">End Date:</span>
                <span className="text-indigo-600 font-medium">{formattedEndDate || "N/A"}</span>
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

