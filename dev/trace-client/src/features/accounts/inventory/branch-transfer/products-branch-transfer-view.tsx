import { useDispatch } from "react-redux";
import { DatabaseTablesMap } from "../../../../app/graphql/maps/database-tables-map";
import { SqlIdsMap } from "../../../../app/graphql/maps/sql-ids-map";
import { AppDispatchType } from "../../../../app/store/store";
import {
  CompSyncFusionGrid,
  SyncFusionGridAggregateType,
  SyncFusionGridColumnType
} from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid";
import { CompSyncFusionGridToolbar } from "../../../../controls/components/syncfusion-grid/comp-syncfusion-grid-toolbar";
import { Utils } from "../../../../utils/utils";
import { useUtilsInfo } from "../../../../utils/utils-info-hook";
import {
  setActiveTabIndex,
  showCompAppLoader
} from "../../../../controls/redux-components/comp-slice";
import { useEffect, useRef, useState } from "react";
import ReactSlidingPane from "react-sliding-pane";
import { PDFViewer } from "@react-pdf/renderer";
import { ProductsBranchTransferPdf } from "./products-branch-transfer-pdf";
import { BranchTransferJsonResultType} from "./products-branch-transfer-main/products-branch-transfer-main";
import { CompInstances } from "../../../../controls/redux-components/comp-instances";
import { format } from "date-fns";
import { Messages } from "../../../../utils/messages";

export function ProductsBranchTransferView({ instance }: { instance: string }) {
  const dispatch: AppDispatchType = useDispatch();
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const meta = useRef<BranchTransferJsonResultType>({
    branchTransfers: [],
    tranH: {} as any
  });

  const {
    buCode,
    branchId,
    context,
    currentDateFormat,
    dbName,
    decodedDbParamsObject,
    finYearId
  } = useUtilsInfo();

  useEffect(() => {
    const loadData = context?.CompSyncFusionGrid[instance]?.loadData
    if (loadData && buCode) {
      loadData()
    }
  }, [buCode, finYearId, branchId]);


  return (
    <div className="flex flex-col w-full">
      <CompSyncFusionGridToolbar
        className="mt-2 mr-6"
        minWidth="600px"
        title="Branch Transfer View"
        isPdfExport={true}
        isExcelExport={true}
        isCsvExport={true}
        isLastNoOfRows={false}
        instance={instance}
      />

      <CompSyncFusionGrid
        aggregates={getAggregates()}
        buCode={buCode}
        className="mr-6 mt-4"
        columns={getColumns()}
        dbName={dbName}
        dbParams={decodedDbParamsObject}
        deleteColumnWidth={40}
        editColumnWidth={40}
        height="calc(100vh - 410px)"
        allowPaging={true}
        instance={instance}
        minWidth="1300px"
        onDelete={handleOnDelete}
        onEdit={handleOnEdit}
        onPreview={handleOnPreview}
        previewColumnWidth={40}
        sqlId={SqlIdsMap.getAllBranchTransferHeaders}
        sqlArgs={{ branchId: branchId, finYearId: finYearId }}
      />
      {/* Sliding Pane */}
      <ReactSlidingPane
        className="bg-gray-300"
        isOpen={isPaneOpen}
        title="Branch Transfer"
        from="right"
        width="80%"
        onRequestClose={() => setIsPaneOpen(false)}
      >
        {/* PDF Viewer inside the sliding pane */}
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <ProductsBranchTransferPdf
            branchTransfers={meta.current.branchTransfers}
            tranH={meta.current.tranH}
          />
        </PDFViewer>
      </ReactSlidingPane>
    </div>
  );

  function getAggregates(): SyncFusionGridAggregateType[] {
    return [
      {
        columnName: "tranDate",
        type: "Count",
        field: "tranDate",
        format: "N0",
        footerTemplate: (props: any) => (
          <span className="text-xs">Count: {props.Count}</span>
        )
      },
      {
        columnName: "amount",
        type: "Sum",
        field: "amount",
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
        field: "tranDate",
        headerText: "Date",
        type: "date",
        width: 80,
        template: (props: any) =>
          format(props.tranDate, currentDateFormat)
      },
      {
        field: "autoRefNo",
        headerText: "Auto Ref No",
        type: "string",
        width: 100
      },
      {
        field: "sourceBranchName",
        headerText: "Src Branch",
        type: "string",
        width: 100
      },
      {
        field: "destBranchName",
        headerText: "Dest Branch",
        type: "string",
        width: 100
      },
      {
        field: "userRefNo",
        headerText: "User Ref",
        type: "string",
        width: 80
      },
      {
        field: "productDetails",
        headerText: "Prod Details",
        type: "string",
        width: 120
      },
      {
        field: "serialNumbers",
        headerText: "Ser No",
        type: "string",
        width: 80
      },
      {
        field: "productCodes",
        headerText: "Prod Codes",
        type: "string",
        width: 100
      },
      {
        field: "amount",
        textAlign: "Right",
        headerText: "Amount",
        type: "number",
        format: "N2",
        width: 100
      },
      {
        field: "remarks",
        headerText: "Remarks",
        type: "string",
        width: 100
      },
      {
        field: "lineRefNo",
        headerText: "Line Ref no",
        type: "string",
        width: 100
      },
      {
        field: "lineRemarks",
        headerText: "Line Remarks",
        type: "string",
        width: 100
      }
    ];
  }

  async function handleOnDelete(id: number | string) {
    Utils.showDeleteConfirmDialog(doDelete);
    async function doDelete() {
      try {
        if (!id) {
          Utils.showErrorMessage(Messages.errDeletingRecord)
          return
        }
        await Utils.doGenericDelete({
          buCode: buCode || "",
          tableName: DatabaseTablesMap.TranH,
          deletedIds: [id]
        });
        Utils.showSaveMessage();
        const loadData = context.CompSyncFusionGrid[instance].loadData;
        if (loadData) {
          await loadData();
        }
      } catch (e: any) {
        console.log(e);
      }
    }
  }

  async function handleOnEdit(props: any) {
    dispatch(
      setActiveTabIndex({
        instance: instance,
        id: props.id,
        activeTabIndex: 0
      })
    );
  }

  async function handleOnPreview(props: any) {
    dispatch(
      showCompAppLoader({
        isVisible: true,
        instance: CompInstances.compAppLoader
      })
    );
    try {
      const res: any = await Utils.doGenericQuery({
        buCode: buCode || "",
        dbName: dbName || "",
        dbParams: decodedDbParamsObject || {},
        instance: instance,
        sqlArgs: {
          id: props.id
        },
        sqlId: SqlIdsMap.getBranchTransferDetailsOnTranHeaderId
      });
      const jsonResult: BranchTransferJsonResultType = res?.[0]?.jsonResult;
      jsonResult.tranH.currentDateFormat = currentDateFormat;
      meta.current = jsonResult;
      setIsPaneOpen(true);
    } catch (e: any) {
      console.log(e);
    } finally {
      dispatch(
        showCompAppLoader({
          isVisible: false,
          instance: CompInstances.compAppLoader
        })
      );
    }
  }
}
