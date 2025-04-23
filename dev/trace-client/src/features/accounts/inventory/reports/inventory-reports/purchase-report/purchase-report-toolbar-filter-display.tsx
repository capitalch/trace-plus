import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../../app/store/store";
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
        <div className="flex items-center gap-4 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-700">
            <div className="text-blue-500 font-bold">
                <span className="font-semibold text-primary-600">Start date:</span>{' '}
                {selectedStartDate ? format(selectedStartDate || Date(), currentDateFormat) : 'None'}
            </div>
            <div className="text-blue-500 font-bold">
                <span className="font-semibold text-primary-600">End date:</span>{' '}
                {selectedEndDate ? format(selectedEndDate || Date(), currentDateFormat) : 'None'}
            </div>
            <button
                className="h-8 py-1 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
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