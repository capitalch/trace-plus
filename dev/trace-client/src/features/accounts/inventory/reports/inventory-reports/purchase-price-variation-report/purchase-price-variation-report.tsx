// import { useState } from "react";
// import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import {
  CompSyncFusionGrid,
  SyncFusionGridAggregateType,
  SyncFusionGridColumnType
} from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
// import { PurchasePriceVariationFilterControl } from "./purchase-price-variation-filter-control";
import { DataInstancesMap } from "../../../../../../app/graphql/maps/data-instances-map";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { CompSyncFusionGridToolbar } from "../../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { BackToDashboardLink } from "../../back-to-dashboard-link";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";
import { PurchasePriceVariationToolbarCustomControl } from "./purchase-price-variation-toolbar-custom-control";
import { format } from "date-fns";

export function PurchasePriceVariationReport({ title }: { title?: string }) {
  const instance = DataInstancesMap.purchasePriceVariationReport;
  const {
    branchId,
    buCode,
    currentDateFormat,
    dbName,
    decodedDbParamsObject,
    finYearId
  } = useUtilsInfo();

  return (
    <div className="flex flex-col">
      <CompSyncFusionGridToolbar
        CustomControl={() => <PurchasePriceVariationToolbarCustomControl />}
        className="mr-4"
        minWidth="600px"
        title={title || ""}
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
        dbName={dbName}
        dbParams={decodedDbParamsObject}
        hasIndexColumn={true}
        height="calc(100vh - 245px)"
        instance={instance}
        isLoadOnInit={false}
        minWidth="900px"
        sqlId={SqlIdsMap.getPurchasePriceVariation}
        sqlArgs={{
          branchId: branchId,
          finYearId: finYearId,
          brandId: null,
          catId: null,
          tagId: null
        }}
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
        headerText: "P Code",
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
        headerText: "Diff",
        type: "number",
        format: "N2",
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
      // {
      //   field: "label",
      //   visible: false,
      //   width: 0
      // },
      {
        field: "mobileNumber",
        visible: false,
        width: 0
      }
    ];
  }
  // <div className="flex flex-col">
  //   <button type="button" onClick={() => setIsPaneOpen(true)}>
  //     Open Filters
  //   </button>
  // </div>
}
