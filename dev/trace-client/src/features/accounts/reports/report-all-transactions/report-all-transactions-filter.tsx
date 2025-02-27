import React, { useState } from "react";
import { AppDispatchType, RootStateType } from "../../../../app/store/store";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AllTransactionsFilterType, setAllTransactionFilter } from "../../accounts-slice";
import { startOfMonth, endOfMonth, endOfToday, format, subDays, subMonths } from "date-fns";
import { currentFinYearSelectorFn, FinYearType, } from "../../../login/login-slice";
import { Utils } from "../../../../utils/utils";
import { closeSlidingPane } from "../../../../controls/redux-components/comp-slice";
import { Messages } from "../../../../utils/messages";
import { transactionTypes } from "./export-constants";

export const ReportAllTransactionsFilter: React.FC = () => {
    const dispatch: AppDispatchType = useDispatch()
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn, shallowEqual) || Utils.getRunningFinYear()
    const isoDate = 'yyyy-MM-dd'
    const selectedAllTransactionsFilter: AllTransactionsFilterType = useSelector((state: RootStateType) => state.accounts.allTransactionsFilter, shallowEqual)

    const [errorMessage, setErrorMessage] = useState<string>("");

    const predefinedDateRanges = [
        { label: "Today", dateRangeName: 'today' },
        { label: "Yesterday", dateRangeName: 'yesterday' },
        { label: "Last 3 Days", dateRangeName: 'last3Days' },
        { label: "Last 7 Days", dateRangeName: 'last7Days' },
        { label: "Last 30 Days", dateRangeName: 'last30Days' },
        { label: "This Month", dateRangeName: 'thisMonth' },
        { label: "Last Month", dateRangeName: 'lastMonth' },
        { label: "Last 2 Months", dateRangeName: 'last2Months' },
        { label: "Last 3 months", dateRangeName: 'last3Months' },
        { label: "Since Last Month", dateRangeName: 'sinceLastMonth' },
        { label: "Since Last 2 Months", dateRangeName: 'sinceLast2Months' },
        { label: "Since Last 3 Months", dateRangeName: 'sinceLast3Months' },
        { label: "Fiscal Year", dateRangeName: 'fiscalYear' }
    ];

    const quarters = [
        { label: "Q1", dateRangeName: 'q1' },
        { label: "Q2", dateRangeName: 'q2' },
        { label: "Q3", dateRangeName: 'q3' },
        { label: "Q4", dateRangeName: 'q4' },
    ];

    const validateDates = (start: string, end: string) => {
        if (new Date(start) > new Date(end)) {
            setErrorMessage(Messages.messEndDateGreaterThanStartDate);
            return false;
        }
        setErrorMessage("");
        return true;
    };

    const setDateRange = (dateRangeName: string) => {
        const today = format(endOfToday(), isoDate)
        const lastMonth = subMonths(new Date(), 1)
        const logicObject: { [key: string]: () => any } = {
            today: () => ({ startDate: today, endDate: today })
            , yesterday: () => (
                {
                    startDate: format(subDays(new Date(), 1), isoDate),
                    endDate: today
                })
            , last3Days: () => (
                {
                    startDate: format(subDays(new Date(), 3), isoDate),
                    endDate: today
                })
            , last7Days: () => (
                {
                    startDate: format(subDays(new Date(), 7), isoDate),
                    endDate: today
                })
            , last30Days: () => (
                {
                    startDate: format(subDays(new Date(), 30), isoDate),
                    endDate: today
                })
            , thisMonth: () => (
                {
                    startDate: format(startOfMonth(new Date()), isoDate),
                    endDate: today
                })
            , lastMonth: () => {
                return (
                    {
                        startDate: format(startOfMonth(lastMonth), isoDate),
                        endDate: format(endOfMonth(lastMonth), isoDate)
                    })
            }
            , last2Months: () => {
                const last2Month = subMonths(new Date(), 2)
                return (
                    {
                        startDate: format(startOfMonth(last2Month), isoDate),
                        endDate: format(endOfMonth(lastMonth), isoDate)
                    })
            }
            , last3Months: () => {
                const last3Month = subMonths(new Date(), 3)
                return (
                    {
                        startDate: format(startOfMonth(last3Month), isoDate),
                        endDate: format(endOfMonth(lastMonth), isoDate)
                    })
            }
            , sinceLastMonth: () => {
                const lastMonth = subMonths(new Date(), 1)
                return (
                    {
                        startDate: format(startOfMonth(lastMonth), isoDate),
                        endDate: today
                    })
            }
            , sinceLast2Months: () => {
                const last2Month = subMonths(new Date(), 2)
                return (
                    {
                        startDate: format(startOfMonth(last2Month), isoDate),
                        endDate: today
                    })
            }
            , sinceLast3Months: () => {
                const last3Month = subMonths(new Date(), 3)
                return (
                    {
                        startDate: format(startOfMonth(last3Month), isoDate),
                        endDate: today
                    })
            }
            , fiscalYear: () => {
                return (
                    {
                        startDate: format(currentFinYear.startDate, isoDate),
                        endDate: format(currentFinYear.endDate, isoDate),
                    })
            }
            , q1: () => ({
                startDate: currentFinYear.startDate,
                endDate: `${currentFinYear.finYearId}-06-30`
            })
            , q2: () => ({
                startDate: `${currentFinYear.finYearId}-07-01`,
                endDate: `${currentFinYear.finYearId}-09-30`
            })
            , q3: () => ({
                startDate: `${currentFinYear.finYearId}-10-01`,
                endDate: `${currentFinYear.finYearId}-12-31`
            })
            , q4: () => ({
                startDate: `${currentFinYear.finYearId + 1}-01-01`,
                endDate: `${currentFinYear.finYearId + 1}-03-31`
            })
        }
        const computedDate = logicObject[dateRangeName]()
        dispatch(setAllTransactionFilter({
            ...selectedAllTransactionsFilter,
            ...computedDate,
            selectedQuickDate: dateRangeName
        }))
    }

    const handleStartDateChange = (date: string) => {
        const newStartDate = date;
        const currentEndDate = selectedAllTransactionsFilter.endDate;
        dispatch(setAllTransactionFilter({
            ...selectedAllTransactionsFilter,
            startDate: newStartDate,
            selectedQuickDate: ''
        }))

        validateDates(newStartDate, currentEndDate);
    };

    const handleEndDateChange = (date: string) => {
        const newEndDate = date;
        const currentStartDate = selectedAllTransactionsFilter.startDate;
        dispatch(setAllTransactionFilter({
            ...selectedAllTransactionsFilter,
            endDate: newEndDate,
            selectedQuickDate: ''
        }))
        validateDates(currentStartDate, newEndDate);
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="bg-violet-400 p-2 rounded w-full max-w-3xl shadow-lg">

            {/* Transaction type */}
            <div className="bg-white p-2 rounded-lg shadow-md">
                <label className="block text-gray-700 font-medium text-sm">Transaction Type</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                    {Object.entries(transactionTypes).map(([key, { name, }]) => (
                        <label key={key} className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="radio"
                                name="transactionType"
                                value={key}
                                checked={selectedAllTransactionsFilter.transactionType === key}
                                onChange={(e: any) => {
                                    dispatch(setAllTransactionFilter({
                                        ...selectedAllTransactionsFilter,
                                        transactionType: e.target.value
                                    }))
                                }}
                                className="hidden"
                            />
                            <span
                                className={`px-2 py-1 rounded-md text-xs transition-colors duration-200 cursor-pointer   
                  ${selectedAllTransactionsFilter.transactionType === key ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>
                                {name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Date type */}
            <div className="mt-2">
                <div className="bg-white rounded-lg shadow-md mt-2 p-2">
                    <label className="block text-gray-700 font-medium text-sm">Date Type</label>
                    <div className="flex gap-2 mt-1">
                        {["transactionDate", "entryDate"].map((type) => (
                            <label key={type} className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="dateType"
                                    value={type}
                                    checked={selectedAllTransactionsFilter.dateType === type}
                                    onChange={(e) => {
                                        dispatch(setAllTransactionFilter({
                                            ...selectedAllTransactionsFilter,
                                            dateType: e.target.value as any
                                        }))
                                    }}
                                    className="hidden"
                                />
                                <span
                                    className={`px-2 py-1 rounded-md text-xs transition-colors duration-200 cursor-pointer   
                  ${selectedAllTransactionsFilter.dateType === type ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                                >
                                    {capitalizeFirstLetter(type.replace("Date", " Date"))}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
                {/* Date Range */}
                <div className="bg-white rounded-lg shadow-md mt-2 p-2">
                    <label className="block text-gray-700 font-medium text-sm">Date Range</label>
                    <div className="flex mt-1 gap-1">
                        <input
                            type="date"
                            name="startDate"
                            value={selectedAllTransactionsFilter.startDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            className="flex-grow border border-blue-300 rounded-md max-w-36 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300"
                            style={{ cursor: "pointer" }}
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={selectedAllTransactionsFilter.endDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            className="flex-grow border border-blue-300 rounded-md max-w-36 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 ml-4"
                            style={{ cursor: "pointer" }}
                        />
                    </div>
                    {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
                </div>

                {/* Quick date selection */}
                <div className="bg-white rounded-lg shadow-md mt-2 p-2">
                    <label className="block text-gray-700 font-medium text-sm">Quick Date Selection</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {predefinedDateRanges.map((range) => (
                            <label key={range.label} className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="quickDate"
                                    value={range.label}
                                    checked={selectedAllTransactionsFilter.selectedQuickDate === range.label}
                                    onChange={() => setDateRange(range.dateRangeName)}
                                    className="hidden"
                                />
                                <span
                                    className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-colors duration-200   
                    ${selectedAllTransactionsFilter.selectedQuickDate === range.dateRangeName ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>
                                    {range.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-2 rounded-lg shadow-md mt-2">
                    <label className="block text-gray-700 font-medium text-sm">Quarters</label>
                    <div className="flex gap-1 mt-1">
                        {quarters.map((quarter) => (
                            <label key={quarter.label} className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="quarter"
                                    value={quarter.label}
                                    checked={selectedAllTransactionsFilter.selectedQuickDate === quarter.label}
                                    onChange={() => setDateRange(quarter.dateRangeName)}
                                    className="hidden"
                                />
                                <span
                                    className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-colors duration-200   
                    ${selectedAllTransactionsFilter.selectedQuickDate === quarter.dateRangeName ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>
                                    {quarter.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Selected filter */}
            <div className="bg-white p-2 rounded-lg shadow-md mt-2">
                <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Selected Filter:</span>
                    <button onClick={handleSubmit} className="bg-indigo-600 px-4 rounded-md text-xs text-white font-medium">Submit</button>
                </div>
                <div className="mt-1 text-gray-600 text-sm">
                    <strong>Transaction Type:</strong> {selectedAllTransactionsFilter.transactionType}
                    <br />
                    <strong>Date Type:</strong> {selectedAllTransactionsFilter.dateType.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                    <br />
                    <strong>Date Range:</strong> {formatDate(selectedAllTransactionsFilter.startDate)} to {formatDate(selectedAllTransactionsFilter.endDate)}
                    <br />
                    <strong>Quick Selection:</strong> {selectedAllTransactionsFilter.selectedQuickDate || "None"}
                </div>
            </div>
        </div>
    );

    function capitalizeFirstLetter(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function handleSubmit() {
        dispatch(setAllTransactionFilter({
            dateType: selectedAllTransactionsFilter.dateType,
            transactionType: selectedAllTransactionsFilter.transactionType,
            startDate: selectedAllTransactionsFilter.startDate,
            endDate: selectedAllTransactionsFilter.endDate,
            selectedQuickDate: selectedAllTransactionsFilter.selectedQuickDate
        }))
        dispatch(closeSlidingPane())
    }
};