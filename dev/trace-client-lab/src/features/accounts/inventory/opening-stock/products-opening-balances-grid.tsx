import { useDispatch } from "react-redux";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { AppDispatchType, RootStateType } from "../../../../app/store";
import {
  CompSyncFusionGrid,
  SyncFusionGridAggregateType,
  SyncFusionGridColumnType
} from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import Decimal from "decimal.js";
import {
  ProductOpeningBalanceEditType,
  setProductOpeningBalanceEdit
} from "../../accounts-slice";
import { Utils } from "../../../../utils/utils";
import { AllTables} from "../../../../app/maps/database-tables-map";
import { ProductsStockTransfer } from "./products-stock-transfer-button";
import { useEffect, useState } from "react";
import { showCompAppLoader } from "../../../../controls/redux-components/comp-slice";
import { CompInstances } from "../../../../controls/redux-components/comp-instances";

export function ProductsOpeningBalancesGrid() {
  const [apiData, setApiData] = useState([])
  const instance = DataInstancesMap.productsOpeningBalances;
  const dispatch: AppDispatchType = useDispatch();
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
  }, [branchId, buCode, finYearId]);


  return (
    <div className="border-2 border-amber-100 rounded-lg">
      <CompSyncFusionGridToolbar
        CustomControl={() => <ProductsStockTransfer instance={instance} />}
        className="mt-2 mr-6"
        minWidth="400px"
        title={"Products opening balances"}
        isPdfExport={true}
        isExcelExport={true}
        isCsvExport={true}
        instance={instance}
      />

      <CompSyncFusionGrid
        aggregates={getAggregates()}
        buCode={buCode}
        className="mt-4"
        columns={getColumns()}
        dataSource={apiData}
        deleteColumnWidth={40}
        editColumnWidth={40}
        height="calc(100vh - 260px)"
        instance={instance}
        loadData={loadData}
        minWidth="400px"
        onDelete={handleOnDelete}
        onEdit={handleOnEdit}
      />
    </div>
  );

  function customClosingAggregate(data: any) {
    const res: Decimal = (data?.result || data) // when you pdf or excel export then figures are available in data and not in data.result
      .reduce((acc: Decimal, current: any) => {
        return acc.plus(
          new Decimal(current["openingPrice"]).times(
            new Decimal(current["qty"])
          )
        ); // Multiply and add with Decimal
      }, new Decimal(0)); // Initialize accumulator as Decimal
    return res.toNumber(); // Get the absolute value and convert back to a number
  }

  function getAggregates(): SyncFusionGridAggregateType[] {
    return [
      {
        columnName: "label",
        type: "Count",
        field: "label",
        format: "N0",
        footerTemplate: productAggrTemplate
      },
      {
        columnName: "info",
        customAggregate: (data: any) => customClosingAggregate(data),
        field: "info",
        format: "N2",
        footerTemplate: (props: any) => {
          return (
            <span className="mr-3 font-semibold">Value: {props.Custom}</span>
          );
        },
        type: "Custom"
      }
    ];
  }

  function productAggrTemplate(props: any) {
    return <span className="text-xs">Count: {props.Count}</span>;
  }

  function getColumns(): SyncFusionGridColumnType[] {
    return [
      {
        field: "index",
        headerText: "#",
        type: "number",
        width: 80,
        textAlign: "Right"
      },
      {
        field: "productCode",
        headerText: "Code",
        type: "string",
        width: 80,
        textAlign: "Right"
      },
      { field: "catName", headerText: "Cat", type: "string", width: 100 },
      { field: "brandName", headerText: "Brand", type: "string", width: 80 },
      { field: "label", headerText: "Label", type: "string", width: 150 },
      {
        field: "qty",
        headerText: "Qty",
        type: "number",
        width: 80,
        textAlign: "Right"
      },
      {
        field: "openingPrice",
        headerText: "Op price",
        type: "number",
        format: "N2",
        width: 100,
        textAlign: "Right"
      },
      {
        field: "lastPurchaseDate",
        headerText: "Pur dt",
        type: "date",
        width: 90,
        format: currentDateFormat
      },
      { field: "info", headerText: "Details", type: "string", width: 250 },
      {
        field: "id",
        type: "string",
        width: 0,
        textAlign: "Right",
        isPrimaryKey: true,
        visible: false
      },
      {
        field: "isActive",
        headerText: "Active",
        type: "boolean",
        width: 80,
      }
    ];
  }

  async function handleOnDelete(id: string | number) {
    Utils.showDeleteConfirmDialog(doDelete);
    async function doDelete() {
      try {
        await Utils.doGenericDelete({
          buCode: buCode || "",
          tableName: AllTables.ProductOpBal.name,
          deletedIds: [id]
        });
        Utils.showSaveMessage();
        await loadData();
      } catch (e: any) {
        console.log(e);
      }
    }
  }

  async function handleOnEdit(args: ProductOpeningBalanceEditType) {
    dispatch(
      setProductOpeningBalanceEdit({
        id: args.id,
        catId: args.catId,
        brandId: args.brandId,
        labelId: args.productId,
        qty: args.qty,
        openingPrice: args.openingPrice,
        lastPurchaseDate: args.lastPurchaseDate
      })
    );
  }

  async function loadData() {
    const state: RootStateType = Utils.getReduxState();
    const finYearId = state.login.currentFinYear?.finYearId;
    const branchId = state.login.currentBranch?.branchId;
    const buCode = state.login.currentBusinessUnit?.buCode;
    dispatch(showCompAppLoader({
      isVisible: true,
      instance: CompInstances.compAppLoader
    }))

    try {
      const res: any = await Utils.doGenericQuery({
        buCode: buCode || '',
        dbName: dbName || '',
        dbParams: decodedDbParamsObject,
        instance: instance,
        sqlArgs: {
          branchId: branchId,
          finYearId: finYearId
        },
        sqlId: SqlIdsMap.getProductsOpeningBalances
      })
      setApiData(res?.[0]?.jsonResult?.openingBalances || []) // Set the data to state
    } catch (e: any) {
      console.log(e)
    } finally {
      dispatch(showCompAppLoader({
        isVisible: false,
        instance: CompInstances.compAppLoader
      }))
    }
  }
}
