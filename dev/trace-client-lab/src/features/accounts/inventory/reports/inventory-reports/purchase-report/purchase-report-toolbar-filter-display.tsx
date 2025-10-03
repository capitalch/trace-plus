import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../../app/store";
import { setPurchaseReportIsPaneOpen } from "../../../../accounts-slice";
import SlidingPane from "react-sliding-pane";
import { PurchaseReportFilterContol } from "./purchase-report-filter-control";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { format } from "date-fns";

export function PurchaseReportToolbarFilterDisplay() {
    const dispatch: AppDispatchType = useDispatch();
    const { currentDateFormat } = useUtilsInfo();
    const selectedIsPaneOpen = useSelector(
        (state: RootStateType) =>
            state.accounts.purchaseReportFilterState.isPaneOpen
    );
    const selectedStartDate = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectedStartDate)
    const selectedEndDate = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectedEndDate)

    return (
        <div className="flex items-center px-2 py-1 text-gray-700 text-sm bg-gray-50 border border-gray-200 rounded-lg shadow-sm gap-4">
            <div className="font-bold text-blue-500">
                <span className="font-semibold text-primary-600">Start date:</span>{' '}
                {selectedStartDate ? format(selectedStartDate || Date(), currentDateFormat) : 'None'}
            </div>
            <div className="font-bold text-blue-500">
                <span className="font-semibold text-primary-600">End date:</span>{' '}
                {selectedEndDate ? format(selectedEndDate || Date(), currentDateFormat) : 'None'}
            </div>
            <button
                className="px-4 py-1 h-8 text-white bg-blue-500 rounded-lg hover:bg-blue-700"
                onClick={() => {
                    dispatch(setPurchaseReportIsPaneOpen(true));
                }}
                type="button"
            >
                Open Filters
            </button>
            <SlidingPane
                isOpen={selectedIsPaneOpen}
                title="Filter Options"
                onRequestClose={() =>
                    dispatch(setPurchaseReportIsPaneOpen(false))
                }
                width="500px"
            >
                <PurchaseReportFilterContol />
            </SlidingPane>
        </div>
    );
}