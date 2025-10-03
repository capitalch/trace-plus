import { RootStateType } from "../../../../app/store";
import { useCallback, useEffect, useState } from "react";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import { CompSyncFusionGrid, SyncFusionGridAggregateType, SyncFusionGridColumnType } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import clsx from "clsx";
import { DataInstancesMap } from "../../../../app/maps/data-instances-map";
import { format } from "date-fns";
import { Utils } from "../../../../utils/utils";
import { SqlIdsMap } from "../../../../app/maps/sql-ids-map";
import { ArrowLeft } from "lucide-react";
import { RowDataBoundEventArgs } from "@syncfusion/ej2-react-grids";
import { Messages } from "../../../../utils/messages";
import { AllTables } from "../../../../app/maps/database-tables-map";
import { useFormContext } from "react-hook-form";
import { SalesReturnFormDataType } from "./all-sales-return";
import { generateSalesReturnInvoicePDF } from "./all-sales-return-invoice-jspdf";

interface AllSalesReturnViewProps {
  className?: string;
  onBack: () => void;
}

export function AllSalesReturnView({ className, onBack }: AllSalesReturnViewProps) {
  const instance = DataInstancesMap.allSalesReturn
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
  const { populateFormOverId, getSalesReturnEditDataOnId }:any = useFormContext<SalesReturnFormDataType>();

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
        sqlId: SqlIdsMap.getAllSales, // Reusing the sales query with sales return transaction type
        sqlArgs: {
          branchId: isAllBranchesState
            ? null
            : state.login.currentBranch?.branchId,
          finYearId: finYearId,
          tranTypeId: Utils.getTranTypeId("SaleReturn"),
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
        title={``}
        isPdfExport={true}
        isExcelExport={true}
        isCsvExport={true}
        instance={instance}
      />
      <CompSyncFusionGrid
        aggregates={getAggregates()}
        // allowPaging={true}
        allowTextWrap={false}
        // pageSettings={{ pageSize: 500, pageSizes: [500, 1000, 2000, 5000, 10000] }}
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
        minWidth="400px"
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
    return ([
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
          <span className="text-right text-xs">Total: {Utils.toDecimalFormat(props.Sum)}</span>
        )
      },
    ]);
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
        headerText: "Return Date",
        type: "string",
        width: 100,
        valueAccessor: (field: string, data: any) =>
          format(data?.[field], currentDateFormat)
      },
      {
        field: "autoRefNo",
        headerText: "Ref No",
        type: "string",
        width: 140,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "userRefNo",
        headerText: "User Ref No",
        type: "string",
        width: 140,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "productDetails",
        headerText: "Product Details",
        type: "string",
        width: 200,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: 'accounts',
        headerText: 'Customer',
        width: 150,
        textAlign: 'Left',
        type: 'string',
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "amount",
        headerText: "Return Amount",
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
        width: 120
      },
      {
        field: "cgst",
        headerText: "CGST",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100
      },
      {
        field: "sgst",
        headerText: "SGST",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100
      },
      {
        field: "igst",
        headerText: "IGST",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 100
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
        headerText: "Qty",
        type: "number",
        format: "N2",
        textAlign: "Right",
        width: 80
      },
      {
        field: "hsns",
        headerText: "HSN Codes",
        type: "string",
        width: 120,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "remarks",
        headerText: "Remarks",
        type: "string",
        width: 150,
        clipMode: 'EllipsisWithTooltip'
      },
      {
        field: "lineRemarks",
        headerText: "Line Remarks",
        type: "string",
        width: 150,
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
      // Get the sales return details for the selected row
      const salesReturnEditData = await getSalesReturnEditDataOnId(data.id)
      if (!salesReturnEditData) {
        Utils.showErrorMessage(Messages.errNoDataFound)
        return
      }
      generateSalesReturnInvoicePDF(salesReturnEditData, branchName || '', currentDateFormat)
    } catch (error) {
      console.error('Error generating PDF:', error)
      Utils.showErrorMessage(Messages.errGeneratingPdf)
    }
  }

  function handleOnRowDataBound(args: RowDataBoundEventArgs): void {
    const rowData: any = args.data;
    if (args.row) {
      if (rowData.bColor) {
        args.row.classList.add("bg-green-50");
      }
    }
  }
}