import clsx from "clsx";
import { AppDispatchType } from "../../../../../../app/store/store";
import { useDispatch } from "react-redux";
import { setStockSummaryReportIsFilterPanelVisible } from "./stock-summary-report-slice";

export function StockSummaryReportFilterPanel({
  className,
  isVisible = true
}: StockSummaryReportFilterPanel) {
  const dispatch: AppDispatchType = useDispatch();
  return (
    <div
      className={clsx(
        "bg-yellow-100 w-3xl h-16 z-10 absolute left-0 top-0",
        isVisible ? "" : "hidden",
        className
      )}
    >
      {/* Close (X) button */}
      <button type="button"
        onClick={() => dispatch(setStockSummaryReportIsFilterPanelVisible(false))}
        aria-label="Close filter panel"
        className="absolute -top-1.5 right-0.5 text-black text-2xl font-bold hover:text-red-600"
      >
        ×
      </button>
    </div>
  );
}

type StockSummaryReportFilterPanel = {
  className?: string;
  isVisible?: boolean;
};
