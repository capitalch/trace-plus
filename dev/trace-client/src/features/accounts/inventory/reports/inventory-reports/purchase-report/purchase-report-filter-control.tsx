import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../../app/store/store";
// import { useRef } from "react";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import Select from 'react-select'
import { setPurchaseReportCustomFilterOption, setPurchaseReportFilterDateInterval, setPurchaseReportIsPaneOpen, setPurchaseReportPredefinedFilterOption, setPurchaseReportSelectMode } from "../../../../accounts-slice";
import { Utils } from "../../../../../../utils/utils";
import { format} from "date-fns";
import { useInventoryReportsShared } from "../inventory-reports-shared-hook";
import { dateRangeOptions, DateRangeType } from "../../../shared-definitions";

export function PurchaseReportFilterContol() {
    const dispatch: AppDispatchType = useDispatch();
    // const selectRef: any = useRef<Select>(null)
    const { currentDateFormat, } = useUtilsInfo();
    const {getDateRange, getMonthRange} = useInventoryReportsShared()
    const isoFormat = 'yyyy-MM-dd'

    //redux
    const selectedSelectMode = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectMode)
    const selectedPredefinedFilterOption = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.predefinedFilterOption)
    const selectedCustomFilterOption = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.customFilterOption)

    return (
        <div className="flex flex-col gap-6">

            {/* Radio Selector */}
            <div className="flex items-center gap-6 px-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                    <input
                        type="radio"
                        name="rangeMode"
                        value="predefined"
                        checked={selectedSelectMode === 'predefined'}
                        onChange={() => dispatch(setPurchaseReportSelectMode('predefined'))}
                        className="accent-blue-600"
                    />
                    Predefined Date Range
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                    <input
                        type="radio"
                        name="rangeMode"
                        value="custom"
                        checked={selectedSelectMode === 'custom'}
                        onChange={() => dispatch(setPurchaseReportSelectMode('custom'))}
                        className="accent-green-600"
                    />
                    Custom Date Range
                </label>
            </div>

            {/* Predefined Date Range Section */}
            {selectedSelectMode === 'predefined' && (
                <section className="px-4 py-5 border rounded-lg shadow-sm bg-white space-y-4 border-blue-300 ring-2 ring-blue-400">

                    <label className="text-lg font-semibold text-primary-800">Predefined Date Range</label>

                    <Select
                        className="mt-2"
                        // ref={selectRef}
                        placeholder="Select a predefined date range"
                        styles={Utils.getReactSelectStyles()}
                        options={dateRangeOptions}
                        onChange={handleOnChangePredefinedDateRange}
                        menuPlacement="auto"
                        value={dateRangeOptions.find((option: DateRangeType) => option.value === selectedPredefinedFilterOption.value) || null}
                    />

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>Start date: <span className="font-medium">{selectedPredefinedFilterOption.startDate ? format(selectedPredefinedFilterOption.startDate, currentDateFormat) : 'None'}</span></div>
                        <div>End date: <span className="font-medium">{selectedPredefinedFilterOption.endDate ? format(selectedPredefinedFilterOption.endDate, currentDateFormat) : 'None'}</span></div>
                    </div>
                </section>
            )}

            {/* Custom Date Range Section */}
            {selectedSelectMode === 'custom' && (
                <section className="px-4 py-5 border rounded-lg shadow-sm bg-white space-y-4 border-green-300 ring-2 ring-green-400">

                    <label className="text-lg font-semibold text-primary-800">Custom Date Range</label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm text-primary-800 font-medium mt-2">
                            <span>Start Date</span>
                            <input
                                type="date"
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                value={selectedCustomFilterOption.startDate}
                                onChange={(e) => {
                                    handleCustomStartDateChange(e.target.value);
                                }}
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm text-primary-800 font-medium mt-2">
                            <span>End Date</span>
                            <input
                                type="date"
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                value={selectedCustomFilterOption.endDate}
                                onChange={(e) => {
                                    handleCustomEndDateChange(e.target.value);
                                }}
                            />
                        </label>
                    </div>
                </section>
            )}

            {/* Filter Button */}
            <div className="flex justify-end px-2">
                <button
                    onClick={handleApplyFilter}
                    disabled={isApplyFilterButtonDisabled()}
                    className="px-5 py-2 rounded-md text-white text-sm font-medium transition bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Apply Filter
                </button>
            </div>
        </div>
    );

    function handleCustomStartDateChange(date: string) {
        const dateValue = new Date(date)
        const formattedDate = format(dateValue, isoFormat)
        dispatch(setPurchaseReportCustomFilterOption({ ...selectedCustomFilterOption, startDate: formattedDate }))
    }

    function handleCustomEndDateChange(date: string) {
        const dateValue = new Date(date)
        const formattedDate = format(dateValue, isoFormat)
        dispatch(setPurchaseReportCustomFilterOption({ ...selectedCustomFilterOption, endDate: formattedDate }))
    }

    function handleApplyFilter() {
        const startDate = selectedSelectMode === 'predefined' ? selectedPredefinedFilterOption.startDate : selectedCustomFilterOption.startDate
        const endDate = selectedSelectMode === 'predefined' ? selectedPredefinedFilterOption.endDate : selectedCustomFilterOption.endDate

        if (!startDate || !endDate) {
            return
        }

        dispatch(setPurchaseReportFilterDateInterval({ startDate:startDate, endDate:endDate }))
        dispatch(setPurchaseReportIsPaneOpen(false))
    }

    function handleOnChangePredefinedDateRange(selected: { label: string, value: string } | null) {
        if (!selected) {
            return
        }
        let dateRange: { startDate: string, endDate: string }
        if (Utils.isNumeric(selected.value)) {
            dateRange = getMonthRange(selected.value)
        } else {
            dateRange = getDateRange(selected.value)
        }
        dispatch(setPurchaseReportPredefinedFilterOption({ startDate: dateRange.startDate, endDate: dateRange.endDate, value: selected.value }))
    }

    function isApplyFilterButtonDisabled(): boolean {
        const startDate = selectedSelectMode === 'predefined' ? selectedPredefinedFilterOption.startDate : selectedCustomFilterOption.startDate
        const endDate = selectedSelectMode === 'predefined' ? selectedPredefinedFilterOption.endDate : selectedCustomFilterOption.endDate
        const isDisabled = (!startDate) || (!endDate)
        return (isDisabled)
    }

}