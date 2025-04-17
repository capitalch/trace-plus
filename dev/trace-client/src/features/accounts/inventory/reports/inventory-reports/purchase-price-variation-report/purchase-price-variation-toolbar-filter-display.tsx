export function PurchasePriceVariationToolbarFilterDisplay() {
    return (
        <div className="flex items-center gap-6 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-700">
            <div>
                <span className="font-semibold text-primary-600">Category:</span>{" "}
                {/* {selectedCatOption?.catName || "None"} */}
            </div>
            <div>
                <span className="font-semibold text-primary-600">Brand:</span>{" "}
                {/* {selectedBrandOption?.brandName || "None"} */}
            </div>
            <div>
                <span className="font-semibold text-primary-600">Tag:</span>{" "}
                {/* {selectedTagOption?.tagName || "None"} */}
            </div>
        </div>)
}