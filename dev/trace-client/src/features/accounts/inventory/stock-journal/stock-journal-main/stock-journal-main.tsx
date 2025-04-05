import { FormProvider, useForm } from "react-hook-form";
import { format } from "date-fns";
import { ProductLineItem, TranHeaderType } from "../../shared-types";
import { StockJournalHeader } from "./stock-journal-header";
import { StockJournalTabs } from "./stock-journal-tabs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../app/store/store";
import { useEffect } from "react";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { Messages } from "../../../../../utils/messages";
import _ from "lodash";
import { resetTranHeaderIdToEdit } from "../../../accounts-slice";
import { XDataObjectType } from "../../../../../utils/global-types-interfaces-enums";
import { DatabaseTablesMap } from "../../../../../app/graphql/maps/database-tables-map";
import { StockJournalCrown } from "../stock-journal-crown";
// import ReactSlidingPane from "react-sliding-pane";
// import { PDFViewer } from "@react-pdf/renderer";
// import { StockJournalPdf } from "../stock-journal-pdf";

export function StockJournalMain({ instance }: { instance: string }) {
  const dispatch: AppDispatchType = useDispatch();

  const {
    branchId,
    buCode,
    context,
    dbName,
    decodedDbParamsObject,
    finYearId
  } = useUtilsInfo();

  const selectedTranHeaderId = useSelector(
    (state: RootStateType) => state.accounts.tranHeaderEdit[instance]?.id
  );

  const methods = useForm<StockJournalType>({
    mode: "onTouched",
    criteriaMode: "all",
    defaultValues: {
      autoRefNo: "",
      tranDate: format(new Date(), "yyyy-MM-dd"),
      userRefNo: null,
      remarks: null,
      inputLineItems: [
        {
          productCode: null,
          productDetails: null,
          lineRefNo: null,
          qty: 1,
          price: 0,
          lineRemarks: null,
          serialNumbers: null
        }
      ],
      outputLineItems: [
        {
          productCode: null,
          productDetails: null,
          lineRefNo: null,
          qty: 1,
          price: 0,
          lineRemarks: null,
          serialNumbers: null
        }
      ]
    }
  });
  const { reset } = methods;
  const extendedMethods = { ...methods, xReset };

  useEffect(() => {
    if (selectedTranHeaderId) {
      loadStockJournalOnTranHeaderId();
    }
  }, [selectedTranHeaderId]);

  useEffect(() => {
    return () => {
      dispatch(
        resetTranHeaderIdToEdit({
          instance: instance
        })
      );
    };
  }, [dispatch, instance]);

  return (
    <div className="h-[calc(100vh-240px)] relative">
      <FormProvider {...extendedMethods}>
        <form
          className="flex flex-col gap-6 mr-6 min-w-[85rem]"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <StockJournalCrown className="absolute -top-5.5 right-6" />
          <StockJournalHeader instance={instance} />
          <StockJournalTabs instance={instance} />
        </form>
      </FormProvider>
    </div>
  );

  async function loadStockJournalOnTranHeaderId() {
    const res: any = await Utils.doGenericQuery({
      buCode: buCode || "",
      dbName: dbName || "",
      dbParams: decodedDbParamsObject || {},
      instance: instance,
      sqlArgs: {
        id: selectedTranHeaderId
      },
      sqlId: SqlIdsMap.getStockJournalOnTranHeaderId
    });
    const jsonResult: StockJournalJsonResultType = res?.[0]?.jsonResult;
    if (_.isEmpty(jsonResult)) {
      Utils.showAlertMessage("Oops!", Messages.messResultSetEmpty);
      return;
    }
    populateData(jsonResult);
  }

  async function onSubmit(data: StockJournalType) {
    const xData: XDataObjectType = getTranHeaderRow();
    try {
      await Utils.doGenericUpdate({
        buCode: buCode || "",
        tableName: DatabaseTablesMap.TranH,
        xData: xData
      });
      Utils.showSaveMessage();
      xReset();
    } catch (e) {
      console.log(e);
    }

    function getTranHeaderRow() {
      return {
        id: (data.id as number) || undefined,
        autoRefNo: data.autoRefNo,
        branchId: branchId,
        finYearId: finYearId,
        jData: "{}",
        posId: 1,
        remarks: data.remarks,
        tranDate: data.tranDate,
        tranTypeId: 11,
        userRefNo: data.userRefNo,
        xDetails: getXDetails()
      };
    }

    function getXDetails() {
      const xDataSourceItems = data.inputLineItems.map(
        (item: ProductLineItem) => {
          const formattedSerialNumbers = item.serialNumbers
            ? item.serialNumbers
              .split(/[,;]\s*/) // Split by ',' or ';' with or without spaces
              .filter((sn) => sn.trim() !== "") // Remove empty entries
              .join(", ") // Join with ', '
            : null;
          return {
            id: item.id || undefined,
            jData: formattedSerialNumbers
              ? JSON.stringify({ serialNumbers: formattedSerialNumbers })
              : null,
            lineRefNo: item.lineRefNo,
            lineRemarks: item.lineRemarks,
            price: item.price,
            productId: item.productId,
            qty: item.qty,
            dc: "C"
          };
        }
      );
      const xDataOutputItems = data.outputLineItems.map(
        (item: ProductLineItem) => {
          const formattedSerialNumbers = item.serialNumbers
            ? item.serialNumbers
              .split(/[,;]\s*/) // Split by ',' or ';' with or without spaces
              .filter((sn) => sn.trim() !== "") // Remove empty entries
              .join(", ") // Join with ', '
            : null;
          return {
            id: item.id || undefined,
            jData: formattedSerialNumbers
              ? JSON.stringify({ serialNumbers: formattedSerialNumbers })
              : null,
            lineRefNo: item.lineRefNo,
            lineRemarks: item.lineRemarks,
            price: item.price,
            productId: item.productId,
            qty: item.qty,
            dc: "D"
          };
        }
      );
      return {
        tableName: DatabaseTablesMap.StockJournal,
        fkeyName: "tranHeaderId",
        deletedIds: context.DataInstances?.[instance]?.deletedIds || [],
        xData: xDataSourceItems.concat(xDataOutputItems)
      };
    }
  }

  function populateData(jsonResult: StockJournalJsonResultType) {
    const tranH = jsonResult.tranH;
    const stockJournals = jsonResult.stockJournals;
    if (
      _.isEmpty(tranH) ||
      _.isEmpty(stockJournals) ||
      (Array.isArray(stockJournals) && stockJournals.length === 0)
    ) {
      Utils.showAlertMessage("Oops!", Messages.messResultSetEmpty);
      return;
    }

    const inputLineItems = stockJournals
      .filter((item: StockJournalInfoType) => item.dc === "C")
      .map((item: StockJournalInfoType) => {
        return {
          id: item.id,
          lineRefNo: item.lineRefNo,
          lineRemarks: item.lineRemarks,
          price: item.price,
          productCode: item.productCode,
          productDetails: item.productDetails,
          productId: item.productId,
          qty: item.qty,
          serialNumbers: item.serialNumbers,
          tranHeaderId: item.tranHeaderId,
          upcCode: item.upcCode
        };
      });
    const outputLineItems = stockJournals
      .filter((item: StockJournalInfoType) => item.dc === "D")
      .map((item: StockJournalInfoType) => {
        return {
          id: item.id,
          lineRefNo: item.lineRefNo,
          lineRemarks: item.lineRemarks,
          price: item.price,
          productCode: item.productCode,
          productDetails: item.productDetails,
          productId: item.productId,
          qty: item.qty,
          serialNumbers: item.serialNumbers,
          tranHeaderId: item.tranHeaderId,
          upcCode: item.upcCode
        };
      });

    reset(
      // Reset the form with the new data should be done all together
      {
        id: tranH.id,
        autoRefNo: tranH.autoRefNo,
        remarks: tranH.remarks,
        tranDate: tranH.tranDate,
        userRefNo: tranH.userRefNo,
        inputLineItems: inputLineItems,
        outputLineItems: outputLineItems
      },
      { keepDirty: false } // Ensure the form is not marked as dirty
    );
  }

  function xReset() {
    reset({
      id: undefined,
      autoRefNo: "",
      tranDate: format(new Date(), "yyyy-MM-dd"),
      userRefNo: null,
      remarks: null,
      inputLineItems: [
        {
          id: undefined,
          productId: undefined,
          productCode: null,
          productDetails: null,
          lineRefNo: null,
          qty: 1,
          price: 0,
          lineRemarks: null,
          tranHeaderId: undefined,
          serialNumbers: null,
          upcCode: null
        }
      ],
      outputLineItems: [
        {
          id: undefined,
          productId: undefined,
          productCode: null,
          productDetails: null,
          lineRefNo: null,
          qty: 1,
          price: 0,
          lineRemarks: null,
          tranHeaderId: undefined,
          serialNumbers: null,
          upcCode: null
        }
      ]
    });
    // If edited then reset tranHeaderId
    dispatch(
      resetTranHeaderIdToEdit({
        instance: instance
      })
    );
    // Reset deletedIds
    if (context.DataInstances?.[instance]) {
      context.DataInstances[instance].deletedIds = [];
    }
  }
}

export type StockJournalType = {
  id?: string | number;
  autoRefNo?: string | null;
  inputLineItems: ProductLineItem[];
  outputLineItems: ProductLineItem[];
  remarks?: string | null;
  tranDate: string;
  userRefNo?: string | null;
};

export type StockJournalJsonResultType = {
  stockJournals: StockJournalInfoType[];
  tranH: TranHeaderType;
};

type StockJournalInfoType = {
  id: number;
  dc: string;
  lineRefNo: string;
  lineRemarks: string | null;
  price: number;
  productCode: string | null;
  productDetails?: string | null;
  productId?: number;
  qty: number;
  serialNumbers: string | null;
  tranHeaderId: number;
  upcCode: string | null;
};
