import { FormProvider, useForm } from "react-hook-form";
import { format } from "date-fns";
import { ProductLineItem, TranHeaderType } from "../../shared-types";
import { StockJournalHeader } from "./stock-journal-header";
import { StockJournalTabs } from "./stock-journal-tabs";
import { useSelector } from "react-redux";
import { RootStateType } from "../../../../../app/store/store";
import { useEffect } from "react";
import { useUtilsInfo } from "../../../../../utils/utils-info-hook";
import { Utils } from "../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../app/graphql/maps/sql-ids-map";
import { Messages } from "../../../../../utils/messages";
import _ from "lodash";

export function StockJournalMain({ instance }: { instance: string }) {
  // const dispatch: AppDispatchType = useDispatch();

  const {
    // branchId,
    buCode,
    // context,
    dbName,
    decodedDbParamsObject,
    // finYearId
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
      sourceLineItems: [
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

  return (
    <div className="h-[calc(100vh-240px)]">
      <FormProvider {...extendedMethods}>
        <form
          className="flex flex-col gap-6 mr-6 min-w-[85rem]"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
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
    console.log(data);
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

    const sourceLineItems = stockJournals.filter((item:StockJournalInfoType) => item.dc === "C").map((item: StockJournalInfoType) => {
        return {
          id: item.id,
          lineRefNo: item.lineRefNo,
          lineRemarks: item.lineRemarks,
          price: item.price,
          productCode: item.productCode,
          productDetails:item.productDetails,
          productId: item.productId,
          qty: item.qty,
          serialNumbers: item.serialNumbers,
          tranHeaderId: item.tranHeaderId,
          upcCode: item.upcCode
        };
  
    });
    const outputLineItems = stockJournals.filter((item: StockJournalInfoType) => item.dc === "D").map((item: StockJournalInfoType) => {
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
        sourceLineItems: sourceLineItems,
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
      sourceLineItems: [
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
  }
}

export type StockJournalType = {
  id?: string | number;
  autoRefNo?: string | null;
  sourceLineItems: ProductLineItem[];
  outputLineItems: ProductLineItem[];
  remarks?: string | null;
  tranDate: string;
  userRefNo?: string | null;
};

export type StockJournalJsonResultType = {
    stockJournals: StockJournalInfoType[];
    tranH: TranHeaderType;
}

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
