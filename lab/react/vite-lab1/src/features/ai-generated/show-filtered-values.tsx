import React, { useState } from "react";

interface FilterOptions {
  transactionType: "All" | "Contra" | "Journals" | "Payments" | "Receipts";
  dateType: "transactionDate" | "entryDate";
  startDate: string;
  endDate: string;
}

const CompactTransactionFilter: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    transactionType: "All",
    dateType: "transactionDate",
    startDate: "",
    endDate: "",
  });

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg shadow-md border border-gray-300 text-xs">
      {/* Transaction Type */}
      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
        <span className="text-gray-500">Transaction Type:</span>
        <span className="text-indigo-600 font-medium">{filters.transactionType}</span>
      </div>

      {/* Filter By */}
      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
        <span className="text-gray-500">Filter By:</span>
        <span className="text-indigo-600 font-medium">{filters.dateType.replace("Date", " Date")}</span>
      </div>

      {/* Start Date */}
      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
        <span className="text-gray-500">Start Date:</span>
        <span className="text-indigo-600 font-medium">{filters.startDate || "N/A"}</span>
      </div>

      {/* End Date */}
      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
        <span className="text-gray-500">End Date:</span>
        <span className="text-indigo-600 font-medium">{filters.endDate || "N/A"}</span>
      </div>
    </div>
  );
};

export default CompactTransactionFilter;
