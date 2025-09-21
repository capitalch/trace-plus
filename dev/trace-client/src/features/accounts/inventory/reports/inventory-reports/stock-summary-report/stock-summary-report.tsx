import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType, } from "../../../../../../app/store";
import { DataInstancesMap } from "../../../../../../app/maps/data-instances-map";
import { selectCompSwitchStateFn } from "../../../../../../controls/redux-components/comp-slice";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { useEffect, useState } from "react";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/maps/sql-ids-map";
import { CompSyncFusionGridToolbar } from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSwitch } from "../../../../../../controls/redux-components/comp-switch";
import { BackToDashboardLink } from "../../back-to-dashboard-link";
import {
  CompSyncFusionGrid,
  SyncFusionGridAggregateType,
  SyncFusionGridColumnType,
} from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import {
  QueryCellInfoEventArgs,
  RowDataBoundEventArgs,
} from "@syncfusion/ej2-react-grids";
import { format } from "date-fns";
import { StockSummaryReportFilterControl } from "./stock-summary-report-filter-control";
import { StockSummaryReportToolbarFilterDisplay } from "./stock-summary-report-toolbar-filter-display";
import { setStockSummaryReportFilters } from "./stock-summary-report-slice";

export function StockSummaryReport({ title }: { title?: string }) {
  const dispatch: AppDispatchType = useDispatch()
  const instance = DataInstancesMap.stockSummaryReport;
  const isAllBranches: boolean =
    useSelector(
      (state: RootStateType) => selectCompSwitchStateFn(state, instance),
      shallowEqual
    ) || false;
  const selectedFilters = useSelector(
    (state: RootStateType) => state.stockSummaryReport
  );

  const [rowsData, setRowsData] = useState<RowDataType[]>([]);
  const {
    branchId,
    buCode,
    currentDateFormat,
    dbName,
    decodedDbParamsObject,
    finYearId,
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
    selectedFilters.onDate,
    selectedFilters.selectedGrossProfitStatus.value
  ]);

  return (
    <div className="flex flex-col">
      <CompSyncFusionGridToolbar
        CustomControl={() => (
          <div className="flex items-center gap-2">
            <StockSummaryReportToolbarFilterDisplay />
            <button
              type="button"
              onClick={handleOnClickFilter}
              className="px-2 py-1 font-medium text-sm text-white bg-blue-500 rounded hover:bg-blue-700"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleOnClickResetFilter}
              className="px-2 py-1 font-medium text-sm text-white bg-amber-500 rounded hover:bg-amber-700"
            >
              Reset Filter
            </button>
            <button
              type="button"
              onClick={handleOnClickTrim}
              className="px-2 py-1 font-medium text-sm text-white bg-green-500 rounded hover:bg-purple-700"
            >
              Trim
            </button>
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
        // allowPaging={true}
        allowTextWrap={false}
        // pageSettings={{ pageSize: 500, pageSizes: [500, 1000, 2000] }}
        buCode={buCode}
        className="mt-4"
        columns={getColumns()}
        dataSource={rowsData}
        editSettings={{
          allowEditing: false,
          allowDeleting: false,
          mode: "Normal",
        }}
        hasCheckBoxSelection={true}
        hasIndexColumn={true}
        height="calc(100vh - 230px)"
        indexColumnWidth={60}
        instance={instance}
        loadData={loadData}
        minWidth="800px"
        onRemove={handleOnRemove}
        rowHeight={30}
        searchFields={['productCode', 'catName', 'product']}
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
        ),
      },
      {
        columnName: "op",
        type: "Sum",
        field: "op",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "dr",
        type: "Sum",
        field: "dr",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "cr",
        type: "Sum",
        field: "cr",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "clos",
        type: "Sum",
        field: "clos",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "grossProfit",
        type: "Sum",
        field: "grossProfit",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "opValue",
        type: "Sum",
        field: "opValue",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "closValue",
        type: "Sum",
        field: "closValue",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "purchase",
        type: "Sum",
        field: "purchase",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "sale",
        type: "Sum",
        field: "sale",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "purchaseRet",
        type: "Sum",
        field: "purchaseRet",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "saleRet",
        type: "Sum",
        field: "saleRet",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "stockJournalDebits",
        type: "Sum",
        field: "stockJournalDebits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "stockJournalCredits",
        type: "Sum",
        field: "stockJournalCredits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "branchTransferDebits",
        type: "Sum",
        field: "branchTransferDebits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
      {
        columnName: "branchTransferCredits",
        type: "Sum",
        field: "branchTransferCredits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        ),
      },
    ];
  }

  function getColumns(): SyncFusionGridColumnType[] {
    return [
      {
        field: "productCode",
        headerText: "Pr code",
        width: 90,
        type: "string",
      },
      {
        field: 'catName',
        headerText: 'Category',
        width: 100,
        type: 'string',
        clipMode: "EllipsisWithTooltip",
      },
      {
        field: "product",
        headerText: "Product",
        width: 300,
        type: "string",
        clipMode: "EllipsisWithTooltip",
      },
      {
        field: "info",
        clipMode: "EllipsisWithTooltip",
        headerText: "Details",
        width: 250,
        type: "string",
      },
      {
        field: "op",
        headerText: "Op",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "dr",
        headerText: "Dr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "cr",
        headerText: "Cr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "clos",
        headerText: "Clos",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "grossProfit",
        headerText: "Profit(GP)",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 120,
      },
      {
        field: "age",
        headerText: "Age",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "openingPrice",
        headerText: "Op price",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 120,
      },
      {
        field: "opValue",
        headerText: "Op value",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 150,
      },
      {
        field: "lastPurchasePrice",
        headerText: "Clos price",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100,
      },
      {
        field: "closValue",
        headerText: "Clos value",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 150,
      },
      {
        field: "lastPurchaseDate",
        headerText: "Lst pur dt",
        type: "string",
        width: 90,
        valueAccessor: (field: string, data: any) =>
          data?.[field] ? format(data?.[field], currentDateFormat) : '',
      },
      {
        field: "lastSaleDate",
        headerText: "Lst sal dt",
        type: "string",
        width: 90,
        valueAccessor: (field: string, data: any) =>
          data?.[field] ? format(data?.[field], currentDateFormat) : '',
      },
      {
        field: "purchase",
        headerText: "Pur",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "sale",
        headerText: "Sal",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "purchaseRet",
        headerText: "Pur ret",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "saleRet",
        headerText: "Sal ret",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "stockJournalDebits",
        headerText: "Stk Jr Dr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 80,
      },
      {
        field: "stockJournalCredits",
        headerText: "Stk Jr Cr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 80,
      },
      {
        field: "branchTransferDebits",
        headerText: "Br Trf Dr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 80,
      },
      {
        field: "branchTransferCredits",
        headerText: "Br Trf Cr",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 80,
      },
      {
        field: "productId",
        headerText: "Pr id",
        width: 60,
        type: "number",
        textAlign: "Right",
        isPrimaryKey: true,
      },
    ];
  }

  function handleOnClickFilter() {
    Utils.showHideModalDialogA({
      isOpen: true,
      size: "md",
      title: "Stock Summary Report Filter",
      element: <StockSummaryReportFilterControl />,
    });
  }

  function handleOnClickResetFilter() {
    dispatch(
      setStockSummaryReportFilters({
        catFilterOption: {
          selectedBrand: { brandName: 'All', id: null },
          selectedCategory: { catName: 'All', id: "" },
          selectedTag: { tagName: 'All', id: null },
        },
        ageFilterOption: { selectedAge: { value: null, label: "All" } },
        onDate: format(new Date(), "yyyy-MM-dd"),
        selectedGrossProfitStatus: { label: "All", value: 0 },
      })
    );
  }

  function handleOnClickTrim() {
    setRowsData((prev) =>
      prev.filter((item: RowDataType) => item.clos !== 0)
    );
  }

  function handleOnRowDataBound(args: RowDataBoundEventArgs) {
    const rowData = args.data as RowDataType;

    if (args.row && rowData.age > 360 && rowData.clos > 0) {
      args.row.classList.add("bg-blue-100");
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
      const buCode = state.login.currentBusinessUnit?.buCode;
      const finYearId = state.login.currentFinYear?.finYearId;

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
          brandId:
            selectedFiltersState.catFilterOption.selectedBrand?.id || null,
          catId:
            selectedFiltersState.catFilterOption.selectedCategory?.id || null,
          tagId: selectedFiltersState.catFilterOption.selectedTag?.id || null,
          onDate: selectedFiltersState.onDate,
          days: selectedFiltersState.ageFilterOption.selectedAge?.value || 0,
          grossProfitFilter: selectedFiltersState.selectedGrossProfitStatus.value
        },
      });

      setRowsData(rowsData);
    } catch (e: any) {
      console.log(e);
    }
  }

  function handleOnRemove(props: any) {
    setRowsData((prev) =>
      prev.filter((item: RowDataType) => item.productId !== props.productId)
    );
  }
}

type RowDataType = {
  age: number;
  brandName: string;
  catName: string;
  cr: number;
  clos: number;
  dr: number;
  grossProfit: number;
  info: string;
  label: string;
  lastPurchaseDate: string;
  lastPurchasePrice: number;
  op: number;
  price: number;
  productCode: string;
  productId: number;
  qty: number;
  stock: number;
};
