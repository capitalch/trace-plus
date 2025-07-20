import { useDispatch, useSelector } from "react-redux";
import {
  AppDispatchType,
  RootStateType
} from "../../../../../../app/store";
import SlidingPane from "react-sliding-pane";
import clsx from "clsx";
import { setPurchasePriceVariationIsPaneOpen } from "../../../../accounts-slice";
import { PurchasePriceVariationFilterControl } from "./purchase-price-variation-filter-control";
import { DataInstancesMap } from "../../../../../../app/graphql/maps/data-instances-map";

export function PurchasePriceVariationToolbarFilterDisplay() {
  const dispatch: AppDispatchType = useDispatch();
  const selectedIsPaneOpen = useSelector(
    (state: RootStateType) =>
      state.accounts.purchasePriceVariationFilterState.isPaneOpen
  );
  const selectedBrandOption = useSelector(
    (state: RootStateType) =>
      state.accounts.purchasePriceVariationFilterState.selectedBrand
  );
  const selectedTagOption = useSelector(
    (state: RootStateType) =>
      state.accounts.purchasePriceVariationFilterState.selectedTag
  );
  const selectedCatOption = useSelector(
    (state: RootStateType) =>
      state.accounts.purchasePriceVariationFilterState.selectedCategory
  );

  return (
    <div className="flex items-center gap-6 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-700">
      <div className={clsx(selectedCatOption?.id && "text-blue-500 font-bold")}>
        <span className="font-semibold text-primary-600">Category:</span>{" "}
        {selectedCatOption?.catName || "All categories"}
      </div>
      <div
        className={clsx(selectedBrandOption?.id && "text-blue-500 font-bold")}
      >
        <span className="font-semibold text-primary-600">Brand:</span>{" "}
        {selectedBrandOption?.brandName || "All brands"}
      </div>
      <div className={clsx(selectedTagOption?.id && "text-blue-500 font-bold")}>
        <span className="font-semibold text-primary-600">Tag:</span>{" "}
        {selectedTagOption?.tagName || "All tags"}
      </div>
      <button
        className="h-8 py-1 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        onClick={() => {
          dispatch(setPurchasePriceVariationIsPaneOpen(true));
        }}
        type="button"
      >
        Open Filters
      </button>
      <SlidingPane
        isOpen={selectedIsPaneOpen}
        title="Filter Options"
        onRequestClose={() =>
          dispatch(setPurchasePriceVariationIsPaneOpen(false))
        }
        width="500px"
      >
        <PurchasePriceVariationFilterControl instance={DataInstancesMap.purchasePriceVariationReport} />
      </SlidingPane>
    </div>
  );
}
