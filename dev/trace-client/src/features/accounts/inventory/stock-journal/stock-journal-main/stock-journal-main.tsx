import { FormProvider, useForm } from "react-hook-form";
import { format } from "date-fns";
import { ProductLineItem, TranHeaderType } from "../../shared-definitions";
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
import Decimal from "decimal.js";

export function StockJournalMain({ instance }: { instance: string }) {
  const dispatch: AppDispatchType = useDispatch();
  const { branchId, buCode, context, dbName, decodedDbParamsObject, finYearId } = useUtilsInfo();

  const selectedTranHeaderId = useSelector(
    (state: RootStateType) => state.accounts.tranHeaderEdit[instance]?.id
  );

  const methods = useForm<StockJournalType>({
    mode: "onTouched",
    criteriaMode: "all",
    defaultValues: getDefaultValues(),
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
      dispatch(resetTranHeaderIdToEdit({ instance }));
    };
  }, [dispatch, instance]);

  return (
    <div className="h-[calc(100vh-240px)] relative">
      <FormProvider {...extendedMethods}>
        <form
          className="flex flex-col gap-4 mr-6 min-w-[85rem]"
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
      instance,
      sqlArgs: { id: selectedTranHeaderId },
      sqlId: SqlIdsMap.getStockJournalOnTranHeaderId,
    });

    const jsonResult: StockJournalJsonResultType = res?.[0]?.jsonResult;
    if (_.isEmpty(jsonResult)) {
      Utils.showAlertMessage("Oops!", Messages.messResultSetEmpty);
      return;
    }

    populateData(jsonResult);
  }

  async function onSubmit(data: StockJournalType) {
    const debits = calculateTotal(data.outputLineItems);
    const credits = calculateTotal(data.inputLineItems);

    if (debits.equals(credits)) {
      await onSave();
    } else {
      Utils.showAlertMessage('Validation Error', Messages.messStockJournalDebitCreditMismatch)
      // Utils.showConfirmDialog(
      //   "Oops!",
      //   Messages.messStockJournalDebitCreditMismatch,
      //   async () => {
      //     await onSave();
      //   }
      // );
    }
  }

  async function onSave() {
    try {
      const xData: XDataObjectType = getTranHeaderRow();
      await Utils.doGenericUpdate({
        buCode: buCode || "",
        tableName: DatabaseTablesMap.TranH,
        xData,
      });
      Utils.showSaveMessage();
      xReset();
    } catch (e) {
      console.error(e);
    }
  }

  function getTranHeaderRow() {
    return {
      id: (methods.getValues("id") as number) || undefined,
      autoRefNo: methods.getValues("autoRefNo"),
      branchId,
      finYearId,
      jData: "{}",
      posId: 1,
      remarks: methods.getValues("remarks"),
      tranDate: methods.getValues("tranDate"),
      tranTypeId: 11,
      userRefNo: methods.getValues("userRefNo"),
      xDetails: getXDetails(),
    };
  }

  function getXDetails() {
    const xDataSourceItems = mapLineItems(methods.getValues("inputLineItems"), "C");
    const xDataOutputItems = mapLineItems(methods.getValues("outputLineItems"), "D");

    return {
      tableName: DatabaseTablesMap.StockJournal,
      fkeyName: "tranHeaderId",
      deletedIds: context.DataInstances?.[instance]?.deletedIds || [],
      xData: xDataSourceItems.concat(xDataOutputItems),
    };
  }

  function populateData(jsonResult: StockJournalJsonResultType) {
    const { tranH, stockJournals } = jsonResult;

    if (_.isEmpty(tranH) || _.isEmpty(stockJournals)) {
      Utils.showAlertMessage("Oops!", Messages.messResultSetEmpty);
      return;
    }

    const inputLineItems = mapStockJournals(stockJournals, "C");
    const outputLineItems = mapStockJournals(stockJournals, "D");

    reset(
      {
        id: tranH.id,
        autoRefNo: tranH.autoRefNo,
        remarks: tranH.remarks,
        tranDate: tranH.tranDate,
        userRefNo: tranH.userRefNo,
        inputLineItems,
        outputLineItems,
      },
      { keepDirty: false }
    );
  }

  function xReset() {
    reset(getDefaultValues());
    dispatch(resetTranHeaderIdToEdit({ instance }));
    if (context.DataInstances?.[instance]) {
      context.DataInstances[instance].deletedIds = [];
    }
  }

  // Helper Functions
  function getDefaultValues(): StockJournalType {
    return {
      id: undefined,
      autoRefNo: "",
      tranDate: format(new Date(), "yyyy-MM-dd"),
      userRefNo: null,
      remarks: null,
      inputLineItems: [getEmptyLineItem()],
      outputLineItems: [getEmptyLineItem()],
    };
  }

  function getEmptyLineItem(): ProductLineItem {
    return {
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
      upcCode: null,
    };
  }

  function mapLineItems(items: ProductLineItem[], dc: string) {
    return items.map((item) => ({
      id: item.id || undefined,
      jData: formatSerialNumbers(item.serialNumbers),
      lineRefNo: item.lineRefNo,
      lineRemarks: item.lineRemarks,
      price: item.price,
      productId: item.productId,
      qty: item.qty,
      dc,
    }));
  }

  function mapStockJournals(stockJournals: StockJournalInfoType[], dc: string) {
    return stockJournals
      .filter((item) => item.dc === dc)
      .map((item) => ({
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
        upcCode: item.upcCode,
      }));
  }

  function formatSerialNumbers(serialNumbers: string | null) {
    return serialNumbers
      ? JSON.stringify({
        serialNumbers: serialNumbers
          .split(/[,;]\s*/)
          .filter((sn) => sn.trim() !== "")
          .join(", "),
      })
      : null;
  }

  function calculateTotal(items: ProductLineItem[]) {
    return items.reduce(
      (acc, item) => acc.plus(new Decimal(item.price || 0).times(item.qty || 0)),
      new Decimal(0)
    );
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