import { useSelector } from "react-redux";
import { RootStateType } from "../../../../../../app/store";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { format } from "date-fns";

export function SalesReportToolbarFilterDisplay() {
    const selectedFilters = useSelector(
        (state: RootStateType) => state.salesReport)
    const { currentDateFormat } = useUtilsInfo();
    const displayFilter = {
        age: selectedFilters.ageFilterOption.selectedAge,
        filterMode: selectedFilters.filterMode,
        category: selectedFilters.catFilterOption.selectedCategory,
        brand: selectedFilters.catFilterOption.selectedBrand,
        tag: selectedFilters.catFilterOption.selectedTag,
        productCode: selectedFilters.productCode,
        selectedDateRange: selectedFilters.dateRangeFilterOption.selectedDateRange,
        startDate: selectedFilters.dateRangeFilterOption.startDate,
        endDate: selectedFilters.dateRangeFilterOption.endDate
    }
    return (
        <div className="flex flex-wrap p-1 w-[200px] text-sm bg-amber-100 rounded-md gap-1 lg:w-[450px] md:w-[350px] sm:w-[200px] xl:w-[550px]">
            {getDisplayControl({ label: 'Date Range: ', value: displayFilter.selectedDateRange.label })}
            {getDisplayControl({ label: 'From Date: ', value: format(displayFilter.startDate, currentDateFormat) })}
            {getDisplayControl({ label: 'To Date: ', value: format(displayFilter.endDate, currentDateFormat) })}
            {displayFilter.age.value && getDisplayControl({ label: 'Age: ', value: displayFilter.age.label.slice(4) })}

            {(displayFilter.productCode) && getDisplayControl({ label: "Pr Code: ", value: displayFilter.productCode })}
            {(displayFilter.category.id) && getDisplayControl({ label: 'Category: ', value: displayFilter.category.catName })}
            {(displayFilter.brand.id) && getDisplayControl({ label: 'Brand: ', value: displayFilter.brand.brandName })}
            {(displayFilter.tag.id) && getDisplayControl({ label: 'Tag: ', value: displayFilter.tag.tagName })}
        </div>)

    function getDisplayControl(item: { label: string, value: string }) {
        return (
            <label className="px-1 font-medium text-gray-800 odd:bg-white even:bg-slate-100">
                {item.label}
                <span className="font-normal">{item.value}</span>
            </label>)
    }
}