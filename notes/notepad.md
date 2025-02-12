## Replit datepicker control

# DateSelector.tsx - Main component for date range selection:
import { useState } from "react";
import { format } from "date-fns";
import DatePickerComponent from "./DatePickerComponent";
import { Card, CardContent } from "@/components/ui/card";
import { ExportButton } from "./ExportButton";

export default function DateSelector() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">Date Range Selection</h2>
              <div className="px-3 py-1 bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">
                  {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
                </span>
              </div>
            </div>
            <ExportButton startDate={startDate} endDate={endDate} />
          </div>
          <DatePickerComponent onDateChange={handleDateChange} />
        </div>
      </CardContent>
    </Card>
  );
}

# DatePickerComponent.tsx - Component handling date selection:
import { useState } from "react";
import { DatePickerComponent as SyncDatePicker } from "@syncfusion/ej2-react-calendars";
import { addMonths, format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getPresetDateRange, getQuarterDates } from "@/lib/date-utils";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-calendars/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-react-calendars/styles/material.css";

type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

interface DatePickerComponentProps {
  onDateChange?: (start: Date, end: Date) => void;
}

export default function DatePickerComponent({ onDateChange }: DatePickerComponentProps) {
  const defaultStartDate = new Date();
  const defaultEndDate = addMonths(new Date(), 1);

  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(defaultEndDate);

  const handlePresetClick = (preset: string) => {
    const { start, end } = getPresetDateRange(preset);
    setStartDate(start);
    setEndDate(end);
    onDateChange?.(start, end);
  };

  const handleQuarterClick = (quarter: Quarter) => {
    const { start, end } = getQuarterDates(quarter);
    setStartDate(start);
    setEndDate(end);
    onDateChange?.(start, end);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label className="block mb-2">Preset Ranges</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick("last3Months")}
            >
              Last 3 Months
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick("thisMonth")}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick("lastMonth")}
            >
              Last Month
            </Button>
          </div>
        </div>

        <div>
          <Label className="block mb-2">Quarters</Label>
          <div className="flex flex-wrap gap-2">
            {(["Q1", "Q2", "Q3", "Q4"] as Quarter[]).map((quarter) => (
              <Button
                key={quarter}
                variant="outline"
                size="sm"
                onClick={() => handleQuarterClick(quarter)}
              >
                {quarter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-start">
        <div className="w-48">
          <Label className="block mb-2">Start Date</Label>
          <SyncDatePicker
            value={startDate}
            onChange={(args: any) => {
              if (args.value) {
                setStartDate(args.value);
              }
            }}
            format="dd/MM/yyyy"
            placeholder="Select start date"
            showClearButton={false}
            cssClass="w-full e-input-compact e-control-wrapper"
            enablePersistence={true}
          />
        </div>

        <div className="w-48">
          <Label className="block mb-2">End Date</Label>
          <SyncDatePicker
            value={endDate}
            min={startDate}
            onChange={(args: any) => {
              if (args.value) {
                setEndDate(args.value);
              }
            }}
            format="dd/MM/yyyy"
            placeholder="Select end date"
            showClearButton={false}
            cssClass="w-full e-input-compact e-control-wrapper"
            enablePersistence={true}
          />
        </div>
      </div>
    </div>
  );
}

# ExportButton
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

interface ExportButtonProps {
  startDate: Date;
  endDate: Date;
}

export function ExportButton({ startDate, endDate }: ExportButtonProps) {
  const handleExport = (format: string) => {
    const dateRange = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    // TODO: Implement export logic for each format
    console.log(`Exporting as ${format}`, dateRange);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[150px]">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')}>
          Export as XLSX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}