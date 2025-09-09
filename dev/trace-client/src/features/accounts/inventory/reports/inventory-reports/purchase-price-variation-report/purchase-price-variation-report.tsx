import "react-sliding-pane/dist/react-sliding-pane.css";
import {
  CompSyncFusionGrid,
  SyncFusionGridAggregateType,
  SyncFusionGridColumnType
} from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { DataInstancesMap } from "../../../../../../app/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { CompSyncFusionGridToolbar } from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { BackToDashboardLink } from "../../back-to-dashboard-link";
import { SqlIdsMap } from "../../../../../../app/maps/sql-ids-map";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Utils } from "../../../../../../utils/utils";
import { QueryCellInfoEventArgs } from "@syncfusion/ej2-react-grids";
import { PurchasePriceVariationToolbarFilterDisplay } from "./purchase-price-variation-toolbar-filter-display";
import {  RootStateType} from "../../../../../../app/store";
import { shallowEqual, useSelector } from "react-redux";
import { CompSwitch } from "../../../../../../controls/redux-components/comp-switch";
import { selectCompSwitchStateFn } from "../../../../../../controls/redux-components/comp-slice";

export function PurchasePriceVariationReport({ title }: { title?: string }) {
  const instance = DataInstancesMap.purchasePriceVariationReport;
  const isAllBranches: boolean =
    useSelector(
      (state: RootStateType) => selectCompSwitchStateFn(state, instance),
      shallowEqual
    ) || false;

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
    loadData();
  }, [isAllBranches, branchId, buCode, finYearId]);

  return (
    <div className="flex flex-col">
      <CompSyncFusionGridToolbar
        CustomControl={() => (
          <div className="flex items-center gap-4">
            <PurchasePriceVariationToolbarFilterDisplay />
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
        buCode={buCode}
        className="mt-4"
        columns={getColumns()}
        dataSource={rowsData}
        hasIndexColumn={true}
        height="calc(100vh - 245px)"
        instance={instance}
        isSmallerFont={true}
        loadData={loadData}
        minWidth="600px"
        queryCellInfo={handleQueryCellInfo}
      />
    </div>
  );

  function getAggregates(): SyncFusionGridAggregateType[] {
    return [
      {
        columnName: "label",
        type: "Count",
        field: "label",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">Count: {props.Count}</span>
        )
      }
    ];
  }

  function getColumns(): SyncFusionGridColumnType[] {
    return [
      {
        field: "productCode",
        headerText: "P code",
        width: 90,
        type: "string"
      },
      {
        field: "label",
        headerText: "Product",
        width: 250,
        type: "string",
        template: (props: any) =>
          "".concat(props.catName, " ", props.brandName, " ", props.label)
      },
      {
        field: "tranDate",
        headerText: "Date",
        type: "string",
        width: 80,
        // Otherwise PDF export error
        valueAccessor: (field: string, data: any) =>
          format(data?.[field], currentDateFormat)
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
        headerText: "Price",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 80
      },
      {
        field: "diff",
        headerText: "Diff (%)",
        type: "string",
        textAlign: "Right",
        width: 80
      },
      {
        field: "accName",
        headerText: "Account",
        type: "string"
      },
      {
        field: "email",
        headerText: "Mob / Mail",
        type: "string",
        template: (props: any) =>
          "".concat(
            props.mobileNumber ?? "",
            props.mobileNumber ? ", " : "",
            props.email
          )
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
        field: "bColor",
        type: "boolean",
        visible: false,
        width: 0
      },
      {
        field: "mobileNumber",
        visible: false,
        width: 0
      }
    ];
  }

  function handleQueryCellInfo(args: QueryCellInfoEventArgs) {
    const rowData = args.data as RowDataType;

    // Light background if row has bColor
    if (rowData.bColor && args.cell) {
      (args.cell as any).style.backgroundColor = "#f9fef9";
    }

    // Apply text color only to "diff" column
    if (args.column?.field === "diff" && typeof rowData.diff === "number") {
      if (rowData.diff > 1) {
        (args.cell as any).style.color = "red";
      } else if (rowData.diff < -1) {
        (args.cell as any).style.color = "blue";
      }
    }
  }

  async function loadData() {
    try {
      const state: RootStateType = Utils.getReduxState();
      const isAllBranchesState = state.reduxComp.compSwitch[instance]
      const buCode = state.login.currentBusinessUnit?.buCode;
      const finYearId = state.login.currentFinYear?.finYearId;
      const rowsData: RowDataType[] = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        instance: instance,
        sqlId: SqlIdsMap.getPurchasePriceVariation,
        sqlArgs: {
          branchId: isAllBranchesState ? null : state.login.currentBranch?.branchId, // this get the latest branchId
          finYearId: finYearId,
          brandId:
            state.accounts.purchasePriceVariationFilterState.selectedBrand
              ?.id || null,
          catId:
            state.accounts.purchasePriceVariationFilterState.selectedCategory
              ?.id || null,
          tagId:
            state.accounts.purchasePriceVariationFilterState.selectedTag?.id ||
            null
        }
      });
      updateRowsDataForDisplay(rowsData);
    } catch (e: any) {
      console.log(e);
    }
  }

  function updateRowsDataForDisplay(rows: RowDataType[]) {
    if (rows.length > 0) {
      let currentProductCode = rows[0].productCode;
      let previousPrice = rows[0].price;
      let alternateColor = false;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const { productCode, price } = row;

        // Toggle color on product code change
        if (productCode !== currentProductCode) {
          alternateColor = !alternateColor;
          currentProductCode = productCode;
          previousPrice = price;
        } else if (price !== previousPrice) {
          const diff = ((price - previousPrice) / previousPrice) * 100;
          row.diff = Math.round(diff * 100) / 100;
          row.absDiff = Math.abs(diff);
          previousPrice = price;
        }
        row.bColor = alternateColor;
      }
    }
    setRowsData(rows);
  }
}

type RowDataType = {
  absDiff?: number;
  accName: string;
  bColor: boolean;
  diff?: number;
  email: string;
  label: string;
  mobileNumber: string;
  productCode: string;
  price: number;
  qty: number;
  tranDate: string;
};
