import React, { useState } from "react";

interface FilterOptions {
  dateType: "transactionDate" | "entryDate";
  startDate: string;
  endDate: string;
  transactionType: "All" | "Contra" | "Journals" | "Payments" | "Receipts";
  selectedQuickDate: string;
}

const ReportAllTransactionsFilter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateType: "transactionDate",
    startDate: "",
    endDate: "",
    transactionType: "All",
    selectedQuickDate: "",
  });

  const [errorMessage, setErrorMessage] = useState<string>("");

  const predefinedDateRanges = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "Last 3 Days", days: 3 },
    { label: "Last 7 Days", days: 7 },
    { label: "Last 30 Days", days: 30 },
    { label: "Last Month", months: 1 },
    { label: "Last 2 Months", months: 2 },
    { label: "Last 3 Months", months: 3 },
  ];

  const transactionTypes = ["All", "Contra", "Journals", "Payments", "Receipts"];

  const getDateRange = (days?: number, months?: number, label?: string) => {
    const today = new Date();
    let startDate = new Date();

    if (days) {
      startDate.setDate(today.getDate() - days);
    } else if (months) {
      startDate = new Date(today.getFullYear(), today.getMonth() - months, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      setFilterOptions((prev) => ({
        ...prev,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
        selectedQuickDate: label || "",
      }));
      return;
    }

    setFilterOptions((prev) => ({
      ...prev,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: today.toISOString().slice(0, 10),
      selectedQuickDate: label || "",
    }));
  };

  return (
    <div className="bg-violet-400 p-4 rounded w-full max-w-3xl shadow-lg">
      {/* Quick Date Selection */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <label className="block text-gray-700 font-medium text-sm">Quick Date Selection</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {predefinedDateRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => getDateRange(range.days, range.months, range.label)}
              className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                filterOptions.selectedQuickDate === range.label
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Type Selection */}
      <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <label className="block text-gray-700 font-medium text-sm">Date Type</label>
        <select
          value={filterOptions.dateType}
          onChange={(e) => setFilterOptions({ ...filterOptions, dateType: e.target.value as FilterOptions["dateType"] })}
          className="mt-2 p-2 border rounded w-full"
        >
          <option value="transactionDate">Transaction Date</option>
          <option value="entryDate">Entry Date</option>
        </select>
      </div>

      {/* Transaction Type Selection */}
      <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <label className="block text-gray-700 font-medium text-sm">Transaction Type</label>
        <select
          value={filterOptions.transactionType}
          onChange={(e) => setFilterOptions({ ...filterOptions, transactionType: e.target.value as FilterOptions["transactionType"] })}
          className="mt-2 p-2 border rounded w-full"
        >
          {transactionTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Selected Filter Details */}
      <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <span className="text-gray-700 font-medium">Selected Filter:</span>
        <div className="mt-1 text-gray-600 text-sm">
          <strong>Transaction Type:</strong> {filterOptions.transactionType}
          <br />
          <strong>Date Type:</strong> {filterOptions.dateType.replace(/([A-Z])/g, " ")}
          <br />
          <strong>Date Range:</strong> {filterOptions.startDate} to {filterOptions.endDate}
          <br />
          <strong>Quick Selection:</strong> {filterOptions.selectedQuickDate || "None"}
        </div>
      </div>
    </div>
  );
};

export default ReportAllTransactionsFilter;
