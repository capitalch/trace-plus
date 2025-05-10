import { useDispatch, useSelector } from "react-redux";
import { DataInstancesMap } from "../../../../../../app/graphql/maps/data-instances-map";
import { CompSwitch } from "../../../../../../controls/redux-components/comp-switch";
import { StockSummaryReportFilterPanel } from "./stock-summary-report-filter-panel";
import { AppDispatchType, RootStateType } from "../../../../../../app/store/store";
import { toggleStockSummaryReportIsFilterPanelVisible } from "./stock-summary-report-slice";

export function StockSummaryReportFilterControl() {
const dispatch: AppDispatchType = useDispatch();
  const isFilterPanelVisible = useSelector(
    (state: RootStateType) => state.stockSummaryReport.isFilterPanelVisible
  );

  return (<div className="flex items-center gap-2" >
    <button
      type="button"
      onClick={handleOnClickFilter}
      className="bg-blue-500 text-white px-2 py-1 rounded-full font-medium text-sm hover:bg-blue-700"
    >
      Filter
    </button>
    <StockSummaryReportFilterPanel isVisible={isFilterPanelVisible} />
    <CompSwitch
      instance={DataInstancesMap.stockSummaryReport}
      className=""
      leftLabel="Curr branch"
      rightLabel="All branches"
      toToggleLeftLabel={true} />
  </div>)

  function handleOnClickFilter() {
    dispatch(toggleStockSummaryReportIsFilterPanelVisible());
  }
}