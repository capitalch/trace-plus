import { shallowEqual, useSelector } from "react-redux";
import { DataInstancesMap } from "../../../../../app/graphql/maps/data-instances-map";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { BackToDashboardLink } from "../back-to-dashboard-link";
import { RootStateType } from "../../../../../app/store/store";
import { selectCompSwitchStateFn } from "../../../../../controls/redux-components/comp-slice";
import { CompInstances } from "../../../../../controls/redux-components/comp-instances";
import { CompSwitch } from "../../../../../controls/redux-components/comp-switch";
import { useEffect } from "react";

export function CurrentOrdersReport({ title }: { title?: string }) {
  const instance = DataInstancesMap.currentOrdersReport;
  const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, CompInstances.compSwitchCurrentOrdersReport), shallowEqual) || false

  const {
    buCode,
    branchId,
    context,
    dbName,
    decodedDbParamsObject,
    finYearId
  } = useUtilsInfo();

  useEffect(() => { // This block is necessary. Otherwise branch selection not works correctly
    const loadData = context.CompSyncFusionGrid[instance].loadData
    if (loadData) {
      loadData()
    }
  }, [isAllBranches])

  return <div className="flex flex-col">
    <CompSyncFusionGridToolbar
      CustomControl={() => <CompSwitch instance={CompInstances.compSwitchCurrentOrdersReport} className="" leftLabel="Curr branch" rightLabel="All branches" toToggleLeftLabel={true} />}
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
      hasIndexColumn={true} isLoadOnInit={false}
      // hasRemoveButton={true}
      height="calc(100vh - 245px)"
      instance={instance}
      minWidth="600px"
      // onRemove={onRemove}
      sqlId={SqlIdsMap.getCurrentOrders}
      sqlArgs={{
        branchId: isAllBranches ? null : branchId,
        finYearId: finYearId
      }}
    />
  </div>;

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
      {
        columnName: "orderValue",
        type: "Sum",
        field: "orderValue",
        format: "N2",
        footerTemplate: (props: any) => (
          <span className="text-xs mr-4">{props.Sum}</span>
        )
      }
    ];
  }

  function getColumns(): SyncFusionGridColumnType[] {
    return [
      {
        field: "productCode",
        headerText: "Pr code",
        width: 80,
        type: "string",
      },
      {
        field: "productDetails",
        headerText: "Product",
        width: 250,
        type: "string",
        template: (rowData: any) => (
          <div className="flex gap-2">
            <label>{rowData.catName} <strong>{rowData.brandName}</strong> {rowData.label} {rowData.info}</label>
          </div>
        ),
      },
      { // important for search to work on this info field
        field: "info",
        width: 0,
        visible: false,
        type: "string",
      },
      {
        field: "clos",
        headerText: "Stock",
        width: 60,
        type: "number",
        format: "N0",
        textAlign: "Right",
      },
      {
        field: "finalOrder",
        headerText: "Order",
        width: 60,
        type: "number",
        format: "N0",
        textAlign: "Right",
        template: (rowData: any) => <strong>{rowData.finalOrder ?? 0}</strong>
      },
      {
        field: "orderValue",
        headerText: "Value",
        width: 80,
        type: "number",
        format: "N2",
        textAlign: "Right",
      },
      {
        field: "isUrgent",
        headerText: "Urgent",
        width: 50,
        type: "boolean",
        textAlign: "Center",
        template: (props: any) => <input type="checkbox" checked={props.isUrgent} readOnly aria-label="Urgent" />
      },
    ];
  }

  // function onRemove(props: any) {
  //   const gridRef = context.CompSyncFusionGrid[instance].gridRef;
  //   if (gridRef.current) {
  //     const rowIndex = gridRef.current.getRowIndexByPrimaryKey(props.id);
  //     gridRef.current.selectRow(rowIndex);
  //     const selectedRecords = gridRef.current?.getSelectedRecords();
  //     if (selectedRecords && selectedRecords.length > 0) {
  //       gridRef.current?.deleteRecord('OrderID', selectedRecords[0]);
  //     } else {
  //       alert('Please select a row to delete');
  //     }
  //   }
  // }
}
