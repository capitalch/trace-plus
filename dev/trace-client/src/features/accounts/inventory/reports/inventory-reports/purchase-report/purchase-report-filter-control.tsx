import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../../app/store/store";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { useEffect, useRef, useState, } from "react";
import Select from 'react-select'
import { Utils } from "../../../../../../utils/utils";
import { endOfMonth, format, formatDate, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
import { setPurchasePriceVariationIsPaneOpen, setPurchaseReportFilterDateInterval, setPurchaseReportPredefinedValue, setPurchaseReportSelectMode } from "../../../../accounts-slice";
import clsx from "clsx";

export function PurchaseReportFilterContol() {
    const [, setRefresh] = useState({})
    const dispatch: AppDispatchType = useDispatch();
    const selectRef: any = useRef<Select>(null)
    const { currentDateFormat, currentFinYear, } = useUtilsInfo();
    const isoFormat = 'yyyy-MM-dd'

    const selectedStartDate = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectedStartDate)
    const selectedEndDate = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectedEndDate)
    const selectedSelectMode = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectMode)
    const selectedPredefinedValue = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectedPredefinedValue)

    const fiscalYearStartYear = currentFinYear?.finYearId || new Date().getFullYear()
    const predefinedDateRangeLocalState = useRef<{ startDate: string, endDate: string }>({ startDate: '', endDate: '' })
    const customDateRangeLocalState = useRef<{ startDate: string, endDate: string }>({ startDate: '', endDate: '' })

    // useEffect(() => {
    //     if (selectRef?.current) {
    //         // selectRef.current.setValue(periodOptions[0])
    //         // const dateRange = getDateRange(periodOptions[0].value)
    //         // dispatch(setPurchaseReportFilterDateInterval({ startDate: dateRange.startDate, endDate: dateRange.endDate }))
    //     }
    // }, [])

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

                    <h2 className="text-lg font-semibold text-primary-800">Predefined Date Range</h2>

                    <Select
                        ref={selectRef}
                        placeholder="Select a predefined date range"
                        styles={Utils.getReactSelectStyles()}
                        options={periodOptions}
                        onChange={handleOnChangePredefinedDateRange}
                        menuPlacement="auto"
                        value={periodOptions.find((option) => option.value === selectedPredefinedValue) || null}
                    />

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {/* <div>Start date: <span className="font-medium">{selectedStartDate ? format(selectedStartDate, currentDateFormat) : 'None'}</span></div>
                        <div>End date: <span className="font-medium">{selectedEndDate ? format(selectedEndDate, currentDateFormat) : 'None'}</span></div> */}
                        <div>Start date: <span className="font-medium">{predefinedDateRangeLocalState.current.startDate ? format(predefinedDateRangeLocalState.current.startDate, currentDateFormat) : 'None'}</span></div>
                        <div>End date: <span className="font-medium">{predefinedDateRangeLocalState.current.endDate ? format(predefinedDateRangeLocalState.current.endDate, currentDateFormat) : 'None'}</span></div>
                    </div>
                </section>
            )}

            {/* Custom Date Range Section */}
            {selectedSelectMode === 'custom' && (
                <section className="px-4 py-5 border rounded-lg shadow-sm bg-white space-y-4 border-green-300 ring-2 ring-green-400">

                    <h2 className="text-lg font-semibold text-primary-800">Custom Date Range</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm text-primary-800 font-medium">
                            <span>Start Date</span>
                            <input
                                type="date"
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                value={customDateRangeLocalState.current.startDate}
                                onChange={(e) => {
                                    // dispatch(setPurchaseReportSelectMode('custom'));
                                    handleCustomStartDateChange(e.target.value);
                                    setRefresh({}) // Force re-render to update the date
                                }}
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm text-primary-800 font-medium">
                            <span>End Date</span>
                            <input
                                type="date"
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                                value={customDateRangeLocalState.current.endDate}
                                onChange={(e) => {
                                    // dispatch(setPurchaseReportSelectMode('custom'))
                                    handleCustomEndDateChange(e.target.value);
                                    setRefresh({}) // Force re-render to update the date
                                }}
                            />
                        </label>
                    </div>
                </section>
            )}

            {/* Filter Button */}
            <div className="flex justify-end px-2">
                <button
                    onClick={handleFilter}
                    disabled={isApplyFilterButtonDisabled()}
                    className={clsx(
                        "px-5 py-2 rounded-md text-white text-sm font-medium transition",
                        selectedStartDate && selectedEndDate
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-300 cursor-not-allowed"
                    )}
                >
                    Apply Filter
                </button>
            </div>

        </div>
    );

    function getDateRange(range: string) {
        const formatDate = (date: Date) => format(date, isoFormat)
        const today = new Date()
        const prevMonth = subMonths(today, 1)

        const logicObject: { [key: string]: { startDate: Date, endDate: Date } } = {
            finYear: { startDate: new Date(currentFinYear?.startDate || Date()), endDate: new Date(currentFinYear?.endDate || Date()) },
            today: { startDate: today, endDate: today },
            prevDay: { startDate: subDays(today, 1), endDate: subDays(today, 1) },
            last3Days: { startDate: subDays(today, 2), endDate: today },
            thisWeek: { startDate: startOfWeek(today, { weekStartsOn: 1 }), endDate: today },
            thisMonth: { startDate: startOfMonth(today), endDate: today },
            prevMonth: { startDate: startOfMonth(prevMonth), endDate: endOfMonth(prevMonth) },
            last3Months: { startDate: startOfMonth(subMonths(today, 3)), endDate: endOfMonth(prevMonth) },
            qtr1: { startDate: new Date(fiscalYearStartYear, 3, 1), endDate: new Date(fiscalYearStartYear, 5, 30) },
            qtr2: { startDate: new Date(fiscalYearStartYear, 6, 1), endDate: new Date(fiscalYearStartYear, 8, 30) },
            qtr3: { startDate: new Date(fiscalYearStartYear, 9, 1), endDate: new Date(fiscalYearStartYear, 11, 31) },
            qtr4: { startDate: new Date(fiscalYearStartYear + 1, 0, 1), endDate: new Date(fiscalYearStartYear + 1, 2, 31) },
            h1: { startDate: new Date(fiscalYearStartYear, 3, 1), endDate: new Date(fiscalYearStartYear, 8, 30) },
            h2: { startDate: new Date(fiscalYearStartYear, 9, 1), endDate: new Date(fiscalYearStartYear + 1, 2, 31) },
        }
        const dateRange = logicObject[range]
        return ({ startDate: formatDate(dateRange.startDate), endDate: formatDate(dateRange.endDate) })
    }

    function handleCustomStartDateChange(date: string) {
        const dateValue = new Date(date)
        const formattedDate = format(dateValue, isoFormat)
        customDateRangeLocalState.current.startDate = formattedDate
        // dispatch(setPurchaseReportFilterDateInterval({ startDate: formattedDate, endDate: selectedEndDate }))
    }

    function handleCustomEndDateChange(date: string) {
        const dateValue = new Date(date)
        const formattedDate = format(dateValue, isoFormat)
        customDateRangeLocalState.current.endDate = formattedDate
        // dispatch(setPurchaseReportFilterDateInterval({ startDate: selectedStartDate, endDate: formattedDate }))
    }

    function handleFilter() {
        const startDate = selectedSelectMode === 'predefined' ? predefinedDateRangeLocalState.current.startDate : customDateRangeLocalState.current.startDate
        const endDate = selectedSelectMode === 'predefined' ? predefinedDateRangeLocalState.current.endDate : customDateRangeLocalState.current.endDate

        if (!startDate || !endDate) {
            return
        }

        dispatch(setPurchaseReportFilterDateInterval({ startDate, endDate }))
        dispatch(setPurchasePriceVariationIsPaneOpen(false))
    }

    function handleOnChangePredefinedDateRange(selected: { label: string, value: string } | null) {
        if (!selected) {
            return
        }
        const getMonthRange = (month: any) => {
            const year =
                month >= 4 && month <= 12
                    ? fiscalYearStartYear
                    : fiscalYearStartYear + 1
            const startDate = new Date(year, month - 1, 1)
            const endDate = endOfMonth(startDate)
            return {
                startDate: format(startDate, isoFormat),
                endDate: format(endDate, isoFormat)
            }
        }
        let dateRange: { startDate: string, endDate: string }
        if (Utils.isNumeric(selected.value)) {
            dateRange = getMonthRange(selected.value)
        } else {
            dateRange = getDateRange(selected.value)
        }
        dispatch(setPurchaseReportPredefinedValue(selected.value))
        predefinedDateRangeLocalState.current = dateRange
        console.log(dateRange)

        // dispatch(setPurchasePriceVariationIsPaneOpen(false))

        // dispatch(setPurchaseReportFilterDateInterval({
        //     startDate: dateRange.startDate,
        //     endDate: dateRange.endDate
        // }))

    }

    function isApplyFilterButtonDisabled(): boolean {
        const startDate = selectedSelectMode === 'predefined' ? predefinedDateRangeLocalState.current.startDate : customDateRangeLocalState.current.startDate
        const endDate = selectedSelectMode === 'predefined' ? predefinedDateRangeLocalState.current.endDate : customDateRangeLocalState.current.endDate
        return ((!startDate) || (!endDate))
    }
}

const periodOptions: { label: string; value: any }[] = [
    { label: 'Current financial year', value: 'finYear' },
    { label: 'Today', value: 'today' },
    { label: 'Prev day', value: 'prevDay' },
    { label: 'last 3 days', value: 'last3Days' },
    { label: 'This week', value: 'thisWeek' },
    { label: 'This month', value: 'thisMonth' },
    { label: 'Prev month', value: 'prevMonth' },
    { label: 'Last 3 months', value: 'last3Months' },
    { label: 'Qtr1', value: 'qtr1' },
    { label: 'Qtr2', value: 'qtr2' },
    { label: 'Qtr3', value: 'qtr3' },
    { label: 'Qtr4', value: 'qtr4' },
    { label: 'H1', value: 'h1' },
    { label: 'H2', value: 'h2' },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12, },
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 }
]