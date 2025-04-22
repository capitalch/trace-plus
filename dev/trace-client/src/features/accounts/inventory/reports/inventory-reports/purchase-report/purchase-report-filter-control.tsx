import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../../app/store/store";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { useEffect, useRef } from "react";
import Select from 'react-select'
import { Utils } from "../../../../../../utils/utils";
import { endOfMonth, format, formatDate, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";

export function PurchaseReportFilterContol() {
    const dispatch: AppDispatchType = useDispatch();
    const selectRef: any = useRef<Select | null>(null)
    const { buCode, context, currentFinYear, dbName, decodedDbParamsObject } = useUtilsInfo();
    const isoFormat = 'yyyy-MM-dd'

    const selectedStartDate = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectedStartDate)
    const selectedEndDate = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectedEndDate)

    useEffect(() => {
        if (selectRef?.current) {
            selectRef.current.setValue(periodOptions[5])
        }
    }, [])

    return (<div className="flex flex-col gap-4">

        {/* Range */}
        <label className="flex flex-col font-medium text-primary-800 gap-2">
            <span className="font-bold">Range</span>
            <Select menuPlacement='auto'
                ref={selectRef}
                placeholder='Select purchase period'
                styles={Utils.getReactSelectStyles()}
                options={periodOptions}
                onChange={handleOnChangePurchasePeriod} />
        </label>

        {/* Start date */}
        <label className="flex flex-col font-medium text-primary-800 gap-2">
            <span className="font-bold">Start date</span>
            <input
                type='date'
                className={'text-right rounded-md'}
                value={selectedStartDate || formatDate(Date(), isoFormat)}
            />
        </label>

        {/* End date */}
        <label className="flex flex-col font-medium text-primary-800 gap-2">
            <span className="font-bold">End date</span>
            <input
                type='date'
                className={'text-right rounded-md'}
                value={selectedEndDate || formatDate(Date(), isoFormat)}
            />
        </label>

    </div>)

    function getDateRange(range: string) {
        const formatDate = (date: Date) => format(date, isoFormat)
        const today = new Date()
        const prevMonth = subMonths(today, 1)
        // const fiscalYearStartMonth = 3 // April (0-based index)
        const fiscalYearStartYear = currentFinYear?.finYearId || new Date().getFullYear() // today.getMonth() < fiscalYearStartMonth ? today.getFullYear() - 1 : today.getFullYear()
        // const fiscalStartDate = new Date(fiscalYearStartYear, 3, 1) // April 1st
        // const fiscalEndDate = new Date(fiscalYearStartYear + 1, 2, 31) // March 31st next year

        const logicObject: { [key: string]: { startDate: Date , endDate: Date  } } = {
            finYear: { startDate: new Date(currentFinYear?.startDate || Date()), endDate: new Date(currentFinYear?.endDate || Date()) },
            today: { startDate: today, endDate: today },
            prevDay: { startDate: subDays(today, 1), endDate: subDays(today, 1) },
            last3Days: { startDate: subDays(today, 2), endDate: today },
            thisWeek: { startDate: startOfWeek(today, { weekStartsOn: 1 }), endDate: today },
            thisMonth: { startDate: startOfMonth(today), endDate: today },
            prevMonth: { startDate: startOfMonth(prevMonth), endDate: endOfMonth(prevMonth) },
            last3Months: { startDate: startOfMonth(subMonths(today, 2)), endDate: endOfMonth(prevMonth) },
            qtr1: { startDate: new Date(fiscalYearStartYear, 3, 1), endDate: new Date(fiscalYearStartYear, 5, 30) },
            qtr2: { startDate: new Date(fiscalYearStartYear, 6, 1), endDate: new Date(fiscalYearStartYear, 8, 30) },
            qtr3: { startDate: new Date(fiscalYearStartYear, 9, 1), endDate: new Date(fiscalYearStartYear, 11, 31) },
            qtr4: { startDate: new Date(fiscalYearStartYear + 1, 0, 1), endDate: new Date(fiscalYearStartYear + 1, 2, 31) },
            h1: { startDate: new Date(fiscalYearStartYear, 3, 1), endDate: new Date(fiscalYearStartYear, 8, 30) },
            h2: { startDate: new Date(fiscalYearStartYear, 9, 1), endDate: new Date(fiscalYearStartYear + 1, 2, 31) },
        }
        const dateRange = logicObject[range]
        return({startDate: formatDate(dateRange.startDate ), endDate: formatDate(dateRange.endDate)})
    }

    function handleOnChangePurchasePeriod(selected: any) {

    }
}

const periodOptions: { label: string; value: any }[] = [
    { label: 'Current financial year', value: 'finYear' },
    { label: 'Today', value: 'today' },
    { label: 'Prev day', value: 'prevDay' },
    { label: 'last 3 days', value: 'last3Days' },
    { label: 'This week', value: 'this week' },
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
    { label: 'October', value: 11 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12, },
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 }
]