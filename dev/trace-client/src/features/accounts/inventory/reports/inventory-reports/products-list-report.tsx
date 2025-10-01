import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatchType } from "../../../../../app/store";
import { setCompAccountsContainerMainTitle } from "../../../../../controls/redux-components/comp-slice";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import {
  CompSyncFusionGrid,
  SyncFusionGridAggregateType,
  SyncFusionGridColumnType
} from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { BackToDashboardLink } from "../back-to-dashboard-link";

export function ProductsListReport({ title }: { title?: string }) {
  const dispatch: AppDispatchType = useDispatch();
  const instance = DataInstancesMap.productsListReport;

  const { buCode, context, dbName, decodedDbParamsObject } = useUtilsInfo();

useEffect(() => {
        dispatch(setCompAccountsContainerMainTitle({ mainTitle: "Inventory Reports" }));
    }, [dispatch]);

    useEffect(() => {
        const loadData = context?.CompSyncFusionGrid[instance]?.loadData
        if (loadData && buCode) {
            loadData()
        }
    }, [buCode])

  return (
    <div className="flex flex-col">
      <CompSyncFusionGridToolbar
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
        allowPaging={true}
        buCode={buCode}
        className="mt-4"
        columns={getColumns()}
        dbName={dbName}
        dbParams={decodedDbParamsObject}
        height="calc(100vh - 303px)"
        instance={instance}
        minWidth="600px"
        pageSettings={{ pageSize: 500, pageSizes: [200, 500, 1000, 2000] }}
        sqlId={SqlIdsMap.getAllProducts}
        sqlArgs={{
          isActive: true
        }}
      />
    </div>
  );

  function cleanStringAllowSome(input: string) {
    if (typeof input !== "string") return "";
    return input.replace(/[^a-zA-Z0-9-_ ]/g, "");
  }

  function getAggregates(): SyncFusionGridAggregateType[] {
    return [
      {
        columnName: "info",
        type: "Count",
        field: "info",
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
        field: "index",
        headerText: "#",
        width: 50
      },
      {
        field: "productCode",
        headerText: "P Code",
        width: 90,
        type: "string"
      },
      {
        field: "catName",
        headerText: "Category",
        width: 100,
        type: "string"
      },
      {
        field: "brandName",
        headerText: "Brand",
        width: 100,
        type: "string"
      },
      {
        field: "label",
        headerText: "Label",
        width: 150,
        type: "string"
      },
      {
        field: "info",
        headerText: "Details",
        width: 200,
        type: "string",
        valueAccessor: (field: string, data: any) =>
          cleanStringAllowSome(data?.[field])
      },
      {
        field: "salePrice",
        headerText: "Sale pr",
        width: 100,
        type: "number",
        textAlign: "Right",
        format: "N2"
      },
      {
        field: "salePriceGst",
        headerText: "Sal pr (gst)",
        width: 100,
        type: "number",
        textAlign: "Right",
        format: "N2"
      },
      {
        field: "maxRetailPrice",
        headerText: "MRP",
        width: 100,
        type: "number",
        textAlign: "Right",
        format: "N2"
      },
      {
        field: "dealerPrice",
        headerText: "Dealer pr",
        width: 100,
        type: "number",
        textAlign: "Right",
        format: "N2"
      },
      {
        field: "purPrice",
        headerText: "Pur pr",
        width: 100,
        type: "number",
        textAlign: "Right",
        format: "N2"
      },
      {
        field: "purPriceGst",
        headerText: "Pur pr (gst)",
        width: 100,
        type: "number",
        textAlign: "Right",
        format: "N2"
      },
      {
        field: "hsn",
        headerText: "HSN",
        width: 100,
        type: "number"
      },
      {
        field: "upcCode",
        headerText: "UPC",
        width: 100,
        type: "number"
      },
      {
        field: "gstRate",
        headerText: "GST (%)",
        width: 100,
        type: "number",
        textAlign: "Right"
      },
      {
        field: "id",
        headerText: "Pr id",
        width: 100,
        type: "number"
      }
    ];
  }
}
