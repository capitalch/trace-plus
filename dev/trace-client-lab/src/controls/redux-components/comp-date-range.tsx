import { format } from 'date-fns'
import { Utils } from '../../utils/utils'
import { useEffect, useState } from 'react'
import { currentFinYearSelectorFn, FinYearType } from '../../features/login/login-slice'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AppDispatchType, RootStateType } from '../../app/store'
import { setCompDateRangeEndDate, setCompDateRangeStartDate, setCompDateRangeStartDateEndDate } from './comp-slice'
import clsx from 'clsx'

export function CompDateRange({ className, instance, title }: CompDateRangeType) {
    const dispatch: AppDispatchType = useDispatch()
    const currentFinYear: FinYearType = useSelector(currentFinYearSelectorFn, shallowEqual) || Utils.getRunningFinYear()
    const selectedDateRange: { startDate: string, endDate: string } = useSelector((state: RootStateType) => state.reduxComp.compDateRange[instance])
    const isoFormat: string = 'yyyy-MM-dd'
    const currentDateFormat: string = Utils.getCurrentDateFormat().replace('DD', 'dd').replace('YYYY', 'yyyy') || 'dd/MM/yyyy'

    const [presetRangeDisabled, setPresetRangeDisabled] = useState(false)
    const [selectedType, setSelectedType] = useState<DateRangeType>("custom");
    const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(undefined);
    const [selectedPreset, setSelectedPreset] = useState("");

    useEffect(() => {
        setSelectedType('custom')
        setSelectedQuarter(undefined)
        setSelectedPreset('')
        dispatch(setCompDateRangeStartDateEndDate({ instance: instance, startDate: format(currentFinYear.startDate, isoFormat), endDate: format(currentFinYear.endDate, isoFormat) }))
        if (currentFinYear.finYearId === Utils.getRunningFinYear().finYearId) {
            setPresetRangeDisabled(false)
        } else {
            setPresetRangeDisabled(true)
        }
    }, [currentFinYear])

    return (<div className={clsx(className, "flex flex-col space-y-4")}>

        {/* Header */}
        <div className="flex space-x-4 items-center">
            <label className="text-lg font-semibold text-primary-500">{title || 'Select Date Range'}</label>
            <span className='text-black-600 mt-1 font-semibold'>
                {format(selectedDateRange?.startDate || currentFinYear.startDate, currentDateFormat)} - {format(selectedDateRange?.endDate || currentFinYear.endDate, currentDateFormat)}
            </span>
        </div>

        <div className='flex space-x-6'>
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
                <span className="font-medium">Custom Range</span>
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
                <span className="font-medium">Quarters</span>
            </label>

            {/* preset ranges */}
            <label className="flex items-center space-x-2 cursor-pointer disabled:bg-gray-400 disabled:cursor-auto">
                <input
                    disabled={presetRangeDisabled}
                    type="radio"
                    name="dateType"
                    value="preset"
                    checked={selectedType === "preset"}
                    onChange={() => handleTypeChange("preset")}
                    className="w-4 h-4 text-blue-600 cursor-pointer disabled:bg-gray-400 disabled:cursor-auto"
                />
                <span className="font-medium">Preset Ranges</span>
            </label>
        </div>

        {/* Custom date range */}
        {selectedType === "custom" && (
            <div className="flex gap-4 justify-start items-center">
                <div className="w-48">
                    <label className="block mb-2 text-sm font-medium">Start Date</label>
                    <input
                        type="date"
                        value={format(selectedDateRange?.startDate || currentFinYear.startDate, isoFormat)}
                        onChange={(e) => {
                            const date = e.target.value;
                            setSelectedPreset('')
                            setSelectedQuarter(undefined)
                            dispatch(setCompDateRangeStartDate({ instance: instance, startDate: date }))
                        }}
                        className="w-full px-3 py-2 border rounded-md text-sm cursor-pointer"
                    />
                </div>
                <div className="w-48">
                    <label className="block mb-2 text-sm font-medium">End Date</label>
                    <input
                        type="date"
                        value={format(selectedDateRange?.endDate || currentFinYear.endDate, isoFormat)}
                        min={format(selectedDateRange?.startDate || currentFinYear.startDate, isoFormat)}
                        onChange={(e) => {
                            const date = e.target.value;
                            setSelectedPreset('')
                            setSelectedQuarter(undefined)
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
            <div className="grid grid-cols-4 gap-4 mr-6">
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
            <div className="grid grid-cols-6 gap-4 mr-6">
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
                        <span className="font-medium">{label}</span>
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
        return ({ startDate: format(startDate, isoFormat), endDate: format(endDate, isoFormat) })
    }

    function getQuarterDates(quarter: Quarter) {
        const finYear: number = quarter === 'Q4' ? currentFinYear.finYearId + 1 : currentFinYear.finYearId
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
            startDate: format(new Date(finYear, startMonth, 1), isoFormat),
            endDate: format(new Date(finYear, endMonth + 1, 0), isoFormat)
        };
    }

    function handlePresetChange(value: string) {
        setSelectedPreset(value);
        const { startDate, endDate } = getPresetDateRange(value);
        dispatch(setCompDateRangeStartDateEndDate({ instance: instance, startDate: startDate, endDate: endDate }))
    }

    function handleResetToFiscalYear() {
        setSelectedQuarter(undefined)
        setSelectedPreset('')
        dispatch(setCompDateRangeStartDateEndDate({ instance: instance, startDate: format(currentFinYear.startDate, isoFormat), endDate: format(currentFinYear.endDate, isoFormat) }))
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
type CompDateRangeType = {
    className?: string
    instance: string
    title?: string
}