import { AppDispatchType, RootStateType } from "../../../../../app/store";
import { useCallback, useEffect, useState } from "react";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import clsx from "clsx";
import { DataInstancesMap } from "../../../../../app/maps/data-instances-map";
import { format } from "date-fns";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/maps/sql-ids-map";
import { Messages } from "../../../../../utils/messages";
import { AllTables } from "../../../../../app/maps/database-tables-map";
import { RowDataBoundEventArgs } from "@syncfusion/ej2-react-grids";
import { PurchaseFormDataType } from "./all-purchases";
import { ExtGstTranDType, SalePurchaseDetailsWithExtraType, SalePurchaseEditDataType, TranDType, TranHType } from "../../../../../utils/global-types-interfaces-enums";
import { useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setActiveTabIndex } from "../../../../../controls/redux-components/comp-slice";
import { generatePurchaseInvoicePDF } from "./purchase-invoice-jspdf";
import { setInvoicExists } from "../purchase-slice";

export function AllPurchasesView({ className }: { className?: string }) {
  const dispatch: AppDispatchType = useDispatch()
  const instance = DataInstancesMap.allPurchases
  const [rowsData, setRowsData] = useState<any[]>([]);
  const {
    currentDateFormat,
    buCode,
    branchId,
    branchName,
    dbName,
    decodedDbParamsObject,
    finYearId,
  } = useUtilsInfo();

  const {
    reset,
    setValue,
    populateFormFromId,
    getPurchaseEditDataOnId
  } = useFormContext<PurchaseFormDataType>() as any;

  const loadData = useCallback(async () => {
    try {
      const state: RootStateType = Utils.getReduxState();
      const isAllBranchesState = state.reduxComp.compSwitch[instance];
      const buCode = state.login.currentBusinessUnit?.buCode;
      const finYearId = state.login.currentFinYear?.finYearId;

      const rowsData: any[] = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject,
        instance: instance,
        sqlId: SqlIdsMap.getAllPurchases,
        sqlArgs: {
          branchId: isAllBranchesState
            ? null
            : state.login.currentBranch?.branchId,
          finYearId: finYearId,
          tranTypeId: 5,
        },
      });
      let currentId: number | null | undefined = null;
      let currentColor = false;

      rowsData.forEach((row: any) => {
        if (row.id !== currentId) {
          currentId = row.id;
          currentColor = !currentColor; // toggle color when id changes
        }
        row.bColor = currentColor;
      });
      setRowsData(rowsData);
    } catch (e: any) {
      console.error(e);
    }
  }, [decodedDbParamsObject, dbName, instance]);

  useEffect(() => {
    loadData();
  }, [loadData, finYearId, buCode, branchId]);

  return (
    <div className={clsx("flex flex-col w-full", className)}>
      <CompSyncFusionGridToolbar
        className="mr-4"
        minWidth="600px"
        title={`Purchases View`}
        isPdfExport={true}
        isExcelExport={true}
        isCsvExport={true}
        instance={instance}
      />

      <CompSyncFusionGrid
        aggregates={getAggregates()}
        allowPaging={true}
        allowTextWrap={false}
        pageSettings={{ pageSize: 500, pageSizes: [500, 1000, 2000, 5000, 10000] }}
        buCode={buCode}
        className="mt-2"
        columns={getColumns()}
        dataSource={rowsData}
        deleteColumnWidth={40}
        editColumnWidth={40}
        hasCheckBoxSelection={true}
        height="calc(100vh - 285px)"
        instance={instance}
        isSmallerFont={true}
        loadData={loadData}
        minWidth="400px"
        onCopy={handleOnCopy}
        onEdit={handleOnEdit}
        onDelete={handleOnDelete}
        onPreview={handleOnPreview}
        onRowDataBound={handleOnRowDataBound}
        previewColumnWidth={40}
        rowHeight={35}
        searchFields={['autoRefNo', 'userRefNo', 'productDetails', 'accounts', 'amount', 'serialNumbers', 'productCodes', 'hsns', 'remarks', 'lineRemarks']}
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
          <span className="text-right text-xs">Cnt: {props.Count}</span>
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
        columnName: "aggr",
        type: "Sum",
        field: "aggr",
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
        field: 'index',
        headerText: '#',
        width: 70,
        textAlign: 'Left',
        type: 'number',
      },
      {
        field: 'id',
        headerText: 'Id',
        width: 90,
        textAlign: 'Left',
        type: 'number',
        visible: false
      },
      {
        field: "tranDate",
        headerText: "Date",
        type: "string",
        width: 75,
        // Otherwise PDF export error
        valueAccessor: (field: string, data: any) =>
          format(data?.[field], currentDateFormat)
      },
      {
        field: "autoRefNo",
        headerText: "Ref No",
        type: "string",
        width: 140
      },
      {
        field: "userRefNo",
        headerText: "Invoice No",
        type: "string",
        width: 140,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "productDetails",
        headerText: "Product Details",
        type: "string",
        width: 160,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: 'accounts',
        headerText: 'Account',
        width: 150,
        textAlign: 'Left',
        type: 'string',
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "amount",
        headerText: "Amount",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 140
      },
      {
        field: "aggr",
        headerText: "Aggregate",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 130
      },
      {
        field: "cgst",
        headerText: "CGST",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 110
      },
      {
        field: "sgst",
        headerText: "SGST",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 110
      },
      {
        field: "igst",
        headerText: "IGST",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 110
      },
      {
        field: "serialNumbers",
        headerText: "Serial Numbers",
        type: "string",
        width: 160,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "productCodes",
        headerText: "Product Codes",
        type: "string",
        width: 160,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "productQty",
        headerText: "Pr Qty",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 80
      },
      {
        field: "hsns",
        headerText: "HSN Codes",
        type: "string",
        width: 160,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "remarks",
        headerText: "Remarks",
        type: "string",
        width: 120,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "lineRemarks",
        headerText: "Line Remarks",
        type: "string",
        width: 200,
        clipMode: 'EllipsisWithTooltip'
      },
    ];
  }

  async function handleOnCopy(data: PurchaseFormDataType) {
    const editData: SalePurchaseEditDataType | null = await getPurchaseEditDataOnId(data.id)
    if (!editData) {
      Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
      return
    }
    setValue('purchaseEditData', undefined)
    const tranH: TranHType = editData.tranH
    const tranD: TranDType[] = editData.tranD
    const extGsTranD: ExtGstTranDType = editData.extGstTranD
    const salePurchaseDetails: SalePurchaseDetailsWithExtraType[] = editData.salePurchaseDetails

    reset({
      id: undefined,
      tranTypeId: tranH.tranTypeId,
      isGstInvoice: Boolean(extGsTranD?.id),
      debitAccId: tranD.find((item) => item.dc === "D")?.accId,
      creditAccId: tranD.find((item) => item.dc === "C")?.accId,
      gstin: extGsTranD?.gstin,
      isIgst: extGsTranD?.igst ? true : false,

      purchaseEditData: undefined,
      purchaseLineItems: salePurchaseDetails.map((item) => ({
        id: undefined,
        productId: item.productId,
        productCode: item.productCode,
        upcCode: item.upcCode || null,
        productDetails: `${item.brandName} ${item.catName} ${item.label}}`,
        hsn: item.hsn.toString(),
        qty: 1,
        gstRate: item.gstRate,
        price: item.price,
        discount: item.discount,
        priceGst: item.priceGst,
        lineRemarks: null,
        serialNumbers: null
      }))

    })
    dispatch(setActiveTabIndex({ instance: instance, activeTabIndex: 0 })) // Switch to the first tab (Edit tab)
    dispatch(setInvoicExists(false))
  }

  async function handleOnDelete(id: number | string) {
    Utils.showDeleteConfirmDialog(async () => {
      try {
        if (!id) {
          Utils.showAlertMessage("Error", Messages.errDeletingRecord)
          return
        }
        await Utils.doGenericDelete({
          buCode: buCode || '',
          tableName: AllTables.TranH.name,
          deletedIds: [id]
        })
        Utils.showSaveMessage();
        loadData(); // Reload data after deletion
      } catch (e: any) {
        console.log(e)
      }
    })
  }

  async function handleOnEdit(data: any) {
    await populateFormFromId(data.id)
  }

  async function handleOnPreview(data: PurchaseFormDataType) {
    const purchaseEditData: SalePurchaseEditDataType | null = await getPurchaseEditDataOnId(data.id)
    if (!purchaseEditData) {
      Utils.showErrorMessage(Messages.errNoDataFoundForEdit)
      return
    }
    generatePurchaseInvoicePDF(purchaseEditData, branchName ?? '', currentDateFormat)
  }

  function handleOnRowDataBound(args: RowDataBoundEventArgs) {
    const rowData: any = args.data;

    if (args.row) {
      if (rowData.bColor) {
        args.row.classList.add("bg-green-50",);
      }
    }
  }
}

