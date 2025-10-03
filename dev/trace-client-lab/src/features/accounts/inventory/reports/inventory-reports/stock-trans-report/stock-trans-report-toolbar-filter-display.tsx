import { useSelector } from "react-redux";
import { RootStateType } from "../../../../../../app/store";

export function StockTransReportToolbarFilterDisplay() {
    const selectedFilters = useSelector(
        (state: RootStateType) => state.stockTransReport)

    const displayFilter = {
        filterMode: selectedFilters.filterMode,
        category: selectedFilters.catFilterOption.selectedCategory,
        brand: selectedFilters.catFilterOption.selectedBrand,
        tag: selectedFilters.catFilterOption.selectedTag,
        productCode: selectedFilters.productCode,
    }

    const dispAllItems = (displayFilter.productCode || displayFilter.category.id || displayFilter.brand.id || displayFilter.tag.id) ? '' : 'All items'

    return (
        <div className="flex flex-wrap p-1 w-[200px] text-sm bg-amber-100 rounded-md gap-1 lg:w-[350px] md:w-[250px] sm:w-[200px] xl:w-[450px]">
            {<label className="px-2 font-medium text-gray-800 bg-slate-100">{dispAllItems}</label>}
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