import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  AppDispatchType,
  RootStateType
} from "../../../../../../app/store/store";
import { DataInstancesMap } from "../../../../../../app/graphql/maps/data-instances-map";
import { selectCompSwitchStateFn } from "../../../../../../controls/redux-components/comp-slice";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { useEffect, useState } from "react";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionGridToolbar } from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSwitch } from "../../../../../../controls/redux-components/comp-switch";
import { BackToDashboardLink } from "../../back-to-dashboard-link";
import {
  CompSyncFusionGrid,
  SyncFusionGridAggregateType,
  SyncFusionGridColumnType
} from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import clsx from "clsx";
import {
  QueryCellInfoEventArgs,
  RowDataBoundEventArgs
} from "@syncfusion/ej2-react-grids";
import { StockSummaryReportFilterPanel } from "./stock-summary-report-filter-panel";
import { toggleStockSummaryReportIsFilterPanelVisible } from "./stock-summary-report-slice";
import { format } from "date-fns";

export function StockSummaryReport({ title }: { title?: string }) {
  const dispatch: AppDispatchType = useDispatch();
  const instance = DataInstancesMap.stockSummaryReport;
  const isAllBranches: boolean =
    useSelector(
      (state: RootStateType) => selectCompSwitchStateFn(state, instance),
      shallowEqual
    ) || false;
  const selectedFilters = useSelector(
    (state: RootStateType) => state.stockSummaryReport
  );
  const isFilterPanelVisible = useSelector(
    (state: RootStateType) => state.stockSummaryReport.isFilterPanelVisible
  );

  const [rowsData, setRowsData] = useState<RowDataType[]>([]);
  const {
    branchId,
    buCode,
    currentDateFormat,
    dbName,
    decodedDbParamsObject,
    finYearId
    // currentFinYear
  } = useUtilsInfo();

  useEffect(() => {
    {
      loadData();
    }
  }, [
    isAllBranches,
    branchId,
    buCode,
    finYearId,
    selectedFilters.catFilterOption.selectedBrand.id,
    selectedFilters.catFilterOption.selectedCategory.id,
    selectedFilters.catFilterOption.selectedTag.id,
    selectedFilters.ageFilterOption.selectedAge.value,
    selectedFilters.productCode
  ]);

  return (
    <div className="flex flex-col relative">
      <CompSyncFusionGridToolbar
        CustomControl={() => (
          <div className="flex items-center gap-2">
            {/* <SalesReportToolbarFilterDisplay /> */}
            <button
              type="button"
              onClick={handleOnClickFilter}
              className="bg-blue-500 text-white px-2 py-1 rounded-full font-medium text-sm hover:bg-blue-700"
            >
              Filter
            </button>
            <StockSummaryReportFilterPanel isVisible={isFilterPanelVisible} />
            <CompSwitch
              instance={instance}
              className=""
              leftLabel="Curr branch"
              rightLabel="All branches"
              toToggleLeftLabel={true}
            />
          </div>
        )}
        className="mr-4"
        minWidth="600px"
        title={title || ""}
        isPdfExportAsLandscape={true}
        isPdfExport={true}
        isExcelExport={true}
        isCsvExport={true}
        instance={instance}
        subTitleControl={<BackToDashboardLink />}
      />

      <CompSyncFusionGrid
        aggregates={getAggregates()}
        allowPaging={true}
        allowTextWrap={false}
        pageSettings={{ pageSize: 500, pageSizes: [500, 1000, 2000] }}
        buCode={buCode}
        className="mt-4"
        columns={getColumns()}
        dataSource={rowsData}
        hasCheckBoxSelection={true}
        hasIndexColumn={true}
        height="calc(100vh - 300px)"
        indexColumnWidth={60}
        instance={instance}
        isLoadOnInit={false}
        isSmallerFont={true}
        loadData={loadData}
        minWidth="800px"
        rowHeight={30}
        queryCellInfo={handleQueryCellInfo} // Text color works with queryCellInfo
        onRowDataBound={handleOnRowDataBound} // Background color works with onRowDataBound
      />
    </div>
  );

  function getAggregates(): SyncFusionGridAggregateType[] {
    return [
      {
        columnName: "catName",
        type: "Count",
        field: "catName",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">Count: {props.Count}</span>
        )
      },
      {
        columnName: "op",
        type: "Sum",
        field: "op",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "dr",
        type: "Sum",
        field: "dr",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "cr",
        type: "Sum",
        field: "cr",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "clos",
        type: "Sum",
        field: "clos",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "grossProfit",
        type: "Sum",
        field: "grossProfit",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "opValue",
        type: "Sum",
        field: "opValue",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "closValue",
        type: "Sum",
        field: "closValue",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "purchase",
        type: "Sum",
        field: "purchase",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "sale",
        type: "Sum",
        field: "sale",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "purchaseRet",
        type: "Sum",
        field: "purchaseRet",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "saleRet",
        type: "Sum",
        field: "saleRet",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "stockJournalDebits",
        type: "Sum",
        field: "stockJournalDebits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "stockJournalCredits",
        type: "Sum",
        field: "stockJournalCredits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "branchTransferDebits",
        type: "Sum",
        field: "branchTransferDebits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "branchTransferCredits",
        type: "Sum",
        field: "branchTransferCredits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      }
    ];
  }

  function getColumns(): SyncFusionGridColumnType[] {
    return [
      {
        field: "productCode",
        headerText: "Pr code",
        width: 90,
        type: "string"
      },
      {
        field: "catName",
        headerText: "Product",
        width: 300,
        type: "string",
        clipMode: "EllipsisWithTooltip",
        template: (props: any) => (
          <div
            className={clsx(
              "flex flex-col",
              props.grossProfit < 0 ? "text-red-500" : ""
            )}
          >
            {"".concat(props.catName, " ", props.brandName, " ", props.label)}
          </div>
        )
      },
      {
        field: "info",
        clipMode: "EllipsisWithTooltip",
        headerText: "Details",
        width: 250,
        type: "string"
      },
      {
        field: "op",
        headerText: "Op",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "dr",
        headerText: "Dr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "cr",
        headerText: "Cr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "clos",
        headerText: "Clos",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "grossProfit",
        headerText: "Profit(GP)",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 120
      },
      {
        field: "age",
        headerText: "Age",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "openingPrice",
        headerText: "Op price",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 120
      },
      {
        field: "opValue",
        headerText: "Op value",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 150
      },
      {
        field: "lastPurchasePrice",
        headerText: "Clos price",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100
      },
      {
        field: "closValue",
        headerText: "Clos value",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 150
      },
      {
        field: "lastPurchaseDate",
        headerText: "Lst pur dt",
        type: "string",
        width: 90,
        valueAccessor: (field: string, data: any) =>
          format(data?.[field], currentDateFormat)
      },
      {
        field: "lastSaleDate",
        headerText: "Lst sal dt",
        type: "string",
        width: 90,
        valueAccessor: (field: string, data: any) =>
          format(data?.[field], currentDateFormat)
      },
      {
        field: "purchase",
        headerText: "Pur",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "sale",
        headerText: "Sal",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "purchaseRet",
        headerText: "Pur ret",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "saleRet",
        headerText: "Sal ret",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "stockJournalDebits",
        headerText: "Stk Jr Dr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 80
      },
      {
        field: "stockJournalCredits",
        headerText: "Stk Jr Cr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 80
      },
      {
        field: "branchTransferDebits",
        headerText: "Br Trf Dr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 80
      },
      {
        field: "branchTransferCredits",
        headerText: "Br Trf Cr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 80
      },
      {
        field: "productId",
        headerText: "Pr id",
        width: 60,
        type: "number",
        textAlign: "Right"
      },
      { field: "brandName", visible: false, width: 0 },
      { field: "label", visible: false, width: 0 }
    ];
  }

  function handleOnClickFilter() {
    dispatch(toggleStockSummaryReportIsFilterPanelVisible());
  }

  function handleOnRowDataBound(args: RowDataBoundEventArgs) {
    const rowData = args.data as RowDataType;

    if (args.row) {
      if (rowData.age > 360) {
        args.row.classList.add("bg-blue-100");
      }
    }
  }

  function handleQueryCellInfo(args: QueryCellInfoEventArgs) {
    const rowData = args.data as RowDataType;
    if (rowData.grossProfit < 0) {
      (args.cell as any).style.color = "red";
    }
  }

  async function loadData() {
    try {
      const state: RootStateType = Utils.getReduxState();
      const isAllBranchesState = state.reduxComp.compSwitch[instance];
      const selectedFiltersState = state.stockSummaryReport;

      const rowsData: RowDataType[] = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        instance: instance,
        sqlId: SqlIdsMap.getStockSummaryReport,
        sqlArgs: {
          branchId: isAllBranchesState
            ? null
            : state.login.currentBranch?.branchId,
          finYearId: finYearId,
          productCode: selectedFiltersState.productCode || null,
          brandId:
            selectedFiltersState.catFilterOption.selectedBrand?.id || null,
          catId:
            selectedFiltersState.catFilterOption.selectedCategory?.id || null,
          tagId: selectedFiltersState.catFilterOption.selectedTag?.id || null,
          onDate: selectedFiltersState.onDate,
          days: selectedFiltersState.ageFilterOption.selectedAge?.value || 0
        }
      });

      setRowsData(rowsData);
    } catch (e: any) {
      console.log(e);
    }
  }
}

type RowDataType = {
  age: number;
  brandName: string;
  catName: string;
  grossProfit: number;
  info: string;
  label: string;
  lastPurchaseDate: string;
  lastPurchasePrice: number;
  price: number;
  productCode: string;
  productId: number;
  qty: number;
  stock: number;
};
