
import { useState } from "react";
import { format } from "date-fns";
import DatePickerComponent from "./DatePickerComponent";

export default function DateSelector() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Date Range Selection</h2>
            <div className="px-3 py-1 bg-gray-100 rounded-md">
              <span className="text-sm text-gray-600">
                {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                {["PDF", "CSV", "JSON", "XLSX"].map((format) => (
                  <button
                    key={format}
                    onClick={() => handleExport(format.toLowerCase())}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as {format}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <DatePickerComponent onDateChange={handleDateChange} />
      </div>
    </div>
  );
}
