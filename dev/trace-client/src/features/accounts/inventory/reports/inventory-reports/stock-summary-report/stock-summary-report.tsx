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
    selectedFilters.ageFilterOption.selectedAge.value,
    selectedFilters.productCode
  ]);

  return (
    <div className="flex flex-col relative">
      <CompSyncFusionGridToolbar 
        CustomControl={() => (
          <div className="flex items-center gap-2">
            {/* <SalesReportToolbarFilterDisplay /> */}
            <StockSummaryReportFilterPanel />
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
      //   {
      //     columnName: "autoRefNo",
      //     type: "Count",
      //     field: "autoRefNo",
      //     format: "N0",
      //     footerTemplate: (props: any) => (
      //       <span className="text-xs">Count: {props.Count}</span>
      //     )
      //   },
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
      }
    ];
  }

  function getColumns(): SyncFusionGridColumnType[] {
    return [
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
