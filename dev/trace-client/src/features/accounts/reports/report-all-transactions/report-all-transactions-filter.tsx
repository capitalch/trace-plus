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
  ];  

  const quarters = [  
    { label: "Q1", startMonth: 0, endMonth: 2 },  
    { label: "Q2", startMonth: 3, endMonth: 5 },  
    { label: "Q3", startMonth: 6, endMonth: 8 },  
    { label: "Q4", startMonth: 9, endMonth: 11 },  
  ];  

  const transactionTypes = ["All", "Contra", "Journals", "Payments", "Receipts"];  

  const validateDates = (start: string, end: string) => {  
    if (new Date(start) > new Date(end)) {  
      setErrorMessage("End date must be greater than or equal to start date.");  
      return false;  
    }  
    setErrorMessage("");  
    return true;  
  };  

  const getDateRange = (days: number, label: string) => {  
    const today = new Date();  
    const startDate = new Date();  
    startDate.setDate(today.getDate() - days);  
    setFilterOptions((prev) => ({  
      ...prev,  
      startDate: startDate.toISOString().slice(0, 10),  
      endDate: today.toISOString().slice(0, 10),  
      selectedQuickDate: label,  
    }));  
  };  

  const getQuarterRange = (label: string, startMonth: number, endMonth: number) => {  
    const year = new Date().getFullYear();  
    const startDate = new Date(year, startMonth, 1);  
    const endDate = new Date(year, endMonth + 1, 0);  
    setFilterOptions((prev) => ({  
      ...prev,  
      startDate: startDate.toISOString().slice(0, 10),  
      endDate: endDate.toISOString().slice(0, 10),  
      selectedQuickDate: label,  
    }));  
  };  

  const handleStartDateChange = (date: string) => {  
    const newStartDate = date;  
    const currentEndDate = filterOptions.endDate;  

    setFilterOptions((prev) => ({  
      ...prev,  
      startDate: newStartDate,  
      selectedQuickDate: "",  
    }));  

    validateDates(newStartDate, currentEndDate);  
  };  

  const handleEndDateChange = (date: string) => {  
    const newEndDate = date;  
    const currentStartDate = filterOptions.startDate;  

    setFilterOptions((prev) => ({  
      ...prev,  
      endDate: newEndDate,  
      selectedQuickDate: "",  
    }));  

    validateDates(currentStartDate, newEndDate);  
  };  

  const setFiscalYearRange = () => {  
    const startDate = new Date(currentYear, 0, 1); // January 1st of current year  
    const endDate = new Date(currentYear, 11, 31); // December 31st of current year  
    setFilterOptions((prev) => ({  
      ...prev,  
      startDate: startDate.toISOString().slice(0, 10),  
      endDate: endDate.toISOString().slice(0, 10),  
      selectedQuickDate: "Fiscal Year",  
    }));  
  };  

  const formatDate = (dateString: string) => {  
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };  
    return new Date(dateString).toLocaleDateString(undefined, options);  
  };  

  return (  
    <div className="bg-gradient-to-r from-green-300 to-blue-400 p-4 rounded w-full max-w-3xl shadow-lg">  
      <div className="bg-white p-2 rounded-lg shadow-md">  
        <label className="block text-gray-700 font-medium text-sm">Transaction Type</label>  
        <div className="flex gap-2 mt-1">  
          {transactionTypes.map((type) => (  
            <label key={type} className="flex items-center gap-1 cursor-pointer">  
              <input  
                type="radio"  
                name="transactionType"  
                value={type}  
                checked={filterOptions.transactionType === type}  
                onChange={(e) =>  
                  setFilterOptions({ ...filterOptions, transactionType: e.target.value as FilterOptions["transactionType"] })  
                }  
                className="hidden"  
              />  
              <span  
                className={`px-2 py-1 rounded-md text-xs transition-colors duration-200 cursor-pointer   
                  ${filterOptions.transactionType === type ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}  
              >  
                {type}  
              </span>  
            </label>  
          ))}  
        </div>  
      </div>  

      <div className="bg-white p-2 rounded-lg shadow-md mt-4">  
        <label className="block text-gray-700 font-medium text-sm">Filter By</label>  
        <div className="flex gap-2 mt-1">  
          {["transactionDate", "entryDate"].map((type) => (  
            <label key={type} className="flex items-center gap-1 cursor-pointer">  
              <input  
                type="radio"  
                name="dateType"  
                value={type}  
                checked={filterOptions.dateType === type}  
                onChange={(e) =>  
                  setFilterOptions({ ...filterOptions, dateType: e.target.value as FilterOptions["dateType"] })  
                }  
                className="hidden"  
              />  
              <span  
                className={`px-2 py-1 rounded-md text-xs transition-colors duration-200 cursor-pointer   
                  ${filterOptions.dateType === type ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}  
              >  
                {type.replace("Date", " Date")}  
              </span>  
            </label>  
          ))}  
        </div>  

        <div className="bg-white p-2 rounded-lg shadow-md mt-2">  
          <label className="block text-gray-700 font-medium text-sm">Date Range</label>  
          <div className="flex mt-1 gap-1">  
            <input  
              type="date"  
              name="startDate"  
              value={filterOptions.startDate}  
              onChange={(e) => handleStartDateChange(e.target.value)}  
              className="flex-grow border border-blue-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300"  
              style={{ cursor: "pointer" }}  
            />  
            <input  
              type="date"  
              name="endDate"  
              value={filterOptions.endDate}  
              onChange={(e) => handleEndDateChange(e.target.value)}  
              className="flex-grow border border-blue-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300"  
              style={{ cursor: "pointer" }}  
            />  
          </div>  
          {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}  
        </div>  

        <div className="bg-white p-2 rounded-lg shadow-md mt-2">  
          <label className="block text-gray-700 font-medium text-sm">Quick Date Selection</label>  
          <div className="flex flex-wrap gap-1 mt-1">  
            {predefinedDateRanges.map((range) => (  
              <label key={range.label} className="flex items-center gap-1 cursor-pointer">  
                <input  
                  type="radio"  
                  name="quickDate"  
                  value={range.label}  
                  checked={filterOptions.selectedQuickDate === range.label}  
                  onChange={() => getDateRange(range.days, range.label)}  
                  className="hidden"  
                />  
                <span  
                  className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-colors duration-200   
                    ${filterOptions.selectedQuickDate === range.label ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}  
                >  
                  {range.label}  
                </span>  
              </label>  
            ))}  
            <button  
              onClick={setFiscalYearRange}  
              className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-colors duration-200   
                ${filterOptions.selectedQuickDate === "Fiscal Year" ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}  
            >  
              Fiscal Year  
            </button>  
          </div>  
        </div>  

        <div className="bg-white p-2 rounded-lg shadow-md mt-2">  
          <label className="block text-gray-700 font-medium text-sm">Quarters</label>  
          <div className="flex gap-1 mt-1">  
            {quarters.map((quarter) => (  
              <label key={quarter.label} className="flex items-center gap-1 cursor-pointer">  
                <input  
                  type="radio"  
                  name="quarter"  
                  value={quarter.label}  
                  checked={filterOptions.selectedQuickDate === quarter.label}  
                  onChange={() => getQuarterRange(quarter.label, quarter.startMonth, quarter.endMonth)}  
                  className="hidden"  
                />  
                <span  
                  className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-colors duration-200   
                    ${filterOptions.selectedQuickDate === quarter.label ? "bg-indigo-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}  
                >  
                  {quarter.label}  
                </span>  
              </label>  
            ))}  
          </div>  
        </div>  
      </div>  

      <div className="bg-white p-2 rounded-lg shadow-md mt-4">  
        <span className="text-gray-700 font-medium">Selected Filter:</span>  
        <div className="mt-1 text-gray-600 text-sm">  
          <strong>Transaction Type:</strong> {filterOptions.transactionType}  
          <br />  
          <strong>Date Type:</strong> {filterOptions.dateType.replace(/([A-Z])/g, " ")}  
          <br />  
          <strong>Date Range:</strong> {formatDate(filterOptions.startDate)} to {formatDate(filterOptions.endDate)}  
          <br />  
          <strong>Quick Selection:</strong> {filterOptions.selectedQuickDate || "None"}  
        </div>  
      </div>  
    </div>  
  );  
};  

export default ReportAllTransactionsFilter;