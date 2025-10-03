import { useSelector } from "react-redux";
import { RootStateType } from "../../../../../../app/store";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { format } from "date-fns";

export function StockSummaryReportToolbarFilterDisplay() {
    const selectedFilters = useSelector(
        (state: RootStateType) => state.stockSummaryReport)
    const { currentDateFormat } = useUtilsInfo();

    const displayFilter = {
        onDate: selectedFilters.onDate,
        age: selectedFilters.ageFilterOption.selectedAge,
        grossProfitStatus: selectedFilters.selectedGrossProfitStatus,
        category: selectedFilters.catFilterOption.selectedCategory,
        brand: selectedFilters.catFilterOption.selectedBrand,
        tag: selectedFilters.catFilterOption.selectedTag
    }
    return (
        <div className="flex flex-wrap p-1 text-sm bg-amber-100 rounded-md gap-1">
            {getDisplayControl({ label: 'Stock On Date: ', value: format(displayFilter.onDate, currentDateFormat) })}
            {displayFilter.age.value && getDisplayControl({ label: 'Age: ', value: displayFilter.age.label.slice(4) })}
            {(displayFilter.grossProfitStatus.value !== 0) && getDisplayControl({ label: 'Gross Profit:', value: displayFilter.grossProfitStatus.label.slice(12) })}
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