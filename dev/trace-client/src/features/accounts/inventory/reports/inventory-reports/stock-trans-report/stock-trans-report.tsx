import { useEffect, useState } from "react";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { shallowEqual, useSelector } from "react-redux";
import { selectCompSwitchStateFn } from "../../../../../../controls/redux-components/comp-slice";
import { RootStateType } from "../../../../../../app/store/store";
import { DataInstancesMap } from "../../../../../../app/graphql/maps/data-instances-map";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionGridToolbar } from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSwitch } from "../../../../../../controls/redux-components/comp-switch";
import { BackToDashboardLink } from "../../back-to-dashboard-link";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { format } from "date-fns";

export function StockTransReport({ title }: { title?: string; }) {

  const instance = DataInstancesMap.stockTransReport;
  const isAllBranches: boolean =
    useSelector(
      (state: RootStateType) => selectCompSwitchStateFn(state, instance),
      shallowEqual
    ) || false;
  const selectedFilters = useSelector(
    (state: RootStateType) => state.stockTransReport
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
    // selectedFilters.selectedGrossProfitStatus.value
  ]);

  return (<div className="flex flex-col">
    <CompSyncFusionGridToolbar
      CustomControl={() => (
        <div className="flex items-center gap-2">
          {/* <StockSummaryReportToolbarFilterDisplay /> */}
          <button
            type="button"
            // onClick={handleOnClickFilter}
            className="bg-blue-500 text-white px-2 py-1 rounded font-medium text-sm hover:bg-blue-700"
          >
            Filter
          </button>
          <button
            type="button"
            // onClick={handleOnClickResetFilter}
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
      allowTextWrap={false}
      pageSettings={{ pageSize: 500, pageSizes: [500, 1000, 2000] }}
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
      height="calc(100vh - 300px)"
      indexColumnWidth={60}
      instance={instance}
      isLoadOnInit={false}
      isSmallerFont={true}
      loadData={loadData}
      minWidth="800px"
      // onRemove={handleOnRemove}
      rowHeight={30}
    // queryCellInfo={handleQueryCellInfo} // Text color works with queryCellInfo
    // onRowDataBound={handleOnRowDataBound} // Background color works with onRowDataBound
    />
  </div>)

  function getAggregates(): SyncFusionGridAggregateType[] {
    return [
      {
        columnName: "product",
        type: "Count",
        field: "catName",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">Count: {props.Count}</span>
        ),
      },
      {
        columnName: "debits",
        type: "Sum",
        field: "debits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs mr-1">{props.Sum}</span>
        ),
      },
      {
        columnName: "credits",
        type: "Sum",
        field: "credits",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs mr-1">{props.Sum}</span>
        ),
      },
      {
        columnName: "balance",
        type: "Sum",
        field: "balance",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs mr-1">{props.Sum}</span>
        ),
      },
      {
        columnName: "grossProfit",
        type: "Sum",
        field: "grossProfit",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs mr-2">{props.Sum}</span>
        ),
      },
    ]
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
        field:'catName',
        headerText:'Category',
        width:100,
        type:'string',
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
        field: "tranDate",
        headerText: "Date",
        type: "string",
        width: 90,
        valueAccessor: (field: string, data: any) =>
          format(data?.[field], currentDateFormat)
      },
      {
        field: "debits",
        headerText: "Debits",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "credits",
        headerText: "Credits",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "balance",
        headerText: "Balance",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 70,
      },
      {
        field: "tranType",
        headerText: "Tr Type",
        width: 70,
        type: "string",
      },
      {
        field: "price",
        headerText: "Price",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 120,
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
        field: "remarks",
        headerText: "Remarks",
        width: 300,
        type: "string",
      },
    ]
  }

  async function loadData() {
    try {
      const state: RootStateType = Utils.getReduxState();
      const isAllBranchesState = state.reduxComp.compSwitch[instance];
      const selectedFiltersState = state.stockTransReport;

      const rowsData: RowDataType[] = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        instance: instance,
        sqlId: SqlIdsMap.getStockTransReport,
        sqlArgs: {
          branchId: isAllBranchesState
            ? null
            : state.login.currentBranch?.branchId,
          finYearId: finYearId,
          productCode: null,
          brandId:
            selectedFiltersState.catFilterOption.selectedBrand?.id || null,
          catId:
            selectedFiltersState.catFilterOption.selectedCategory?.id || null,
          tagId: selectedFiltersState.catFilterOption.selectedTag?.id || null,
          onDate: selectedFiltersState.onDate,
          days: selectedFiltersState.ageFilterOption.selectedAge?.value || 0,
        },
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