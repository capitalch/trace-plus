import { useEffect, useState } from "react";
import { DataInstancesMap } from "../../../../../../app/graphql/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  AppDispatchType,
  RootStateType
} from "../../../../../../app/store/store";
import { selectCompSwitchStateFn } from "../../../../../../controls/redux-components/comp-slice";
import { CompSyncFusionGridToolbar } from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSwitch } from "../../../../../../controls/redux-components/comp-switch";
import { BackToDashboardLink } from "../../back-to-dashboard-link";
import {
  CompSyncFusionGrid,
  SyncFusionGridAggregateType,
  SyncFusionGridColumnType
} from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { format } from "date-fns";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import {
  QueryCellInfoEventArgs,
  RowDataBoundEventArgs
} from "@syncfusion/ej2-react-grids";
import clsx from "clsx";
import { SalesReportToolbarFilterDisplay } from "./sales-report-toolbar-filter-display";
import { setSalesReportDateRange, setSalesReportFilters } from "./sales-report-slice";
import { SalesReportFilterControl } from "./sales-report-filter-control";

export function SalesReport({ title }: { title?: string }) {
  const dispatch: AppDispatchType = useDispatch();
  const instance = DataInstancesMap.salesReport;
  const isAllBranches: boolean =
    useSelector(
      (state: RootStateType) => selectCompSwitchStateFn(state, instance),
      shallowEqual
    ) || false;
  const selectedFilters = useSelector(
    (state: RootStateType) => state.salesReport
  );

  const [rowsData, setRowsData] = useState<RowDataType[]>([]);
  const {
    branchId,
    buCode,
    currentDateFormat,
    dbName,
    decodedDbParamsObject,
    finYearId,
    currentFinYear
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
    selectedFilters.dateRangeFilterOption.startDate,
    selectedFilters.dateRangeFilterOption.endDate,
    selectedFilters.ageFilterOption.selectedAge.value,
    selectedFilters.productCode
  ]);

  return (
    <div className="flex flex-col">
      <CompSyncFusionGridToolbar
        CustomControl={() => (
          <div className="flex items-center gap-2">
            <SalesReportToolbarFilterDisplay />
            <button
              type="button"
              onClick={handleOnClickFilter}
              className="bg-blue-500 text-white px-2 py-1 rounded font-medium text-sm hover:bg-blue-700"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleOnClickResetFilter}
              className="bg-amber-500 text-white px-2 py-1 rounded font-medium text-sm hover:bg-amber-700"
            >
              Reset Filter
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
        allowPaging={true}
        pageSettings={{ pageSize: 500, pageSizes: [500, 1000, 2000] }}
        buCode={buCode}
        className="mt-4"
        columns={getColumns()}
        dataSource={rowsData}
        hasIndexColumn={true}
        height="calc(100vh - 300px)"
        indexColumnWidth={60}
        instance={instance}
        isLoadOnInit={false}
        isSmallerFont={true}
        loadData={loadData}
        minWidth="800px"
        queryCellInfo={handleQueryCellInfo} // Text color works with queryCellInfo
        onRowDataBound={handleOnRowDataBound} // Background color works with onRowDataBound
      />
    </div>
  );

  function getAggregates(): SyncFusionGridAggregateType[] {
    return [
      {
        columnName: "autoRefNo",
        type: "Count",
        field: "autoRefNo",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">Count: {props.Count}</span>
        )
      },
      {
        columnName: "qty",
        type: "Sum",
        field: "qty",
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
        columnName: "amount",
        type: "Sum",
        field: "amount",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "aggrSale",
        type: "Sum",
        field: "aggrSale",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "cgst",
        type: "Sum",
        field: "cgst",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "sgst",
        type: "Sum",
        field: "sgst",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      },
      {
        columnName: "igst",
        type: "Sum",
        field: "igst",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs">{props.Sum}</span>
        )
      }
    ];
  }

  function getColumns(): SyncFusionGridColumnType[] {
    return [
      {
        field: "tranDate",
        headerText: "Date",
        type: "string",
        width: 90,
        valueAccessor: (field: string, data: any) =>
          format(data?.[field], currentDateFormat)
      },
      {
        field: "autoRefNo",
        headerText: "Ref no | Acct",
        width: 140,
        type: "string",
        template: (props: RowDataType) => {
          return (
            <div
              className={clsx(
                "flex flex-col",
                props.grossProfit < 0 ? "text-red-500" : ""
              )}
            >
              <span>{props.autoRefNo}</span>
              <span>{props.accounts}</span>
            </div>
          );
        }
      },
      { field: "productCode", headerText: "P code", width: 90, type: "string" },
      {
        field: "catName",
        headerText: "Product",
        width: 250,
        type: "string",
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
      { field: "info", headerText: "Details", width: 200, type: "string" },
      {
        field: "qty",
        headerText: "Qty",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
      },
      {
        field: "stock",
        headerText: "Stock",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70
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
        field: "grossProfit",
        headerText: "Profit(GP)",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 120
      },
      {
        field: "amount",
        headerText: "Sale(Gst)",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 120
      },
      {
        field: "aggrSale",
        headerText: "Sale(Aggr)",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 120
      },
      {
        field: "price",
        headerText: "Sale price",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100
      },
      {
        field: "lastPurchasePrice",
        headerText: "Pur price",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100
      },
      {
        field: "gstRate",
        headerText: "Gst%",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 60
      },
      {
        field: "cgst",
        headerText: "Cgst",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 110
      },
      {
        field: "sgst",
        headerText: "Sgst",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 110
      },
      {
        field: "igst",
        headerText: "Igst",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 110
      },
      { field: "saleType", headerText: "Type", width: 80, type: "string" },
      {
        field: "timestamp",
        headerText: "Time",
        width: 100,
        type: "string",
        valueAccessor: (field: string, data: any) =>
          new Date(data?.[field]).toLocaleTimeString()
      },
      { field: "contact", headerText: "Contact", width: 200, type: "string" },
      {
        field: "productId",
        headerText: "Pr id",
        width: 60,
        type: "number",
        textAlign: "Right"
      },
      {
        field: "commonRemarks",
        headerText: "Common remarks",
        width: 200,
        type: "string"
      },
      {
        field: "lineRemarks",
        headerText: "Line remarks",
        width: 200,
        type: "string"
      },
      {
        field: "serialNumbers",
        headerText: "Serial no",
        width: 200,
        type: "string"
      },

      { field: "brandName", visible: false, width: 0 },
      { field: "label", visible: false, width: 0 }
    ];
  }

  function handleOnClickFilter() {
    Utils.showHideModalDialogA({
      isOpen: true,
      size: "md",
      title: "Sales Report Filter",
      element: <SalesReportFilterControl />,
    });
  }

  function handleOnClickResetFilter() {
    dispatch(
      setSalesReportFilters({
        filterMode: 'category',
        catFilterOption: {
          selectedBrand: { brandName: 'All', id: null },
          selectedCategory: { catName: 'All', id: "" },
          selectedTag: { tagName: 'All', id: null },
        },
        productCode: null,
        ageFilterOption: { selectedAge: { value: null, label: "All" } },
        dateRangeFilterOption: {
          selectedDateRange: { label: "today", value: "today" },
          startDate: format(new Date(), "yyyy-MM-dd"),
          endDate: format(new Date(), "yyyy-MM-dd"),
        }
      })
    );
  }

  function handleOnRowDataBound(args: RowDataBoundEventArgs) {
    const rowData = args.data as RowDataType;

    if (args.row) {
      if (rowData.age > 360) {
        args.row.classList.add("bg-blue-100");
      } else if (rowData.bColor) {
        args.row.classList.add("bg-green-100");
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
      const selectedFiltersState = state.salesReport;
      const currentStartDate = currentFinYear?.startDate || "";
      const currentEndDate = currentFinYear?.endDate || "";
      const { startDate, endDate, selectedDateRange } = selectedFiltersState.dateRangeFilterOption;
      const setRowsDataBColor = (rowData: RowDataType[]) => {
        let prevRefNo = null;
        let bColor: boolean = false;
        for (let i = 0; i < rowData.length; i++) {
          rowData[i].bColor = bColor;
          if (rowData[i].autoRefNo !== prevRefNo) {
            rowData[i].bColor = !bColor;
            prevRefNo = rowData[i].autoRefNo;
            bColor = !bColor;
          }
        }
      }

      if ((selectedDateRange.value === "finYear") && (currentStartDate !== startDate || currentEndDate !== endDate)) {
        dispatch(
          setSalesReportDateRange({
            startDate: currentStartDate,
            endDate: currentEndDate
          })
        );
        return;
      }

      const rowsData: RowDataType[] = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        instance: instance,
        sqlId: SqlIdsMap.getSalesReport,
        sqlArgs: {
          branchId: isAllBranchesState
            ? null
            : state.login.currentBranch?.branchId,
          productCode: selectedFiltersState.productCode || null,
          brandId:
            selectedFiltersState.catFilterOption.selectedBrand?.id || null,
          catId:
            selectedFiltersState.catFilterOption.selectedCategory?.id || null,
          tagId: selectedFiltersState.catFilterOption.selectedTag?.id || null,
          finYearId,
          startDate: selectedFiltersState.dateRangeFilterOption.startDate,
          endDate: selectedFiltersState.dateRangeFilterOption.endDate,
          days: selectedFiltersState.ageFilterOption.selectedAge?.value || 0
        }
      });

      setRowsDataBColor(rowsData);
      setRowsData(rowsData);
    } catch (e: any) {
      console.log(e);
    }
  }
}

type RowDataType = {
  accounts: string;
  age: number;
  aggrSale: number;
  amount: number;
  autoRefNo: string;
  bColor?: boolean;
  brandName: string;
  catName: string;
  cgst: number;
  commonRemarks: string;
  contact: string;
  grossProfit: number;
  gstRate: number;
  igst: number;
  info: string;
  label: string;
  lastPurchaseDate: string;
  lastPurchasePrice: number;
  lineRemarks: string;
  price: number;
  productCode: string;
  productId: number;
  saleType: string;
  stock: number;
  timestamp: string;
  qty: number;
  sgst: number;
  serialNumbers: string;
  tranDate: string;
};
