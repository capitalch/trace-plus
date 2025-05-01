import SlidingPane from "react-sliding-pane";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../../app/store/store";
import { SalesReportFilterControl } from "./sale-report-filter-control";
import { setSalesReportIsPaneOpen } from "./sales-report-slice";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { format } from "date-fns";

export function SalesReportToolbarFilterDisplay() {
    const dispatch: AppDispatchType = useDispatch();
    const selectedFilters = useSelector(
        (state: RootStateType) => state.salesReport)
    const { currentDateFormat } = useUtilsInfo();
    const selectedIsPaneOpen = useSelector(
        (state: RootStateType) =>
            state.salesReport.isPaneOpen
    );
    const isCategoryFilterMode = selectedFilters.filterMode === 'category';
    const isProductCodeFilterMode = selectedFilters.filterMode === 'productCode';
    return (
        <div>
            <div className="max-w-xl grid grid-rows-2 gap-y-1 px-1 bg-gray-50 rounded-lg text-sm text-gray-700">
                {/* Row 1 */}
                <div className="flex items-center gap-x-2 w-full">

                    {isCategoryFilterMode && <div className="w-64 truncate text-blue-500 font-bold">
                        <span className="font-semibold text-primary-600">Cat:</span>{' '}
                        {selectedFilters.catFilterOption.selectedCategory.catName}
                    </div>}
                    {isCategoryFilterMode && <div className="w-32 truncate text-blue-500 font-bold">
                        <span className="font-semibold text-primary-600">Brand:</span>{' '}
                        {selectedFilters.catFilterOption.selectedBrand.brandName}
                    </div>}
                    {isProductCodeFilterMode && <div className="w-64 truncate text-blue-500 font-bold">
                        <span className="font-semibold text-primary-600">Product code:</span>{' '}
                        {selectedFilters.productCode || 'None'}
                    </div>}
                    <button
                        className="w-32 h-6 px-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 shrink-0 ml-2"
                        onClick={() => dispatch(setSalesReportIsPaneOpen(true))}
                        type="button"
                    >
                        Open Filters
                    </button>
                </div>

                {/* Row 2 */}
                <div className="flex items-center gap-x-2 w-full">
                    {isCategoryFilterMode && <div className="w-24 truncate text-blue-500 font-bold">
                        <span className="font-semibold text-primary-600">Tag:</span>{' '}
                        {selectedFilters.catFilterOption.selectedTag.tagName}
                    </div>}
                    <div className="w-24 truncate text-blue-500 font-bold">
                        <span className="font-semibold text-primary-600"></span>{' '}
                        {selectedFilters.ageFilterOption.selectedAge?.label || 'All'}
                    </div>
                    <div className="w-48 truncate text-blue-500 font-bold">
                        <span className="font-semibold text-primary-600">Start dt:</span>{' '}
                        {format(selectedFilters.dateRangeFilterOption.startDate, currentDateFormat)}
                    </div>
                    <div className="w-48 truncate text-blue-500 font-bold ml-auto">
                        <span className="font-semibold text-primary-600">End dt:</span>{' '}
                        {format(selectedFilters.dateRangeFilterOption.endDate, currentDateFormat)}
                    </div>
                </div>
            </div>

            <SlidingPane
                isOpen={selectedIsPaneOpen}
                title="Filter Options"
                onRequestClose={() => dispatch(setSalesReportIsPaneOpen(false))}
                width="500px"
            >
                <SalesReportFilterControl />
            </SlidingPane>
        </div>
    );
}