import { useEffect, useState } from "react";
import { DataInstancesMap } from "../../../../../../app/graphql/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { shallowEqual, useSelector } from "react-redux";
import { RootStateType } from "../../../../../../app/store/store";
import { selectCompSwitchStateFn } from "../../../../../../controls/redux-components/comp-slice";
import { CompSyncFusionGridToolbar } from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { CompSwitch } from "../../../../../../controls/redux-components/comp-switch";
import { BackToDashboardLink } from "../../back-to-dashboard-link";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { format } from "date-fns";
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { QueryCellInfoEventArgs } from "@syncfusion/ej2-react-grids";
import { PurchaseReportToolbarFilterDisplay } from "./purchase-report-toolbar-filter-display";

export function PurchaseReport({ title }: { title?: string }) {
  const instance = DataInstancesMap.purchaseReport;
  const isAllBranches: boolean =
    useSelector(
      (state: RootStateType) => selectCompSwitchStateFn(state, instance),
      shallowEqual
    ) || false;
  const selectedStartDate = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectedStartDate)
  const selectedEndDate = useSelector((state: RootStateType) => state.accounts.purchaseReportFilterState.selectedEndDate)

  const [rowsData, setRowsData] = useState<RowDataType[]>([]);
  const {
    branchId,
    buCode,
    currentDateFormat,
    dbName,
    decodedDbParamsObject,
    finYearId
  } = useUtilsInfo();

  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      loadData();
    }
  }, [isAllBranches,
    branchId,
    buCode,
    finYearId,
    selectedStartDate,
    selectedEndDate]);

  return (
    <div className="flex flex-col">
      <CompSyncFusionGridToolbar
        CustomControl={() => (
          <div className="flex items-center gap-2">
            <PurchaseReportToolbarFilterDisplay />
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
        height="calc(100vh - 303px)"
        indexColumnWidth={60}
        instance={instance}
        isSmallerFont={true}
        loadData={loadData}
        minWidth="800px"
        queryCellInfo={handleQueryCellInfo}
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
        columnName: "aggrPurchase",
        type: "Sum",
        field: "aggrPurchase",
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
      },
    ];
  }

  function getColumns(): SyncFusionGridColumnType[] {
    return [
      {
        field: "tranDate",
        headerText: "Date",
        type: "string",
        width: 90,
        // Otherwise PDF export error
        valueAccessor: (field: string, data: any) =>
          format(data?.[field], currentDateFormat)
      },
      {
        field: "autoRefNo",
        headerText: "Ref no",
        width: 120,
        type: "string"
      },
      {
        field: "userRefNo",
        headerText: "Inv no",
        width: 120,
        type: "string"
      },
      {
        field: "party",
        headerText: "Account",
        width: 200,
        type: "string"
      },
      {
        field: "productCode",
        headerText: "P code",
        width: 90,
        type: "string"
      },
      {
        field: "info",
        headerText: "Product",
        width: 250,
        type: "string",
        template: (props: any) =>
          "".concat(props.catName, " ", props.brandName, " ", props.label, /*" ", props.info || ''*/)
      },
      {
        field: "qty",
        headerText: "Qty",
        type: "number",
        format: "N0",
        textAlign: "Right",
        width: 80
      },
      {
        field: "price",
        headerText: "Pur price",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100
      },
      {
        field: "aggrPurchase",
        headerText: "Aggr pur",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100
      },
      {
        field: "amount",
        headerText: "Gst pur",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100
      },
      {
        field: "gstRate",
        headerText: "Gst(%)",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 80
      },
      {
        field: "cgst",
        headerText: "Cgst",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 90
      },
      {
        field: "sgst",
        headerText: "Sgst",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 90
      },
      {
        field: "igst",
        headerText: "Igst",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 90
      },
      {
        field: "purchaseType",
        headerText: "Type",
        width: 80,
        type: "string"
      },
      {
        field: "productId",
        headerText: "Pr id",
        width: 80,
        type: "number",
        textAlign: 'Right'
      },
      {
        field: "catName",
        visible: false,
        width: 0
      },
      {
        field: "brandName",
        visible: false,
        width: 0
      },
      {
        field: "label",
        visible: false,
        width: 0
      },
    ];
  }

  function handleQueryCellInfo(args: QueryCellInfoEventArgs) {
    const rowData = args.data as RowDataType;

    // Light background if row has bColor
    if (rowData.bColor && args.cell) {
      (args.cell as any).style.backgroundColor = "#eaf4ea";
    }
  }

  async function loadData() {
    try {
      const state: RootStateType = Utils.getReduxState();
      const isAllBranchesState = state.reduxComp.compSwitch[instance]
      const buCode = state.login.currentBusinessUnit?.buCode;
      const finYearId = state.login.currentFinYear?.finYearId;
      const startDate = state.accounts.purchaseReportFilterState.selectedStartDate
      const endDate = state.accounts.purchaseReportFilterState.selectedEndDate

      if (!startDate || !endDate) {
        return;
      }

      const rowsData: RowDataType[] = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        instance: instance,
        sqlId: SqlIdsMap.getPurchaseReport,
        sqlArgs: {
          branchId: isAllBranchesState ? null : state.login.currentBranch?.branchId, // this get the latest branchId
          finYearId: finYearId,
          startDate: startDate, //'2025-04-01', // 
          endDate: endDate,//'2025-04-22', 
        }
      });
      setRowsDataBColor(rowsData);
      setRowsData(rowsData)
    } catch (e: any) {
      console.log(e);
    }

    function setRowsDataBColor(rowData: RowDataType[]) {
      let prevRefNo = null
      let bColor: boolean = false
      for (let i = 0; i < rowData.length; i++) {
        rowData[i].bColor = bColor
        if (rowData[i].autoRefNo !== prevRefNo) {
          rowData[i].bColor = !bColor
          prevRefNo = rowData[i].autoRefNo
          bColor = !bColor
        }
      }
    }
  }

}

type RowDataType = {
  aggrPurchase: number;
  amount: number;
  autoRefNo: string;
  bColor?: boolean;
  brandName: string;
  catName: string;
  cgst: number;
  gstRate: number;
  igst: number;
  info: string;
  label: string;
  party: string;
  price: number;
  productCode: string;
  productId: number;
  purchaseType: string;
  qty: number;
  sgst: number;
  tranDate: string;
  userRefNo: string
};
