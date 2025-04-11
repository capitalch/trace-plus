// import { shallowEqual, useSelector } from "react-redux";
import { DataInstancesMap } from "../../../../../app/graphql/maps/data-instances-map";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { BackToDashboardLink } from "../back-to-dashboard-link";
// import { RootStateType } from "../../../../../app/store/store";
// import { selectCompSwitchStateFn } from "../../../../../controls/redux-components/comp-slice";
// import { CompInstances } from "../../../../../controls/redux-components/comp-instances";
// import { CompSwitch } from "../../../../../controls/redux-components/comp-switch";

export function ProductsListReport({ title }: { title?: string }) {
  const instance = DataInstancesMap.productsListReport;
  // const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, CompInstances.compSwitchAllProductsReport), shallowEqual) || false;

  const {
    buCode,
    branchId,
    dbName,
    decodedDbParamsObject,
    finYearId
  } = useUtilsInfo();

  return (
    <div className="flex flex-col">
      <CompSyncFusionGridToolbar
        className="mr-4"
        minWidth="600px"
        title={title || ''}
        isPdfExport={true}
        isExcelExport={true}
        isCsvExport={true}
        isLastNoOfRows={true}
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
        minWidth="600px"
        sqlId={SqlIdsMap.getAllProducts}
        sqlArgs={{
          branchId: branchId,
          finYearId: finYearId
        }}
      />
    </div>
  );

  function cleanStringAllowSome(input: string) {
    if (typeof input !== 'string') return '';
    return input.replace(/[^a-zA-Z0-9-_ ]/g, '');
  }

  function getAggregates(): SyncFusionGridAggregateType[] {
    return [
      {
        columnName: "productCode",
        type: "Count",
        field: "productCode",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">Count: {props.Count}</span>
        )
      },
    ];
  }

  function getColumns(): SyncFusionGridColumnType[] {
    return [
      {
        field: "productCode",
        headerText: "Product Code",
        width: 80,
        type: "string",
      },
      {
        field: "catName",
        headerText: "Category",
        width: 100,
        type: "string",
      },
      {
        field: "brandName",
        headerText: "Brand",
        width: 100,
        type: "string",
      },
      {
        field: "label",
        headerText: "Label",
        width: 100,
        type: "string",
      },
      {
        field: "info",
        headerText: "Details",
        width: 100,
        type: "string",
        valueAccessor: (field: string, data: any) => cleanStringAllowSome(data?.[field])
      },
    ];
  }
}
