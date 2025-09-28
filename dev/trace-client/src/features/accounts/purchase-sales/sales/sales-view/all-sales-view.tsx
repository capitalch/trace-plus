import { RootStateType } from "../../../../../app/store";
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
import { SalesFormDataType, /*ShippingInfoType,*/ } from "../all-sales";
// import { /*ContactsType, ExtGstTranDType, SalePurchaseDetailsWithExtraType, TranDExtraType, TranHType*/ SalePurchaseEditDataType } from "../../../../../utils/global-types-interfaces-enums";
import { useFormContext } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
// import Decimal from "decimal.js";
import { generateSalesInvoicePDF } from "../all-sales-invoice-jspdf";

interface AllSalesViewProps {
  className?: string;
  onBack: () => void;
}

export function AllSalesView({ className, onBack }: AllSalesViewProps) {
  const instance = DataInstancesMap.allSales
  const [rowsData, setRowsData] = useState<any[]>([]);
  const {
    currentDateFormat,
    buCode,
    branchId,
    dbName,
    decodedDbParamsObject,
    finYearId,
    branchName
  } = useUtilsInfo();
  // const { getValues }: any = useFormContext<SalesFormDataType>();
  const { populateFormOverId, getSalesEditDataOnId }:any = useFormContext<SalesFormDataType>();

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
        sqlId: SqlIdsMap.getAllSales,
        sqlArgs: {
          branchId: isAllBranchesState
            ? null
            : state.login.currentBranch?.branchId,
          finYearId: finYearId,
          tranTypeId: Utils.getTranTypeId("Sales"),
        },
      });
      let currentId: number | null | undefined = null;
      let currentColor = false;

      rowsData.forEach((row: any) => {
        if (row.id !== currentId) {
          currentId = row.id;
          currentColor = !currentColor;
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
        CustomControl={() => (
          <div className="flex items-center mr-4">
            <button
              onClick={onBack}
              className="flex items-center justify-center px-4 py-2 font-medium text-sm text-white whitespace-nowrap bg-blue-500 rounded-md shadow-sm transition-colors hover:bg-blue-600 space-x-2"
            >
              <ArrowLeft size={16} className="flex-shrink-0" />
              <span>BACK</span>
            </button>
          </div>
        )}
        className="mr-4"
        minWidth="600px"
        title={`Sales View`}
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
        height="calc(100vh - 260px)"
        instance={instance}
        isSmallerFont={true}
        loadData={loadData}
        minWidth="1400px"
        onEdit={handleOnEdit}
        onDelete={handleOnDelete}
        onPreview={handleOnPreview}
        onRowDataBound={handleOnRowDataBound}
        previewColumnWidth={40}
        rowHeight={35}
        searchFields={['autoRefNo', 'userRefNo', 'productDetails', 'contactDetails', 'accounts', 'amount', 'serialNumbers', 'productCodes', 'hsns', 'remarks', 'lineRemarks']}
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
          <span className="text-right text-xs">Count: {props.Count}</span>
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
        valueAccessor: (field: string, data: any) =>
          format(data?.[field], currentDateFormat)
      },
      {
        field: "autoRefNo",
        headerText: "Invoice No",
        type: "string",
        width: 140
      },
      {
        field: "userRefNo",
        headerText: "Ref No",
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
        field: 'contactDetails',
        headerText: 'Contact',
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
        loadData();
      } catch (e: any) {
        console.log(e)
      }
    })
  }

  async function handleOnEdit(data: any) {
    await populateFormOverId(data.id);
    onBack()
  }

  async function handleOnPreview(data: any) {
    try {
      // Get the sales details for the selected row
      const salesEditData = await getSalesEditDataOnId(data.id)
      if (!salesEditData) {
        Utils.showErrorMessage(Messages.errNoDataFound)
        return
      }
      generateSalesInvoicePDF(salesEditData, branchName || '', currentDateFormat)
    } catch (error) {
      console.error('Error generating PDF:', error)
      Utils.showErrorMessage(Messages.errGeneratingPdf)
    }
  }

  function handleOnRowDataBound(args: RowDataBoundEventArgs) {
    const rowData: any = args.data;
    if (args.row) {
      if (rowData.bColor) {
        args.row.classList.add("bg-green-50");
      }
    }
  }
}