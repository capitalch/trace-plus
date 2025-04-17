import SlidingPane from "react-sliding-pane";
import { PurchasePriceVariationFilterControl } from "./purchase-price-variation-filter-control";
import { useState } from "react";
export function PurchasePriceVariationToolbarButton({
  className
}: {
  className?: string;
}) {
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  return (
    <div className={className}>
      <button
        className="h-8 py-1 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        onClick={() => {
          setIsPaneOpen(true);
        }}
        type="button"
      >
        Open Filters
      </button>
      <SlidingPane
        isOpen={isPaneOpen}
        title="Filter Options"
        onRequestClose={() => setIsPaneOpen(false)}
        width="500px"
      >
        <PurchasePriceVariationFilterControl />
      </SlidingPane>
    </div>
  );
}
