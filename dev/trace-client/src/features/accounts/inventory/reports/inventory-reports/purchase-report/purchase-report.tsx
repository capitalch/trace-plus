import { useEffect, useState } from "react";
// import SlidingPane from "react-sliding-pane";
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

export function PurchaseReport({ title }: { title?: string}) {
  const instance = DataInstancesMap.purchaseReport;
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
  }, [isAllBranches, branchId, buCode]);
  return (
    <div className="flex flex-col">
      <CompSyncFusionGridToolbar
        CustomControl={() => (
          <div className="flex items-center gap-6">
            <CompSwitch
              instance={instance}
              className=""
              leftLabel="Curr branch"
              rightLabel="All branches"
              toToggleLeftLabel={true}
            />
            {/* <PurchasePriceVariationToolbarFilterDisplay /> */}
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
        isLoadOnInit={false}
        loadData={loadData}
        minWidth="600px"
        // queryCellInfo={handleQueryCellInfo}
      />
      {/* <SlidingPane
        isOpen={selectedIsPaneOpen}
        title="Filter Options"
        onRequestClose={() =>
          dispatch(setPurchasePriceVariationIsPaneOpen(false))
        }
        width="500px"
      >
        <PurchasePriceVariationFilterControl instance={instance} />
      </SlidingPane> */}
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
        headerText: "Diff (%)",
        type: "string",
        // format: "N2",
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

  async function loadData() {
    try {
      // const state: RootStateType = Utils.getReduxState();
      const rowsData: RowDataType[] = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        instance: instance,
        sqlId: SqlIdsMap.getPurchaseReport,
        sqlArgs: {
          branchId: isAllBranches ? null : branchId,
          finYearId: finYearId,
        }
      });
      setRowsData(rowsData);
    } catch (e: any) {
      console.log(e);
    }
  }

}

type RowDataType = {
  tranDate: string;
};
