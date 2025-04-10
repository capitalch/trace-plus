// import { shallowEqual, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { DataInstancesMap } from "../../../../../app/graphql/maps/data-instances-map";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { BackToDashboardLink } from "../back-to-dashboard-link";
import { Utils } from "../../../../../utils/utils";
// import { RootStateType } from "../../../../../app/store/store";
// import { selectCompSwitchStateFn } from "../../../../../controls/redux-components/comp-slice";
// import { CompInstances } from "../../../../../controls/redux-components/comp-instances";
// import { CompSwitch } from "../../../../../controls/redux-components/comp-switch";

export function ProductsListReport({ title }: { title?: string }) {
  // const [,setRefresh] = useState({})
  const [products, setProducts] = useState<any>([])
  const instance = DataInstancesMap.productsListReport;
  // const isAllBranches: boolean = useSelector((state: RootStateType) => selectCompSwitchStateFn(state, CompInstances.compSwitchAllProductsReport), shallowEqual) || false;
  // const meta = useRef<MetaType>({
  //   products: []
  // })
  const {
    buCode,
    // branchId,
    context,
    dbName,
    decodedDbParamsObject,
    // finYearId
  } = useUtilsInfo();

  useEffect(() => {
    context.CompSyncFusionGrid[instance].loadData = loadData
    loadData()
  }, [])

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
        // dataSource={meta.current.products}
        dataSource={products}
        dbName={dbName}
        dbParams={decodedDbParamsObject}
        editSettings={{
          allowDeleting: true, // required for delete
          allowEditing: false,
          mode: "Normal",
        }}
        // hasIndexColumn={true}
        // hasRemoveButton={true}
        height="calc(100vh - 245px)"
        indexColumnWidth={30}
        instance={instance}
        isLoadOnInit={false}
        // loadData={loadData}
        onRemove={onRemove}
        minWidth="600px"
        removeButtonWidth={30}
      />
    </div>
  );

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
        field: "index",
        headerText: "#",
        width: 30,
        type: "number",
      },
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
        field: "",
        headerText: "Details",
        width: 100,
        type: "string",
        template: (props: any) => props.info // otherwise pdf export has issue
      },
      {
        field: "id",
        width: 0,
        type: "number",
        isPrimaryKey: true,
        visible: false,
      },
    ];
  }

  async function loadData() {
    const sqlId = SqlIdsMap.getAllProducts;
    try {
      const res = await Utils.doGenericQuery({
        buCode: buCode || '',
        sqlId: sqlId,
        dbName: dbName || '',
        dbParams: decodedDbParamsObject,
        instance: instance,
      })
      // meta.current.products = [...res];
      setProducts([...res])
      // setRefresh({})
    } catch (e: any) {
      console.log(e)
    }
  }

  function onRemove(props: any) {
    const gridRef = context.CompSyncFusionGrid[instance].gridRef;
    if (gridRef.current) {
      const rowIndex = gridRef.current.getRowIndexByPrimaryKey(props.id);
      gridRef.current.selectRow(rowIndex);
      const selectedRecords = gridRef.current?.getSelectedRecords();
      if (selectedRecords && selectedRecords.length > 0) {
        gridRef.current?.deleteRecord('OrderID', selectedRecords[0]);
      } else {
        alert('Please select a row to delete');
      }
    }
  }
}

// type MetaType = {
//   products: any[]
// }