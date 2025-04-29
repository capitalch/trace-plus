import { useSelector } from "react-redux";
import Select from "react-select";
import { RootStateType } from "../../../../../../app/store/store";
import { setSalesReportFilterMode } from "./sales-report-slice";
export function SalesReportFilterControl() {
    const selectedFilterMode = useSelector((state: RootStateType) => state.salesReport.filterMode);
    return (
        <div className="max-w-md mx-auto space-y-4">

            {/* Radio Group for Filter Type */}
            <div className="space-y-2">
                <label className="text-lg font-semibold">Filter Mode</label>
                <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="filterMode"
                            value="category"
                            checked={selectedFilterMode === "category"}
                            onChange={() => setSalesReportFilterMode("category")}
                        />
                        <span>By Category</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="filterMode"
                            value="productCode"
                            checked={selectedFilterMode === "productCode"}
                            onChange={() => setSalesReportFilterMode("productCode")}
                        />
                        <span>By Product Code</span>
                    </label>
                </div>
            </div>

            {/* Group 1: Category Filters */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold">Group 1: Category Filters</label>
                    <div className="flex justify-end px-2">
                        <button
                            onClick={handleApplyFilter}
                            disabled={isApplyFilterButtonDisabled()}
                            className="px-5 py-2 rounded-md text-white text-sm font-medium transition bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>

                <Select
                    options={categoryOptions}
                    placeholder="Select Category"
                // isDisabled={filterMode !== "category"}
                />
                <Select
                    options={brandOptions}
                    placeholder="Select Brand"
                // isDisabled={filterMode !== "category"}
                />
                <Select
                    options={tagOptions}
                    placeholder="Select Tag"
                // isDisabled={filterMode !== "category"}
                />
            </div>

            {/* Group 2: Product Code */}
            <div className="space-y-2">
                <label className="text-lg font-semibold">Group 2: Product Code</label>
                <input
                    type="number"
                    placeholder="Enter Product Code"
                    className="w-full border rounded p-2"
                // disabled={filterMode !== "productCode"}
                // value={productCode}
                // onChange={(e) => setProductCode(e.target.value)}
                />
            </div>

            {/* Group 3: Age */}
            <div className="space-y-2">
                <label className="text-lg font-semibold">Group 3: Age Filter</label>
                <Select
                    options={ageOptions}
                    placeholder="Select Age Range"
                />
            </div>

            {/* Group 4: Date Range */}
            <div className="space-y-2">
                <label className="text-lg font-semibold">Group 4: Date Range</label>
                <Select
                    options={dateRangeOptions}
                    menuPlacement="top"
                    placeholder="Select Date Range"
                />
                <div className="flex space-x-2">
                    <input type="date" className="flex-1 border rounded p-2" />
                    <input type="date" className="flex-1 border rounded p-2" />
                </div>
            </div>
        </div>
    );
    // <div className="max-w-md mx-auto space-y-4">

    //     {/* Category Filters */}
    //     <div className="space-y-4">
    //         <div className="flex items-center justify-between">
    //             <h2 className="text-lg font-semibold">Group 1: Category Filters</h2>
    //             {/* Filter Button */}
    //             <div className="flex justify-end px-2">
    //                 <button
    //                     onClick={handleApplyFilter}
    //                     disabled={isApplyFilterButtonDisabled()}
    //                     className="px-5 py-2 rounded-md text-white text-sm font-medium transition bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
    //                 >
    //                     Apply Filter
    //                 </button>
    //             </div>
    //         </div>

    //         <Select
    //             options={categoryOptions}
    //             placeholder="Select Category"
    //         //   value={selectedCategory}
    //         //   onChange={setSelectedCategory}
    //         />
    //         <Select
    //             options={brandOptions}
    //             placeholder="Select Brand"
    //         //   value={selectedBrand}
    //         //   onChange={setSelectedBrand}
    //         />
    //         <Select
    //             options={tagOptions}
    //             placeholder="Select Tag"
    //         //   value={selectedTag}
    //         //   onChange={setSelectedTag}
    //         />
    //     </div>

    //     {/* Product code */}
    //     <div className="space-y-2">
    //         <h2 className="text-lg font-semibold">Group 2: Product Code</h2>
    //         <input
    //             type="number"
    //             placeholder="Enter Product Code"
    //             className="w-full border rounded p-2"
    //         //   value={productCode}
    //         //   onChange={(e) => setProductCode(e.target.value)}
    //         />
    //     </div>

    //     {/* Group 3 */}
    //     <div className="space-y-2">
    //         <h2 className="text-lg font-semibold">Group 3: Age Filter</h2>
    //         <Select
    //             options={ageOptions}
    //             placeholder="Select Age Range"
    //         //   value={selectedAge}
    //         //   onChange={setSelectedAge}
    //         />
    //     </div>

    //     {/* Group 4 */}
    //     <div className="space-y-2">
    //         <h2 className="text-lg font-semibold">Group 4: Date Range</h2>
    //         <Select
    //             options={dateRangeOptions}
    //             menuPlacement="top"
    //             placeholder="Select Date Range"
    //         //   value={selectedDateRange}
    //         //   onChange={handleDateRangeChange}
    //         />
    //         <div className="flex space-x-2">
    //             <input
    //                 type="date"
    //                 className="flex-1 border rounded p-2"
    //             // value={startDate}
    //             // onChange={(e) => setStartDate(e.target.value)}
    //             />
    //             <input
    //                 type="date"
    //                 className="flex-1 border rounded p-2"
    //             // value={endDate}
    //             // onChange={(e) => setEndDate(e.target.value)}
    //             />
    //         </div>
    //     </div>
    // </div>

    function handleApplyFilter() {

    }

    function isApplyFilterButtonDisabled() {
        return false;
    }
}

const categoryOptions = [
    { label: "Category A", value: "A" },
    { label: "Category B", value: "B" },
];
const brandOptions = [
    { label: "Brand X", value: "X" },
    { label: "Brand Y", value: "Y" },
];
const tagOptions = [
    { label: "Tag 1", value: "1" },
    { label: "Tag 2", value: "2" },
];

const ageOptions = [
    { label: "All", value: "all" },
    { label: "0-30 Days", value: "0-30" },
    { label: "31-60 Days", value: "31-60" },
    { label: "61-90 Days", value: "61-90" },
];

const dateRangeOptions = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "last7" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Custom", value: "custom" },
];
