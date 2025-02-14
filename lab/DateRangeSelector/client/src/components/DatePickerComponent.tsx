
import { useState } from "react";
import { format } from "date-fns";

type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
type DateRangeType = "preset" | "quarter" | "custom";

interface DatePickerComponentProps {
  onDateChange?: (start: Date, end: Date) => void;
}

export default function DatePickerComponent({ onDateChange }: DatePickerComponentProps) {
  const defaultStartDate = new Date();
  const defaultEndDate = new Date();
  
  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(defaultEndDate);
  const [selectedType, setSelectedType] = useState<DateRangeType>("custom");
  const [selectedPreset, setSelectedPreset] = useState("thisMonth");
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>("Q1");

  const handleTypeChange = (value: DateRangeType) => {
    setSelectedType(value);
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    const { start, end } = getPresetDateRange(value);
    setStartDate(start);
    setEndDate(end);
    onDateChange?.(start, end);
  };

  const handleQuarterChange = (value: Quarter) => {
    setSelectedQuarter(value);
    const { start, end } = getQuarterDates(value);
    setStartDate(start);
    setEndDate(end);
    onDateChange?.(start, end);
  };

  const getPresetDateRange = (preset: string) => {
    const today = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (preset) {
      case "last3Months":
        start.setMonth(today.getMonth() - 3);
        return { start, end: today };
      case "thisMonth":
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        return { start, end };
      case "lastMonth":
        start.setMonth(start.getMonth() - 1, 1);
        end.setMonth(end.getMonth(), 0);
        return { start, end };
      default:
        return { start: today, end: today };
    }
  };

  const getQuarterDates = (quarter: Quarter) => {
    const currentYear = new Date().getFullYear();
    const quarterMap = {
      Q1: { startMonth: 0, endMonth: 2 },
      Q2: { startMonth: 3, endMonth: 5 },
      Q3: { startMonth: 6, endMonth: 8 },
      Q4: { startMonth: 9, endMonth: 11 }
    };

    const { startMonth, endMonth } = quarterMap[quarter];
    return {
      start: new Date(currentYear, startMonth, 1),
      end: new Date(currentYear, endMonth + 1, 0)
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateType"
            value="custom"
            checked={selectedType === "custom"}
            onChange={() => handleTypeChange("custom")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium">Custom Range</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateType"
            value="quarter"
            checked={selectedType === "quarter"}
            onChange={() => handleTypeChange("quarter")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium">Quarters</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="dateType"
            value="preset"
            checked={selectedType === "preset"}
            onChange={() => handleTypeChange("preset")}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium">Preset Ranges</span>
        </label>
      </div>

      {selectedType === "custom" && (
        <div className="flex gap-4 justify-start">
          <div className="w-48">
            <label className="block mb-2 text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setStartDate(date);
                onDateChange?.(date, endDate);
              }}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="w-48">
            <label className="block mb-2 text-sm font-medium">End Date</label>
            <input
              type="date"
              value={format(endDate, "yyyy-MM-dd")}
              min={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setEndDate(date);
                onDateChange?.(startDate, date);
              }}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>
      )}

      {selectedType === "quarter" && (
        <div className="grid grid-cols-2 gap-4">
          {(["Q1", "Q2", "Q3", "Q4"] as Quarter[]).map((quarter) => (
            <label key={quarter} className="flex items-center space-x-2 p-4 border rounded-md hover:bg-gray-50">
              <input
                type="radio"
                name="quarter"
                value={quarter}
                checked={selectedQuarter === quarter}
                onChange={() => handleQuarterChange(quarter)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">{quarter}</span>
            </label>
          ))}
        </div>
      )}

      {selectedType === "preset" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "last3Months", label: "Last 3 Months" },
            { value: "thisMonth", label: "This Month" },
            { value: "lastMonth", label: "Last Month" }
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center space-x-2 p-4 border rounded-md hover:bg-gray-50">
              <input
                type="radio"
                name="preset"
                value={value}
                checked={selectedPreset === value}
                onChange={() => handlePresetChange(value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
