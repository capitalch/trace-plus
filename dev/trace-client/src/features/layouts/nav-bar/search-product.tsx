import { IconSearch } from "../../../controls/icons/icon-search"
import { TooltipComponent } from "@syncfusion/ej2-react-popups"
import { Utils } from "../../../utils/utils"
import { SearchProductModal } from "./search-product-modal"

export function SearchProduct() {
    const handleSearch = () => {
        Utils.showHideModalDialogA({
            isOpen: true,
            title: "Search Product",
            element: <SearchProductModal />,
            size: "xlg"
        })
    }

    return (
        <TooltipComponent content="Search Product" position="BottomCenter">
            <button
                onClick={handleSearch}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 hover:scale-105"
                type="button"
            >
                <IconSearch className="w-5 h-5" />
            </button>
        </TooltipComponent>
    )
}