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
        <div className="flex flex-wrap bg-amber-100 p-1 text-sm rounded-md gap-1 xl:w-[450px] lg:w-[350px] md:w-[250px] sm:w-[200px] w-[200px]">
            {<label className="font-medium bg-slate-100 px-2 text-gray-800">{dispAllItems}</label>}
            {(displayFilter.productCode) && getDisplayControl({ label: "Pr Code: ", value: displayFilter.productCode })}
            {(displayFilter.category.id) && getDisplayControl({ label: 'Category: ', value: displayFilter.category.catName })}
            {(displayFilter.brand.id) && getDisplayControl({ label: 'Brand: ', value: displayFilter.brand.brandName })}
            {(displayFilter.tag.id) && getDisplayControl({ label: 'Tag: ', value: displayFilter.tag.tagName })}
        </div>)

    function getDisplayControl(item: { label: string, value: string }) {
        return (
            <label className="font-medium px-1 text-gray-800  even:bg-slate-100 odd:bg-white">
                {item.label}
                <span className="font-normal">{item.value}</span>
            </label>)
    }
}