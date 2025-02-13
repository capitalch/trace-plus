import { format } from 'date-fns'
import { Utils } from '../../../utils/utils'
import { useEffect, useState } from 'react'
import { currentFinYearSelectorFn, FinYearType } from '../../../features/login/login-slice'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatchType, RootStateType } from '../../../app/store/store'
import { setCompDateRangeEndDate, setCompDateRangeStartDate, setCompDateRangeStartDateEndDate } from '../comp-slice'

export function CompDateRange({ instance }: { instance: string }) {
    const dispatch: AppDispatchType = useDispatch()
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn) || Utils.getRunningFinYear()
    const selectedDateRange: { startDate: string, endDate: string } = useSelector((state: RootStateType) => state.reduxComp.compDateRange[instance])

    const currentDateFormat: string = Utils.getCurrentDateFormat().replace('DD', 'dd').replace('YYYY', 'yyyy') || 'dd/MM/yyyy'

    const [selectedType, setSelectedType] = useState<DateRangeType>("custom");
    const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(undefined);
    const [selectedPreset, setSelectedPreset] = useState("");

    useEffect(() => {
        setSelectedType('custom')
        setSelectedQuarter(undefined)
        setSelectedPreset('')
    }, [currentFinYear])

    return (<div className="flex flex-col space-y-4">

        {/* Header */}
        <div className="flex space-x-4 items-center">
            <label className="text-lg font-semibold text-primary-500">Date Range</label>
            <span className='text-sm text-black-600 mt-1 font-semibold'>
                {format(selectedDateRange?.startDate || currentFinYear.startDate, currentDateFormat)} - {format(selectedDateRange?.endDate || currentFinYear.endDate, currentDateFormat)}
            </span>
        </div>

        <div className='flex space-x-4'>
            {/* custom range */}
            <label className="flex items-center space-x-2 cursor-pointer">
                <input
                    type="radio"
                    name="dateType"
                    value="custom"
                    checked={selectedType === "custom"}
                    onChange={() => handleTypeChange("custom")}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="text-sm font-medium">Custom Range</span>
            </label>

            {/* Quarters */}
            <label className="flex items-center space-x-2 cursor-pointer">
                <input
                    type="radio"
                    name="dateType"
                    value="quarter"
                    checked={selectedType === "quarter"}
                    onChange={() => handleTypeChange("quarter")}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="text-sm font-medium">Quarters</span>
            </label>

            {/* preset ranges */}
            <label className="flex items-center space-x-2 cursor-pointer disabled:bg-gray-400 disabled:cursor-auto">
                <input
                    type="radio"
                    name="dateType"
                    value="preset"
                    checked={selectedType === "preset"}
                    onChange={() => handleTypeChange("preset")}
                    className="w-4 h-4 text-blue-600 cursor-pointer disabled:bg-gray-400 disabled:cursor-auto"
                />
                <span className="text-sm font-medium">Preset Ranges</span>
            </label>
        </div>

        {/* Custom date range */}
        {selectedType === "custom" && (
            <div className="flex gap-4 justify-start items-center">
                <div className="w-48">
                    <label className="block mb-2 text-sm font-medium">Start Date</label>
                    <input
                        type="date"
                        value={format(selectedDateRange?.startDate || currentFinYear.startDate, 'yyyy-MM-dd')}
                        onChange={(e) => {
                            const date = e.target.value;
                            dispatch(setCompDateRangeStartDate({ instance: instance, startDate: date }))
                        }}
                        className="w-full px-3 py-2 border rounded-md text-sm cursor-pointer"
                    />
                </div>
                <div className="w-48">
                    <label className="block mb-2 text-sm font-medium">End Date</label>
                    <input
                        type="date"
                        value={format(selectedDateRange?.endDate || currentFinYear.endDate, "yyyy-MM-dd")}
                        min={format(selectedDateRange?.startDate || currentFinYear.startDate, "yyyy-MM-dd")}
                        onChange={(e) => {
                            const date = e.target.value;
                            dispatch(setCompDateRangeEndDate({ instance: instance, endDate: date }))
                        }}
                        className="w-full px-3 py-2 border rounded-md text-sm cursor-pointer"
                    />
                </div>
                <button onClick={handleResetToFiscalYear} className='bg-primary-400 text-sm text-gray-50 px-4 py-1 h-10 rounded-md mt-7 hover:bg-primary-500 font-semibold'>Reset to Fiscal Year</button>
            </div>
        )}

        {/* Quarter date range */}
        {selectedType === "quarter" && (
            <div className="grid grid-cols-4 gap-4">
                {(["Q1", "Q2", "Q3", "Q4"] as Quarter[]).map((quarter) => (
                    <label key={quarter} className="flex items-center space-x-2 p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                            type="radio"
                            name="quarter"
                            value={quarter}
                            checked={selectedQuarter === quarter}
                            onChange={() => handleQuarterChange(quarter)}
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="text-sm font-medium">{quarter}</span>
                    </label>
                ))}
            </div>
        )}

        {/* Preset range */}
        {selectedType === "preset" && (
            <div className="grid grid-cols-6 gap-4">
                {[
                    { value: "thisMonth", label: "This Month" },
                    { value: "lastMonth", label: "Last Month" },
                    { value: "last3Months", label: "Last 3 Months" },
                    { value: "last6Months", label: "Last 6 Months" },
                    { value: "last9Months", label: "Last 9 Months" },
                    { value: "thisYear", label: "This Year" },
                ].map(({ value, label }) => (
                    <label key={value} className="flex items-center space-x-2 p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                            type="radio"
                            name="preset"
                            value={value}
                            checked={selectedPreset === value}
                            onChange={() => handlePresetChange(value)}
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="text-sm font-medium">{label}</span>
                    </label>
                ))}
            </div>
        )}

    </div>)

    function getPresetDateRange(preset: string) {
        const today = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (preset) {
            case "thisMonth":
                startDate.setDate(1);
                break;
            case "lastMonth":
                startDate.setMonth(startDate.getMonth() - 1, 1);
                endDate.setMonth(endDate.getMonth(), 0);
                break;
            case "last3Months":
                startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                endDate.setMonth(endDate.getMonth(), 0);
                break;
            case "last6Months":
                startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
                endDate.setMonth(endDate.getMonth(), 0);
                break;
            case "last9Months":
                startDate = new Date(today.getFullYear(), today.getMonth() - 9, 1);
                endDate.setMonth(endDate.getMonth(), 0);
                break;
            case "thisYear":
                startDate = new Date(Utils.getRunningFinYear().startDate)
                endDate = new Date(Utils.getRunningFinYear().endDate)
                break;
            default:
                startDate = today;
                endDate = today;
        }
        return ({ startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') })
    }

    function getQuarterDates(quarter: Quarter) {
        const currentYear = new Date().getFullYear();
        const quarterMap = {
            Q1: { startMonth: 3, endMonth: 5 },
            Q2: { startMonth: 6, endMonth: 8 },
            Q3: { startMonth: 9, endMonth: 11 },
            Q4: { startMonth: 0, endMonth: 2 }
        };
        let startMonth, endMonth: number
        if (!quarter) {
            startMonth = 0
            endMonth = 0
        } else {
            startMonth = quarterMap[quarter].startMonth;
            endMonth = quarterMap[quarter].endMonth;
        }

        return {
            startDate: format(new Date(currentYear, startMonth, 1), 'yyyy-MM-dd'),
            endDate: format(new Date(currentYear, endMonth + 1, 0), 'yyyy-MM-dd')
        };
    }

    function handlePresetChange(value: string) {
        setSelectedPreset(value);
        const { startDate, endDate } = getPresetDateRange(value);
        dispatch(setCompDateRangeStartDateEndDate({ instance: instance, startDate: startDate, endDate: endDate }))
        // setStartDate(start);
        // setEndDate(end);
        // onDateChange?.(start, end);
    }

    function handleResetToFiscalYear() {

    }

    function handleTypeChange(value: DateRangeType) {
        setSelectedType(value);
    }

    function handleQuarterChange(value: Quarter) {
        setSelectedQuarter(value);
        const { startDate, endDate } = getQuarterDates(value);
        dispatch(setCompDateRangeStartDateEndDate({ instance: instance, startDate: startDate, endDate: endDate }))
    }
}

type DateRangeType = "preset" | "quarter" | "custom";
type Quarter = "Q1" | "Q2" | "Q3" | "Q4" | undefined;