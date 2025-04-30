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