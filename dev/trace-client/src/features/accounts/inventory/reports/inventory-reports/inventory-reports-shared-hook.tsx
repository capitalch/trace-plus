import { endOfMonth, format, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";

export function useInventoryReportsShared() {
    const { currentFinYear, } = useUtilsInfo();
    const isoFormat = 'yyyy-MM-dd'
    const fiscalYearStartYear = currentFinYear?.finYearId || new Date().getFullYear()

    function getDateRange(range: string): { startDate: string, endDate: string } {
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

    function getMonthRange(month: any): { startDate: string, endDate: string } {
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

    return ({
        getDateRange, getMonthRange
    })
}

export const dateRangeOptions: { label: string; value: any }[] = [
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